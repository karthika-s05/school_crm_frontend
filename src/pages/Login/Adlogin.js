import React, { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faUser, faLock } from "@fortawesome/free-solid-svg-icons";
import { useFormik } from "formik";
import { useNavigate } from "react-router-dom";
import { login } from "../../services/api";
import { setToken, setUserData } from "../../services/auth";
import { ToastContainer, toast } from "react-toastify";
import "./adlogin.css";
import "../../assets/illustrations/schoolTheme.css";
import { SchoolCampusScene } from "../../assets/illustrations/SchoolIllustrations";

export default function Adlogin() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current.focus();
  }, []);

  const validate = (values) => {
    const errors = {};
    if (!values.username) errors.username = "Please enter your username";
    if (!values.password) errors.password = "Please enter your password";
    return errors;
  };

  const handleSubmit = async (values) => {
    try {
      const { username, password } = values;
      const token = await login(username, password);
      console.log(token);
      const userData = token.data[0];
      setToken(token.token.accessToken);
      setUserData("role", userData.role);
      // Store display name for all roles
      if (userData.role === "Staff") {
        setUserData("staffName", userData.staffName || userData.adminName || username);
      } else if (userData.role === "Student") {
        setUserData("studentName", userData.studentName || userData.firstName || username);
        setUserData("admissionNo", userData.admissionNo || userData.AdmissionNo || "");
        setUserData("classId", userData.classId || "");
        setUserData("sectionId", userData.sectionId || "");
      } else {
        setUserData("adminName", userData.adminName || username);
      }
      setUserData("image", userData.photoUrl || "");
      const redirectPath = userData.role === "Staff" ? "/staff/dashboard"
        : userData.role === "Student" ? "/student/dashboard"
        : "/dashboard";
      toast.success("Login successful!", {
        onClose: () => {
          navigate(redirectPath);
          window.location.reload();
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage("Invalid credentials. Please try again.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (/^[a-zA-Z0-9\s]*$/.test(value) || value === "") {
      formik.setFieldValue(name, value);
    }
  };

  const formik = useFormik({
    initialValues: { username: "", password: "" },
    validate,
    onSubmit: handleSubmit,
  });

  return (
    <div className="adlogin-wrapper">
      {/* Left Panel */}
      <div className="adlogin-left">
        <span className="adlogin-float-deco d1"><i className="bx bxs-book-open"></i></span>
        <span className="adlogin-float-deco d2"><i className="bx bxs-star"></i></span>
        <span className="adlogin-float-deco d3"><i className="bx bxs-graduation"></i></span>
        <span className="adlogin-float-deco d4"><i className="bx bxs-pencil"></i></span>
        <span className="adlogin-float-deco d5"><i className="bx bxs-backpack"></i></span>
        <div className="adlogin-left-content">
          <div className="adlogin-scene-wrap">
            <SchoolCampusScene width={320} />
          </div>
          <h1 className="adlogin-school-name">KST InfoTech</h1>
          <p className="adlogin-tagline">Empowering Education, Shaping Futures</p>
          <div className="adlogin-estd">ESTD 2000</div>
          <div className="adlogin-stars">
            <span>★</span><span>★</span><span>★</span>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="adlogin-right">
        <div className="adlogin-form-card">
          <div className="adlogin-form-header">
            <div style={{ fontSize: 36, color: "#2D3A8C", marginBottom: 8 }}>
              <i className="bx bxs-school"></i>
            </div>
            <h2>Welcome Back</h2>
            <p>Sign in to your account to continue</p>
          </div>

          <form onSubmit={formik.handleSubmit} className="adlogin-form">
            <div className="adlogin-field">
              <label>Username</label>
              <div className="adlogin-input-wrap">
                <span className="adlogin-input-icon">
                  <FontAwesomeIcon icon={faUser} />
                </span>
                <input
                  ref={inputRef}
                  type="text"
                  name="username"
                  placeholder="Enter your username"
                  onChange={handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.username}
                  onPaste={(e) => e.preventDefault()}
                  className={formik.touched.username && formik.errors.username ? "adlogin-input error" : "adlogin-input"}
                />
              </div>
              {formik.touched.username && formik.errors.username && (
                <span className="adlogin-error">{formik.errors.username}</span>
              )}
            </div>

            <div className="adlogin-field">
              <label>Password</label>
              <div className="adlogin-input-wrap">
                <span className="adlogin-input-icon">
                  <FontAwesomeIcon icon={faLock} />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.password}
                  onPaste={(e) => e.preventDefault()}
                  className={formik.touched.password && formik.errors.password ? "adlogin-input error" : "adlogin-input"}
                />
                <button
                  type="button"
                  className="adlogin-eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} />
                </button>
              </div>
              {formik.touched.password && formik.errors.password && (
                <span className="adlogin-error">{formik.errors.password}</span>
              )}
            </div>

            {errorMessage && (
              <div className="adlogin-error-box">{errorMessage}</div>
            )}

            <button type="submit" className="adlogin-submit-btn">
              Sign In
            </button>
          </form>
        </div>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={1000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        style={{ fontSize: "14px" }}
      />
    </div>
  );
}
