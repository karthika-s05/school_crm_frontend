import React, { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { useFormik } from "formik";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../../services/api";
import { setToken, setUserData } from "../../services/auth";
import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

export default function Adlogin() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current.focus();
  }, []);
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validate = (values) => {
    const errors = {};

    if (!values.username) {
      errors.username = "Please enter your username";
    }

    if (!values.password) {
      errors.password = "Please enter your password";
    }
    return errors;
  };

  const handleSubmit = async (values) => {
    try {
      const { username, password } = values;
      const token = await login(username, password);

      if (token.status === "success") {
        if (token.data[0].role === "Admin") {
          setToken(token.token.accessToken);
          setUserData("role", token.data[0].role);
          setUserData("adminName", token.data[0].adminName);
          setUserData("image", token.data[0].photoUrl);
          toast.success("Login successful!", {
            onClose: () => {
              navigate("/dashboard");
              window.location.reload();
            }
          });
        } else if (token.data[0].role === "Staff") {
          setToken(token.token.accessToken);
          setUserData("role", token.data[0].role);
          setUserData("staffName", token.data[0].staffName);
          setUserData("image", token.data[0].image);
          toast.success("Login successful!", {
            onClose: () => {
              navigate("/dashboard");
              window.location.reload();
            }
          });
        } else {
          setToken("");
          alert("Only Teacher and Admin Login");
        }
      } else {
        setErrorMessage(token.data);
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage("An error occurred during login. Please try again.");
    }
  };

  const handleCopyPaste = (e) => {
    e.preventDefault();
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    const regex = /^[a-zA-Z0-9\s]*$/;

    if (regex.test(value) || value === "") {
      formik.setFieldValue(name, value);
    }
  };

  const formik = useFormik({
    initialValues: {
      username: "",
      password: "",
    },
    validate,
    onSubmit: handleSubmit
  });

  return (
    <>
      <div
        id="horizontal-stepper"
        className="container-fluid p-0 m-0 main_bg_color default-theme"
        style={{ padding: '0px', margin: '0px' }}
      >
        <div
          className="m-0 p-0 h_100 bg_img_css"
          style={{ display: "flex", justifyContent: "center" }}
        >
          <div
            className="row mx-0 w-100 "
            style={{ justifyContent: "center", height: "1107px" }}
          >
            <div
              className="col-md-7 col-sm-12"
              style={{
                height: "100%",
                placeContent: "center",
                boxSizing: "border-box",
                display: "flex",
              }}
            >
              <form
                className="ng-untouched ng-pristine ng-invalid"
                onSubmit={formik.handleSubmit}
              >
                <div
                  className="table-container"
                  style={{
                    background: "white",
                    width: "370px",
                    height: "386px",
                    marginTop: "160px",
                    borderRadius: "8px",
                    marginLeft: "720px",
                  }}
                >
                  <h2
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      fontSize: "25px",
                      fontWeight: "500",
                    }}
                  >
                    Login
                  </h2>
                  <p
                    style={{
                      color: "gray",
                      textAlign: "center",
                      marginLeft: "13px",
                    }}
                  >
                    Welcome back! Please enter your details
                  </p>
                  <div style={{ marginTop: "20px" }}>
                    <div>
                      <label>User Name</label>
                      <input
                        ref={inputRef}
                        type="text"
                        name="username"
                        className={`form-control size ${formik.touched.username && formik.errors.username
                            ? "is-invalid"
                            : ""
                          }`}
                        onChange={handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.username}
                        onPaste={handleCopyPaste}
                        style={{
                          display: "flex",
                          width: "100%",
                          padding: "10px",
                          borderRadius: "5px",
                          border: `1px solid ${formik.touched.username && formik.errors.username
                              ? "red"
                              : "#c8c8c8"
                            }`,
                          marginTop: "5px",
                          fontSize: "13px",
                          backgroundColor: "#f0f1f3",
                        }}
                      />

                      {formik.touched.username && formik.errors.username ? (
                        <div
                          className="text-danger"
                          style={{
                            color: "red",
                            fontSize: "12px",
                            marginBottom: "-10px",
                            marginTop: "1px",
                          }}
                        >
                          {formik.errors.username}
                        </div>
                      ) : null}
                    </div>
                    <div style={{ marginTop: "20px" }}>
                      <label>Password</label>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.password}
                        onPaste={handleCopyPaste}
                        style={{
                          display: "flex",
                          width: "100%",
                          padding: "10px",
                          borderRadius: "5px",
                          border: `1px solid ${formik.touched.password && formik.errors.password
                              ? "red"
                              : "#c8c8c8"
                            }`,
                          marginTop: "5px",
                          backgroundColor: "#f0f1f3",
                          userSelect: "none",
                        }}
                      />{" "}
                      <button
                        type="button"
                        className="toggle-password-btn"
                        onClick={togglePasswordVisibility}
                        style={{
                          marginTop: "-36px",
                          marginRight: "2px",
                          float: "right",
                          backgroundColor: "rgb(232,240,254)",
                        }}
                      >
                        <FontAwesomeIcon
                          icon={showPassword ? faEye : faEyeSlash}
                        />
                      </button>
                      {formik.touched.password && formik.errors.password ? (
                        <div
                          className="text-danger"
                          style={{
                            color: "red",
                            fontSize: "12px",
                            marginBottom: "-10px",
                            marginTop: "1px",
                          }}
                        >
                          {formik.errors.password}
                        </div>
                      ) : null}
                    </div>
                  </div>
                  <Link
                    to="/forgot-password"
                    style={{
                      color: "#0265ff",
                      fontSize: "12px",
                      float: "right",
                      marginTop: "5px",
                    }}
                  >
                    Forgot Password?
                  </Link>
                  {errorMessage && (
                    <div
                      className="text-danger"
                      style={{
                        color: "red",
                        fontSize: "12px",
                        textAlign: "center",
                        marginTop: "10px",
                      }}
                    >
                      {errorMessage}
                    </div>
                  )}
                  <div
                    style={{
                      marginTop: "37px",
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    <button
                      type="submit"
                      className="main_bg_color default-theme custom-button"
                      style={{
                        color: "white",
                        borderRadius: "3px",
                        fontSize: "16px",
                        marginTop: "19px",
                        fontWeight: '500'
                      }}
                    >
                      Login
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
        <ToastContainer
          position="top-right"
          autoClose={1000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          style={{ fontSize: "14px" }}
        />
      </div>
    </>
  );
}
