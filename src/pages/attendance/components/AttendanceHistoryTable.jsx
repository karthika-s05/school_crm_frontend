import React, { useEffect, useMemo, useState } from "react";
import { avatarColor, getInitials } from "../constants";
import StatusBadge from "./StatusBadge";
import { LoadingState, EmptyState, ErrorState } from "./AttendanceStates";
import Pagination from "./Pagination";

const PAGE_SIZE = 10;

/**
 * Reusable read-only history/records table with search + pagination.
 *
 * rows:    [{ id, name, subLabel, date, extra: {colKey: value}, status, remarks, raw }]
 * columns: extra columns between date and status: [{ key, header }]
 */
const AttendanceHistoryTable = ({
  rows,
  columns = [],
  loading,
  error,
  onRetry,
  emptyText = "No attendance records found",
  showName = true,
  subLabelHeader = "ID",
  searchPlaceholder = "Search records…",
  toolbarRight = null,
}) => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      [r.name, r.subLabel, r.date, r.status, r.remarks, ...Object.values(r.extra || {})]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [rows, search]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;

  // Fall back if the current page no longer holds records.
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  if (loading) return <div className="av2-table-card"><LoadingState text="Loading records…" /></div>;
  if (error) return <div className="av2-table-card"><ErrorState text={error} onRetry={onRetry} /></div>;

  return (
    <div className="av2-table-card">
      <div className="av2-table-toolbar">
        <div className="av2-search" style={{ maxWidth: 280, flex: 1 }}>
          <i className="bx bx-search"></i>
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        {toolbarRight}
      </div>

      {rows.length === 0 ? (
        <EmptyState text={emptyText} />
      ) : (
        <div className="av2-table-scroll">
          <table className="av2-table">
            <thead>
              <tr>
                {showName && <th>Name</th>}
                {showName && <th>{subLabelHeader}</th>}
                <th>Date</th>
                {columns.map((c) => (
                  <th key={c.key}>{c.header}</th>
                ))}
                <th style={{ textAlign: "center" }}>Status</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={99}>
                    <EmptyState text="No matches for your search" icon="bx bx-search-alt" />
                  </td>
                </tr>
              ) : (
                paged.map((r, i) => (
                  <tr key={r.id ?? i}>
                    {showName && (
                      <td>
                        <div className="av2-person-cell">
                          <div className="av2-avatar" style={{ background: avatarColor(i) }}>
                            {getInitials(r.name)}
                          </div>
                          <span className="av2-person-name">{r.name}</span>
                        </div>
                      </td>
                    )}
                    {showName && <td className="av2-muted">{r.subLabel || "-"}</td>}
                    <td className="av2-muted">{r.date || "-"}</td>
                    {columns.map((c) => (
                      <td key={c.key} className="av2-muted">{r.extra?.[c.key] ?? "-"}</td>
                    ))}
                    <td style={{ textAlign: "center" }}>
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="av2-muted" style={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis" }}>
                      {r.remarks || "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <Pagination page={page} setPage={setPage} total={filtered.length} pageSize={PAGE_SIZE} />
    </div>
  );
};

export default AttendanceHistoryTable;
