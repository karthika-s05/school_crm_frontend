import React, { useMemo, useState } from "react";
import LeaveTable from "./LeaveTable";
import { filterLeaves } from "../utils/leaveHelpers";

export default function MyLeave({ leaves, loading, type }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () => filterLeaves(leaves, search),
    [leaves, search]
  );

  return (
    <div className="mod-table-card">
      <div className="mod-table-toolbar">
        <span style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>
          <i className="bx bx-history" style={{ marginRight: 6 }}></i>
          My Leave History
        </span>
        <span className="mod-pill blue">
          <i className="bx bx-calendar"></i> {leaves.length} records
        </span>
      </div>

      {/* Search */}
      <div style={{ padding: "10px 16px 0" }}>
        <div className="mod-search-wrap">
          <i className="bx bx-search mod-search-icon"></i>
          <input
            className="mod-search-input"
            placeholder="Search by reason, type or status…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="mod-search-clear" onClick={() => setSearch("")}>
              <i className="bx bx-x"></i>
            </button>
          )}
        </div>
      </div>

      <div className="mod-table-body-wrap">
        <LeaveTable
          rows={filtered}
          loading={loading}
          emptyMessage="No leave requests found. Click 'Apply Leave' to submit one."
        />
      </div>
    </div>
  );
}
