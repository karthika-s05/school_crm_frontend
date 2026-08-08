import React from "react";
import { fmt, STATUS_COLOR, STATUS_ICON, getRowName, STUDENT_LEAVE_TYPES } from "../utils/leaveHelpers";

const STUDENT_LEAVE_LABEL = Object.fromEntries(
  STUDENT_LEAVE_TYPES.map((lt) => [lt.id, lt.label])
);

export default function LeaveTable({
  rows,
  loading,
  emptyMessage = "No leave records found.",
}) {
  if (loading) {
    return (
      <div className="mod-loading">
        <div className="mod-spinner"></div> Loading…
      </div>
    );
  }

  if (!rows.length) {
    return (
      <div className="mod-empty">
        <i className="bx bx-calendar-x"></i>
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="lv-table-wrap">
      <table className="mod-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>From</th>
            <th>To</th>
            <th>Days</th>
            <th>Reason</th>
            <th>Type</th>
            <th>Status</th>
            <th>Remarks</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const status     = row.status || "Pending";
            const statusKey  = status.toLowerCase();
            const badgeClass = STATUS_COLOR[statusKey] || "mod-badge-gray";
            const iconClass  = STATUS_ICON[statusKey] || "bx-circle";

            return (
              <tr key={row.id || i}>
                <td>
                  <div className="mod-avatar-cell">
                    <div className="mod-avatar" style={{ background: "#2D3A8C" }}>
                      {(getRowName(row)[0] || "?").toUpperCase()}
                    </div>
                    <div>
                      <div className="mod-cell-name">{getRowName(row)}</div>
                      {row.className && (
                        <div className="mod-cell-sub">
                          {row.className}
                          {row.sectionName ? ` – ${row.sectionName}` : ""}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td>{fmt(row.startDate || row.fromDate)}</td>
                <td>{fmt(row.endDate   || row.toDate)}</td>
                <td>
                  <span className="lv-days-chip">{row.noOfDays ?? "-"}</span>
                </td>
                <td className="lv-reason-cell" title={row.reason || ""}>
                  {row.reason || "-"}
                </td>
                <td>{STUDENT_LEAVE_LABEL[row.leaveType] || row.leaveType || row.leaveTypeName || "-"}</td>
                <td>
                  <span className={`mod-badge ${badgeClass}`}>
                    <i className={`bx ${iconClass}`}></i>
                    {status}
                  </span>
                </td>
                <td className="lv-reason-cell" title={row.remarks || ""}>
                  {row.remarks || "-"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
