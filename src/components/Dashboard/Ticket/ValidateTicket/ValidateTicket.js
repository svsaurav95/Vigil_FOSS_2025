import React, { useState } from "react";
import styles from "./ValidateTicket.module.css";
import { useNavigate } from "react-router-dom";

const ValidateTicket = () => {
  const [scanning, setScanning] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const navigate = useNavigate();

  const toggleScan = () => {
    if (scanning) {
      document.getElementById("video-feed").src = "";
    }
    setScanning(!scanning);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch("http://127.0.0.1:5004/upload_qr", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setUploadResult(data);
    } catch (error) {
      console.error("Error uploading file:", error);
      setUploadResult({ status: "Error", message: "Failed to process QR code" });
    }
  };

  return (
    <div className={styles.container}>
      <button
  onClick={() => navigate("/dashboard")}
  style={{
    position: "absolute",
    top: "-20px",
    left: "-420px",
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
      <h2>QR Ticket Scanner</h2>
      <button
        onClick={toggleScan}
        className={`${styles.button} ${scanning ? styles.stopButton : ""}`}
      >
        {scanning ? "Stop Scanning" : "Start Scanning"}
      </button>
      <p>{scanning ? "Live QR Scanner Activated!" : "Click the button to start scanning..."}</p>
      <div className={styles.videoContainer}>
        {scanning && <img id="video-feed" src="http://127.0.0.1:5004/video_feed" alt="Live QR Scanner" />}
      </div>
      <p style={{fontSize:"0.3rem"}}>‎ </p>
      <hr></hr>
      <p style={{fontSize:"0.3rem"}}>‎ </p>
      <h3>OR Upload QR Code Image</h3>
      <input type="file" accept="image/*" onChange={handleFileUpload} className={styles.uploadInput} />
      
      {uploadResult && (
        <div className={`${styles.result} ${uploadResult.status === "Valid" ? styles.valid : styles.invalid}`}>
          <p><strong>Status:</strong> {uploadResult.status}</p>
          <p><strong>Message:</strong> {uploadResult.message}</p>
        </div>
      )}
    </div>
  );
};

export default ValidateTicket;
