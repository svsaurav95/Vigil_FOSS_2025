import cv2
import torch
import numpy as np
import torchvision.transforms as T
from flask import Flask, Response, request, render_template_string, redirect, url_for
from torchvision.models.segmentation import deeplabv3_mobilenet_v3_large
import os

app = Flask(__name__)

# Load DeepLabV3 model for person segmentation
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = deeplabv3_mobilenet_v3_large(pretrained=True).to(device).eval()

# Define preprocessing transformation
transform = T.Compose([
    T.ToPILImage(),
    T.Resize((480, 640)),
    T.ToTensor(),
    T.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])

# Helper function for processing video and detecting stampede
def process_video(frame):
    # Convert frame to RGB and preprocess
    image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    input_tensor = transform(image).unsqueeze(0).to(device)

    # Run segmentation model
    with torch.no_grad():
        output = model(input_tensor)["out"][0]

    # Get person segmentation mask
    seg_map = output.argmax(0).byte().cpu().numpy()
    person_mask = (seg_map == 15).astype(np.uint8) * 255

    # Apply Gaussian Blur to create heatmap
    heatmap = cv2.GaussianBlur(person_mask, (31, 31), 10)
    heatmap = cv2.normalize(heatmap, None, 0, 255, cv2.NORM_MINMAX)
    heatmap = cv2.applyColorMap(np.uint8(heatmap), cv2.COLORMAP_JET)
    heatmap = cv2.resize(heatmap, (frame.shape[1], frame.shape[0]))

    # Convert binary mask to grayscale for clustering
    _, binary_mask = cv2.threshold(person_mask, 50, 255, cv2.THRESH_BINARY)

    # Find clusters using connected components
    num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats(binary_mask, connectivity=8)

    total_cluster_area = 0  
    large_cluster_count = 0
    small_cluster_count = 0

    for i in range(1, num_labels):
        x, y, w, h, area = stats[i]
        centroid_x, centroid_y = centroids[i]

        # Find contours of the cluster
        cluster_mask = (labels == i).astype(np.uint8) * 255
        contours, _ = cv2.findContours(cluster_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        # Compute Solidity to filter irregular shapes
        if contours:
            hull = cv2.convexHull(contours[0])
            hull_area = cv2.contourArea(hull)
            solidity = area / hull_area if hull_area > 0 else 0

            # Ignore small irregular clusters
            if solidity < 0.8 and area < 15000:
                continue  

        # Add to total cluster area
        total_cluster_area += area

        # Classify clusters
        if area > 10000:
            large_cluster_count += 1
        else:
            small_cluster_count += 1

    # Ignore cases where people are too scattered
    if total_cluster_area < 5000:
        stampede_detected = False
    else:
        # Stampede Conditions
        stampede_condition_1 = (large_cluster_count + small_cluster_count) > 5 and total_cluster_area > 18000
        stampede_condition_2 = large_cluster_count > 0 and small_cluster_count == 0

        if stampede_condition_1 or stampede_condition_2:
            stampede_detected = True
            cv2.putText(frame, "STAMPede WARNING!", (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 1.2, (0, 0, 255), 3)
            print("STAMPede DETECTED!")

            # Save first detected stampede event
            if not os.path.exists("stampede_log.txt"):
                with open("stampede_log.txt", "w") as log_file:
                    log_file.write(f"First Stampede Detected - Clusters: {large_cluster_count + small_cluster_count}, Area: {total_cluster_area}\n")
        else:
            stampede_detected = False

    # *Display High-Risk and Low-Risk Zones*
    for i in range(1, num_labels):
        x, y, w, h, area = stats[i]
        if area > 10000:  # Large clusters
            cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 0, 255), 2)  # Red for high risk
            cv2.putText(frame, "HIGH RISK ZONE", (x, y - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)
        else:  # Small clusters
            cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)  # Green for low risk
            cv2.putText(frame, "LOW RISK ZONE", (x, y - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)

    # Blend heatmap with the original frame
    output_frame = cv2.addWeighted(frame, 0.6, heatmap, 0.4, 0)

    return output_frame, stampede_detected

# Route to display the home page and handle video upload
@app.route("/", methods=["GET", "POST"])
def index():
    if request.method == "POST":
        video_file = request.files["video_file"]
        if video_file:
            video_path = os.path.join("uploads", video_file.filename)
            video_file.save(video_path)
            return redirect(url_for("video_feed", video_path=video_path))
    
    html = """
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Stampede Detection</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 20px;
                text-align: center;
            }
            h1 {
                color: #d9534f;
            }
            .upload-form {
                margin-top: 50px;
            }
            input[type="file"] {
                margin: 20px;
                padding: 10px;
                font-size: 1em;
            }
            button {
                padding: 10px 20px;
                font-size: 1em;
                background-color: #5bc0de;
                color: white;
                border: none;
                cursor: pointer;
            }
            button:hover {
                background-color: #31b0d5;
            }
        </style>
    </head>
    <body>

        <h1>Stampede Detection System</h1>
        <p>Upload a video to detect stampedes in real-time.</p>

        <div class="upload-form">
            <form method="POST" enctype="multipart/form-data">
                <input type="file" name="video_file" accept="video/*" required>
                <button type="submit">Upload Video</button>
            </form>
        </div>

    </body>
    </html>
    """
    return render_template_string(html)

# Route to start streaming the video with detection
@app.route("/video_feed")
def video_feed():
    video_path = request.args.get("video_path", "")
    cap = cv2.VideoCapture(video_path)

    def generate():
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            # Process frame to detect stampede
            output_frame, stampede_detected = process_video(frame)

            # Encode the frame as JPEG
            ret, jpeg = cv2.imencode('.jpg', output_frame)
            if not ret:
                break
            # Yield the frame as a byte stream for streaming
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + jpeg.tobytes() + b'\r\n')

    return Response(generate(), mimetype='multipart/x-mixed-replace; boundary=frame')

# Start the Flask server
if __name__ == "__main__":
    if not os.path.exists("uploads"):
        os.makedirs("uploads")
    app.run(host="0.0.0.0", port=5000, threaded=True)
