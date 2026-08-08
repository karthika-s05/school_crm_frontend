import React, { useCallback, useEffect, useMemo, useState } from "react";
import "../List/StudentDummyList.css";
import "./services.css";
import "./transport.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getToken } from "../../services/auth";
import { runApi } from "../../utils/apiHelper";
import ModalPortal from "../../component/modals/ModalPortal";
import {
  getClass,
  getSection,
  getFeeStructures,
  saveFeeStructure,
  deleteFeeStructure,
  getFeeLedger,
  generateFeeLedger,
  collectFeePayment,
  getSchoolFeeSummary,
  getTransportFeeSummary,
  getStudentTransportAllocations,
  updateTransportFeeStatus,
} from "../../services/api";

const TABS = ["Fee Structure", "School Collection", "Transport Fees"];
const TERMS = ["Annual", "Term1", "Term2", "Term3"];
const AV_COLORS = ["#2D3A8C", "#E8541A", "#22c55e", "#8b5cf6", "#f59e0b", "#06b6d4"];

const initials = (n) =>
  String(n || "?")
    .split(" ")
    .map((x) => x[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const fmtMoney = (v) => `₹${Number(v || 0).toLocaleString("en-IN")}`;

const asList = (res) => {
  const raw = res?.data ?? res;
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.data)) return raw.data;
  return [];
};

const emptyStructure = {
  id: 0,
  classId: "",
  sectionId: "",
  feeName: "Tuition Fee",
  term: "Annual",
  amount: "",
  academicYear: String(new Date().getFullYear()),
};

export default function FeesCollection() {
  const token = getToken();
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(false);

  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);

  const [structures, setStructures] = useState([]);
  const [structureForm, setStructureForm] = useState(emptyStructure);
  const [savingStructure, setSavingStructure] = useState(false);

  const [ledger, setLedger] = useState([]);
  const [schoolSummary, setSchoolSummary] = useState({});
  const [ledgerFilters, setLedgerFilters] = useState({
    classId: "All",
    sectionId: "All",
    feeStatus: "All",
    feeStructureId: "",
    search: "",
  });
  const [collectModal, setCollectModal] = useState(null);
  const [collectAmount, setCollectAmount] = useState("");
  const [generating, setGenerating] = useState(false);

  const [transportStudents, setTransportStudents] = useState([]);
  const [transportSummary, setTransportSummary] = useState({});
  const [transportSearch, setTransportSearch] = useState("");
  const [transportFeeFilter, setTransportFeeFilter] = useState("All");

  const loadMasters = useCallback(async () => {
    if (!token) return;
    try {
      const [cls, sec] = await Promise.all([
        getClass(0, token),
        getSection(0, token),
      ]);
      setClasses(Array.isArray(cls) ? cls : asList(cls));
      setSections(Array.isArray(sec) ? sec : asList(sec));
    } catch (err) {
      console.error("Failed to load class/section masters", err);
      toast.error("Failed to load class and section lists");
      setClasses([]);
      setSections([]);
    }
  }, [token]);

  const loadStructures = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    await runApi(() => getFeeStructures({}, token), {
      onSuccess: (res) => setStructures(asList(res)),
      onError: () => setStructures([]),
    });
    setLoading(false);
  }, [token]);

  const loadLedger = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    const body = {
      classId: ledgerFilters.classId,
      sectionId: ledgerFilters.sectionId,
      feeStatus: ledgerFilters.feeStatus,
      search: ledgerFilters.search,
    };
    if (ledgerFilters.feeStructureId) {
      body.feeStructureId = Number(ledgerFilters.feeStructureId);
    }
    await Promise.all([
      runApi(() => getFeeLedger(body, token), {
        onSuccess: (res) => setLedger(asList(res)),
        onError: () => setLedger([]),
      }),
      runApi(() => getSchoolFeeSummary(token), {
        onSuccess: (res) => setSchoolSummary(res?.data || {}),
      }),
    ]);
    setLoading(false);
  }, [token, ledgerFilters]);

  const loadTransport = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    await Promise.all([
      runApi(() => getStudentTransportAllocations({}, token), {
        onSuccess: (res) => {
          const rows = asList(res).map((row) => ({
            id: row.id,
            name: `${row.firstName || ""} ${row.lastName || ""}`.trim() || row.studentName || "-",
            admNo: row.admissionNo || row.studentId || "",
            cls: [row.className, row.sectionName].filter(Boolean).join("-") || "-",
            busNo: row.busNo || row.vehicleNo || "-",
            annualFee: Number(row.annualFee) || 0,
            feeStatus: row.feeStatus || "Unpaid",
          }));
          setTransportStudents(rows);
        },
        onError: () => setTransportStudents([]),
      }),
      runApi(() => getTransportFeeSummary(token), {
        onSuccess: (res) => setTransportSummary(res?.data || {}),
      }),
    ]);
    setLoading(false);
  }, [token]);

  useEffect(() => {
    loadMasters();
  }, [loadMasters]);

  useEffect(() => {
    if (tab === 0) loadStructures();
    if (tab === 1) {
      loadStructures();
      loadLedger();
    }
    if (tab === 2) loadTransport();
  }, [tab, loadStructures, loadLedger, loadTransport]);

  const classNameOf = (id) =>
    classes.find((c) => Number(c.id) === Number(id))?.name || `Class ${id}`;

  const handleSaveStructure = async (e) => {
    e.preventDefault();
    if (!structureForm.classId) {
      toast.error("Class is required");
      return;
    }
    if (!String(structureForm.feeName || "").trim()) {
      toast.error("Fee name is required");
      return;
    }
    if (structureForm.amount === "" || structureForm.amount == null) {
      toast.error("Amount is required");
      return;
    }
    if (Number(structureForm.amount) < 0 || Number.isNaN(Number(structureForm.amount))) {
      toast.error("Enter a valid amount");
      return;
    }
    setSavingStructure(true);
    await runApi(
      () =>
        saveFeeStructure(
          {
            id: structureForm.id || 0,
            classId: Number(structureForm.classId),
            sectionId: structureForm.sectionId ? Number(structureForm.sectionId) : null,
            feeName: structureForm.feeName,
            term: structureForm.term,
            amount: Number(structureForm.amount),
            academicYear: structureForm.academicYear || null,
          },
          token
        ),
      {
        successMsg: structureForm.id ? "Fee structure updated" : "Fee structure created",
        onSuccess: () => {
          setStructureForm(emptyStructure);
          loadStructures();
        },
      }
    );
    setSavingStructure(false);
  };

  const handleEditStructure = (row) => {
    setStructureForm({
      id: row.id,
      classId: String(row.classId || ""),
      sectionId: row.sectionId ? String(row.sectionId) : "",
      feeName: row.feeName || "Tuition Fee",
      term: row.term || "Annual",
      amount: String(row.amount ?? ""),
      academicYear: row.academicYear || String(new Date().getFullYear()),
    });
  };

  const handleDeleteStructure = async (id) => {
    if (!window.confirm("Delete this fee structure?")) return;
    await runApi(() => deleteFeeStructure(id, token), {
      successMsg: "Fee structure deleted",
      onSuccess: () => loadStructures(),
    });
  };

  const handleGenerate = async () => {
    if (!ledgerFilters.feeStructureId) {
      toast.error("Select a fee structure to generate dues");
      return;
    }
    setGenerating(true);
    await runApi(
      () =>
        generateFeeLedger({ feeStructureId: Number(ledgerFilters.feeStructureId) }, token),
      {
        onSuccess: (res) => {
          const d = res?.data || {};
          toast.success(
            `Generated ${d.created || 0} dues (${d.skipped || 0} already existed)`
          );
          loadLedger();
        },
      }
    );
    setGenerating(false);
  };

  const openCollect = (row) => {
    setCollectModal(row);
    setCollectAmount(String(row.amountDue ?? ""));
  };

  const handleCollect = async (markFullyPaid = false) => {
    if (!collectModal) return;
    await runApi(
      () =>
        collectFeePayment(
          {
            id: collectModal.id,
            amountPaid: markFullyPaid
              ? Number(collectModal.amountDue)
              : Number(collectAmount || 0),
            markFullyPaid,
          },
          token
        ),
      {
        successMsg: "Payment recorded",
        onSuccess: () => {
          setCollectModal(null);
          loadLedger();
        },
      }
    );
  };

  const toggleTransportFee = async (row) => {
    const next = row.feeStatus === "Paid" ? "Unpaid" : "Paid";
    await runApi(() => updateTransportFeeStatus({ id: row.id, feeStatus: next }, token), {
      successMsg: `Marked ${next}`,
      onSuccess: () => loadTransport(),
    });
  };

  const schoolCards = useMemo(
    () => [
      {
        label: "Collected",
        val: fmtMoney(schoolSummary.collected),
        sub: `${schoolSummary.paidCount || 0} paid`,
        color: "#22c55e",
      },
      {
        label: "Pending",
        val: fmtMoney(schoolSummary.pending),
        sub: `${schoolSummary.unpaidCount || 0} unpaid · ${schoolSummary.partialCount || 0} partial`,
        color: "#ef4444",
      },
      {
        label: "Total Due",
        val: fmtMoney(schoolSummary.totalDue),
        sub: `${schoolSummary.totalRecords || 0} records`,
        color: "#2D3A8C",
      },
    ],
    [schoolSummary]
  );

  const transportPaid =
    transportSummary.paidCount ??
    transportStudents.filter((s) => s.feeStatus === "Paid").length;
  const transportUnpaid =
    transportSummary.unpaidCount ??
    transportStudents.filter((s) => s.feeStatus === "Unpaid").length;
  const transportCollected = Number(transportSummary.collected) || 0;
  const transportPending = Number(transportSummary.pending) || 0;
  const transportDue = Number(transportSummary.totalDue) || transportCollected + transportPending;

  return (
    <div className="svc-page">
      <ToastContainer position="bottom-right" autoClose={2500} style={{ zIndex: 99999, fontSize: 14 }} />
      <div className="svc-header">
        <div>
          {/* <h2 style={{ margin: 0, color: "#2D3A8C" }}>Fees Collection</h2>
          <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 13 }}>
            Define class fee structures, collect school fees, and manage transport fees
          </p> */}
        </div>
        <div className="svc-tabs">
          {TABS.map((label, i) => (
            <button
              key={label}
              type="button"
              className={`svc-tab${tab === i ? " active" : ""}`}
              onClick={() => setTab(i)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div style={{ padding: 24, color: "#64748b", textAlign: "center" }}>
          <i className="bx bx-loader-alt bx-spin" style={{ fontSize: 28 }} />
        </div>
      )}

      {/* ── Fee Structure ── */}
      {tab === 0 && (
        <div className="transport-panel">
          <div className="transport-panel-inner" style={{ display: "grid", gap: 18 }}>
            <form
              className="svc-form-card"
              onSubmit={handleSaveStructure}
              style={{
                background: "#fff",
                borderRadius: 14,
                padding: 18,
                border: "1px solid #e2e8f0",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                gap: 12,
                alignItems: "end",
              }}
            >
              <div>
                <label className="svc-label">Class *</label>
                <select
                  className="svc-select"
                  value={structureForm.classId}
                  onChange={(e) =>
                    setStructureForm((f) => ({ ...f, classId: e.target.value }))
                  }
                  required
                >
                  <option value="">Select class</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="svc-label">Section (optional)</label>
                <select
                  className="svc-select"
                  value={structureForm.sectionId}
                  onChange={(e) =>
                    setStructureForm((f) => ({ ...f, sectionId: e.target.value }))
                  }
                >
                  <option value="">All sections</option>
                  {sections.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="svc-label">Fee name *</label>
                <input
                  className="svc-input"
                  value={structureForm.feeName}
                  onChange={(e) =>
                    setStructureForm((f) => ({ ...f, feeName: e.target.value }))
                  }
                  required
                />
              </div>
              <div>
                <label className="svc-label">Term</label>
                <select
                  className="svc-select"
                  value={structureForm.term}
                  onChange={(e) =>
                    setStructureForm((f) => ({ ...f, term: e.target.value }))
                  }
                >
                  {TERMS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="svc-label">Amount (₹) *</label>
                <input
                  className="svc-input"
                  type="number"
                  min="0"
                  step="0.01"
                  value={structureForm.amount}
                  onChange={(e) =>
                    setStructureForm((f) => ({ ...f, amount: e.target.value }))
                  }
                  required
                />
              </div>
              <div>
                <label className="svc-label">Academic year</label>
                <input
                  className="svc-input"
                  value={structureForm.academicYear}
                  onChange={(e) =>
                    setStructureForm((f) => ({ ...f, academicYear: e.target.value }))
                  }
                />
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="svc-btn-primary" type="submit" disabled={savingStructure}>
                  {structureForm.id ? "Update" : "Add structure"}
                </button>
                {structureForm.id ? (
                  <button
                    type="button"
                    className="svc-btn-ghost"
                    onClick={() => setStructureForm(emptyStructure)}
                  >
                    Cancel
                  </button>
                ) : null}
              </div>
            </form>

            <div className="sdl-table-card">
              <table className="sdl-table">
                <thead>
                  <tr>
                    <th>Fee</th>
                    <th>Class</th>
                    <th>Section</th>
                    <th>Term</th>
                    <th>Year</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {structures.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: "center", color: "#94a3b8" }}>
                        No fee structures yet. Add one above.
                      </td>
                    </tr>
                  ) : (
                    structures.map((row, i) => (
                      <tr key={row.id}>
                        <td className="sdl-name">{row.feeName}</td>
                        <td>{row.className || classNameOf(row.classId)}</td>
                        <td>{row.sectionName || (row.sectionId ? row.sectionId : "All")}</td>
                        <td>{row.term}</td>
                        <td>{row.academicYear || "-"}</td>
                        <td>
                          <strong>{fmtMoney(row.amount)}</strong>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── School Collection ── */}
      {tab === 1 && (
        <div className="transport-panel">
          <div className="transport-panel-inner">
            <div className="transport-fee-row svc-fee-summary">
              {schoolCards.map((c) => (
                <div key={c.label} className="svc-fee-card" style={{ borderColor: c.color }}>
                  <div>
                    <div className="svc-fee-val" style={{ color: c.color }}>
                      {c.val}
                    </div>
                    <div className="svc-fee-lbl">
                      {c.label} ({c.sub})
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="transport-toolbar" style={{ flexWrap: "wrap", gap: 10 }}>
              <select
                className="svc-select"
                value={ledgerFilters.feeStructureId}
                onChange={(e) =>
                  setLedgerFilters((f) => ({ ...f, feeStructureId: e.target.value }))
                }
              >
                <option value="">All structures</option>
                {structures.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.feeName} · {s.className || classNameOf(s.classId)} · {s.term}
                  </option>
                ))}
              </select>
              <select
                className="svc-select"
                value={ledgerFilters.classId}
                onChange={(e) =>
                  setLedgerFilters((f) => ({ ...f, classId: e.target.value }))
                }
              >
                <option value="All">All classes</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <select
                className="svc-select"
                value={ledgerFilters.sectionId}
                onChange={(e) =>
                  setLedgerFilters((f) => ({ ...f, sectionId: e.target.value }))
                }
              >
                <option value="All">All sections</option>
                {sections.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <select
                className="svc-select"
                value={ledgerFilters.feeStatus}
                onChange={(e) =>
                  setLedgerFilters((f) => ({ ...f, feeStatus: e.target.value }))
                }
              >
                <option value="All">All status</option>
                <option value="Paid">Paid</option>
                <option value="Partial">Partial</option>
                <option value="Unpaid">Unpaid</option>
              </select>
              <div className="sdl-search">
                <i className="bx bx-search"></i>
                <input
                  placeholder="Search student…"
                  value={ledgerFilters.search}
                  onChange={(e) =>
                    setLedgerFilters((f) => ({ ...f, search: e.target.value }))
                  }
                />
                {ledgerFilters.search && (
                  <i className="bx bx-x sdl-search-clear" onClick={() => setLedgerFilters((f) => ({ ...f, search: "" }))} />
                )}
              </div>
              <button type="button" className="svc-btn-primary" onClick={loadLedger}>
                Apply
              </button>
              <button
                type="button"
                className="svc-btn-primary"
                disabled={generating || !ledgerFilters.feeStructureId}
                onClick={handleGenerate}
                title="Create Unpaid dues for all active students in the selected structure's class"
              >
                {generating ? "Generating…" : "Generate dues"}
              </button>
            </div>

            <div className="sdl-table-card">
              <table className="sdl-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Fee</th>
                    <th>Class</th>
                    <th>Due</th>
                    <th>Paid</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {ledger.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: "center", color: "#94a3b8" }}>
                        No ledger rows. Select a structure and click Generate dues.
                      </td>
                    </tr>
                  ) : (
                    ledger.map((row, i) => (
                      <tr key={row.id}>
                        <td>
                          <div className="sdl-student-cell">
                            <div
                              className="sdl-avatar"
                              style={{ background: AV_COLORS[i % AV_COLORS.length] }}
                            >
                              {initials(row.studentName || row.studentId)}
                            </div>
                            <div>
                              <div className="sdl-name">{row.studentName || row.studentId}</div>
                              <div className="sdl-email">{row.admissionNo || row.studentId}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          {row.feeName}
                          <div className="sdl-email">{row.term}</div>
                        </td>
                        <td>
                          {[row.className, row.sectionName].filter(Boolean).join(" - ") || "-"}
                        </td>
                        <td>
                          <strong>{fmtMoney(row.amountDue)}</strong>
                        </td>
                        <td>{fmtMoney(row.amountPaid)}</td>
                        <td>
                          <span className={`sdl-status ${String(row.feeStatus || "").toLowerCase()}`}>
                            {row.feeStatus}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Transport Fees ── */}
      {tab === 2 && (
        <div className="transport-panel">
          <div className="transport-panel-inner">
            <div className="transport-fee-row svc-fee-summary">
              <div className="svc-fee-card" style={{ borderColor: "#22c55e" }}>
                <div>
                  <div className="svc-fee-val" style={{ color: "#22c55e" }}>
                    {fmtMoney(transportCollected)}
                  </div>
                  <div className="svc-fee-lbl">Collected ({transportPaid} students)</div>
                </div>
              </div>
              <div className="svc-fee-card" style={{ borderColor: "#ef4444" }}>
                <div>
                  <div className="svc-fee-val" style={{ color: "#ef4444" }}>
                    {fmtMoney(transportPending)}
                  </div>
                  <div className="svc-fee-lbl">Pending ({transportUnpaid} students)</div>
                </div>
              </div>
              <div className="svc-fee-card" style={{ borderColor: "#2D3A8C" }}>
                <div>
                  <div className="svc-fee-val" style={{ color: "#2D3A8C" }}>
                    {fmtMoney(transportDue)}
                  </div>
                  <div className="svc-fee-lbl">
                    Total Due ({transportStudents.length} students)
                  </div>
                </div>
              </div>
            </div>

            <div className="transport-toolbar">
              <div className="sdl-search">
                <i className="bx bx-search"></i>
                <input
                  placeholder="Search student…"
                  value={transportSearch}
                  onChange={(e) => setTransportSearch(e.target.value)}
                />
                {transportSearch && (
                  <i className="bx bx-x sdl-search-clear" onClick={() => setTransportSearch("")} />
                )}
              </div>
              <select
                className="svc-select"
                value={transportFeeFilter}
                onChange={(e) => setTransportFeeFilter(e.target.value)}
              >
                <option value="All">All Status</option>
                <option value="Paid">Paid</option>
                <option value="Unpaid">Unpaid</option>
              </select>
            </div>

            <div className="sdl-table-card">
              <table className="sdl-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Class</th>
                    <th>Bus</th>
                    <th>Annual Fee</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transportStudents
                    .filter(
                      (s) =>
                        s.name.toLowerCase().includes(transportSearch.toLowerCase()) &&
                        (transportFeeFilter === "All" || s.feeStatus === transportFeeFilter)
                    )
                    .map((s, i) => (
                      <tr key={s.id}>
                        <td>
                          <div className="sdl-student-cell">
                            <div
                              className="sdl-avatar"
                              style={{ background: AV_COLORS[i % AV_COLORS.length] }}
                            >
                              {initials(s.name)}
                            </div>
                            <div>
                              <div className="sdl-name">{s.name}</div>
                              <div className="sdl-email">{s.admNo}</div>
                            </div>
                          </div>
                        </td>
                        <td>{s.cls}</td>
                        <td>{s.busNo}</td>
                        <td>
                          <strong>{fmtMoney(s.annualFee)}</strong>
                        </td>
                        <td>
                          <span className={`sdl-status ${String(s.feeStatus).toLowerCase()}`}>
                            {s.feeStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  {transportStudents.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ textAlign: "center", color: "#94a3b8" }}>
                        No transport allocations. Assign students under Transport.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {collectModal && (
        <ModalPortal>
        <div
          className="svc-modal-overlay"
          onClick={() => setCollectModal(null)}
        >
          <div
            className="svc-modal svc-modal-sm"
            style={{ padding: 22 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="svc-modal-hdr">
              <span className="svc-modal-title">Collect fee</span>
              <button
                type="button"
                className="svc-modal-close"
                onClick={() => setCollectModal(null)}
                aria-label="Close"
              >
                <i className="bx bx-x"></i>
              </button>
            </div>
            <div className="svc-modal-body">
            <p style={{ color: "#64748b", fontSize: 13, marginTop: 0 }}>
              {collectModal.studentName || collectModal.studentId} · {collectModal.feeName} · Due{" "}
              {fmtMoney(collectModal.amountDue)}
            </p>
            <label className="svc-label">Amount paid (₹)</label>
            <input
              className="svc-input"
              type="number"
              min="0"
              step="0.01"
              value={collectAmount}
              onChange={(e) => setCollectAmount(e.target.value)}
              style={{ width: "100%", marginBottom: 14 }}
            />
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap" }}>
              <button type="button" className="svc-btn-ghost" onClick={() => setCollectModal(null)}>
                Cancel
              </button>
              <button type="button" className="svc-btn-primary" onClick={() => handleCollect(false)}>
                Save payment
              </button>
              <button type="button" className="svc-btn-primary" onClick={() => handleCollect(true)}>
                Mark fully paid
              </button>
            </div>
            </div>
          </div>
        </div>
        </ModalPortal>
      )}
    </div>
  );
}
