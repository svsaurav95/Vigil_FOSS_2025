import cv2
import torch
import numpy as np
from PIL import Image
from flask import Flask, Response, request, jsonify, render_template_string
from transformers import CLIPProcessor, CLIPModel

# Initialize Flask app
app = Flask(__name__)

# Load CLIP model
device = "cuda" if torch.cuda.is_available() else "cpu"
model_name = "wkcn/TinyCLIP-ViT-8M-16-Text-3M-YFCC15M"
model = CLIPModel.from_pretrained(model_name, cache_dir="./huggingface_cache").to(device)
processor = CLIPProcessor.from_pretrained(model_name, cache_dir="./huggingface_cache")

categories = {
    "Gender": ["a man", "a woman"],
    "Nationality": [
        "a person of American nationality",
        "a person of Chinese nationality",
        "a person of Indian nationality",
        "a person of African nationality",
        "a person of European nationality",
    ],
    "Age": [
        "a baby", "a child", "a teenager",
        "a young adult", "a middle-aged person", "an elderly person"
    ],
    
    "Sentiment": ["a happy person", "a sad person", "an angry person", "a neutral expression"]
}


def classify_frame(frame):
    """Classifies a frame using CLIP and returns results."""
    image = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))  # Convert OpenCV frame to PIL Image

    # Flatten all category labels
    all_labels = sum(categories.values(), [])

    # Process inputs
    inputs = processor(text=all_labels, images=image, return_tensors="pt", padding=True).to(device)

    with torch.no_grad():
        outputs = model(**inputs)
        logits_per_image = outputs.logits_per_image.squeeze(0)  # Get logits (similarity scores)

    # Extract results for each category
    category_results = {}
    start_idx = 0

    for category, labels in categories.items():
        end_idx = start_idx + len(labels)
        scores = logits_per_image[start_idx:end_idx].cpu().numpy()

        # Sort labels based on scores
        sorted_indices = np.argsort(scores)[::-1]
        sorted_labels = [labels[i] for i in sorted_indices]
        sorted_scores = [scores[i] for i in sorted_indices]

        category_results[category] = list(zip(sorted_labels, sorted_scores))
        start_idx = end_idx

    return category_results


def generate_frames(cap):
    """Generate frames for streaming."""
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        resized_frame = cv2.resize(frame, (224, 224))
        results = classify_frame(resized_frame)

        # Overlay classification on frame
        y_offset = 30
        for category, label_scores in results.items():
            best_label, best_score = label_scores[0]
            cv2.putText(frame, f"{category}: {best_label} ({round(best_score, 2)})",
                        (10, y_offset), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)
            y_offset += 30

        _, buffer = cv2.imencode('.jpg', frame)
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')


@app.route('/')
def home():
    """Render HTML page"""
    html = """ 
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>CLIP Video Classification</title>
        <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 20px; }
            .container { max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; box-shadow: 0px 0px 10px #aaa; }
            h1 { color: #333; }
            button { margin-top: 10px; padding: 10px 15px; font-size: 16px; cursor: pointer; border: none; background-color: #28a745; color: white; border-radius: 5px; }
            button:hover { background-color: #218838; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>CLIP Video Classification</h1>
            <h2>Webcam Classification</h2>
            <img id="webcam-stream" src="/classify/webcam" width="100%" />
            <h2>Upload a Video for Classification</h2>
            <form id="upload-form" enctype="multipart/form-data">
                <input type="file" name="video" id="video-file" accept="video/*">
                <button type="button" onclick="uploadVideo()">Upload & Classify</button>
            </form>
            <h2>Classified Video</h2>
            <img id="video-stream" style="display:none;" width="100%" />
        </div>
        <script>
            function uploadVideo() {
                let formData = new FormData(document.getElementById("upload-form"));
                fetch("/classify/video", {
                    method: "POST",
                    body: formData
                }).then(response => {
                    if (response.ok) {
                        document.getElementById("video-stream").src = response.url;
                        document.getElementById("video-stream").style.display = "block";
                    } else {
                        alert("Error uploading video");
                    }
                }).catch(error => console.error("Error:", error));
            }
        </script>
    </body>
    </html>
    """
    return render_template_string(html)


@app.route('/status', methods=['GET'])
def status():
    """Check API Status"""
    return jsonify({"status": "running", "device": device})


@app.route('/classify/webcam', methods=['GET'])
def classify_webcam():
    """Stream classification results from the webcam."""
    cap = cv2.VideoCapture(0)
    return Response(generate_frames(cap), mimetype='multipart/x-mixed-replace; boundary=frame')


@app.route('/classify/video', methods=['POST'])
def classify_video():
    """Classifies frames from an uploaded video file."""
    file = request.files.get('video')
    if not file:
        return jsonify({"error": "No video file provided"}), 400

    file_path = "./uploaded_video.mp4"
    file.save(file_path)

    cap = cv2.VideoCapture(file_path)
    return Response(generate_frames(cap), mimetype='multipart/x-mixed-replace; boundary=frame')


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
