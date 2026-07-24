import React, { useState } from "react";
import { normalizeStatus } from "../constants";

/**
 * Small modal to edit status + remarks of one attendance record.
 * record: { id, name, date, status, remarks }
 * onSave: async ({ status, remarks }) => void
 */
const EditAttendanceModal = ({ record, statuses, onSave, onClose }) => {
  const [status, setStatus] = useState(normalizeStatus(record.status) || "");
  const [remarks, setRemarks] = useState(record.remarks || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!status) return;
    setSaving(true);
    try {
      await onSave({ status, remarks });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="av2-modal-overlay" onClick={onClose}>
      <div className="av2-modal" onClick={(e) => e.stopPropagation()}>
        <div className="av2-modal-head">
          <h3>Edit Attendance</h3>
          <button type="button" className="av2-modal-close" onClick={onClose}>
            <i className="bx bx-x"></i>
          </button>
        </div>
        <div className="av2-modal-body">
          <div className="av2-filter-group" style={{ minWidth: 0 }}>
            <label>Record</label>
            <div style={{ fontSize: 13.5, color: "#334155", fontWeight: 600 }}>
              {record.name} {record.date ? `· ${record.date}` : ""}
            </div>
          </div>
          <div className="av2-filter-group" style={{ minWidth: 0 }}>
            <label>Status</label>
            <select className="av2-input" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">- Select status -</option>
              {statuses.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="av2-filter-group" style={{ minWidth: 0 }}>
            <label>Remarks</label>
            <input
              className="av2-input"
              type="text"
              maxLength={200}
              placeholder="Optional remarks…"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </div>
        </div>
        <div className="av2-modal-footer">
          <button type="button" className="av2-btn av2-btn-ghost" onClick={onClose}>Cancel</button>
          <button
            type="button"
            className="av2-btn av2-btn-primary"
            onClick={handleSave}
            disabled={saving || !status}
          >
            <i className="bx bx-save"></i> {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditAttendanceModal;
