import { useEffect, useState } from "react";
import { getToken } from "../services/auth";
import {
  fetchNotifications,
  mapNotificationRow,
  NOTIFICATION_POLL_MS,
} from "../utils/notificationBus";

export default function useNavNotifications() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    let active = true;

    const load = async () => {
      const token = getToken();
      if (!token || !active) return;
      try {
        const res = await fetchNotifications(token);
        if (!active || res?.status !== "success" || !Array.isArray(res.data)) {
          return;
        }
        setNotifications(res.data.map(mapNotificationRow));
      } catch (_) {
        // ignore transient fetch errors in navbar badge
      }
    };

    load();
    window.addEventListener("notifications:changed", load);
    const pollId = setInterval(load, NOTIFICATION_POLL_MS);

    return () => {
      active = false;
      window.removeEventListener("notifications:changed", load);
      clearInterval(pollId);
    };
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return { notifications, unreadCount, setNotifications };
}
