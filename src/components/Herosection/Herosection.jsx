import React from "react";
import { auth } from "../Login/firebase";
import { useNavigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import styles from "./Herosection.module.css";
import heroImage from "../Dashboard/Media/face-det-feature1.png"; // Update the path based on your project structure
import Features from "../Features/Features";
import Pricing from "../Pricing/Pricing";
import AboutUs from "../About/About";
import Contact from "../Contact/Contact";

const HeroSection = () => { 
    const [isSignedIn] = useAuthState(auth);
    const navigate = useNavigate();
    
    const handleGetStartedClick = () => {
        navigate(isSignedIn ? "/dashboard" : "/login");
      };
    
      const handleGithubClick = () => {
        window.open("https://github.com/svsaurav95/Vigil_FOSS_2025", "_blank");
      };
      
    
    

  return (  
    <section className={styles.hero}>
      <div className={styles.container}>
        {/* Left Side Text Content */}
        <div className={styles.content}>
          <p className={styles.date}>23rd February, 2025 • Panjab University, CHD</p>
          <h1 className={styles.title}>
            Welcome to <span style={{ color: "rgb(0, 153, 255)" }}>Vigil.AI</span>
          </h1>
          <p className={styles.description}>
          Advanced facial recognition and crowd analysis solutions
          </p>
          <div className={styles.buttons}>
            <button className={styles.getStdButton} onClick={handleGetStartedClick}>
                          Get Started
                          <svg fill="currentColor" viewBox="0 0 24 24" className={styles.icon}>
                            <path
                              clipRule="evenodd"
                              d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm4.28 10.28a.75.75 0 000-1.06l-3-3a.75.75 0 10-1.06 1.06l1.72 1.72H8.25a.75.75 0 000 1.5h5.69l-1.72 1.72a.75.75 0 101.06 1.06l3-3z" 
                              fillRule="evenodd"
                            ></path>
                          </svg>
            </button>
            <button className={styles.Githubbutton} onClick={handleGithubClick}>
                          Star on Github
                          <svg fill="currentColor" viewBox="0 0 24 24" className={styles.icon}>
                            <path
                              clipRule="evenodd"
                              d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm4.28 10.28a.75.75 0 000-1.06l-3-3a.75.75 0 10-1.06 1.06l1.72 1.72H8.25a.75.75 0 000 1.5h5.69l-1.72 1.72a.75.75 0 101.06 1.06l3-3z" 
                              fillRule="evenodd"
                            ></path>
                          </svg>
            </button> 
          </div>
        </div> 

        {/* Right Side Image */}
        <div className={styles.imageContainer}>
          <img src={heroImage} alt="Conference" className={styles.heroImage} />
        </div>
      </div>

      {/* Stats Section */}
      <div className={styles.stats}>
        <div className={styles.statItem}>
          <h2>5,000</h2>
          <p>Lorem Ipsum Dolor Sit Amet</p>
        </div>
        <div className={styles.statItem}>
          <h2>150</h2>
          <p>Lorem Ipsum Dolor Sit Amet</p>
        </div>
        <div className={styles.statItem}>
          <h2>800</h2>
          <p>Lorem Ipsum Dolor Sit Amet</p>
        </div>
        <div className={styles.statItem}>
          <h2>85</h2>
          <p>Lorem Ipsum Dolor Sit Amet</p>
        </div>
      </div>
      <div className={styles.belowWave}>
      <div className={styles.belowContainer}>
          <Features />
          <Pricing />
          <AboutUs />
          <Contact />
        </div>
        </div>
    </section>
    
  );
};

export default HeroSection;
