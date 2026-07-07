// App.js
import React from 'react';
import './App.css';
import Navbar from './component/NavBar/Nav';
import StaffNav from './component/NavBar/StaffNav';
import StudentNav from './component/NavBar/StudentNav';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { getToken, getUserData } from './services/auth';
import Adlogin from './pages/Login/Adlogin';

function App() {
  const token = getToken();
  const role  = getUserData("role");
  return (
    <Router>
      <div className="App">
        {!token ? (
          <Routes>
            <Route path="/" element={<Adlogin />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        ) : role === "Staff" ? (
          <StaffNav />
        ) : role === "Student" ? (
          <StudentNav />
        ) : (
          <Navbar />
        )}
      </div>
    </Router>
  );
}

export default App;
