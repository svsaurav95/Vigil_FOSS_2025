import React, { useEffect, useState } from "react";
import styles from "./Charts.module.css";
import { Bar, Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const Charts = () => {
    const [chartData, setChartData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch("http://127.0.0.1:5005/get_data")
            .then(response => response.json())
            .then(data => setChartData(data))
            .catch(err => setError("Failed to fetch data"));
    }, []);

    if (error) return <p className={styles.error}>{error}</p>;
    if (!chartData) return <p className={styles.loading}>Loading...</p>;

    const barChartOptions = {
        responsive: true,
        plugins: { legend: { position: "top" } },
        scales: {
            x: { ticks: { color: "white" }, grid: { color: "white" } },
            y: { ticks: { color: "white" }, grid: { color: "white" } },
        },
    };

    const createPieData = (data) => ({
        labels: Object.keys(data),
        datasets: [{ data: Object.values(data), backgroundColor: ["#ff6384", "#36a2eb", "#ffce56"] }]
    });

    const createBarData = (label, data) => ({
        labels: Object.keys(data),
        datasets: [{ label, data: Object.values(data), backgroundColor: "#36a2eb" }]
    });

    return (
        <div className={styles.chartContainer}>
            {Object.entries(chartData).map(([key, data]) => (
                <div key={key} className={styles.chartCard}>
                    <h3 className={styles.chartTitle}>{key.replace(/_/g, " ").toUpperCase()}</h3>
                    <div className={key === "ticket_entry_count" ? styles.barChart : ""}>
                        {key === "ticket_entry_count" ? (
                            <Bar data={createBarData("Tickets", data)} options={barChartOptions} />
                        ) : (
                            <Pie data={createPieData(data)} />
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Charts;
