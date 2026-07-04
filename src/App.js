// App.js
import React, { useState } from 'react';
import './App.css';
import Navbar from './component/NavBar/Nav';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { getToken } from './services/auth'
import Adlogin from './pages/Login/Adlogin';
// import Modal from './component/modals/Modal';

function App() {
  const token = getToken();
  return (
    <Router>
      <div className="App">
        {!token ? (
          <Routes>
            <Route path="/" element={<Adlogin />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        ) : (
          <Navbar />
        )}
      </div>
    </Router>
  );
}

export default App;
