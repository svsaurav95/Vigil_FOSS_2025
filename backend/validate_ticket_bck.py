import sqlite3
import json
import cv2
import time
from datetime import datetime
from flask import Flask, request, jsonify, render_template_string, Response
from flask_cors import CORS
import numpy as np

app = Flask(__name__)
CORS(app, resources={
    r"/validate": {"origins": "http://localhost:3000"},
    r"/upload_qr": {"origins": "http://localhost:3000"}
})

# Connect to SQLite Database
def get_db_connection(): 
    conn = sqlite3.connect("event_tickets.db")
    conn.row_factory = sqlite3.Row
    return conn

# Setup database
def setup_database():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS tickets (
        ticket_id TEXT PRIMARY KEY,
        user_id TEXT,
        user_name TEXT,
        event_id TEXT,
        expiry TEXT,
        scanned INTEGER DEFAULT 0
    );
    """)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS entries (
        ticket_id TEXT PRIMARY KEY,
        user_id TEXT,
        event_id TEXT,
        scan_time TEXT
    );
    """)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS invalid_tickets (
        ticket_id TEXT PRIMARY KEY,
        reason TEXT
    );
    """)
    conn.commit()
    conn.close()

setup_database()

# Function to validate ticket
def validate_ticket(ticket_data):
    conn = get_db_connection()
    cursor = conn.cursor()

    if isinstance(ticket_data, str):
        try:
            ticket_data = json.loads(ticket_data)
        except json.JSONDecodeError:
            pass  

    ticket_id = ticket_data.get("ticket_id", ticket_data)

    cursor.execute("SELECT user_id, user_name, event_id, expiry, scanned FROM tickets WHERE ticket_id=?", (ticket_id,))
    ticket = cursor.fetchone()

    if not ticket:
        cursor.execute("INSERT OR IGNORE INTO invalid_tickets (ticket_id, reason) VALUES (?, ?)", 
                       (ticket_id, "Ticket not found"))
        conn.commit()
        conn.close()
        return {"status": "Invalid", "message": "Ticket not found in the database"}

    user_id, user_name, event_id, expiry, scanned = ticket
    expiry_time = datetime.strptime(expiry, "%Y-%m-%d %H:%M:%S")
    current_time = datetime.now()

    if expiry_time < current_time:
        cursor.execute("INSERT OR IGNORE INTO invalid_tickets (ticket_id, reason) VALUES (?, ?)", 
                       (ticket_id, f"Expired on {expiry_time.strftime('%Y-%m-%d %H:%M:%S')}"))
        conn.commit()
        conn.close()
        return {"status": "Expired", "message": f"Ticket expired on {expiry_time.strftime('%Y-%m-%d %H:%M:%S')}"}

    if scanned == 1:
        cursor.execute("SELECT scan_time FROM entries WHERE ticket_id=?", (ticket_id,))
        scan_time = cursor.fetchone()
        conn.close()
        return {
            "status": "Used",
            "message": f"Ticket was already used on {scan_time['scan_time']}."
        }

    scan_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    cursor.execute("UPDATE tickets SET scanned=1 WHERE ticket_id=?", (ticket_id,))
    cursor.execute("INSERT INTO entries (ticket_id, user_id, event_id, scan_time) VALUES (?, ?, ?, ?)", 
                   (ticket_id, user_id, event_id, scan_time))
    conn.commit()
    conn.close()

    return {"status": "Valid", "message": f"Entry allowed at {scan_time}"}

# Flask API to validate tickets
@app.route('/validate', methods=['POST'])
def api_validate():
    data = request.get_json()
    if not data or "ticket_id" not in data:
        return jsonify({"status": "error", "message": "Invalid Data"}), 400

    result = validate_ticket(data["ticket_id"])
    return jsonify(result)

# QR Code Video Stream
@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

def generate_frames():
    cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)
    detector = cv2.QRCodeDetector()
    last_scan_time = 0
    last_result = None

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        current_time = time.time()

        # Wait 5 seconds before scanning the next ticket
        if current_time - last_scan_time >= 5:
            data, bbox, _ = detector.detectAndDecode(frame)
            if data:
                print(f"🎫 Scanned Ticket ID: {data}")
                last_result = validate_ticket(data)
                print(f"✅ Status: {last_result['status']} - {last_result['message']}")
                last_scan_time = current_time

        # Overlay the latest result under the feed
        if last_result:
            cv2.putText(frame, f"Ticket: {data}", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
            cv2.putText(frame, f"Status: {last_result['status']}", (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.6, 
                        (0, 255, 0) if last_result['status'] == "Valid" else (0, 0, 255), 2)
            cv2.putText(frame, f"Message: {last_result['message']}", (10, 90), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)

        _, buffer = cv2.imencode('.jpg', frame)
        frame_bytes = buffer.tobytes()

        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

    cap.release()
# upload qr code
@app.route("/upload_qr", methods=["POST"])
def upload_qr():
    if "image" not in request.files:
        return jsonify({"status": "Error", "message": "No image uploaded"}), 400

    file = request.files["image"]
    file_bytes = np.frombuffer(file.read(), np.uint8)
    img = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)

    detector = cv2.QRCodeDetector()
    data, _, _ = detector.detectAndDecode(img)

    if not data:
        return jsonify({"status": "Error", "message": "No QR code detected"}), 400

    validation_result = validate_ticket(data)
    return jsonify(validation_result)

# Home Page with Live Feed
@app.route('/')
def index():
    return render_template_string("""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>QR Ticket Scanner</title>
        <style>
            body { font-family: Arial, sans-serif; text-align: center; margin: 20px; }
            #video-container { margin-top: 20px; }
            img { width: 80%; max-width: 600px; border: 2px solid black; }
            button { padding: 10px 20px; font-size: 16px; cursor: pointer; margin-top: 10px; }
        </style>
    </head>
    <body>
        <h2>QR Ticket Scanner</h2>
        <button onclick="startScan()">Start Scanning</button>
        <p id="result">Click the button to start scanning...</p>
        <div id="video-container">
            <img id="video-feed" src="" style="display:none;">
        </div>

        <script>
            function startScan() {
                document.getElementById("video-feed").src = "/video_feed";
                document.getElementById("video-feed").style.display = "block";
                document.getElementById("result").innerText = "Live QR Scanner Activated!";
            }
        </script>
    </body>
    </html>
    """)

# Run Flask App
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5004)
