import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Dashboard.module.css";
import { auth } from "../Login/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import defaultAvatar from "./Media/avatar-icon.png";
import faceDetFeature1 from "./Media/face-det-feature1.png";
import lostFoundFeature2 from "./Media/lost-found-feature2.jpg";
import stampedefeature3 from "./Media/stampede-feature3.jpg";
import dashboardICO from "./Media/dashboard-icon.png";
import homeICO from "./Media/homepage-icon.png";
import pricingICO from "./Media/pricing-icon.png";
import featureICO from "./Media/features-icon.png";
import contactICO from "./Media/contact-icon.png"

const Dashboard = () => {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();

  const handleSignOut = () => {
    auth.signOut();
    navigate("/");
  };

  return (
    <div className={styles.dashboard}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <a href="/">
          <div className={styles.logo}>NeuraClass</div>
        </a>
        <hr style={{width:"100%"}}></hr>
        <nav className={styles.nav}>
          <ul>
            <li className={styles.active}>
              <img src={dashboardICO} alt="Dashboard" className={styles.icon} /> Dashboard
            </li>
            <li>
              <a href="/">
                <img style={{ marginTop: "-2px" }} src={homeICO} alt="Homepage" className={styles.icon} /> Homepage
              </a>
            </li>
            <li>
            <a href="/pricing">
                <img style={{ marginLeft: "-2px", marginTop: "-2px", height:"30px", width:"30px" }} src={pricingICO} alt="pricing" className={styles.icon} /> Pricing
              </a>
            </li>
            <li>
              <a href="/">
                <img style={{ marginTop: "-2px" }} src={featureICO} alt="features" className={styles.icon} /> Features
              </a>
            </li>
            <li>
              <a href="/">
                <img style={{ marginTop: "-1px" }} src={contactICO} alt="Contact Us" className={styles.icon} /> Contact Us
              </a>
            </li>
          </ul>
        </nav>
        <div style={{marginLeft:"10px"}}><button onClick={handleSignOut} className={styles.signOutButton}>Sign Out</button></div>
      </aside>

      {/* Main Content */}
      <main className={styles.mainContent}>
        <div className={styles.topBar}>
          <h1>Dashboard</h1>
            <div className={styles.userInfo}>
            <img 
              src={user?.photoURL || defaultAvatar} 
              alt="Avatar" 
              className={styles.avatar} 
                onError={(e) => e.target.src = defaultAvatar} // Fallback if the image fails to load
              />
              <div className={styles.userName}>{user?.displayName || "Guest"}</div>
              </div>
            </div>

        {/* Feature Cards */}
        <div className={styles.grid}>
          <a href="/generateticket">
            <div className={styles.card}>
              <img src={faceDetFeature1} alt="Face Recognition" className={styles.cardImage} />
              <div className={styles.cardContent}>
                <h2 style={{fontSize:"2rem"}}>Generate Ticket</h2>
                <p>..................</p>
                <p>..................</p>
                <p>‎ </p>
                <p className={styles.rightArrow}>→</p>
              </div>
            </div>
          </a>

          <div className={styles.card} >
            <a href="/lostfound">
            <img src={lostFoundFeature2} alt="Article Analysis" className={styles.cardImage} />
            <div className={styles.cardContent}>
              <h2 style={{fontSize:"2rem"}}>Lost & Found</h2>
              <p>Upload a photo and let our AI scan crowds to help</p>
              <p>find missing persons, even in a group of 4-5 people.</p>
              <p>‎ </p>
              <p className={styles.rightArrow}>→</p>
            </div>
            </a>
          </div>

          <div className={`${styles.card} ${styles.fullWidth}`} >
            <a href="/stampede">
            <img src={stampedefeature3} alt="News Summarizer" className={styles.cardImage} />
            <div className={styles.cardContent}>
              <h2 style={{fontSize:"2rem"}}>Stampede Prediction</h2>
              <p>Analyze crowd movement and get real-time alerts</p>
              <p>with our AI-driven stampede prediction system.</p>
              <p>‎ </p>
              <p className={styles.rightArrow}>→</p>
            </div>
            </a>
          </div>

          <div className={`${styles.card} ${styles.fullWidth}`} >
            <a href="/ticket">
            <img src={stampedefeature3} alt="News Summarizer" className={styles.cardImage} />
            <div className={styles.cardContent}>
              <h2 style={{fontSize:"2rem"}}>Demographic/Validate Ticket</h2>
              <p>AAAAAAAAAAAAAAAAAAAAA</p>
              <p>AAAAAAAAAAAAAAAAAAAAA</p>
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