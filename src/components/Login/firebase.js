// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDTJhbXMJikVFTZF1Bi6j-Qe0nKwOVJ6mU",
  authDomain: "vigilai-9c0ac.firebaseapp.com",
  projectId: "vigilai-9c0ac",
  storageBucket: "vigilai-9c0ac.firebasestorage.app",
  messagingSenderId: "324706844927",
  appId: "1:324706844927:web:da1b4adb1b367f6aa78cca",
  measurementId: "G-J0DB13PM65"
};
  
// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Auth instance
const auth = getAuth(app);

export { auth };
