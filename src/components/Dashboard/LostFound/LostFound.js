import React, { useState } from "react";
import styles from "./LostFound.module.css";
import { useNavigate } from "react-router-dom";

const LostFound = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [referenceUploaded, setReferenceUploaded] = useState(false);
  const [videoStarted, setVideoStarted] = useState(false);
  const [webcamImage, setWebcamImage] = useState(null);
  const navigate = useNavigate();

  const handleFileSelect = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      alert("No file selected!");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch("http://127.0.0.1:5001/upload_reference", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setReferenceUploaded(true);
        setVideoStarted(true);
      } else {
        alert("Failed to upload reference image.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to connect to the server. Is Flask running?");
    }
  };

  return (
    <div className={styles.lostFoundContainer}>
      <button
  onClick={() => navigate("/dashboard")}
  style={{
    position: "absolute",
    top: "-20px",
    left: "-470px",
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
      <h1 className={styles.lostFoundTitle}>Lost & Found - Face Matching</h1>

      {/* Upload Reference Image */}
      <div className={styles.lostFoundUploadSection}>
        <h2 className={styles.lostFoundSubtitle}>Upload Reference Image</h2>
        <p style={{fontSize:"0.3rem"}}>‎ </p>
        <input type="file" accept="image/*" onChange={handleFileSelect} style={{
          width: "90%",
          marginLeft: "0%",
        }} />
        <p style={{fontSize:"0.7rem"}}>‎ </p>
        <button
          onClick={handleFileUpload}
          className={styles.lostFoundUploadBtn}
          disabled={!selectedFile}
        >
          Upload Image
        </button>
      </div>

      {/* Live Video Feed */}
      {referenceUploaded && videoStarted && (
        <div className={styles.lostFoundVideoSection}>
          <h2 className={styles.lostFoundSubtitle}>Live Video Feed</h2>
          <img
            src="http://127.0.0.1:5001/video_feed"
            alt="Live Feed"
            className={styles.lostFoundVideoFeed}
          />
        </div>
      )}
    </div>
  );
};

export default LostFound;
