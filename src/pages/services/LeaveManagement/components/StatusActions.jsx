import React, { useState } from "react";

export default function StatusActions({ row, onUpdate, type }) {
  const [busy, setBusy] = useState(false);
  const status = (row.status || "Pending").toLowerCase();

  if (status === "accepted" || status === "rejected") return null;

  const handle = async (status) => {
    const remarks = window.prompt(
      `Enter remarks for ${status.toLowerCase()} leave (optional):`, ""
    );
    if (remarks === null) return;
    setBusy(true);
    await onUpdate(row.id, status, remarks, type);
    setBusy(false);
  };

  return (
    <div className="lv-action-row">
      <button
        className="lv-action-btn approve"
        disabled={busy}
        title="Approve"
        onClick={() => handle("Accepted")}
      >
        <i className="bx bx-check"></i> Accept
      </button>
      <button
        className="lv-action-btn reject"
        disabled={busy}
        title="Reject"
        onClick={() => handle("Rejected")}
      >
        <i className="bx bx-x"></i> Reject
      </button>
    </div>
  );
}
