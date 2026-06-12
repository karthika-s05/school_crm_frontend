import React from "react";
import "./dashboard.css";
import { getUserData } from "../../services/auth";
import StaffDashboard from "../../component/StaffDashboard/Dashboard";
import AdminDashboard from "../../component/AdminDashboard/AdminDashboard";

const Dashboard = () => {
  const role = getUserData("role");
  return role === "Admin" ? <AdminDashboard /> : <StaffDashboard />;
};

export default Dashboard;
