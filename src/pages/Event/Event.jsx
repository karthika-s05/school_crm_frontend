import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FiBell,
  FiCalendar,
  FiCheck,
  FiDownload,
  FiEdit2,
  FiEye,
  FiPlus,
  FiRefreshCw,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import { getToken, getUserData } from "../../services/auth";
import {
  createEvent,
  createEventImage,
  deletetEvents,
  getClass,
  getEvent,
  getEventHistory,
  getEventMeta,
  getSection,
  getStudentlist,
  publishEvent,
  unpublishEvent,
} from "../../services/api";
import { runApi } from "../../utils/apiHelper";
import "./Event.css";

const EMPTY_FORM = {
  id: 0,
  title: "",
  eventType: "",
  description: "",
  eventDate: "",
  eventTime: "",
  venue: "",
  priority: "Medium",
  audienceType: "",
  classId: "",
  sectionId: "",
  classIds: [],
  studentIds: [],
  status: "Draft",
};

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const EventsPage = () => {
  const token = getToken();
  const role = String(getUserData("role") || "").trim();
  const isAdmin = role.toLowerCase() === "admin";
  const isStaff = role.toLowerCase() === "staff";
  const isStudent = role.toLowerCase() === "student";
  const canManage = isAdmin || isStaff;

  const [events, setEvents] = useState([]);
  const [meta, setMeta] = useState({
    eventTypes: [],
    audienceTypes: [],
    priorities: ["High", "Medium", "Low"],
  });
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [students, setStudents] = useState([]);
  const [filters, setFilters] = useState({
    title: "",
    eventType: "All",
    status: "All",
    date: "",
    classId: "",
    sectionId: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyRows, setHistoryRows] = useState([]);
  const [viewItem, setViewItem] = useState(null);

  const pageTitle = isAdmin
    ? "Events & Announcements"
    : isStaff
      ? "Parent Meetings & Class Announcements"
      : "School Events";

  const loadMasters = useCallback(async () => {
    if (!token || isStudent) return;
    try {
      const [metaRes, classRes, sectionRes] = await Promise.all([
        getEventMeta(token),
        getClass(0, token),
        getSection(0, token),
      ]);
      setMeta({
        eventTypes: metaRes?.data?.eventTypes || [],
        audienceTypes: metaRes?.data?.audienceTypes || [],
        priorities: metaRes?.data?.priorities || ["High", "Medium", "Low"],
      });
      setClasses(Array.isArray(classRes) ? classRes : classRes?.data || []);
      setSections(Array.isArray(sectionRes) ? sectionRes : sectionRes?.data || []);
    } catch (_) {
      // Masters are optional for viewing.
    }
  }, [token, isStudent]);

  const loadEvents = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    await runApi(
      () =>
        getEvent(
          {
            title: filters.title || undefined,
            eventType: filters.eventType !== "All" ? filters.eventType : undefined,
            status: filters.status !== "All" ? filters.status : undefined,
            date: filters.date || undefined,
            classId: filters.classId || undefined,
            sectionId: filters.sectionId || undefined,
          },
          token
        ),
      {
        onSuccess: (res) => {
          const list = Array.isArray(res.data) ? res.data : [];
          setEvents(list);
        },
        onError: () => {
          setEvents([]);
          setError("Unable to load events.");
        },
      }
    );
    setLoading(false);
  }, [token, filters]);

  useEffect(() => {
    loadMasters();
  }, [loadMasters]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  useEffect(() => {
    if (!token || !canManage || !form.classId) {
      setStudents([]);
      return;
    }
    getStudentlist(
      { userName: 0, classId: Number(form.classId), sectionId: Number(form.sectionId || 0) },
      token
    )
      .then((res) => {
        const list = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res)
            ? res
            : [];
        setStudents(list);
      })
      .catch(() => setStudents([]));
  }, [token, canManage, form.classId, form.sectionId]);

  const openCreate = () => {
    setForm({
      ...EMPTY_FORM,
      eventType: meta.eventTypes[0] || "",
      audienceType: meta.audienceTypes[0] || "",
    });
    setFile(null);
    setShowModal(true);
  };

  const openEdit = (item) => {
    const firstTarget = item.targets?.[0] || {};
    setForm({
      id: item.id,
      title: item.title || "",
      eventType: item.eventType || "",
      description: item.description || "",
      eventDate: String(item.eventDate || "").slice(0, 10),
      eventTime: item.eventTime || "",
      venue: item.venue || "",
      priority: item.priority || "Medium",
      audienceType: item.audienceType || "",
      classId: firstTarget.classId ? String(firstTarget.classId) : "",
      sectionId: firstTarget.sectionId ? String(firstTarget.sectionId) : "",
      classIds: (item.targets || [])
        .map((t) => t.classId)
        .filter(Boolean)
        .map(String),
      studentIds: (item.targets || [])
        .map((t) => t.studentId)
        .filter(Boolean)
        .map(String),
      status: item.status || "Draft",
      attachmentUrl: item.attachmentUrl || "",
    });
    setFile(null);
    setShowModal(true);
  };

  const saveEvent = async ({ publish = false } = {}) => {
    // Sync guard — React state alone cannot block rapid double-clicks.
    if (savingRef.current) return;
    if (!form.title.trim() || !form.eventDate || !form.eventType || !form.audienceType) {
      setError("Title, type, date and audience are required.");
      return;
    }
    const audience = form.audienceType;
    if (
      (audience === "Selected Class" || audience === "Entire Class") &&
      !form.classId
    ) {
      setError("Please select a class for this audience.");
      return;
    }
    if (audience === "Selected Section" && (!form.classId || !form.sectionId)) {
      setError("Please select class and section.");
      return;
    }
    if (audience === "Multiple Classes" && !(form.classIds || []).length) {
      setError("Please select at least one class.");
      return;
    }
    if (
      /selected student/i.test(audience) &&
      !(form.studentIds || []).length
    ) {
      setError("Please select at least one student.");
      return;
    }

    savingRef.current = true;
    setSaving(true);
    setError("");
    const classIds =
      audience === "Multiple Classes"
        ? form.classIds || []
        : form.classId
          ? [form.classId]
          : form.classIds || [];

    // Always save as Draft first, then publish once — avoids create+publish double notify
    // and prevents duplicate rows from overlapping submit handlers.
    const payload = {
      id: Number(form.id) || 0,
      title: form.title.trim(),
      eventType: form.eventType,
      description: form.description.trim(),
      eventDate: form.eventDate,
      eventTime: form.eventTime || null,
      venue: form.venue || null,
      priority: form.priority,
      audienceType: form.audienceType,
      classId: form.classId || (classIds[0] != null ? classIds[0] : null),
      sectionId: form.sectionId || null,
      classIds,
      studentIds: form.studentIds,
      status: "Draft",
    };

    try {
      const saved = await runApi(() => createEvent(payload, token), {
        successMsg: publish ? undefined : "Event saved",
        onError: (err) => {
          const msg =
            err?.message ||
            err?.response?.data?.message ||
            "Unable to save event.";
          setError(typeof msg === "string" ? msg : "Unable to save event.");
        },
      });
      if (!saved) return;

      const eventId = saved?.data?.id || form.id;
      if (file && eventId) {
        const fd = new FormData();
        fd.append("id", eventId);
        fd.append("photoUrl", file);
        await runApi(() => createEventImage(fd, token));
      }

      if (publish && eventId) {
        await runApi(() => publishEvent(eventId, token), {
          successMsg: "Event published",
        });
      }

      setShowModal(false);
      setFile(null);
      window.dispatchEvent(new window.Event("notifications:changed"));
      await loadEvents();
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  const removeEvent = async (id) => {
    if (!window.confirm("Delete this event?")) return;
    await runApi(() => deletetEvents(id, token), {
      successMsg: "Event deleted",
    });
    loadEvents();
  };

  const togglePublish = async (item) => {
    if (item.status === "Published") {
      await runApi(() => unpublishEvent(item.id, token), {
        successMsg: "Event unpublished",
      });
    } else {
      await runApi(() => publishEvent(item.id, token), {
        successMsg: "Event published",
      });
      window.dispatchEvent(new window.Event("notifications:changed"));
    }
    loadEvents();
  };

  const openHistory = async (item) => {
    const res = await runApi(() => getEventHistory(item.id, token));
    setHistoryRows(Array.isArray(res?.data) ? res.data : []);
    setHistoryOpen(true);
  };

  const attachmentHref = (url) => {
    if (!url) return null;
    if (/^https?:\/\//i.test(url)) return url;
    const base = (process.env.REACT_APP_DAILY_URL || "").replace(/\/$/, "");
    return `${base}${url.startsWith("/") ? "" : "/"}${url}`;
  };

  const visibleSections = useMemo(() => {
    if (!form.classId) return sections;
    return sections;
  }, [sections, form.classId]);

  const needsClass =
    /^(selected class|entire class|selected section|selected students?)$/i.test(
      form.audienceType || ""
    );
  const needsSection = /^selected section$/i.test(form.audienceType || "");
  const needsStudents = /^selected students?$/i.test(form.audienceType || "");
  const needsMultiClass = /^multiple classes$/i.test(form.audienceType || "");

  return (
    <section className="evt-page">
      <div className="evt-header">
        <div>
          {/* <span className="evt-eyebrow">
            {isAdmin ? "Administration" : isStaff ? "Communication" : "Activities"}
          </span>
          <h1>{pageTitle}</h1>
          <p>
            {canManage
              ? "Create, publish and notify the selected audience."
              : "Events and announcements intended for you."}
          </p> */}
        </div>
        <div className="evt-header-actions">
          <button type="button" onClick={loadEvents} disabled={loading}>
            <FiRefreshCw /> Refresh
          </button>
          {canManage && (
            <button type="button" className="primary" onClick={openCreate}>
              <FiPlus /> Create
            </button>
          )}
        </div>
      </div>

      <div className="evt-filters">
        <input
          placeholder="Search title"
          value={filters.title}
          onChange={(e) => setFilters((p) => ({ ...p, title: e.target.value }))}
        />
        <select
          value={filters.eventType}
          onChange={(e) => setFilters((p) => ({ ...p, eventType: e.target.value }))}
        >
          <option value="All">All Types</option>
          {(meta.eventTypes.length
            ? meta.eventTypes
            : [
                "School Event",
                "Holiday",
                "Parent Meeting",
                "Circular",
                "General Announcement",
              ]
          ).map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        {canManage && (
          <select
            value={filters.status}
            onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}
          >
            <option value="All">All Status</option>
            <option value="Draft">Draft</option>
            <option value="Published">Published</option>
            <option value="Unpublished">Unpublished</option>
          </select>
        )}
        <input
          type="date"
          value={filters.date}
          onChange={(e) => setFilters((p) => ({ ...p, date: e.target.value }))}
        />
        {canManage && (
          <>
            <select
              value={filters.classId}
              onChange={(e) => setFilters((p) => ({ ...p, classId: e.target.value }))}
            >
              <option value="">All Classes</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name || c.className}</option>
              ))}
            </select>
            <select
              value={filters.sectionId}
              onChange={(e) => setFilters((p) => ({ ...p, sectionId: e.target.value }))}
            >
              <option value="">All Sections</option>
              {sections.map((s) => (
                <option key={s.id} value={s.id}>{s.name || s.sectionName}</option>
              ))}
            </select>
          </>
        )}
      </div>

      {error && <div className="evt-error">{error}</div>}

      {loading ? (
        <div className="evt-empty">Loading events…</div>
      ) : events.length === 0 ? (
        <div className="evt-empty">
          <FiCalendar />
          <strong>No events found</strong>
          <span>Try changing filters or create a new event.</span>
        </div>
      ) : (
        <div className="evt-grid">
          {events.map((item) => {
            const unread = item.isRead === 0;
            return (
              <article
                key={item.id}
                className={`evt-card${unread ? " unread" : ""} priority-${String(
                  item.priority || "Medium"
                ).toLowerCase()}`}
              >
                <div className="evt-card-top">
                  <span className="evt-type">{item.eventType}</span>
                  <span className={`evt-status ${String(item.status || "").toLowerCase()}`}>
                    {item.status}
                  </span>
                </div>
                <h2>{item.title}</h2>
                <p>{item.description || "No description"}</p>
                <div className="evt-meta">
                  <span><FiCalendar /> {formatDate(item.eventDate)}{item.eventTime ? ` · ${item.eventTime}` : ""}</span>
                  {item.venue && <span>{item.venue}</span>}
                  <span>Posted by {item.postedBy || item.createdBy}</span>
                  {isStudent && (
                    <span className={unread ? "unread-pill" : "read-pill"}>
                      <FiBell /> {unread ? "Unread" : item.isRead == null ? "Published" : "Read"}
                    </span>
                  )}
                </div>
                <div className="evt-card-actions">
                  <button type="button" onClick={() => setViewItem(item)}>
                    <FiEye /> View
                  </button>
                  {item.attachmentUrl && (
                    <a href={attachmentHref(item.attachmentUrl)} target="_blank" rel="noreferrer">
                      <FiDownload /> Attachment
                    </a>
                  )}
                  {canManage && (
                    <>
                      <button type="button" onClick={() => openEdit(item)}>
                        <FiEdit2 /> Edit
                      </button>
                      <button type="button" onClick={() => togglePublish(item)}>
                        <FiCheck /> {item.status === "Published" ? "Unpublish" : "Publish"}
                      </button>
                      <button type="button" onClick={() => openHistory(item)}>
                        History
                      </button>
                      <button type="button" className="danger" onClick={() => removeEvent(item.id)}>
                        <FiTrash2 />
                      </button>
                    </>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="evt-modal-backdrop">
          <div className="evt-modal">
            <div className="evt-modal-header">
              <h3>{form.id ? "Edit Event" : "Create Event"}</h3>
              <button type="button" onClick={() => setShowModal(false)}><FiX /></button>
            </div>
            <div className="evt-modal-body">
              <label>Title
                <input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
              </label>
              <label>Event Type
                <select value={form.eventType} onChange={(e) => setForm((p) => ({ ...p, eventType: e.target.value }))}>
                  <option value="">Select type</option>
                  {meta.eventTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </label>
              <label>Description
                <textarea rows={3} value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
              </label>
              <div className="evt-row">
                <label>Date
                  <input type="date" value={form.eventDate} onChange={(e) => setForm((p) => ({ ...p, eventDate: e.target.value }))} />
                </label>
                <label>Time
                  <input type="time" value={form.eventTime} onChange={(e) => setForm((p) => ({ ...p, eventTime: e.target.value }))} />
                </label>
              </div>
              <div className="evt-row">
                <label>Venue
                  <input value={form.venue} onChange={(e) => setForm((p) => ({ ...p, venue: e.target.value }))} />
                </label>
                <label>Priority
                  <select value={form.priority} onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value }))}>
                    {meta.priorities.map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                </label>
              </div>
              <label>Audience
                <select value={form.audienceType} onChange={(e) => setForm((p) => ({ ...p, audienceType: e.target.value }))}>
                  <option value="">Select audience</option>
                  {meta.audienceTypes.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </label>
              {needsClass && !needsMultiClass && (
                <div className="evt-row">
                  <label>Class
                    <select value={form.classId} onChange={(e) => setForm((p) => ({ ...p, classId: e.target.value }))}>
                      <option value="">Select class</option>
                      {classes.map((c) => (
                        <option key={c.id} value={c.id}>{c.name || c.className}</option>
                      ))}
                    </select>
                  </label>
                  {(needsSection || needsStudents) && (
                    <label>Section
                      <select value={form.sectionId} onChange={(e) => setForm((p) => ({ ...p, sectionId: e.target.value }))}>
                        <option value="">Select section</option>
                        {visibleSections.map((s) => (
                          <option key={s.id} value={s.id}>{s.name || s.sectionName}</option>
                        ))}
                      </select>
                    </label>
                  )}
                </div>
              )}
              {needsMultiClass && (
                <label>Classes
                  <select
                    multiple
                    value={form.classIds}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        classIds: Array.from(e.target.selectedOptions).map((o) => o.value),
                      }))
                    }
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>{c.name || c.className}</option>
                    ))}
                  </select>
                </label>
              )}
              {needsStudents && (
                <label>Students
                  <select
                    multiple
                    value={form.studentIds}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        studentIds: Array.from(e.target.selectedOptions).map((o) => o.value),
                      }))
                    }
                  >
                    {students.map((s) => (
                      <option key={s.admissionNo || s.id} value={s.admissionNo || s.userName}>
                        {s.studentName || s.firstName || s.admissionNo}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              <label>Attachment (PDF / Image)
                <input
                  type="file"
                  accept="image/png,image/jpeg,application/pdf"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
              </label>
            </div>
            <div className="evt-modal-footer">
              <button type="button" onClick={() => setShowModal(false)} disabled={saving}>Cancel</button>
              <button
                type="button"
                disabled={saving}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  saveEvent({ publish: false });
                }}
              >
                {saving ? "Saving..." : "Save Draft"}
              </button>
              <button
                type="button"
                className="primary"
                disabled={saving}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  saveEvent({ publish: true });
                }}
              >
                {saving ? "Publishing..." : "Save & Publish"}
              </button>
            </div>
          </div>
        </div>
      )}

      {viewItem && (
        <div className="evt-modal-backdrop" onClick={() => setViewItem(null)}>
          <div className="evt-modal" onClick={(e) => e.stopPropagation()}>
            <div className="evt-modal-header">
              <h3>{viewItem.title}</h3>
              <button type="button" onClick={() => setViewItem(null)}><FiX /></button>
            </div>
            <div className="evt-modal-body">
              <p><strong>Type:</strong> {viewItem.eventType}</p>
              <p><strong>Date:</strong> {formatDate(viewItem.eventDate)} {viewItem.eventTime || ""}</p>
              <p><strong>Venue:</strong> {viewItem.venue || "—"}</p>
              <p><strong>Priority:</strong> {viewItem.priority}</p>
              <p><strong>Posted By:</strong> {viewItem.postedBy || viewItem.createdBy}</p>
              <p>{viewItem.description}</p>
              {viewItem.attachmentUrl && (
                <a href={attachmentHref(viewItem.attachmentUrl)} target="_blank" rel="noreferrer">
                  Open attachment
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {historyOpen && (
        <div className="evt-modal-backdrop" onClick={() => setHistoryOpen(false)}>
          <div className="evt-modal" onClick={(e) => e.stopPropagation()}>
            <div className="evt-modal-header">
              <h3>Event History</h3>
              <button type="button" onClick={() => setHistoryOpen(false)}><FiX /></button>
            </div>
            <div className="evt-modal-body">
              {historyRows.length === 0 ? (
                <div className="evt-empty">No history yet.</div>
              ) : (
                historyRows.map((row) => (
                  <div key={row.id} className="evt-history-row">
                    <strong>{row.action}</strong>
                    <span>by {row.actorId} ({row.actorRole})</span>
                    <time>{formatDate(row.createdAt)}</time>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default EventsPage;
