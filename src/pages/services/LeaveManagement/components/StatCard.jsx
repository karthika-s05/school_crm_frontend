import React from "react";

export default function StatCard({ icon, label, value, color }) {
  return (
    <div className="mod-stat-card">
      <div className="mod-stat-icon" style={{ background: `${color}20`, color }}>
        {icon}
      </div>
      <div className="mod-stat-body">
        <div className="mod-stat-val">{value}</div>
        <div className="mod-stat-label">{label}</div>
      </div>
    </div>
  );
}
