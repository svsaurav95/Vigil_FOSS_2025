import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { auth } from "./components/Login/firebase";
import { onAuthStateChanged } from "firebase/auth";
import Header from "./components/Header/Header";
import HeroSection from "./components/Herosection/Herosection";
import Dashboard from "./components/Dashboard/Dashboard";
import Login from "./components/Login/Login";
import Register from "./components/Register/Register";
import About from "./components/About/About";  // New Page
import Contact from "./components/Contact/Contact"; // New Page
import Features from "./components/Features/Features"; // New Page
import FaceDet from "./components/Dashboard/FaceDetection/FaceDetection"; 
import LostFound from "./components/Dashboard/LostFound/LostFound"; 
import Stampede from "./components/Dashboard/Stampede/Stampede";
import Ticket from "./components/Dashboard/Ticket/Ticket";  
import GenerateTicket from "./components/Dashboard/Ticket/GenerateTicket/GenerateTicket";
import ValidateTicket from "./components/Dashboard/Ticket/ValidateTicket/ValidateTicket";

function App() {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log("User state changed:", currentUser);
      setUser(currentUser || null);
    });

    return () => unsubscribe();
  }, []);

  if (user === undefined) return <div>Loading...</div>; // Show a loading message while auth state is being determined

  return (
    <Router>
      <AppContent user={user} />
    </Router>
  );
}

function AppContent({ user }) {
  const location = useLocation();
  const showHeader = location.pathname !== "/dashboard"; // Hide header on Dashboard

  return (
    <>
      {showHeader && <Header user={user} />}
      <Routes>
        <Route path="/" element={<HeroSection />} />
        <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" replace />} />
        <Route path="/about" element={<About />} /> {/* New Route */}
        <Route path="/contact" element={<Contact />} /> {/* New Route */}
        <Route path="/features" element={<Features />} /> {/* New Route */}
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/" replace /> : <Register />} />
        <Route path="/facedet" element={<FaceDet />} />  
        <Route path="/lostfound" element={<LostFound />} />
        <Route path="/stampede" element={<Stampede />} />
        <Route path="/ticket" element={<Ticket />} />
        <Route path="/generateticket" element={<GenerateTicket />} />
        <Route path="/validateticket" element={<ValidateTicket />} />
      </Routes>
    </>
  );
}

export default App;
