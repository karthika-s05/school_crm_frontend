import React from "react";
import { statusMeta } from "../constants";

/**
 * Compact status-count pills.
 * counts: { [statusLabel]: number, total }
 * statuses: ordered list of status labels to display
 */
export const AttendanceSummaryPills = ({ counts, statuses, showTotal = true }) => (
  <div className="av2-summary">
    {statuses.map((s) => {
      const meta = statusMeta(s);
      return (
        <span key={s} className="av2-pill" style={{ background: meta.bg, color: meta.color }}>
          <i className={meta.icon}></i>
          {counts[s] ?? 0} {s}
        </span>
      );
    })}
    {showTotal && (
      <span className="av2-pill" style={{ background: "#eef0fb", color: "#2d3a8c" }}>
        <i className="bx bx-list-ul"></i>
        {counts.total ?? 0} Total
      </span>
    )}
  </div>
);

/**
 * Larger stat cards grid (used on summary dashboards).
 * items: [{ label, value, color, bg, icon }]
 */
export const AttendanceStatCards = ({ items }) => (
  <div className="av2-stat-grid">
    {items.map((it, i) => (
      <div className="av2-stat-card" key={i}>
        <div className="av2-stat-icon" style={{ background: it.bg, color: it.color }}>
          <i className={it.icon}></i>
        </div>
        <div>
          <div className="av2-stat-value">{it.value}</div>
          <div className="av2-stat-label">{it.label}</div>
        </div>
      </div>
    ))}
  </div>
);
