import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Ticket.module.css";
import { auth } from "../../Login/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import lostFoundFeature2 from "../Media/lost-found-feature2.jpg";
import Demographic from "../Media/demographic.png";
import Validate from "../Media/validate.png";

const Dashboard = () => {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();

  return (
    <div className={styles.dashboard}>
      {/* Main Content */}
      <main className={styles.mainContent}>
      <button
  onClick={() => navigate("/dashboard")}
  style={{
    position: "absolute",
    top: "100px",
    left: "30px",
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

        {/* Feature Cards */}
        <div className={styles.grid}>
          <a href="/facedet">
            <div className={styles.card}>
              <img src={Demographic} alt="Face Recognition" className={styles.cardImage} />
              <div className={styles.cardContent}>
                <h2 style={{fontSize:"2rem"}}>Crowd Demographic</h2>
                <p>Analyze the age, gender, and nationality of a crowd</p>
                <p>to gain valuable insights into audience composition,</p>
                <p>helping with security and event planning.</p>
                <p>‎ </p>
                <p className={styles.rightArrow}>→</p>
              </div>
            </div>
          </a>

          <div className={styles.card} >
            <a href="/validateticket">
            <img src={Validate} alt="Article Analysis" className={styles.cardImage} />
            <div className={styles.cardContent}>
              <h2 style={{fontSize:"2rem"}}>Validate Ticket</h2>
              <p>Scan and verify ticket authenticity in real-time,</p>
                <p>ensuring only valid entries while preventing fraud</p>
                <p>for a seamless and secure check-in experience.</p>
              <p>‎ </p>
              <p className={styles.rightArrow}>→</p>
            </div>
            </a>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;