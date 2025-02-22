import styles from "./Pricing.module.css";

const Pricing = () => { 
  return (
    <section className={styles.pricing}>
      <h2 className={styles.sectionTitle}>Pricing Plans</h2>
      <div className={styles.pricingGrid}>
        <div className={`${styles.priceCard} ${styles.free}`}>
          <h3>Free Plan</h3>
          <p>✦ Basic face detection features</p>
          <p>✦ Limited scans per day</p>
          <p>✦ No real-time monitoring</p>
          <p>✦ Community support only</p>
        </div>
        <div className={`${styles.priceCard} ${styles.standard}`}>
          <h3>₹200 / Month</h3>
          <p>✦ Includes all Free plan features</p>
          <p>✦ Real-time face tracking</p>
          <p>✦ Limited Lost and Found scans</p>
          <p>✦ Email support</p>
        </div>
        <div className={`${styles.priceCard} ${styles.premium}`}>
          <h3>₹500 / Month</h3>
          <p>✦ All features unlocked</p>
          <p>✦ Unlimited face recognition</p>
          <p>✦ Priority customer support</p>
          <p>✦ Advanced analytics dashboard</p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
