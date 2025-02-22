import React, { useState } from "react";
import styles from "./LostFound.module.css";

const LostFound = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [referenceUploaded, setReferenceUploaded] = useState(false);
  const [videoStarted, setVideoStarted] = useState(false);
  const [webcamImage, setWebcamImage] = useState(null);

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
      <h1 className={styles.lostFoundTitle}>Lost & Found - Face Matching</h1>

      {/* Upload Reference Image */}
      <div className={styles.lostFoundUploadSection}>
        <h2 className={styles.lostFoundSubtitle}>Upload Reference Image</h2>
        <input type="file" accept="image/*" onChange={handleFileSelect} />
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
