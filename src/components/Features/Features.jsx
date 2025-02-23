import styles from "./Features.module.css";

const Features = () => {
  return (
    <section className={styles.features}>
      <h2 className={styles.sectionTitle}>Our Features</h2>
      <div className={styles.featuresGrid}>
        <div className={styles.featureCard}>
          <h3>Crowd Demographic</h3>
          <p>➤ Detect faces with high accuracy and extract details like age, gender, and nationality.</p>
          <p>➤ Supports real-time video feeds for continuous monitoring.</p>
        </div>
        <div className={styles.featureCard}>
          <h3>Lost and Found</h3>
          <p>➤ Upload a photo and scan large crowds to locate missing individuals.</p>
          <p>➤ Utilizes advanced AI algorithms to match facial features efficiently.</p>
        </div>
        <div className={styles.featureCard}>
          <h3>Stampede Prediction</h3>
          <p>➤ Analyze crowd behavior to identify potential stampede risks.</p>
          <p>➤ Prevents accidents through predictive alerts and safety measures.</p>
        </div>
        <div className={styles.featureCard}>
          <h3>Generate Tickets</h3>
          <p>➤ Seamlessly generate unique tickets for events, transport, and access control.</p>
          <p>➤ Provides QR codes for easy scanning and verification.</p>
        </div>
        <div className={styles.featureCard}>
          <h3>Validate Tickets</h3>
          <p>➤ Instantly verify ticket authenticity using advanced validation algorithms.</p>
          <p>➤ Ensures fraud prevention and secure access management.</p>
        </div>
        <div className={styles.featureCard}>
          <h3>Real-Time Database</h3>
          <p>➤ Store and update ticketing data in real-time with high reliability.</p>
          <p>➤ Ensures instant access to ticket status, user details, and transaction history.</p>
        </div>
      </div>
    </section>
  );
};

export default Features;
