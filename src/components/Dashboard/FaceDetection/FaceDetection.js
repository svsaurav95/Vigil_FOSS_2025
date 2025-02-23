import { useState, useEffect } from "react";
import { Camera } from "lucide-react";
import styles from "./FaceDetection.module.css";
import { useNavigate } from "react-router-dom";

const BACKEND_URL = "http://localhost:5000";

export default function FaceDetection() {
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [backendStatus, setBackendStatus] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Fetching backend status...");
    fetch(`${BACKEND_URL}/status`)
      .then((response) => response.json())
      .then((data) => {
        console.log("Backend status:", data);
        setBackendStatus(data);
      })
      .catch((error) => console.error("Error checking backend status:", error));

    console.log("Fetching classification history (stored in DB, not displayed)...");
    fetch(`${BACKEND_URL}/results`).catch((error) =>
      console.error("Error fetching classifications:", error)
    );
  }, []);

  const toggleWebcam = () => {
    setIsWebcamActive(!isWebcamActive);
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
      <h1 className={styles.title}>Face Detection</h1>

      <div className={styles.webcamContainer}>
        {isWebcamActive && (
          <img
            src={`${BACKEND_URL}/classify/webcam`}
            className={styles.webcamFeed}
            alt="Webcam feed"
          />
        )}
      </div>

      <button
        className={`${styles.button} ${isWebcamActive ? styles.active : ""}`}
        onClick={toggleWebcam}
      >
        <Camera className="inline-block mr-2" size={20} />
        {isWebcamActive ? "Stop Camera" : "Start Camera"}
      </button>

      {backendStatus && (
        <p className={styles.status}>
          Backend Status: {backendStatus.status} (Running on {backendStatus.device})
        </p>
      )}
    </div>
  );
}
