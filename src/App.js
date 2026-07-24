// App.js
import React, { useEffect, useState } from "react";
import "./App.css";
import Navbar from "./component/NavBar/Nav";
import StaffNav from "./component/NavBar/StaffNav";
import StudentNav from "./component/NavBar/StudentNav";
import AppToastContainer from "./component/AppToastContainer";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { getToken, getUserData, POST_LOGIN_REDIRECT_KEY } from "./services/auth";
import Adlogin from "./pages/Login/Adlogin";

/** Runs inside Router so post-login path works after auth shell mounts. */
function PostLoginRedirect() {
  const navigate = useNavigate();
  useEffect(() => {
    const path = sessionStorage.getItem(POST_LOGIN_REDIRECT_KEY);
    if (!path) return;
    sessionStorage.removeItem(POST_LOGIN_REDIRECT_KEY);
    navigate(path, { replace: true });
  }, [navigate]);
  return null;
}

function App() {
  const [, setAuthTick] = useState(0);

  useEffect(() => {
    const syncAuth = () => setAuthTick((n) => n + 1);
    window.addEventListener("auth-changed", syncAuth);
    window.addEventListener("storage", syncAuth);
    return () => {
      window.removeEventListener("auth-changed", syncAuth);
      window.removeEventListener("storage", syncAuth);
    };
  }, []);

  const token = getToken();
  const role = getUserData("role");

  return (
    <Router>
      <div className="App">
        <AppToastContainer />
        {token ? <PostLoginRedirect /> : null}
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
