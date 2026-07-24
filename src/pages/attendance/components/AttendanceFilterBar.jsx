import React from "react";

/** Card wrapper for filter fields; pass FilterGroup / SearchBox / buttons as children */
export const AttendanceFilterBar = ({ children }) => (
  <div className="av2-filter-card">{children}</div>
);

export const FilterGroup = ({ label, grow, children }) => (
  <div className={`av2-filter-group${grow ? " grow" : ""}`}>
    <label>{label}</label>
    {children}
  </div>
);

export const FilterSelect = ({ value, onChange, options, placeholder, disabled }) => (
  <select
    className="av2-input"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    disabled={disabled}
  >
    {placeholder !== undefined && <option value="">{placeholder}</option>}
    {options.map((o) => (
      <option key={o.id} value={o.id}>
        {o.name}
      </option>
    ))}
  </select>
);

export const SearchBox = ({ value, onChange, placeholder = "Search…" }) => (
  <div className="av2-search">
    <i className="bx bx-search"></i>
    <input
      type="text"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

/** Normalize class/section/subject master rows to { id, name } options */
export const toOptions = (rows, nameKeys = ["name"]) =>
  (Array.isArray(rows) ? rows : []).map((r) => ({
    id: r.id,
    name: nameKeys.map((k) => r[k]).find((v) => v) || r.name || r.className || r.sectionName || r.subjectName || String(r.id),
  }));
