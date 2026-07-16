import React, { useMemo, useState } from "react";
import LeaveTable from "./LeaveTable";
import StatCard from "./StatCard";
import { statsOf, filterLeaves, filterByStatus } from "../utils/leaveHelpers";

const STATUS_FILTERS = [
  { value: "",         label: "All"      },
  { value: "Pending",  label: "Pending"  },
  { value: "Accepted", label: "Accepted" },
  { value: "Rejected", label: "Rejected" },
];

export default function LeaveApproval({
  leaves,
  loading,
  type,
  onUpdate,
  title,
  icon,
}) {
  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const stats = useMemo(() => statsOf(leaves), [leaves]);

  const filtered = useMemo(() => {
    const bySearch = filterLeaves(leaves, search);
    return filterByStatus(bySearch, statusFilter);
  }, [leaves, search, statusFilter]);

  return (
    <div>
      {/* Statistics */}
      <div className="mod-stat-row">
        <StatCard
          icon={<i className="bx bx-list-ul"></i>}
          label="Total Requests"
          value={stats.total}
          color="#2D3A8C"
        />
        <StatCard
          icon={<i className="bx bx-time-five"></i>}
          label="Pending"
          value={stats.pending}
          color="#d97706"
        />
        <StatCard
          icon={<i className="bx bx-check-circle"></i>}
          label="Accepted"
          value={stats.accepted}
          color="#16a34a"
        />
        <StatCard
          icon={<i className="bx bx-x-circle"></i>}
          label="Rejected"
          value={stats.rejected}
          color="#ef4444"
        />
      </div>

      {/* Table card */}
      <div className="mod-table-card">
        <div className="mod-table-toolbar">
          <span style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>
            <i className={`bx ${icon}`} style={{ marginRight: 6 }}></i>
            {title}
          </span>
          <span className="mod-pill blue">
            <i className="bx bx-list-ul"></i> {leaves.length} records
          </span>
        </div>

        {/* Search + Status filter */}
        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            padding: "10px 16px 0",
            alignItems: "center",
          }}
        >
          <div className="mod-search-wrap" style={{ flex: 1, minWidth: 200 }}>
            <i className="bx bx-search mod-search-icon"></i>
            <input
              className="mod-search-input"
              placeholder="Search by name, reason, type or status…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="mod-search-clear" onClick={() => setSearch("")}>
                <i className="bx bx-x"></i>
              </button>
            )}
          </div>

          <div style={{ display: "flex", gap: 6 }}>
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                className={`mod-btn ${statusFilter === f.value ? "mod-btn-primary" : "mod-btn-ghost"}`}
                style={{ padding: "6px 14px", fontSize: 12 }}
                onClick={() => setStatusFilter(f.value)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mod-table-body-wrap">
          <LeaveTable
            rows={filtered}
            loading={loading}
            showActions={true}
            type={type}
            onUpdate={onUpdate}
            emptyMessage={`No ${type} leave requests found.`}
          />
        </div>
      </div>
    </div>
  );
}
