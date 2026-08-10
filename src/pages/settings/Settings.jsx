import React, { useState } from "react";
import "./Settings.css";
import { getUserData } from "../../services/auth";

const Toggle = ({ checked, onChange }) => (
  <label className="settings-toggle">
    <input type="checkbox" checked={checked} onChange={onChange} />
    <span className="settings-toggle-slider" />
  </label>
);

// ── Tab content components ──────────────────────────────────────────────────

const ProfileTab = ({ role }) => {
  const name =
    role === "Staff"
      ? getUserData("staffName")
      : role === "Student"
      ? getUserData("studentName")
      : getUserData("adminName");
  const email = getUserData("email") || "";
  const phone = getUserData("phone") || "";

  const [form, setForm] = useState({ name: name || "", email, phone });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <>
      <div className="settings-card">
        <div className="settings-card-title">Personal Information</div>
        <div className="settings-row">
          <div>
            <div className="settings-row-label">Full Name</div>
            <div className="settings-row-desc">Your display name across the portal</div>
          </div>
          <input
            className="settings-input"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
        </div>
        <div className="settings-row">
          <div>
            <div className="settings-row-label">Email Address</div>
            <div className="settings-row-desc">Used for notifications and login</div>
          </div>
          <input
            className="settings-input"
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          />
        </div>
        <div className="settings-row">
          <div>
            <div className="settings-row-label">Phone Number</div>
            <div className="settings-row-desc">Contact number on record</div>
          </div>
          <input
            className="settings-input"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          />
        </div>
        <button className="settings-save-btn" onClick={handleSave}>
          {saved ? "Saved ✓" : "Save Changes"}
        </button>
      </div>

      {role === "Admin" && (
        <div className="settings-card">
          <div className="settings-card-title">School Information</div>
          <div className="settings-row">
            <div>
              <div className="settings-row-label">School Name</div>
              <div className="settings-row-desc">Displayed on reports and certificates</div>
            </div>
            <input className="settings-input" defaultValue="KST School" />
          </div>
          <div className="settings-row">
            <div>
              <div className="settings-row-label">Academic Year</div>
            </div>
            <select className="settings-select" defaultValue="2025-26">
              <option>2024-25</option>
              <option>2025-26</option>
              <option>2026-27</option>
            </select>
          </div>
        </div>
      )}
    </>
  );
};

const NotificationsTab = () => {
  const [prefs, setPrefs] = useState({
    assignments: true,
    attendance: true,
    exams: true,
    events: false,
    leave: true,
    announcements: true,
  });

  const toggle = (key) => setPrefs((p) => ({ ...p, [key]: !p[key] }));

  const rows = [
    { key: "assignments", label: "Assignments", desc: "New assignments and due date reminders" },
    { key: "attendance", label: "Attendance Alerts", desc: "Absence and late mark notifications" },
    { key: "exams", label: "Exam Schedules", desc: "Upcoming exams and result publications" },
    { key: "events", label: "Events & Announcements", desc: "School events and general notices" },
    { key: "leave", label: "Leave Updates", desc: "Leave approval and rejection alerts" },
    { key: "announcements", label: "System Announcements", desc: "Important system-level messages" },
  ];

  return (
    <div className="settings-card">
      <div className="settings-card-title">Notification Preferences</div>
      {rows.map(({ key, label, desc }) => (
        <div className="settings-row" key={key}>
          <div>
            <div className="settings-row-label">{label}</div>
            <div className="settings-row-desc">{desc}</div>
          </div>
          <Toggle checked={prefs[key]} onChange={() => toggle(key)} />
        </div>
      ))}
    </div>
  );
};

const AppearanceTab = () => {
  const [theme, setTheme] = useState("light");
  const [lang, setLang] = useState("en");
  const [density, setDensity] = useState("comfortable");

  return (
    <div className="settings-card">
      <div className="settings-card-title">Display Preferences</div>
      <div className="settings-row">
        <div>
          <div className="settings-row-label">Theme</div>
          <div className="settings-row-desc">Choose your interface theme</div>
        </div>
        <select className="settings-select" value={theme} onChange={(e) => setTheme(e.target.value)}>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="system">System Default</option>
        </select>
      </div>
      <div className="settings-row">
        <div>
          <div className="settings-row-label">Language</div>
          <div className="settings-row-desc">Portal display language</div>
        </div>
        <select className="settings-select" value={lang} onChange={(e) => setLang(e.target.value)}>
          <option value="en">English</option>
          <option value="ta">Tamil</option>
          <option value="hi">Hindi</option>
        </select>
      </div>
      <div className="settings-row">
        <div>
          <div className="settings-row-label">Layout Density</div>
          <div className="settings-row-desc">Controls spacing in tables and lists</div>
        </div>
        <select className="settings-select" value={density} onChange={(e) => setDensity(e.target.value)}>
          <option value="comfortable">Comfortable</option>
          <option value="compact">Compact</option>
        </select>
      </div>
    </div>
  );
};

const SecurityTab = () => {
  const [form, setForm] = useState({ current: "", newPwd: "", confirm: "" });
  const [msg, setMsg] = useState(null);

  const handleChange = () => {
    if (!form.current || !form.newPwd || !form.confirm) {
      setMsg({ type: "error", text: "All fields are required." });
      return;
    }
    if (form.newPwd !== form.confirm) {
      setMsg({ type: "error", text: "New passwords do not match." });
      return;
    }
    if (form.newPwd.length < 6) {
      setMsg({ type: "error", text: "Password must be at least 6 characters." });
      return;
    }
    setMsg({ type: "success", text: "Password updated successfully." });
    setForm({ current: "", newPwd: "", confirm: "" });
    setTimeout(() => setMsg(null), 3000);
  };

  return (
    <>
      <div className="settings-card">
        <div className="settings-card-title">Change Password</div>
        <div className="settings-row">
          <div className="settings-row-label">Current Password</div>
          <input
            className="settings-input"
            type="password"
            placeholder="Enter current password"
            value={form.current}
            onChange={(e) => setForm((f) => ({ ...f, current: e.target.value }))}
          />
        </div>
        <div className="settings-row">
          <div className="settings-row-label">New Password</div>
          <input
            className="settings-input"
            type="password"
            placeholder="Enter new password"
            value={form.newPwd}
            onChange={(e) => setForm((f) => ({ ...f, newPwd: e.target.value }))}
          />
        </div>
        <div className="settings-row">
          <div className="settings-row-label">Confirm Password</div>
          <input
            className="settings-input"
            type="password"
            placeholder="Confirm new password"
            value={form.confirm}
            onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))}
          />
        </div>
        {msg && (
          <p style={{ fontSize: 13, marginTop: 10, color: msg.type === "error" ? "#ef4444" : "#16a34a" }}>
            {msg.text}
          </p>
        )}
        <button className="settings-save-btn" onClick={handleChange}>
          Update Password
        </button>
      </div>

      <div className="settings-card">
        <div className="settings-card-title">Session</div>
        <div className="settings-row">
          <div>
            <div className="settings-row-label">Active Sessions</div>
            <div className="settings-row-desc">You are currently logged in on this device</div>
          </div>
          <span className="settings-badge">1 active</span>
        </div>
      </div>
    </>
  );
};

// ── Main Settings component ─────────────────────────────────────────────────

const TABS = ["Profile", "Notifications", "Appearance", "Security"];

const Settings = () => {
  const role = getUserData("role") || "Admin";
  const [activeTab, setActiveTab] = useState("Profile");

  const subtitle =
    role === "Staff"
      ? "Staff preferences and configuration."
      : role === "Student"
      ? "Student preferences and configuration."
      : "School configuration and preferences.";

  return (
    <div className="settings-wrap">
      <h2 className="settings-page-title">Settings</h2>
      <p className="settings-page-sub">{subtitle}</p>

      <div className="settings-tabs">
        {TABS.map((tab) => (
          <button
            key={tab}
            className={`settings-tab${activeTab === tab ? " active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Profile"       && <ProfileTab role={role} />}
      {activeTab === "Notifications" && <NotificationsTab />}
      {activeTab === "Appearance"    && <AppearanceTab />}
      {activeTab === "Security"      && <SecurityTab />}
    </div>
  );
};

export default Settings;
