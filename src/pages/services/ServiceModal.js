import React, { useEffect } from "react";
import { createPortal } from "react-dom";

export default function ServiceModal({
  open,
  onClose,
  title,
  headerContent,
  children,
  footer,
  width,
  className = "",
}) {
  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div className="svc-overlay" onClick={onClose}>
      <div
        className={`svc-modal ${className}`.trim()}
        style={width ? { width } : undefined}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === "string" ? title : "Details"}
      >
        <div className="svc-modal-hdr">
          <div className="svc-modal-hdr-main">
            {headerContent || (title ? <span className="svc-modal-title">{title}</span> : null)}
          </div>
          <button type="button" className="svc-modal-close" onClick={onClose} aria-label="Close">
            <i className="bx bx-x"></i>
          </button>
        </div>
        <div className="svc-modal-body">{children}</div>
        {footer ? <div className="svc-modal-footer">{footer}</div> : null}
      </div>
    </div>,
    document.body
  );
}
