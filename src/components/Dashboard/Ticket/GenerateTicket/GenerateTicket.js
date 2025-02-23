import React, { useState } from "react";
import styles from "./GenerateTicket.module.css";
import { useNavigate } from "react-router-dom";

const GenerateTicket = () => {
  const [name, setName] = useState("");
  const [ticket, setTicket] = useState(null);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState("");
  const navigate = useNavigate();

  const handleGenerateTicket = async () => {
    setError("");
    setTicket(null);
    setEmail("");
    setEmailSent(false);
    setEmailError("");

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5003/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      const data = await response.json();

      if (response.ok) {
        setTicket(data);
      } else {
        setError(data.error || "An error occurred.");
      }
    } catch (error) {
      setError("Server error. Please try again later.");
    }
  };

  const handleSendEmail = async () => {
    if (!email.trim()) {
      setEmailError("Please enter your email.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5003/send_ticket_email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, ticket_id: ticket.ticket_id }),
      });

      const data = await response.json();

      if (response.ok) {
        setEmailSent(true);
      } else {
        setEmailError(data.error || "Failed to send email.");
      }
    } catch (error) {
      setEmailError("Error sending email. Please try again.");
    }
  };

  return (
    
    <div className={styles.container}>
      
      <button
  onClick={() => navigate("/dashboard")}
  style={{
    position: "absolute",
    top: "-20px",
    left: "-520px",
    backgroundColor: "#e8c31e",
    color: "#000",
    border: "none",
    padding: "8px 12px",
    borderRadius: "5px",
    fontSize: "15px",
    cursor: "pointer",
    transition: "background 0.3s, transform 0.2s"
  }}
  onMouseOver={(e) => {
    e.target.style.backgroundColor = "#8f7813";
    e.target.style.transform = "scale(1.05)";
  }}
  onMouseOut={(e) => {
    e.target.style.backgroundColor = "#e8c31e";
    e.target.style.transform = "scale(1)";
  }}
>
  ← Dashboard
</button>
      <h2 className={styles.heading}>Generate Event Ticket</h2>
      <p style={{fontSize:"0.3rem"}}>‎ </p>
      <input
        type="text"
        className={styles.input}
        placeholder="Enter your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <p style={{fontSize:"0.3rem"}}>‎ </p>
      <input
        type="text"
        className={styles.input}
        placeholder="Enter Transaction ID"
      />
      <p style={{fontSize:"0.3rem"}}>‎ </p>
      <button className={styles.button} onClick={handleGenerateTicket}>
        Generate Ticket
      </button>
      

      {error && <p className={styles.error}>{error}</p>}

      {ticket && (
        <div className={styles.ticketContainer}>
          <h3 className={styles.ticketHeading}>Ticket Generated!</h3>
          <p><strong>Name:</strong> {ticket.user_name}</p>
          <p><strong>Ticket ID:</strong> {ticket.ticket_id}</p>
          <img src={`http://localhost:5003${ticket.qr_code}`} alt="QR Code" className={styles.qrCode} />

          <div className={styles.emailSection}>
            <p>Do you want to receive the ticket via email?</p>
            <input
              type="email"
              className={styles.input}
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button className={styles.button} onClick={handleSendEmail}>
              Send Email
            </button>
          </div>

          {emailError && <p className={styles.error}>{emailError}</p>}
          {emailSent && <p className={styles.success}>Email sent successfully!</p>}
        </div>
      )}
    </div>
  );
};

export default GenerateTicket;