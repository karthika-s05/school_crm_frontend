import React from "react";

export default function Tabs({ tabs, activeTab, onTabChange, onRefresh }) {
  return (
    <div className="mod-filter-card" style={{ padding: "10px 16px" }}>
      <div className="mod-tabs">
        {tabs.map((t) => (
          <button
            key={t.id}
            className={`mod-tab${activeTab === t.id ? " active" : ""}`}
            onClick={() => onTabChange(t.id)}
          >
            <i className={`bx ${t.icon}`}></i> {t.label}
          </button>
        ))}
      </div>
      <button
        className="mod-btn mod-btn-ghost"
        style={{ marginLeft: "auto" }}
        onClick={onRefresh}
      >
        <i className="bx bx-refresh"></i> Refresh
      </button>
    </div>
  );
}
