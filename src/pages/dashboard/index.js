import React from "react";
import "./dashboard.css";
import { getUserData } from "../../services/auth";
import StaffDashboard from "../../component/StaffDashboard/Dashboard";
import AdminDashboard from "../../component/AdminDashboard/AdminDashboard";
import StudentDashboard from "../../component/StudentDashboard/StudentDashboard";

const Dashboard = () => {
  const role = getUserData("role");
  if (role === "Admin") return <AdminDashboard />;
  if (role === "Student") return <StudentDashboard />;
  return <StaffDashboard />;
};

export default Dashboard;
