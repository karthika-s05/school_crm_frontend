import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  FiBell,
  FiCheck,
  FiCheckCircle,
  FiRefreshCw,
  FiTrash2,
} from "react-icons/fi";
import { getToken } from "../../services/auth";
import {
  deleteNotification,
  getNotifications,
  markNotificationAsRead,
  updateNotificationTime,
} from "../../services/api";
import "./NotificationCenter.css";

const TYPES = [
  "All",
  "Leave",
  "Homework",
  "Assignment",
  "Exam",
  "Examination",
  "Attendance",
  "Event",
  "Parent Meeting",
  "Circular",
  "Holiday",
  "Announcement",
  "Timetable",
];

const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const emitChange = () => window.dispatchEvent(new Event("notifications:changed"));

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState([]);
  const [type, setType] = useState("All");
  const [status, setStatus] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const response = await getNotifications(token, { type, limit: 250 });
      if (response?.status !== "success") {
        throw new Error(response?.message || "Unable to load notifications");
      }
      setNotifications(Array.isArray(response.data) ? response.data : []);
    } catch (loadError) {
      setError(loadError?.response?.data?.message || loadError.message);
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const pollId = setInterval(load, 30000);
    const handleChange = () => load();
    window.addEventListener("notifications:changed", handleChange);
    return () => {
      clearInterval(pollId);
      window.removeEventListener("notifications:changed", handleChange);
    };
  }, [load]);

  const visible = useMemo(
    () =>
      notifications.filter((item) => {
        if (status === "Unread") return !Number(item.isRead);
        if (status === "Read") return Number(item.isRead);
        return true;
      }),
    [notifications, status]
  );

  const unreadCount = notifications.filter((item) => !Number(item.isRead)).length;

  const markOne = async (id) => {
    const token = getToken();
    setNotifications((items) =>
      items.map((item) =>
        Number(item.id) === Number(id) ? { ...item, isRead: 1 } : item
      )
    );
    try {
      await markNotificationAsRead(id, token);
      emitChange();
    } catch (_) {
      load();
    }
  };

  const markAll = async () => {
    const token = getToken();
    setNotifications((items) => items.map((item) => ({ ...item, isRead: 1 })));
    try {
      await updateNotificationTime(token);
      emitChange();
    } catch (_) {
      load();
    }
  };

  const remove = async (id) => {
    const token = getToken();
    try {
      await deleteNotification(id, token);
      setNotifications((items) =>
        items.filter((item) => Number(item.id) !== Number(id))
      );
      emitChange();
    } catch (deleteError) {
      setError(
        deleteError?.response?.data?.message || "Notification could not be deleted"
      );
    }
  };

  return (
    <section className="notification-center">
      <div className="notification-center__header">
        <div>
          <span className="notification-center__eyebrow">Notification Center</span>
          <h1>Notifications</h1>
          <p>{unreadCount} unread notification{unreadCount === 1 ? "" : "s"}</p>
        </div>
        <div className="notification-center__header-actions">
          <button type="button" onClick={load} disabled={loading}>
            <FiRefreshCw /> Refresh
          </button>
          <button type="button" onClick={markAll} disabled={!unreadCount}>
            <FiCheck /> Mark all as read
          </button>
        </div>
      </div>

      <div className="notification-center__filters">
        <label>
          Type
          <select value={type} onChange={(event) => setType(event.target.value)}>
            {TYPES.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </label>
        <div className="notification-center__status" aria-label="Read status filter">
          {["All", "Unread", "Read"].map((item) => (
            <button
              type="button"
              key={item}
              className={status === item ? "active" : ""}
              onClick={() => setStatus(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="notification-center__error">{error}</div>}

      <div className="notification-center__list" aria-live="polite">
        {loading ? (
          <div className="notification-center__empty">Loading notifications…</div>
        ) : visible.length === 0 ? (
          <div className="notification-center__empty">
            <FiBell />
            <strong>No notifications</strong>
            <span>There are no notifications matching this filter.</span>
          </div>
        ) : (
          visible.map((item) => {
            const unread = !Number(item.isRead);
            return (
              <article
                key={item.id}
                className={`notification-card${unread ? " unread" : ""}`}
              >
                <div className="notification-card__icon"><FiBell /></div>
                <div className="notification-card__content">
                  <div className="notification-card__meta">
                    <span>{item.notificationType || "General"}</span>
                    <time>{formatDate(item.createdAt)}</time>
                  </div>
                  <h2>{item.title || "Notification"}</h2>
                  <p>{item.message}</p>
                </div>
                <div className="notification-card__actions">
                  {unread && (
                    <button type="button" onClick={() => markOne(item.id)}>
                      <FiCheckCircle /> Mark read
                    </button>
                  )}
                  <button
                    type="button"
                    className="danger"
                    onClick={() => remove(item.id)}
                    aria-label={`Delete ${item.title || "notification"}`}
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}
