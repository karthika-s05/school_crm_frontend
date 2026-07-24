import React from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/** Single app-wide toast host — bottom-right, above header/nav. */
export default function AppToastContainer() {
  return (
    <ToastContainer
      position="bottom-right"
      autoClose={2500}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="colored"
      style={{ zIndex: 99999 }}
      toastStyle={{ zIndex: 99999, fontSize: 14 }}
    />
  );
}
