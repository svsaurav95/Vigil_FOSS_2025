import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
from flask import Flask, request, jsonify, render_template
import sqlite3
import qrcode
import json
import random
import os
from flask_cors import CORS


EMAIL_SENDER = "suryanshhimalayan@gmail.com"
EMAIL_PASSWORD = "ekfd ioms tsqc ahxj"

# Initialize Flask App
app = Flask(__name__)
CORS(app) 

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

# Function to send email
def send_email(user_email, ticket_data, qr_path):
    subject = "Your Event Ticket"
    
    body = f"""
    Hello {ticket_data['user_name']},

    Your event ticket has been successfully generated!

    Ticket ID: {ticket_data['ticket_id']}
    Event ID: {ticket_data['event_id']}
    Expiry: {ticket_data['expiry']}

    Please find your QR code attached.

    Regards,
    Event Team
    """

    # Create the email
    msg = MIMEMultipart()
    msg["From"] = EMAIL_SENDER
    msg["To"] = user_email
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "plain"))

    # Attach QR Code Image
    try:
        with open(qr_path, "rb") as attachment:
            qr_attachment = MIMEBase("application", "octet-stream")
            qr_attachment.set_payload(attachment.read())
            encoders.encode_base64(qr_attachment)
            qr_attachment.add_header(
                "Content-Disposition", f"attachment; filename=QR_{ticket_data['ticket_id']}.png"
            )
            msg.attach(qr_attachment)

        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(EMAIL_SENDER, EMAIL_PASSWORD)
            server.sendmail(EMAIL_SENDER, user_email, msg.as_string())
        
        return True
    except Exception as e:
        print("Error sending email:", e)
        return False


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

# API Endpoint to Send Email
@app.route('/send_ticket_email', methods=['POST'])
def send_ticket_email():
    data = request.json
    user_email = data.get("email")
    ticket_id = data.get("ticket_id")

    if not user_email or not ticket_id:
        return jsonify({"error": "Email and Ticket ID are required"}), 400

    cursor.execute("SELECT * FROM tickets WHERE ticket_id = ?", (ticket_id,))
    ticket = cursor.fetchone()

    if not ticket:
        return jsonify({"error": "Ticket not found"}), 404

    ticket_data = {
        "ticket_id": ticket[0],
        "user_id": ticket[1],
        "user_name": ticket[2],
        "event_id": ticket[3],
        "expiry": ticket[4]
    }
    
    qr_path = os.path.join(qr_folder, f"QR_{ticket_id}.png")

    if send_email(user_email, ticket_data, qr_path):
        return jsonify({"message": "Email sent successfully!"})
    else:
        return jsonify({"error": "Failed to send email"}), 500


# Run Flask App
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5003)
