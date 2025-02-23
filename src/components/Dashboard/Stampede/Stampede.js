import React, { useState } from "react";
import styles from "./Stampede.module.css"; // Import the CSS module
import { useNavigate } from "react-router-dom";

const Stampede = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [videoPath, setVideoPath] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();

  // Handle file selection
  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  // Handle file upload
  const handleUpload = async (event) => { 
    event.preventDefault();
    if (!selectedFile) {
      alert("Please select a video file first.");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("video_file", selectedFile);

    try {
      const response = await fetch("http://127.0.0.1:5002/", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      // Get the redirected video feed URL
      const redirectedUrl = response.url;
      const videoFileName = redirectedUrl.split("video_path=")[1];
      setVideoPath(videoFileName);
    } catch (error) {
      console.error("Upload Error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={styles.container}>
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
      <h1 className={styles.heading}>Stampede Detection System</h1>
      <p>Upload a video to detect stampedes in real-time.</p>

      {/* File Upload Form */}
      <form onSubmit={handleUpload} className={styles.form}>
        <input type="file" accept="video/*" onChange={handleFileChange} required className={styles.fileInput} />
        <p style={{fontSize:"0.8rem"}}>‎ </p>
        <button type="submit" disabled={isUploading} className={styles.button}>
          {isUploading ? "Uploading..." : "Stream Video"}
        </button>
      </form>

      {/* Video Feed */}
      {videoPath && (
        <div className={styles.videoContainer}>
          <h2>Live Video Processing</h2>
          <img
            src={`http://127.0.0.1:5002/video_feed?video_path=${videoPath}`}
            alt="Video Feed"
            className={styles.video}
          />
        </div>
      )}
    </div>
  );
};

export default Stampede;
