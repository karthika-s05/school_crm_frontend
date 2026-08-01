import React, { useState } from "react";
import "./index.css";
import { login } from "../../services/api";
import { setToken, setUserData } from "../../services/auth";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
const Login = () => {
  const history = useNavigate();
  const [userName, setUsername] = useState(0);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const token = await login(userName, password);

      if (token.status === "success") {
        if (token.data[0].role === "Admin") {
          setToken(token.token.accessToken);
          setUserData("role", token.data[0].role);
          setUserData("adminName", token.data[0].adminName);
          setUserData("image", token.data[0].photoUrl);
          // history("/dashboard");
          // window.location.reload();
        } else if (token.data[0].role === "Staff") {
          setToken(token.token.accessToken);
          setUserData("role", token.data[0].role);
          setUserData("staffName", token.data[0].staffName);
          setUserData("image", token.data[0].image);
          // history("/dashboard");
          // window.location.reload();
        } else {
          setToken("");
          alert("Only Teacher and Admin Login");
        }
      } else {
        setErrorMessage(token.data);
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error)
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <>
      <div className="main-wrap">
        <div className="box-container">
          <div className="img-box"></div>
          <div className="form-wrap">
            <div className="mid-container">
              <h1 style={{ color: "#004f83" }}>Welcome Back</h1>
              <h6>Login your Account</h6>
              {/* {errorMessage && (
                <div className="error-message">{errorMessage}</div>
              )} */}
              <form action="" className="form">
                <label>Username</label>
                <br />
                <input
                  type="username"
                  name="username"
                  placeholder="Username"
                  onChange={(e) => setUsername(e.target.value)}
                />

                <br />
                <br />
                <label>Password</label>
                <div className="password-input" style={{ display: "flex" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password"
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="toggle-password-btn"
                    onClick={togglePasswordVisibility}
                    style={{
                      height: "33px",
                      marginLeft: "-56px",
                      borderBottom: "1px solid #0067ac",
                      backgroundColor: "rgb(232,240,254)",
                    }}
                  >
                    <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} />
                  </button>
                </div>
                <br />
                <br />
                <button
                  type="submit"
                  className="login-btn"
                  onClick={handleLogin}
                >
                  Login
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
