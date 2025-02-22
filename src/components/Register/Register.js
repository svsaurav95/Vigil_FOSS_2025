//Register.js
import React, { useState } from "react";
import styles from "./Register.module.css";
import Header from "../Header/Header";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { username, email, password } = formData;

    if (!username || !email || !password) {
      setError("Please fill in all fields");
    } else {
      setError("");
      alert("Registration successful!");
      // Handle registration logic here
    }
  };

  return (
    <div style={{
      background: "white",
      height: "100vh", // Full viewport height
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    }}>
    <div className={styles.registerContainer}>
      <h1>Register</h1>
      {error && <p className={styles.error}>{error}</p>}
      <form className={styles.registerForm} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
          />
        </div>
        <button type="submit" className={styles.submitBtn}>
          Register
        </button>
      </form>
    </div>
    </div>
  );
};

export default Register;
