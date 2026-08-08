import React, { useState } from "react";
import { toast } from "react-toastify";
import {
  EMPTY_FORM,
  STUDENT_LEAVE_TYPES,
  calcDays,
} from "../utils/leaveHelpers";

export default function ApplyLeaveForm({
  isStaff,
  leaveTypes,
  onSubmit,
  onCancel,
  submitting,
}) {
  const [form, setForm] = useState(EMPTY_FORM);

  const days = calcDays(
    form.startDate,
    form.endDate,
    form.leaveTime
  );

  const dateErr =
    form.startDate &&
    form.endDate &&
    new Date(form.endDate) < new Date(form.startDate);

  const set = (field) => (e) =>
    setForm((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));

  const handleSubmit = (e) => {
    e.preventDefault();

    if (dateErr) {
      toast.error("End date cannot be before start date.");
      return;
    }

    if (!form.reason.trim()) {
      toast.error("Please enter a reason for leave.");
      return;
    }

    if (!form.leaveTypeId) {
      toast.error("Please select a leave type.");
      return;
    }

    if (!form.leaveTime) {
      toast.error("Please select leave duration.");
      return;
    }

    onSubmit(form);
  };

  const daysLabel =
    days === 0.5
      ? "half day"
      : days === 1
      ? "day"
      : "days";

  return (
    <div>
      <div className="lv-form-header">
        <h3>Apply for Leave</h3>

        {days > 0 && (
          <div className="lv-duration-badge">
            {days} {daysLabel}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="lv-form-grid">

          {/* From Date */}
          <div className="mod-form-group">
            <label>
              From Date <span className="lv-required">*</span>
            </label>

            <input
              className="mod-input"
              type="date"
              required
              value={form.startDate}
              onChange={set("startDate")}
            />
          </div>

          {/* To Date */}
          <div className="mod-form-group">
            <label>
              To Date <span className="lv-required">*</span>
            </label>

            <input
              className={`mod-input${
                dateErr ? " lv-input-err" : ""
              }`}
              type="date"
              required
              value={form.endDate}
              onChange={set("endDate")}
              min={form.startDate || undefined}
            />

            {dateErr && (
              <span className="lv-err-msg">
                <i className="bx bx-error"></i>
                End date must be after start date
              </span>
            )}
          </div>

          {/* Leave Type */}
          <div className="mod-form-group">
            <label>
              Leave Type <span className="lv-required">*</span>
            </label>

            <select
              className="mod-input"
              required
              value={form.leaveTypeId}
              onChange={set("leaveTypeId")}
            >
              <option value="">Select leave type</option>

              {isStaff
                ? leaveTypes.map((lt) => (
                    <option key={lt.id} value={lt.id}>
                      {lt.leaveType ||
                        lt.name ||
                        lt.leaveTypeName}
                    </option>
                  ))
                : STUDENT_LEAVE_TYPES.map((lt) => (
                    <option key={lt.id} value={lt.id}>
                      {lt.label}
                    </option>
                  ))}
            </select>
          </div>

          {/* Leave Duration - Staff and Student */}
          <div className="mod-form-group">
            <label>
              Leave Duration{" "}
              <span className="lv-required">*</span>
            </label>

            <select
              className="mod-input"
              required
              value={form.leaveTime}
              onChange={set("leaveTime")}
            >
              <option value="Full day">Full Day</option>
              <option value="Half day">Half Day</option>
            </select>

            {days > 0 && (
              <small className="lv-helper-text">
                Total Duration: {days} {daysLabel}
              </small>
            )}
          </div>

          {/* Reason */}
          <div className="mod-form-group lv-full-col">
            <label>
              Reason <span className="lv-required">*</span>
            </label>

            <textarea
              className="mod-input lv-textarea"
              required
              placeholder="Describe the reason for your leave request…"
              value={form.reason}
              onChange={set("reason")}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="lv-form-actions">
          <button
            type="button"
            className="mod-btn mod-btn-ghost"
            onClick={onCancel}
          >
            <i className="bx bx-x"></i>
            Cancel
          </button>

          <button
            type="submit"
            className="mod-btn mod-btn-primary"
            disabled={submitting || !!dateErr}
          >
            {submitting ? (
              <>
                <span className="lv-spinner"></span>
                Submitting…
              </>
            ) : (
              <>
                <i className="bx bx-send"></i>
                Submit Leave Request
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

