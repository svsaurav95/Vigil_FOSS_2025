import React from "react";
import styles from "./ChartModal.module.css";
import { Bar, Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const Modal = ({ data, onClose }) => {
    if (!data) return null;

    const { type, data: chartData } = data;
    const chartLabels = Object.keys(chartData);
    const chartValues = Object.values(chartData);

    const chartOptions = {
        responsive: true,
        plugins: { legend: { position: "top" } },
    };

    const pieData = {
        labels: chartLabels,
        datasets: [{ data: chartValues, backgroundColor: ["#ff6384", "#36a2eb", "#ffce56"] }]
    };

    const barData = {
        labels: chartLabels,
        datasets: [{ label: type, data: chartValues, backgroundColor: "#36a2eb" }]
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <h2>{type.charAt(0).toUpperCase() + type.slice(1)} Chart</h2>
                {type === "tickets" ? <Bar data={barData} options={chartOptions} /> : <Pie data={pieData} options={chartOptions} />}
                <button className={styles.closeButton} onClick={onClose}>Close</button>
            </div>
        </div>
    );
};

export default Modal;
