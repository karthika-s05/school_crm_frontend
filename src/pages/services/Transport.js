import React, { useState, useEffect, useCallback } from "react";
import "../List/StudentDummyList.css";
import "./services.css";
import "./transport.css";
import TableActionMenu from "../../component/Table/TableActionMenu";
import { getToken } from "../../services/auth";
import {
  getFleetOverview,
  getTransportRoutes,
  getTransportFeeSummary,
  postTransportVehicle,
  deleteTransportVehicle,
  postTransportDriver,
  getStudentTransportAllocations,
  updateTransportFeeStatus,
  postTransportRoute,
} from "../../services/api";
import { runApi } from "../../utils/apiHelper";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const TABS = ["Fleet Overview", "Student Assignment", "Fee Collection"];
const PER_PAGE = 6;
const AV_COLORS = ["#2D3A8C", "#E8541A", "#22c55e", "#8b5cf6", "#f59e0b", "#06b6d4"];
const initials = (n) =>
  (n || "")
    .split(" ")
    .map((x) => x[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const mapStudent = (row) => ({
  id: row.id,
  name: `${row.firstName || ""} ${row.lastName || ""}`.trim(),
  admNo: row.admissionNo || "",
  cls: [row.className, row.sectionName].filter(Boolean).join("-"),
  busId: row.vehicleId,
  stop: row.stopName || "",
  feeStatus: row.feeStatus || "Unpaid",
  annualFee: Number(row.annualFee) || 3600,
});

const findRouteId = (routeName, fleet) => {
  console.log("Finding routeId for", routeName, "Fleet",fleet);
  const match = fleet.find((b) => b.route === routeName && b.routeId);
  return match?.routeId ?? null;
};

function ConfirmModal({ msg, onOk, onCancel }) {
  return (
    <div className="svc-overlay" onClick={onCancel}>
      <div className="svc-modal svc-modal-sm" onClick={(e) => e.stopPropagation()}>
        <div className="svc-delete-body">
          <i className="bx bxs-error-circle svc-delete-icon"></i>
          <p>{msg}</p>
        </div>
        <div className="svc-modal-footer">
          <button className="svc-btn-cancel" onClick={onCancel}>
            Cancel
          </button>
          <button className="svc-btn-danger" onClick={onOk}>
            <i className="bx bx-trash"></i> Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Transport() {
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState("");
  const [busFilter, setBusFilter] = useState("All");
  const [feeFilter, setFeeFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [buses, setBuses] = useState([]);
  const [students, setStudents] = useState([]);
  const [feeSummary, setFeeSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [deletingId, setDeletingId] = useState(null);

  const paid = feeSummary.paidCount ?? students.filter((s) => s.feeStatus === "Paid").length;
  const unpaid = feeSummary.unpaidCount ?? students.filter((s) => s.feeStatus === "Unpaid").length;
  const collected = Number(feeSummary.collected) || 0;
  const pending = Number(feeSummary.pending) || 0;
  const totalDue = Number(feeSummary.totalDue) || 0;
  const totalStudents = feeSummary.totalStudents ?? students.length;

  const loadData = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    await Promise.all([
      runApi(() => getFleetOverview(token), {
        onSuccess: (res) => setBuses(res.data || []),
      }),
      runApi(() => getStudentTransportAllocations({}, token), {
        onSuccess: (res) => setStudents((res.data || []).map(mapStudent)),
      }),
      runApi(() => getTransportFeeSummary(token), {
        onSuccess: (res) => setFeeSummary(res.data || {}),
      }),
    ]);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const fc = (v) => {
    setForm((p) => ({ ...p, ...v }));
  };

  const openAdd = () => {
    setForm({ status: "Active", capacity: 40, assigned: 0 });
    setModal("add");
  };
  const openEdit = (b) => {
    setForm({ ...b });
    setModal("edit");
  };
  const openView = (b) => {
    setForm({ ...b });
    setModal("view");
  };

  const resolveRouteId = async (token, routeName) => {
    const ok = await runApi(() => postTransportRoute({ routeName }, token));
    console.log("Route creation result", ok);
    if (!ok) return null;

    const routesRes = await getTransportRoutes(token);
    if (routesRes?.status === "success" || routesRes?.status === "Success") {
      const match = (routesRes.data || []).find((r) => r.routeName === routeName);
      if (match?.id) return match.id;
    }
    return null;
  };

  const saveBus = async () => {
    if (!form.busNo?.trim() || !form.driver?.trim() || !form.route?.trim() || !form.driverPhone?.trim()) {
      toast.error("Bus number, driver, route, and driver phone are required");
      return;
    }
    const token = getToken();
    if (!token) return;

    setSaving(true);
    try {
      console.log("Saving bus", form);
      let routeId = findRouteId(form.route, buses);
      console.log("Found routeId for", form.route, routeId);
      if (!routeId) {
        routeId = await resolveRouteId(token, form.route.trim());
        if (!routeId) {
          toast.error("Could not resolve route. Please try again.");
          return;
        }
      }

      const vehicleBody = {
        id: modal === "edit" ? form.id : undefined,
        busNo: form.busNo.trim(),
        busRegNo: form.regNo || "",
        capacity: Number(form.capacity) || 40,
        busTiming: form.timing || "",
        status: form.status || "Active",
        routeId,
      };
      console.log("Vehicle body", vehicleBody);
      const vehicleRes = await runApi(
        () => postTransportVehicle(vehicleBody, token),
        { successMsg: modal === "edit" ? "Bus updated" : "Bus added" }
      );
      if (!vehicleRes) return;
      console.log("Vehicle saved", vehicleRes.data);
      const vehicleId = vehicleRes.data?.vehicleId || form.id;
      if (vehicleId) {
        await runApi(
          () =>
            postTransportDriver(
              {
                id: form.driverId,
                driverName: form.driver.trim(),
                driverPhone: form.driverPhone.trim(),
                vehicleId,
              },
              token
            ),
          { successMsg: "Driver saved" }
        );
      }
      console.log("Driver saved");
      setModal(null);
      await loadData();
    } finally {
      setSaving(false);
    }
  };

  const deleteBus = (id) => {
    const token = getToken();
    if (!token) return;
    runApi(() => deleteTransportVehicle(id, token), {
      successMsg: "Bus deleted",
      onSuccess: () => {
        setDeletingId(null);
        loadData();
      },
    });
  };

  const toggleFee = (id) => {
    const student = students.find((s) => s.id === id);
    if (!student) return;
    const toggled = student.feeStatus === "Paid" ? "Unpaid" : "Paid";
    const token = getToken();
    if (!token) return;
    runApi(() => updateTransportFeeStatus({ id, feeStatus: toggled }, token), {
      successMsg: "Fee status updated",
      onSuccess: () => loadData(),
    });
  };

  const filtBuses = buses.filter(
    (b) =>
      (b.busNo || "").toLowerCase().includes(search.toLowerCase()) ||
      (b.driver || "").toLowerCase().includes(search.toLowerCase()) ||
      (b.route || "").toLowerCase().includes(search.toLowerCase())
  );

  const filtStudents = students.filter((s) => {
    const ms =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.admNo.toLowerCase().includes(search.toLowerCase());
    const mb = busFilter === "All" || String(s.busId) === String(busFilter);
    const mf = feeFilter === "All" || s.feeStatus === feeFilter;
    return ms && mb && mf;
  });
  const totalPgs = Math.ceil(filtStudents.length / PER_PAGE);
  const paged = filtStudents.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const switchTab = (i) => {
    setTab(i);
    setSearch("");
    setPage(1);
    setBusFilter("All");
    setFeeFilter("All");
  };

  const getStatusClass = (status) => {
    if (status === "Active") return "svc-active";
    if (status === "Maintenance") return "svc-maint";
    return "inactive";
  };

  if (loading && buses.length === 0 && students.length === 0) {
    return (
      <div className="transport-page">
        <div className="transport-loading">
          <i className="bx bx-loader-alt bx-spin"></i>
          <span>Loading transport data…</span>
        </div>
        <ToastContainer position="top-right" autoClose={2500} />
      </div>
    );
  }

  return (
    <div className="transport-page">
      <div className="transport-hero">
        <div className="transport-hero-text">
          <h2>Transport Management</h2>
          <p>Manage fleet, student assignments, and transport fee collection</p>
        </div>
        <div className="transport-hero-badge">
          <i className="bx bxs-bus"></i>
          {buses.filter((b) => b.status === "Active").length} active / {buses.length} buses
        </div>
      </div>

      <div className="transport-stats">
        {[
          {
            label: "Total Buses",
            val: buses.length,
            icon: "bx bxs-bus",
            color: "#2D3A8C",
            bg: "#eef0fb",
          },
          {
            label: "Active Routes",
            val: buses.filter((b) => b.status === "Active").length,
            icon: "bx bxs-map-alt",
            color: "#16a34a",
            bg: "#dcfce7",
          },
          {
            label: "Students Enrolled",
            val: totalStudents,
            icon: "bx bxs-group",
            color: "#7c3aed",
            bg: "#f5f3ff",
          },
          {
            label: "Fee Collected",
            val:
              collected >= 100000
                ? `₹${(collected / 100000).toFixed(1)}L`
                : collected >= 1000
                  ? `₹${(collected / 1000).toFixed(0)}K`
                  : `₹${collected.toLocaleString()}`,
            icon: "bx bxs-wallet-alt",
            color: "#d97706",
            bg: "#fef3c7",
          },
        ].map((s, i) => (
          <div className="transport-stat-card" key={i}>
            <div className="transport-stat-icon" style={{ background: s.bg, color: s.color }}>
              <i className={s.icon}></i>
            </div>
            <div className="transport-stat-body">
              <div className="transport-stat-val">{s.val}</div>
              <div className="transport-stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="transport-tabs-wrap">
        <div className="svc-tabs">
          {TABS.map((t, i) => (
            <button
              key={i}
              type="button"
              className={`svc-tab${tab === i ? " active" : ""}`}
              onClick={() => switchTab(i)}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 0 – Fleet */}
      {tab === 0 && (
        <div className="transport-panel">
          <div className="transport-panel-inner">
            <div className="transport-toolbar">
              <div className="sdl-search">
                <i className="bx bx-search"></i>
                <input
                  placeholder="Search bus no, driver, route…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="transport-toolbar-actions">
                <button type="button" className="sdl-add-btn" onClick={openAdd}>
                  <i className="bx bx-plus"></i> Add Bus
                </button>
              </div>
            </div>

            <div className="transport-fleet-grid">
              {filtBuses.length === 0 ? (
                <div className="transport-empty transport-empty--grid">
                  <i className="bx bx-bus"></i>
                  <span>No buses found. Add your first bus to get started.</span>
                </div>
              ) : (
                filtBuses.map((b) => (
                  <div className="svc-bus-card" key={b.id}>
                    <div className="svc-bus-card-top">
                      <div className="svc-bus-icon-wrap">
                        <i className="bx bxs-bus"></i>
                      </div>
                      <span className={`svc-bus-status ${getStatusClass(b.status)}`}>
                        {b.status}
                      </span>
                    </div>
                    <div className="svc-bus-no" title={b.busNo}>
                      {b.busNo}
                    </div>
                    <div className="svc-bus-route" title={b.route}>
                      <i className="bx bx-map-pin"></i>
                      {b.route || "No route assigned"}
                    </div>
                    <div className="svc-bus-meta">
                      <span>
                        <i className="bx bxs-user"></i>
                        {b.driver || "—"}
                      </span>
                      <span>
                        <i className="bx bx-phone"></i>
                        {b.driverPhone || "—"}
                      </span>
                    </div>
                    <div className="svc-cap-wrap">
                      <div className="svc-cap-bar">
                        <div
                          className="svc-cap-fill"
                          style={{
                            width: `${b.capacity ? Math.min(100, Math.round((b.assigned / b.capacity) * 100)) : 0}%`,
                            background: b.status === "Maintenance" ? "#f59e0b" : "#2D3A8C",
                          }}
                        ></div>
                      </div>
                      <span className="svc-cap-txt">
                        {b.assigned}/{b.capacity} seats
                      </span>
                    </div>
                    <div className="svc-stops">
                      {(b.stops || []).length > 0 ? (
                        b.stops.map((s, i) => (
                          <span key={i} className="svc-stop-chip">
                            {s}
                          </span>
                        ))
                      ) : (
                        <span className="svc-stop-chip" style={{ opacity: 0.6 }}>
                          No stops listed
                        </span>
                      )}
                    </div>
                    <div className="transport-card-footer">
                      <TableActionMenu
                        onView={() => openView(b)}
                        onEdit={() => openEdit(b)}
                        onDelete={() => setDeletingId(b.id)}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 1 – Student Assignment */}
      {tab === 1 && (
        <div className="transport-panel">
          <div className="transport-panel-inner">
            <div className="transport-toolbar">
              <div className="sdl-search">
                <i className="bx bx-search"></i>
                <input
                  placeholder="Search student name or admission no…"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
              <div className="transport-toolbar-actions">
                <select
                  className="svc-select"
                  value={busFilter}
                  onChange={(e) => {
                    setBusFilter(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="All">All Buses</option>
                  {buses.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.busNo}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="transport-table-wrap">
              <div className="sdl-table-card">
                <table className="sdl-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Student</th>
                      <th>Adm. No</th>
                      <th>Class</th>
                      <th>Bus No</th>
                      <th>Stop</th>
                      <th>Fee Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paged.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="transport-table-empty">
                          <div className="transport-empty-inline">
                            <i className="bx bx-search-alt"></i>
                            <span>No students found</span>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      paged.map((s, i) => {
                        const bus = buses.find((b) => b.id === s.busId);
                        return (
                          <tr key={s.id}>
                            <td className="sdl-num">{(page - 1) * PER_PAGE + i + 1}</td>
                            <td>
                              <div className="sdl-student-cell">
                                <div
                                  className="sdl-avatar"
                                  style={{ background: AV_COLORS[s.id % AV_COLORS.length] }}
                                >
                                  {initials(s.name)}
                                </div>
                                <div className="sdl-name">{s.name}</div>
                              </div>
                            </td>
                            <td className="sdl-adm">{s.admNo}</td>
                            <td>
                              <span className="sdl-class-badge">{s.cls || "—"}</span>
                            </td>
                            <td>
                              <span className="svc-route-badge">{bus?.busNo || "—"}</span>
                            </td>
                            <td>
                              <span className="svc-stop-chip" style={{ margin: 0 }}>
                                {s.stop || "—"}
                              </span>
                            </td>
                            <td>
                              <span className={`sdl-status ${s.feeStatus.toLowerCase()}`}>
                                {s.feeStatus}
                              </span>
                            </td>
                            <td>
                              <TableActionMenu
                                items={[
                                  {
                                    label: "Toggle Fee",
                                    icon: "bx bx-transfer",
                                    onClick: () => toggleFee(s.id),
                                  },
                                ]}
                              />
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {totalPgs > 1 && (
              <div className="transport-pagination sdl-pagination">
                <span className="sdl-page-info">
                  Showing {(page - 1) * PER_PAGE + 1}–
                  {Math.min(page * PER_PAGE, filtStudents.length)} of {filtStudents.length}
                </span>
                <div className="sdl-page-btns">
                  <button
                    type="button"
                    className="sdl-page-btn"
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    <i className="bx bx-chevron-left"></i>
                  </button>
                  {Array.from({ length: totalPgs }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      type="button"
                      className={`sdl-page-btn${page === p ? " active" : ""}`}
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    type="button"
                    className="sdl-page-btn"
                    disabled={page === totalPgs}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    <i className="bx bx-chevron-right"></i>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2 – Fee Collection */}
      {tab === 2 && (
        <div className="transport-panel">
          <div className="transport-panel-inner">
            <div className="transport-toolbar">
              <div className="sdl-search">
                <i className="bx bx-search"></i>
                <input
                  placeholder="Search student…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="transport-toolbar-actions">
                <select
                  className="svc-select"
                  value={feeFilter}
                  onChange={(e) => setFeeFilter(e.target.value)}
                >
                  <option value="All">All Status</option>
                  <option value="Paid">Paid</option>
                  <option value="Unpaid">Unpaid</option>
                </select>
              </div>
            </div>

            <div className="transport-fee-row svc-fee-summary">
              <div className="svc-fee-card" style={{ borderColor: "#22c55e" }}>
                <i className="bx bxs-check-circle" style={{ color: "#22c55e" }}></i>
                <div>
                  <div className="svc-fee-val" style={{ color: "#22c55e" }}>
                    ₹{collected.toLocaleString()}
                  </div>
                  <div className="svc-fee-lbl">Collected ({paid} students)</div>
                </div>
              </div>
              <div className="svc-fee-card" style={{ borderColor: "#ef4444" }}>
                <i className="bx bxs-error-circle" style={{ color: "#ef4444" }}></i>
                <div>
                  <div className="svc-fee-val" style={{ color: "#ef4444" }}>
                    ₹{pending.toLocaleString()}
                  </div>
                  <div className="svc-fee-lbl">Pending ({unpaid} students)</div>
                </div>
              </div>
              <div className="svc-fee-card" style={{ borderColor: "#2D3A8C" }}>
                <i className="bx bxs-wallet-alt" style={{ color: "#2D3A8C" }}></i>
                <div>
                  <div className="svc-fee-val" style={{ color: "#2D3A8C" }}>
                    ₹{totalDue.toLocaleString()}
                  </div>
                  <div className="svc-fee-lbl">Total Due ({totalStudents} students)</div>
                </div>
              </div>
            </div>

            <div className="transport-table-wrap">
              <div className="sdl-table-card">
                <table className="sdl-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Student</th>
                      <th>Class</th>
                      <th>Bus No</th>
                      <th>Annual Fee</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students
                      .filter(
                        (s) =>
                          s.name.toLowerCase().includes(search.toLowerCase()) &&
                          (feeFilter === "All" || s.feeStatus === feeFilter)
                      )
                      .map((s, i) => {
                        const bus = buses.find((b) => b.id === s.busId);
                        return (
                          <tr key={s.id}>
                            <td className="sdl-num">{i + 1}</td>
                            <td>
                              <div className="sdl-student-cell">
                                <div
                                  className="sdl-avatar"
                                  style={{ background: AV_COLORS[s.id % AV_COLORS.length] }}
                                >
                                  {initials(s.name)}
                                </div>
                                <div>
                                  <div className="sdl-name">{s.name}</div>
                                  <div className="sdl-email">{s.admNo}</div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span className="sdl-class-badge">{s.cls || "—"}</span>
                            </td>
                            <td>
                              <span className="svc-route-badge">{bus?.busNo || "—"}</span>
                            </td>
                            <td>
                              <strong>₹{s.annualFee.toLocaleString()}</strong>
                            </td>
                            <td>
                              <span className={`sdl-status ${s.feeStatus.toLowerCase()}`}>
                                {s.feeStatus}
                              </span>
                            </td>
                            <td>
                              <button
                                type="button"
                                className={`svc-toggle-btn${s.feeStatus === "Paid" ? " svc-toggle-unpaid" : " svc-toggle-paid"}`}
                                onClick={() => toggleFee(s.id)}
                              >
                                {s.feeStatus === "Paid" ? "Mark Unpaid" : "Mark Paid"}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    {students.filter(
                      (s) =>
                        s.name.toLowerCase().includes(search.toLowerCase()) &&
                        (feeFilter === "All" || s.feeStatus === feeFilter)
                    ).length === 0 && (
                      <tr>
                        <td colSpan={7} className="transport-table-empty">
                          <div className="transport-empty-inline">
                            <i className="bx bx-wallet"></i>
                            <span>No fee records match your filters</span>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════ Add / Edit Modal ════════ */}
      {(modal === "add" || modal === "edit") && (
        <div className="svc-overlay" onClick={() => !saving && setModal(null)}>
          <div className="svc-modal" onClick={(e) => e.stopPropagation()}>
            <div className="svc-modal-hdr">
              <span>{modal === "add" ? "Add New Bus" : "Edit Bus"}</span>
              <button className="svc-modal-close" onClick={() => !saving && setModal(null)}>
                <i className="bx bx-x"></i>
              </button>
            </div>
            <div className="svc-modal-body">
              <div className="svc-modal-grid">
                {[
                  ["Bus Number", "busNo"],
                  ["Registration No", "regNo"],
                  ["Driver Name", "driver"],
                  ["Driver Phone", "driverPhone"],
                  ["Timing", "timing"],
                ].map(([lbl, name]) => (
                  <div className="svc-field" key={name}>
                    <label>{lbl}</label>
                    <input
                      value={form[name] || ""}
                      onChange={(e) => fc({ [name]: e.target.value })}
                      placeholder={`Enter ${lbl}`}
                    />
                  </div>
                ))}
                <div className="svc-field" style={{ gridColumn: "1/-1" }}>
                  <label>Route</label>
                  <input
                    value={form.route || ""}
                    onChange={(e) => fc({ route: e.target.value })}
                    placeholder="e.g. Route 1 – Velachery → School"
                  />
                </div>
                <div className="svc-field">
                  <label>Capacity</label>
                  <input
                    type="number"
                    value={form.capacity || ""}
                    onChange={(e) => fc({ capacity: e.target.value })}
                    placeholder="40"
                  />
                </div>
                <div className="svc-field">
                  <label>Status</label>
                  <select value={form.status || "Active"} onChange={(e) => fc({ status: e.target.value })}>
                    <option value="Active">Active</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="svc-modal-footer">
              <button className="svc-btn-cancel" onClick={() => !saving && setModal(null)} disabled={saving}>
                Cancel
              </button>
              <button className="svc-btn-save" onClick={saveBus} disabled={saving}>
                <i className={`bx ${saving ? "bx-loader-alt bx-spin" : "bx-check"}`}></i>{" "}
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {modal === "view" && (
        <div className="svc-overlay" onClick={() => setModal(null)}>
          <div className="svc-modal" onClick={(e) => e.stopPropagation()}>
            <div className="svc-modal-hdr">
              <span>Bus Details</span>
              <button className="svc-modal-close" onClick={() => setModal(null)}>
                <i className="bx bx-x"></i>
              </button>
            </div>
            <div className="svc-modal-body">
              <div className="svc-view-grid">
                {[
                  ["Bus No", form.busNo],
                  ["Reg No", form.regNo],
                  ["Driver", form.driver],
                  ["Phone", form.driverPhone],
                  ["Timing", form.timing],
                  ["Capacity", `${form.assigned}/${form.capacity}`],
                  ["Status", form.status],
                ].map(([k, v]) => (
                  <div className="svc-view-row" key={k}>
                    <span className="svc-view-key">{k}</span>
                    <span className="svc-view-val">{v}</span>
                  </div>
                ))}
                <div className="svc-view-row" style={{ gridColumn: "1/-1" }}>
                  <span className="svc-view-key">Route</span>
                  <span className="svc-view-val">{form.route}</span>
                </div>
                <div className="svc-view-row" style={{ gridColumn: "1/-1" }}>
                  <span className="svc-view-key">Stops</span>
                  <div className="svc-stops">
                    {(form.stops || []).map((s, i) => (
                      <span key={i} className="svc-stop-chip">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="svc-modal-footer">
              <button className="svc-btn-save" onClick={() => setModal(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════ Delete Confirm ════════ */}
      {deletingId && (
        <ConfirmModal
          msg="Are you sure you want to delete this bus? Student assignments will be affected."
          onOk={() => deleteBus(deletingId)}
          onCancel={() => setDeletingId(null)}
        />
      )}

      <ToastContainer position="top-right" autoClose={2500} />
    </div>
  );
}
