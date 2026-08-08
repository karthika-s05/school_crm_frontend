import React from "react";

/** Header / row checkbox for table selection. */
export function TableSelectCheckbox({
  checked = false,
  indeterminate = false,
  onChange,
  ariaLabel = "Select row",
  disabled = false,
}) {
  return (
    <label className="sdl-check-wrap" onClick={(e) => e.stopPropagation()}>
      <input
        type="checkbox"
        className="sdl-check"
        checked={Boolean(checked)}
        ref={(el) => {
          if (el) el.indeterminate = Boolean(indeterminate) && !checked;
        }}
        onChange={(e) => onChange?.(e.target.checked)}
        disabled={disabled}
        aria-label={ariaLabel}
      />
      <span className="sdl-check-box" aria-hidden="true" />
    </label>
  );
}

/**
 * Toolbar: optional View, plus Edit + Delete for selected rows.
 * Shows validation toasts/messages via onMessage callback.
 */
export function TableSelectionToolbar({
  selectedCount = 0,
  canEdit = false,
  canDelete = false,
  onView,
  onEdit,
  onDelete,
  onMessage,
  viewLabel = "View",
  editLabel = "Edit",
  deleteLabel = "Delete",
  disabled = false,
  hideDelete = false,
}) {
  const handleView = () => {
    if (selectedCount === 0) {
      onMessage?.("Please select a record to view.");
      return;
    }
    if (selectedCount > 1) {
      onMessage?.("Please select only one record to view.");
      return;
    }
    onView?.();
  };

  const handleEdit = () => {
    if (selectedCount === 0) {
      onMessage?.("Please select a record to edit.");
      return;
    }
    if (selectedCount > 1) {
      onMessage?.("Please select only one record to edit.");
      return;
    }
    onEdit?.();
  };

  const handleDelete = () => {
    if (selectedCount === 0) {
      onMessage?.("Please select a record to delete.");
      return;
    }
    onDelete?.();
  };

  return (
    <div className={`sdl-selection-toolbar${selectedCount === 0 ? " idle" : ""}`}>
      {selectedCount > 0 ? (
        <span className="sdl-selection-count">{selectedCount} selected</span>
      ) : (
        <span className="sdl-selection-hint">
          {onView ? "Select a row to view, edit or delete" : "Select rows to edit or delete"}
        </span>
      )}
      {onView && (
        <button
          type="button"
          className="sdl-sel-btn view"
          onClick={handleView}
          disabled={disabled}
          title={
            canEdit
              ? viewLabel
              : selectedCount > 1
                ? "Please select only one record to view."
                : "Please select a record to view."
          }
        >
          <i className="bx bx-show"></i> {viewLabel}
        </button>
      )}
      <button
        type="button"
        className="sdl-sel-btn edit"
        onClick={handleEdit}
        disabled={disabled}
        title={
          canEdit
            ? editLabel
            : selectedCount > 1
              ? "Please select only one record to edit."
              : "Please select a record to edit."
        }
      >
        <i className="bx bx-edit"></i> {editLabel}
      </button>
      {!hideDelete && (
        <button
          type="button"
          className="sdl-sel-btn delete"
          onClick={handleDelete}
          disabled={disabled || !canDelete}
          title={
            canDelete
              ? deleteLabel
              : "Please select a record to delete."
          }
        >
          <i className="bx bx-trash"></i> {deleteLabel}
        </button>
      )}
    </div>
  );
}

/** Confirmation modal for bulk/single delete. */
export function TableDeleteConfirm({
  open,
  count = 1,
  onConfirm,
  onCancel,
  loading = false,
  message,
}) {
  if (!open) return null;
  return (
    <div className="svc-overlay" onClick={() => !loading && onCancel?.()}>
      <div className="svc-modal svc-modal-sm" onClick={(e) => e.stopPropagation()}>
        <div className="svc-delete-body">
          <i className="bx bxs-error-circle svc-delete-icon"></i>
          <p>
            {message ||
              `Are you sure you want to delete the selected record${count > 1 ? "s" : ""}?`}
          </p>
        </div>
        <div className="svc-modal-footer">
          <button
            type="button"
            className="svc-btn-cancel"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            className="svc-btn-danger"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? (
              <><i className="bx bx-loader-alt bx-spin"></i> Deleting…</>
            ) : (
              <><i className="bx bx-trash"></i> Delete</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
