import cv2
import torch
import time
import numpy as np
import sqlite3
from PIL import Image
from flask import Flask, Response, request, jsonify, render_template_string
from transformers import CLIPProcessor, CLIPModel
from flask_cors import CORS

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Load CLIP model
device = "cuda" if torch.cuda.is_available() else "cpu"
model_name = "wkcn/TinyCLIP-ViT-8M-16-Text-3M-YFCC15M"
model = CLIPModel.from_pretrained(model_name, cache_dir="./huggingface_cache").to(device)
processor = CLIPProcessor.from_pretrained(model_name, cache_dir="./huggingface_cache")

# Classification categories
categories = {
    "Gender": ["a man", "a woman"],
    "Nationality": [
        "a person of American nationality", "a person of Chinese nationality",
        "a person of Indian nationality", "a person of African nationality",
        "a person of European nationality"
    ],
    "Age": [
        "age 0 - 5 years old ", "age 5 - 10 years old ", "10 - 18 years old",
        "18 - 25 years old", "25 - 40 years old", "40 - 60 years old", "60+ years old" 
        
    ],
    "Sentiment": ["a happy person", "a sad person", "an angry person", "a neutral expression"]
}

# Initialize SQLite Database
def init_db():
    """Creates the classifications table if it does not exist."""
    conn = sqlite3.connect("classifications.db")
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS classifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            gender TEXT,
            nationality TEXT,
            age TEXT,
            sentiment TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()

init_db()  # Ensure DB is initialized

last_entry_time = 0  # Global variable to track last database entry time

def save_to_db(results):
    """Saves classification results to SQLite database with a 10s delay to prevent redundant entries."""
    global last_entry_time
    current_time = time.time()

    if current_time - last_entry_time < 10:
        return

    conn = sqlite3.connect("classifications.db")
    cursor = conn.cursor()
    
    cursor.execute("""
        INSERT INTO classifications (gender, nationality, age, sentiment) 
        VALUES (?, ?, ?, ?)
    """, (results["Gender"], results["Nationality"], results["Age"], results["Sentiment"]))
    
    conn.commit()
    conn.close()

    last_entry_time = current_time  # Update last entry time


def fetch_all_results():
    """Fetches all stored classifications from the database."""
    conn = sqlite3.connect("classifications.db")
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM classifications")
    rows = cursor.fetchall()
    
    conn.close()
    return rows


def classify_frame(frame):
    """Classifies a frame using CLIP and stores the best result in the database."""
    image = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))

    all_labels = sum(categories.values(), [])
    inputs = processor(text=all_labels, images=image, return_tensors="pt", padding=True).to(device)

    with torch.no_grad():
        outputs = model(**inputs)
        logits_per_image = outputs.logits_per_image.squeeze(0).cpu().numpy()

    category_results = {}
    start_idx = 0

    for category, labels in categories.items():
        end_idx = start_idx + len(labels)
        scores = logits_per_image[start_idx:end_idx]

        best_index = np.argmax(scores)
        category_results[category] = labels[best_index]

        start_idx = end_idx

    save_to_db(category_results)  # Save with 10s delay protection
    return category_results


def generate_frames(cap):
    """Stream frames with classification overlays."""
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        resized_frame = cv2.resize(frame, (224, 224))
        results = classify_frame(resized_frame)

        # Overlay results
        y_offset = 30
        for category, label in results.items():
            cv2.putText(frame, f"{category}: {label}", (10, y_offset),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)
            y_offset += 30

        _, buffer = cv2.imencode('.jpg', frame)
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')


@app.route('/')
def home():
    """Render basic UI"""
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
            <h2>Stored Classifications</h2>
            <button onclick="fetchClassifications()">Show Classifications</button>
            <pre id="classifications"></pre>
        </div>
        <script>
            function fetchClassifications() {
                fetch("/classifications").then(response => response.json()).then(data => {
                    document.getElementById("classifications").textContent = JSON.stringify(data, null, 2);
                });
            }
        </script>
    </body>
    </html>
    """
    return render_template_string(html)


@app.route('/classify/webcam')
def classify_webcam():
    """Stream webcam classification."""
    cap = cv2.VideoCapture(0)
    return Response(generate_frames(cap), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/results', methods=['GET'])
def get_results():
    """Fetch all stored classifications"""
    results = fetch_all_results()
    return jsonify(results)



if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
