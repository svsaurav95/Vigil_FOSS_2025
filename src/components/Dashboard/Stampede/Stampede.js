import React, { useState } from "react";
import styles from "./Stampede.module.css"; // Import the CSS module

const Stampede = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [videoPath, setVideoPath] = useState("");
  const [isUploading, setIsUploading] = useState(false);

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
      <h1 className={styles.heading}>Stampede Detection System</h1>
      <p>Upload a video to detect stampedes in real-time.</p>

      {/* File Upload Form */}
      <form onSubmit={handleUpload} className={styles.form}>
        <input type="file" accept="video/*" onChange={handleFileChange} required className={styles.fileInput} />
        <button type="submit" disabled={isUploading} className={styles.button}>
          {isUploading ? "Uploading..." : "Upload Video"}
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
