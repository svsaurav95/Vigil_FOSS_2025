import React, { useState } from "react";
import styles from "./ValidateTicket.module.css";

const ValidateTicket = () => {
  const [scanning, setScanning] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);

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
