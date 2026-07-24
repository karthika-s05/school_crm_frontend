import React, { useMemo, useState } from "react";
import { avatarColor, getInitials, normalizeStatus, statusMeta, STATUS } from "../constants";
import { AttendanceSummaryPills } from "./AttendanceSummaryBar";
import { LoadingState, EmptyState, ErrorState } from "./AttendanceStates";
import Pagination from "./Pagination";

const PAGE_SIZE = 10;

/**
 * Reusable roster marking table with status dropdown, remarks, search,
 * pagination and a "Select All Present" bulk action.
 *
 * rows:       [{ id, name, subLabel, status, remarks }]
 * statuses:   allowed status labels
 * onChange:   (id, patch) => void  - patch is { status } or { remarks }
 * onMarkAll:  (status) => void
 */
const AttendanceMarkingTable = ({
  rows,
  statuses,
  onChange,
  onMarkAll,
  loading,
  error,
  onRetry,
  emptyText = "No records to mark",
  subLabelHeader = "ID",
}) => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const counts = useMemo(() => {
    const c = { total: rows.length };
    statuses.forEach((s) => { c[s] = 0; });
    rows.forEach((r) => {
      const st = normalizeStatus(r.status);
      if (c[st] !== undefined) c[st] += 1;
    });
    return c;
  }, [rows, statuses]);

  const marked = rows.filter((r) => normalizeStatus(r.status)).length;
  const pct = rows.length ? Math.round((marked / rows.length) * 100) : 0;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        (r.name || "").toLowerCase().includes(q) ||
        String(r.subLabel || "").toLowerCase().includes(q)
    );
  }, [rows, search]);

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (loading) return <div className="av2-table-card"><LoadingState text="Loading roster…" /></div>;
  if (error) return <div className="av2-table-card"><ErrorState text={error} onRetry={onRetry} /></div>;

  return (
    <div className="av2-table-card">
      <div className="av2-table-toolbar">
        <div className="av2-search" style={{ maxWidth: 280, flex: 1 }}>
          <i className="bx bx-search"></i>
          <input
            type="text"
            placeholder="Search name or number…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <AttendanceSummaryPills counts={counts} statuses={statuses.slice(0, 2)} showTotal={false} />
          <button
            type="button"
            className="av2-btn av2-btn-success av2-btn-sm"
            onClick={() => onMarkAll(STATUS.PRESENT)}
            disabled={rows.length === 0}
          >
            <i className="bx bx-check-double"></i> Select All Present
          </button>
        </div>
      </div>

      <div style={{ padding: "10px 16px 0" }}>
        <div className="av2-progress-wrap">
          <div className="av2-progress-bar">
            <div
              className="av2-progress-fill"
              style={{ width: `${pct}%`, background: "#2d3a8c" }}
            ></div>
          </div>
          <span className="av2-progress-label">{marked}/{rows.length} marked</span>
        </div>
      </div>

      {rows.length === 0 ? (
        <EmptyState text={emptyText} icon="bx bx-group" />
      ) : (
        <div className="av2-table-scroll">
          <table className="av2-table">
            <thead>
              <tr>
                <th style={{ width: 40 }}>#</th>
                <th>Name</th>
                <th>{subLabelHeader}</th>
                <th style={{ width: 160 }}>Status</th>
                <th style={{ width: 220 }}>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <EmptyState text="No matches for your search" icon="bx bx-search-alt" />
                  </td>
                </tr>
              ) : (
                paged.map((r, i) => {
                  const st = normalizeStatus(r.status);
                  const meta = statusMeta(st);
                  return (
                    <tr key={r.id}>
                      <td className="av2-muted">{(page - 1) * PAGE_SIZE + i + 1}</td>
                      <td>
                        <div className="av2-person-cell">
                          <div className="av2-avatar" style={{ background: avatarColor(i) }}>
                            {getInitials(r.name)}
                          </div>
                          <span className="av2-person-name">{r.name}</span>
                        </div>
                      </td>
                      <td className="av2-muted">{r.subLabel || "-"}</td>
                      <td>
                        <select
                          className="av2-status-select"
                          value={st}
                          onChange={(e) => onChange(r.id, { status: e.target.value })}
                          style={st ? { borderColor: meta.color, color: meta.color, background: meta.bg } : {}}
                        >
                          <option value="">- Mark -</option>
                          {statuses.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <input
                          className="av2-remarks-input"
                          type="text"
                          maxLength={200}
                          placeholder="Optional remarks…"
                          value={r.remarks || ""}
                          onChange={(e) => onChange(r.id, { remarks: e.target.value })}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      <Pagination page={page} setPage={setPage} total={filtered.length} pageSize={PAGE_SIZE} />
    </div>
  );
};

export default AttendanceMarkingTable;
