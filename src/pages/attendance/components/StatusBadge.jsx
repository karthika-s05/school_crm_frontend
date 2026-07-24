import React from "react";
import { normalizeStatus, statusMeta } from "../constants";

const StatusBadge = ({ status }) => {
  const label = normalizeStatus(status) || "Unmarked";
  const meta = statusMeta(label);
  return (
    <span className="av2-status-badge" style={{ background: meta.bg, color: meta.color }}>
      <i className={meta.icon}></i>
      {label}
    </span>
  );
};

export default StatusBadge;
