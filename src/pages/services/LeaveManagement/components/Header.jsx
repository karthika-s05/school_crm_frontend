import React from "react";

export default function Header({ role }) {
  const subtitle = {
    Admin:   "Manage staff leave requests and apply your own leave",
    Staff:   "Manage student leave requests and apply your own leave",
    Student: "Apply for leave and view your leave history",
  }[role] || "";

  return (
    <div className="mod-header">
      <div>
        <h2 className="mod-title">
          <i className="bx bx-calendar-check" style={{ color: "#2D3A8C", marginRight: 8 }}></i>
          Leave Management
        </h2>
        {subtitle && <p className="mod-sub">{subtitle}</p>}
      </div>
    </div>
  );
}
