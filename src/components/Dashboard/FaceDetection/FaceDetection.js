import { useState, useEffect } from 'react';
import { Camera } from 'lucide-react';
import styles from './FaceDetection.module.css';

const BACKEND_URL = 'http://localhost:5000';

export default function FaceDetection() {
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [backendStatus, setBackendStatus] = useState(null);  

  useEffect(() => {
    // Check backend status when component mounts
    fetch(`${BACKEND_URL}/status`)
      .then(response => response.json())
      .then(data => setBackendStatus(data))
      .catch(error => console.error('Error checking backend status:', error));
  }, []);

  const toggleWebcam = () => {
    setIsWebcamActive(!isWebcamActive);
  };

  return (
    <div className={styles.container}>
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
        className={`${styles.button} ${isWebcamActive ? styles.active : ''}`}
        onClick={toggleWebcam}
      >
        <Camera className="inline-block mr-2" size={20} />
        {isWebcamActive ? 'Stop Camera' : 'Start Camera'}
      </button>

      {backendStatus && (
        <p className={styles.status}>
          Backend Status: {backendStatus.status} (Running on {backendStatus.device})
        </p>
      )}
    </div>
  );
}