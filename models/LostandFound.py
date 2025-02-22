from flask import Flask, request, jsonify, render_template_string, Response, redirect, url_for
import cv2
import numpy as np
from ultralytics import YOLO
from facenet_pytorch import InceptionResnetV1, MTCNN
import torch
from PIL import Image
import os
import base64
from werkzeug.utils import secure_filename

app = Flask(__name__)

# Device configuration

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Using device: {device}")

# Load YOLOv8 model for face detection
face_detector = YOLO("ultralytics/yolov8n.pt")

# Load FaceNet model
facenet_model = InceptionResnetV1(pretrained='casia-webface').to(device).eval()
mtcnn = MTCNN(keep_all=False, device=device)


# Global variable to store the reference embedding
reference_embedding = None

# Ensure temp directory exists
if not os.path.exists("temp"):
    os.makedirs("temp")

# HTML Interface
HTML_TEMPLATE = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lost Person Search</title>
</head>
<body>
    <h2>Upload Reference Image</h2>
    <form action="/upload_reference" method="post" enctype="multipart/form-data">
        <input type="file" name="file" accept="image/*" required>
        <button type="submit">Upload</button>
    </form>

    <h2>OR Capture from Webcam</h2>
    <form action="/upload_reference" method="post">
        <input type="hidden" id="webcamData" name="webcam">
        <button type="button" onclick="captureWebcam()">Capture from Webcam</button>
        <button type="submit">Submit</button>
    </form>

    <h2>Live Video Feed</h2>
    <img src="{{ url_for('video_feed') }}" width="640px">

    <script>
        function captureWebcam() {
            navigator.mediaDevices.getUserMedia({ video: true })
                .then(function(stream) {
                    const video = document.createElement("video");
                    video.srcObject = stream;
                    video.play();
                    setTimeout(() => {
                        const canvas = document.createElement("canvas");
                        canvas.width = video.videoWidth;
                        canvas.height = video.videoHeight;
                        canvas.getContext("2d").drawImage(video, 0, 0);
                        document.getElementById("webcamData").value = canvas.toDataURL("image/jpeg");
                        stream.getTracks().forEach(track => track.stop());
                    }, 1000);
                })
                .catch(error => console.error("Webcam access denied:", error));
        }
    </script>
</body>
</html>
"""

# -------------------------------------------------------------------
# Helper Functions
# -------------------------------------------------------------------
def detect_faces(frame):
    """Detects faces in a frame and returns a list of (face image, bounding box)."""
    results = face_detector(frame)
    faces = []
    
    for result in results:
        boxes = result.boxes.xyxy.cpu().numpy() if result.boxes is not None else []
        for box in boxes:
            x1, y1, x2, y2 = map(int, box[:4])
            h, w, _ = frame.shape
            x1, y1, x2, y2 = max(0, x1), max(0, y1), min(w, x2), min(h, y2)
            face_img = frame[y1:y2, x1:x2]
            if face_img.size == 0:
                continue
            faces.append((face_img, (x1, y1, x2, y2)))

    return faces

def get_face_embedding(face_img):
    """Extracts a face embedding using FaceNet after alignment with MTCNN."""
    try:
        pil_img = Image.fromarray(cv2.cvtColor(face_img, cv2.COLOR_BGR2RGB))
        face_aligned = mtcnn(pil_img)
        if face_aligned is None:
            return None

        with torch.no_grad():
            face_aligned = face_aligned.to(device)
            embedding = facenet_model(face_aligned.unsqueeze(0))

        return embedding.cpu().numpy().flatten()
    except Exception as e:
        print("Error in embedding extraction:", e)
        return None

# -------------------------------------------------------------------
# API Endpoints
# -------------------------------------------------------------------
@app.route('/')
def index():
    """Renders the HTML interface for uploading a reference image and streaming video."""
    return render_template_string(HTML_TEMPLATE)

@app.route('/upload_reference', methods=['POST'])
def upload_reference():
    """Handles reference image upload and processes it for embedding extraction."""
    global reference_embedding

    if 'file' in request.files:
        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400

        filename = secure_filename(file.filename)
        file_path = os.path.join("temp", filename)
        file.save(file_path)

        frame = cv2.imread(file_path)
        os.remove(file_path)

    elif 'webcam' in request.form:
        webcam_data = request.form['webcam']
        try:
            img_data = base64.b64decode(webcam_data.split(',')[1])
            nparr = np.frombuffer(img_data, np.uint8)
            frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        except Exception as e:
            return jsonify({"error": f"Invalid webcam data: {e}"}), 400
    else:
        return jsonify({"error": "No file or webcam data provided"}), 400

    # Detect face in the reference image
    ref_faces = detect_faces(frame)
    if len(ref_faces) != 1:
        return jsonify({"error": "The reference image must contain exactly one face!"}), 400

    ref_face_img, _ = ref_faces[0]
    reference_embedding = get_face_embedding(ref_face_img)
    if reference_embedding is None:
        return jsonify({"error": "Could not generate an embedding for the reference face."}), 400

    return redirect(url_for('video_feed'))

def generate_frames():
    """Generates webcam frames with face detection and matching."""
    cap = cv2.VideoCapture(0)
    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                break

            faces = detect_faces(frame)
            for face_img, (x1, y1, x2, y2) in faces:
                current_embedding = get_face_embedding(face_img)
                if current_embedding is not None:
                    similarity = np.dot(reference_embedding, current_embedding) / (
                        np.linalg.norm(reference_embedding) * np.linalg.norm(current_embedding) + 1e-10)

                    if similarity > 0.4:
                        cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
                        label = f"MATCH: {similarity:.2f}"
                    else:
                        label = f"SIM: {similarity:.2f}"

                    cv2.putText(frame, label, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)

            ret, buffer = cv2.imencode('.jpg', frame)
            frame = buffer.tobytes()

            yield (b'--frame\r\nContent-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')
    finally:
        cap.release()
        cv2.destroyAllWindows()

@app.route('/video_feed')
def video_feed():
    """Streams the processed video feed."""
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
