import { getNotifications as getNotificationsApi } from "../services/api";

const MIN_FETCH_MS = 5000;
const POLL_MS = 60000;

let inflightPromise = null;
let inflightKey = "";
let lastFetchedAt = 0;
let lastResponse = null;

const buildKey = (filters = {}) =>
  JSON.stringify({
    type: filters.type || "All",
    unreadOnly: !!filters.unreadOnly,
    limit: filters.limit || 100,
  });

export const fetchNotifications = async (token, filters = {}) => {
  if (!token) return { status: "Error", data: [] };

  const key = buildKey(filters);
  const now = Date.now();

  if (inflightPromise && inflightKey === key) {
    return inflightPromise;
  }

  if (
    lastResponse &&
    inflightKey === key &&
    now - lastFetchedAt < MIN_FETCH_MS
  ) {
    return lastResponse;
  }

  inflightKey = key;
  inflightPromise = getNotificationsApi(token, filters)
    .then((response) => {
      lastResponse = response;
      lastFetchedAt = Date.now();
      return response;
    })
    .finally(() => {
      inflightPromise = null;
    });

  return inflightPromise;
};

let emitTimer = null;

export const emitNotificationsChanged = () => {
  if (emitTimer) clearTimeout(emitTimer);
  emitTimer = setTimeout(() => {
    window.dispatchEvent(new Event("notifications:changed"));
  }, 400);
};

export const mapNotificationRow = (n, index = 0) => ({
  id: n.id || index,
  title: n.title || "Notification",
  desc: n.message || n.description || "",
  time: n.createdAt || n.time || "",
  read: Number(n.isRead) === 1 || n.read === true,
  icon: "bx bxs-bell",
  color: "#2D3A8C",
  bg: "#eef0fb",
  ...n,
});

export const NOTIFICATION_POLL_MS = POLL_MS;
