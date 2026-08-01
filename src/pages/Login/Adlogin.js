import React, { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faUser, faLock } from "@fortawesome/free-solid-svg-icons";
import { useFormik } from "formik";
import { login, forgotPassword, verifyOtp, updatePassword } from "../../services/api";
import {
  setToken,
  setUserData,
  notifyAuthChanged,
  POST_LOGIN_REDIRECT_KEY,
  getRememberedUsername,
  setRememberedUsername,
} from "../../services/auth";
import { ToastContainer, toast } from "react-toastify";
import "./adlogin.css";
import "../../assets/illustrations/schoolTheme.css";
import { SchoolCampusScene } from "../../assets/illustrations/SchoolIllustrations";

const FORGOT_STEPS = { USERNAME: 1, OTP: 2, PASSWORD: 3 };

export default function Adlogin() {
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [rememberMe, setRememberMe] = useState(!!getRememberedUsername());
  const [view, setView] = useState("login"); // login | forgot
  const [forgotStep, setForgotStep] = useState(FORGOT_STEPS.USERNAME);
  const [forgotUser, setForgotUser] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [forgotBusy, setForgotBusy] = useState(false);
  const [forgotError, setForgotError] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (view === "login" && inputRef.current) inputRef.current.focus();
  }, [view]);

  const validate = (values) => {
    const errors = {};
    if (!values.username) errors.username = "Please enter your username";
    if (!values.password) errors.password = "Please enter your password";
    return errors;
  };

  const handleSubmit = async (values) => {
    try {
      setErrorMessage("");
      const { username, password } = values;
      const token = await login(username, password);
      if (String(token?.status || "").toLowerCase() !== "success") {
        setErrorMessage(token?.data || "Invalid credentials. Please try again.");
        return;
      }
      const userData = Array.isArray(token.data) ? token.data[0] : token.data;
      if (!userData) {
        setErrorMessage("Invalid credentials. Please try again.");
        return;
      }
      setToken(token.token.accessToken);
      if (rememberMe) setRememberedUsername(username);
      else setRememberedUsername("");

      setUserData("role", userData.role);
      if (userData.role === "Staff") {
        setUserData("staffName", userData.staffName || userData.adminName || username);
      } else if (userData.role === "Student") {
        setUserData("studentName", userData.studentName || userData.firstName || username);
        setUserData("admissionNo", userData.admissionNo || userData.AdmissionNo || "");
        setUserData("classId", userData.classId || "");
        setUserData("sectionId", userData.sectionId || "");
        setUserData("className", userData.className || "");
        setUserData("sectionName", userData.sectionName || "");
      } else {
        setUserData("adminName", userData.adminName || username);
      }
      setUserData("image", userData.photoUrl || "");
      const redirectPath =
        userData.role === "Staff"
          ? "/staff/dashboard"
          : userData.role === "Student"
            ? "/student/dashboard"
            : "/dashboard";
      sessionStorage.setItem(POST_LOGIN_REDIRECT_KEY, redirectPath);
      flushSync(() => {
        notifyAuthChanged();
      });
      toast.success("Login successful!");
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
    initialValues: {
      username: getRememberedUsername(),
      password: "",
    },
    validate,
    onSubmit: handleSubmit,
  });

  const openForgot = () => {
    setView("forgot");
    setForgotStep(FORGOT_STEPS.USERNAME);
    setForgotUser(formik.values.username || getRememberedUsername() || "");
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setForgotError("");
    setErrorMessage("");
  };

  const backToLogin = () => {
    setView("login");
    setForgotError("");
    setForgotBusy(false);
  };

  const handleForgotUsername = async (e) => {
    e.preventDefault();
    const user = String(forgotUser || "").trim();
    if (!user) {
      setForgotError("Please enter your username");
      return;
    }
    setForgotBusy(true);
    setForgotError("");
    try {
      const res = await forgotPassword(user);
      if (String(res?.status || "").toLowerCase() !== "success") {
        setForgotError(res?.data || res?.message || "Could not send OTP. Check username.");
        return;
      }
      const sentTo = res?.email || res?.message || "";
      toast.success(
        sentTo && /@/.test(String(sentTo))
          ? `OTP sent to ${sentTo}`
          : res?.message || "OTP sent to your registered email."
      );
      setForgotStep(FORGOT_STEPS.OTP);
    } catch (err) {
      console.error(err);
      setForgotError("Could not reach server. Please try again.");
    } finally {
      setForgotBusy(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const code = String(otp || "").trim();
    if (!code) {
      setForgotError("Please enter the OTP");
      return;
    }
    setForgotBusy(true);
    setForgotError("");
    try {
      const res = await verifyOtp({ otp: code, userName: forgotUser });
      if (String(res?.status || "").toLowerCase() !== "success") {
        setForgotError(res?.data || "OTP verification failed");
        return;
      }
      toast.success("OTP verified");
      setForgotStep(FORGOT_STEPS.PASSWORD);
    } catch (err) {
      console.error(err);
      setForgotError("OTP verification failed. Please try again.");
    } finally {
      setForgotBusy(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setForgotError("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setForgotError("Passwords do not match");
      return;
    }
    setForgotBusy(true);
    setForgotError("");
    try {
      const res = await updatePassword({ userName: forgotUser, password: newPassword });
      if (String(res?.status || "").toLowerCase() !== "success") {
        setForgotError(res?.data || "Could not update password");
        return;
      }
      toast.success("Password updated. Please sign in.");
      formik.setFieldValue("username", forgotUser);
      formik.setFieldValue("password", "");
      backToLogin();
    } catch (err) {
      console.error(err);
      setForgotError("Could not update password. Please try again.");
    } finally {
      setForgotBusy(false);
    }
  };

  return (
    <div className="adlogin-wrapper">
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

      <div className="adlogin-right">
        <div className="adlogin-form-card">
          {view === "login" ? (
            <>
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
                      className={
                        formik.touched.username && formik.errors.username
                          ? "adlogin-input error"
                          : "adlogin-input"
                      }
                      autoComplete="username"
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
                      className={
                        formik.touched.password && formik.errors.password
                          ? "adlogin-input error"
                          : "adlogin-input"
                      }
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="adlogin-eye-btn"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} />
                    </button>
                  </div>
                  {formik.touched.password && formik.errors.password && (
                    <span className="adlogin-error">{formik.errors.password}</span>
                  )}
                </div>

                <div className="adlogin-options">
                  <label className="adlogin-remember">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <span>Remember Me</span>
                  </label>
                  <button type="button" className="adlogin-forgot-link" onClick={openForgot}>
                    Forgot Password?
                  </button>
                </div>

                {errorMessage && <div className="adlogin-error-box">{errorMessage}</div>}

                <button type="submit" className="adlogin-submit-btn">
                  Sign In
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="adlogin-form-header">
                <div style={{ fontSize: 36, color: "#2D3A8C", marginBottom: 8 }}>
                  <i className="bx bxs-lock-open"></i>
                </div>
                <h2>Forgot Password</h2>
                <p>
                  {forgotStep === FORGOT_STEPS.USERNAME && "Enter your username to receive an OTP on email"}
                  {forgotStep === FORGOT_STEPS.OTP && "Enter the OTP sent to your registered email"}
                  {forgotStep === FORGOT_STEPS.PASSWORD && "Create a new password for your account"}
                </p>
              </div>

              {forgotStep === FORGOT_STEPS.USERNAME && (
                <form onSubmit={handleForgotUsername} className="adlogin-form">
                  <div className="adlogin-field">
                    <label>Username</label>
                    <div className="adlogin-input-wrap">
                      <span className="adlogin-input-icon">
                        <FontAwesomeIcon icon={faUser} />
                      </span>
                      <input
                        type="text"
                        className="adlogin-input"
                        placeholder="Enter your username"
                        value={forgotUser}
                        onChange={(e) => setForgotUser(e.target.value)}
                        autoComplete="username"
                      />
                    </div>
                  </div>
                  {forgotError && <div className="adlogin-error-box">{forgotError}</div>}
                  <button type="submit" className="adlogin-submit-btn" disabled={forgotBusy}>
                    {forgotBusy ? "Sending…" : "Send OTP"}
                  </button>
                  <button type="button" className="adlogin-back-link" onClick={backToLogin}>
                    Back to Sign In
                  </button>
                </form>
              )}

              {forgotStep === FORGOT_STEPS.OTP && (
                <form onSubmit={handleVerifyOtp} className="adlogin-form">
                  <div className="adlogin-field">
                    <label>OTP</label>
                    <div className="adlogin-input-wrap">
                      <span className="adlogin-input-icon">
                        <i className="bx bx-key"></i>
                      </span>
                      <input
                        type="text"
                        className="adlogin-input"
                        placeholder="Enter OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 8))}
                        inputMode="numeric"
                        autoComplete="one-time-code"
                      />
                    </div>
                  </div>
                  {forgotError && <div className="adlogin-error-box">{forgotError}</div>}
                  <button type="submit" className="adlogin-submit-btn" disabled={forgotBusy}>
                    {forgotBusy ? "Verifying…" : "Verify OTP"}
                  </button>
                  <button type="button" className="adlogin-back-link" onClick={backToLogin}>
                    Back to Sign In
                  </button>
                </form>
              )}

              {forgotStep === FORGOT_STEPS.PASSWORD && (
                <form onSubmit={handleResetPassword} className="adlogin-form">
                  <div className="adlogin-field">
                    <label>New Password</label>
                    <div className="adlogin-input-wrap">
                      <span className="adlogin-input-icon">
                        <FontAwesomeIcon icon={faLock} />
                      </span>
                      <input
                        type={showNewPassword ? "text" : "password"}
                        className="adlogin-input"
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        className="adlogin-eye-btn"
                        onClick={() => setShowNewPassword((v) => !v)}
                        aria-label="Toggle password"
                      >
                        <FontAwesomeIcon icon={showNewPassword ? faEye : faEyeSlash} />
                      </button>
                    </div>
                  </div>
                  <div className="adlogin-field">
                    <label>Confirm Password</label>
                    <div className="adlogin-input-wrap">
                      <span className="adlogin-input-icon">
                        <FontAwesomeIcon icon={faLock} />
                      </span>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        className="adlogin-input"
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        className="adlogin-eye-btn"
                        onClick={() => setShowConfirmPassword((v) => !v)}
                        aria-label="Toggle password"
                      >
                        <FontAwesomeIcon icon={showConfirmPassword ? faEye : faEyeSlash} />
                      </button>
                    </div>
                  </div>
                  {forgotError && <div className="adlogin-error-box">{forgotError}</div>}
                  <button type="submit" className="adlogin-submit-btn" disabled={forgotBusy}>
                    {forgotBusy ? "Updating…" : "Update Password"}
                  </button>
                  <button type="button" className="adlogin-back-link" onClick={backToLogin}>
                    Back to Sign In
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>

      <ToastContainer position="bottom-right" autoClose={2500} style={{ zIndex: 99999, fontSize: 14 }} />
    </div>
  );
}
