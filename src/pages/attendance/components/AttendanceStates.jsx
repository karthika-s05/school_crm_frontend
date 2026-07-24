import React from "react";

export const LoadingState = ({ text = "Loading…" }) => (
  <div className="av2-state">
    <div className="av2-spinner"></div>
    {text}
  </div>
);

export const ErrorState = ({ text = "Something went wrong. Please try again.", onRetry }) => (
  <div className="av2-state error">
    <i className="bx bx-error-circle"></i>
    <span>{text}</span>
    {onRetry && (
      <button className="av2-btn av2-btn-outline av2-btn-sm" onClick={onRetry}>
        <i className="bx bx-refresh"></i> Retry
      </button>
    )}
  </div>
);

export const EmptyState = ({ text = "No records found", icon = "bx bx-calendar-x" }) => (
  <div className="av2-state">
    <i className={icon}></i>
    <span>{text}</span>
  </div>
);
