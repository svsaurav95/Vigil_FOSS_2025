import React, { useState, useEffect } from "react";
import { auth } from "../Login/firebase";
import { useNavigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import styles from "./Herosection.module.css";
import heroImage from "./hero-image.png";
import Features from "../Features/Features";
import AboutUs from "../About/About";
import Contact from "../Contact/Contact";
import ChartModal from "../ChartModal/ChartModal";

const HeroSection = () => { 
    const [isSignedIn] = useAuthState(auth);
    const navigate = useNavigate();
    const [modalData, setModalData] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleGetStartedClick = () => {
        navigate(isSignedIn ? "/dashboard" : "/login");
    };
    
    const handleGithubClick = () => {
        window.open("https://github.com/svsaurav95/Vigil_FOSS_2025", "_blank");
    };

    const openModal = (chartType) => {
        fetch("http://127.0.0.1:5005/get_data")
            .then(response => response.json())
            .then(data => {
                let chartData;
                switch (chartType) {
                    case "gender":
                        chartData = data.gender_count;
                        break;
                    case "nationality":
                        chartData = data.nationality_count;
                        break;
                    case "age":
                        chartData = data.age_count;
                        break;
                    case "tickets":
                        chartData = data.ticket_entry_count;
                        break;
                    default:
                        chartData = {};
                }
                setModalData({ type: chartType, data: chartData });
                setIsModalOpen(true);
            })
            .catch(error => console.error("Error fetching data:", error));
    };

    return (  
        <section className={styles.hero}>
            <div className={styles.container}>
                <div className={styles.content}>
                    <p className={styles.date}>23rd February, 2025 • Panjab University, CHD</p>
                    <h1 className={styles.title}>
                        Welcome to <span style={{ color: "rgb(153, 0, 255)" }}>Vigil.AI</span>
                    </h1>
                    <p className={styles.description}>
                        Advanced facial recognition and crowd analysis solutions
                    </p>
                    <div className={styles.buttons}>
                        <button className={styles.getStdButton} onClick={handleGetStartedClick}>
                            Get Started
                        </button>
                        <button className={styles.Githubbutton} onClick={handleGithubClick}>
                            Star on Github
                        </button> 
                    </div>
                </div> 

                <div className={styles.imageContainer}>
                    <img src={heroImage} alt="Conference" className={styles.heroImage} />
                </div>
            </div>
        
            {/* Stats Section */}
            <div className={styles.stats}>
                <div className={styles.statItem} onClick={() => openModal("gender")}>
                    <h2>Gender</h2>
                    <h2>Distribution</h2>
                    <p className={styles.rightArrow}>→</p>
                </div>
                <div className={styles.statItem} onClick={() => openModal("nationality")}>
                    <h2>Nationality</h2>
                    <h2>Distribution</h2>
                    <p className={styles.rightArrow}>→</p>
                </div>
                <div className={styles.statItem} onClick={() => openModal("age")}>
                    <h2>Age</h2>
                    <h2>Distribution</h2>
                    <p className={styles.rightArrow}>→</p>
                </div>
                <div className={styles.statItem} onClick={() => openModal("tickets")}>
                    <h2>Tickets</h2>
                    <h2>Sold</h2>
                    <p className={styles.rightArrow}>→</p>
                </div>
            </div> 

            <div className={styles.belowWave}>
                <div className={styles.belowContainer}>
                    <Features />
                    <AboutUs />
                    <Contact />
                </div>
            </div>

            {/* Modal Component */}
            {isModalOpen && <ChartModal data={modalData} onClose={() => setIsModalOpen(false)} />}
        </section>
    );
};

export default HeroSection;
