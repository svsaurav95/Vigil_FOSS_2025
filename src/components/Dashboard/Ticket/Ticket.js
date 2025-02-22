import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Ticket.module.css";
import { auth } from "../../Login/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import faceDetFeature1 from "../Media/face-det-feature1.png";
import lostFoundFeature2 from "../Media/lost-found-feature2.jpg";
import stampedefeature3 from "../Media/stampede-feature3.jpg";

const Dashboard = () => {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();

  const handleSignOut = () => {
    auth.signOut();
    navigate("/");
  };

  return (
    <div className={styles.dashboard}>
      {/* Main Content */}
      <main className={styles.mainContent}>
        {/* Feature Cards */}
        <div className={styles.grid}>
          <a href="/facedet">
            <div className={styles.card}>
              <img src={faceDetFeature1} alt="Face Recognition" className={styles.cardImage} />
              <div className={styles.cardContent}>
                <h2 style={{fontSize:"2rem"}}>Crowd Demographic</h2>
                <p>BBBBBBBBBBBBBBBBBBBBBBBBBBBBB</p>
                <p>BBBBBBBBBBBBBBBBBBBBBBBBBBBBB</p>
                <p>‎ </p>
                <p className={styles.rightArrow}>→</p>
              </div>
            </div>
          </a>

          <div className={styles.card} >
            <a href="/validateticket">
            <img src={lostFoundFeature2} alt="Article Analysis" className={styles.cardImage} />
            <div className={styles.cardContent}>
              <h2 style={{fontSize:"2rem"}}>Validate Ticket</h2>
              <p>CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC</p>
              <p>CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC</p>
              <p>‎ </p>
              <p className={styles.rightArrow}>→</p>
            </div>
            </a>
          </div>
        </div>

        <footer className={styles.footer}>
          <p>© 2025, Made with Passion ✊ by Team Digi Dynamos</p>
        </footer>
      </main>
    </div>
  );
};

export default Dashboard;