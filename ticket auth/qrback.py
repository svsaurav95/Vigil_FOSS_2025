import sqlite3
import qrcode
import json
import random
import os
from flask import Flask, request, jsonify, render_template

# Initialize Flask App
app = Flask(__name__)

# Create 'qr' folder if not exists
qr_folder = "static/qr"
os.makedirs(qr_folder, exist_ok=True)

# Connect to Database (Changed to "event_tickets.db")
conn = sqlite3.connect("event_tickets.db", check_same_thread=False)
cursor = conn.cursor()

# Create tickets table if not exists
cursor.execute("""
    CREATE TABLE IF NOT EXISTS tickets (
        ticket_id TEXT PRIMARY KEY,
        user_id TEXT,
        user_name TEXT,
        event_id TEXT,
        expiry TEXT,
        scanned INTEGER DEFAULT 0
    )
""")
conn.commit()

# Function to generate a random user ID
def generate_user_id():
    return f"USR{random.randint(10000, 99999)}"

# Function to generate random event ID
def generate_event_id():
    return f"E{random.randint(1000, 9999)}"

# Root Route - Serve HTML Form
@app.route('/')
def home():
    return render_template("index.html")

# API Route for User Registration
@app.route('/register', methods=['POST'])
def register_user():
    data = request.json
    user_name = data.get("name")
    
    if not user_name:
        return jsonify({"error": "User name is required"}), 400

    # Generate ticket details
    user_id = generate_user_id()
    ticket_id = f"EVT{random.randint(10000000, 99999999)}"
    event_id = generate_event_id()
    expiry = "2025-02-25 18:00:00"

    # Insert into Database
    cursor.execute("INSERT INTO tickets (ticket_id, user_id, user_name, event_id, expiry) VALUES (?, ?, ?, ?, ?)",
                   (ticket_id, user_id, user_name, event_id, expiry))
    conn.commit()

    # Generate QR Code Data (Convert Ticket Info to JSON)
    ticket_data = {
        "ticket_id": ticket_id,
        "user_id": user_id,
        "user_name": user_name,
        "event_id": event_id,
        "expiry": expiry
    }
    
    qr = qrcode.make(json.dumps(ticket_data))
    qr_path = os.path.join(qr_folder, f"QR_{ticket_id}.png")
    qr.save(qr_path)

    return jsonify({
        "message": "User registered successfully!",
        "ticket_id": ticket_id,
        "user_name": user_name,
        "qr_code": f"/static/qr/QR_{ticket_id}.png"
    })

# Run Flask App
if __name__ == '__main__':
    app.run(debug=True)
