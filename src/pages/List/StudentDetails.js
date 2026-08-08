import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getStudentlist } from "../../services/api";
import { getToken } from "../../services/auth";
import { formatApiDate } from "../../utils/date";
import {
  fileNameFromUrl,
  pickDocUrl,
  resolveUploadUrl,
} from "../../utils/uploads";
import "./StudentDetails.css";

const initials = (name) =>
  String(name || "?")
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const text = (value) => {
  const clean = String(value ?? "").trim();
  return clean && clean !== "null" && clean !== "undefined" ? clean : "";
};

const joinText = (parts, separator = " ") =>
  parts.map(text).filter(Boolean).join(separator);

const money = (value) => {
  const amount = Number(String(value ?? "").replace(/[^\d.-]/g, ""));
  if (!Number.isFinite(amount) || amount <= 0) return "";
  return `₹ ${amount.toLocaleString("en-IN")}`;
};

const date = (value) => (text(value) ? formatApiDate(value, "") : "");

function Field({ label, value, wide = false }) {
  return (
    <div className={`stv-field${wide ? " stv-field-wide" : ""}`}>
      <span className="stv-field-label">{label}</span>
      <span className={`stv-field-value${value ? "" : " stv-field-empty"}`}>
        {value || "Not provided"}
      </span>
    </div>
  );
}

function Section({ icon, title, children }) {
  return (
    <section className="stv-card">
      <header className="stv-card-head">
        <i className={icon}></i>
        <h3>{title}</h3>
      </header>
      <div className="stv-grid">{children}</div>
    </section>
  );
}

function DocumentRow({ icon, title, number, url }) {
  return (
    <div className={`stv-doc${url ? " stv-doc-ready" : ""}`}>
      <div className="stv-doc-icon">
        <i className={icon}></i>
      </div>
      <div className="stv-doc-meta">
        <p className="stv-doc-title">{title}</p>
        <p className="stv-doc-sub">
          {number ? `No. ${number}` : url ? fileNameFromUrl(url) : "Not uploaded"}
        </p>
      </div>
      {url ? (
        <a
          className="stv-doc-view"
          href={url}
          target="_blank"
          rel="noreferrer"
        >
          <i className="bx bx-show"></i> View
        </a>
      ) : (
        <span className="stv-doc-missing">Missing</span>
      )}
    </div>
  );
}

export default function StudentDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStudent = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getStudentlist({ userName: id }, getToken());
      const row = Array.isArray(response?.data) ? response.data[0] : null;
      setStudent(row || null);
      if (!row) setError("This student could not be found.");
    } catch (err) {
      console.error("Error fetching student details:", err);
      setStudent(null);
      setError("Could not reach server. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) fetchStudent();
  }, [id, fetchStudent]);

  if (loading) {
    return (
      <div className="stv-wrap">
        <div className="stv-loading">
          <i className="bx bx-loader-alt bx-spin"></i>
          Loading student details…
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="stv-wrap">
        <div className="stv-empty">
          <i className="bx bx-user-x"></i>
          <p>{error || "This student could not be found."}</p>
          <button
            type="button"
            className="stv-btn stv-btn-primary"
            onClick={() => navigate("/admin/students")}
          >
            Back to student list
          </button>
        </div>
      </div>
    );
  }

  const admissionNo = text(student.admissionNo) || text(id);
  const name =
    joinText([student.studentName]) ||
    joinText([student.firstName, student.middleName, student.lastName]);
  const displayName = joinText([student.initial, name], ". ") || name;
  const photo = resolveUploadUrl(pickDocUrl(student, "photoUrl", "image"));
  const address = joinText(
    [
      student.address1,
      student.address2,
      student.city,
      student.state,
      text(student.pincode) ? `- ${text(student.pincode)}` : "",
    ],
    ", "
  );

  const documents = [
    {
      key: "photo",
      icon: "bx bxs-camera",
      title: "Student Photo",
      url: photo,
    },
    {
      key: "aadhar",
      icon: "bx bxs-id-card",
      title: "Aadhar Card",
      number: text(student.adharcardNo),
      url: resolveUploadUrl(pickDocUrl(student, "adharCard", "aadharCard")),
    },
    {
      key: "birth",
      icon: "bx bxs-certification",
      title: "Birth Certificate",
      number: text(student.birthCertNo),
      url: resolveUploadUrl(pickDocUrl(student, "birthCertificate")),
    },
    {
      key: "community",
      icon: "bx bxs-file-doc",
      title: "Community Certificate",
      number: text(student.communityCertNo),
      url: resolveUploadUrl(pickDocUrl(student, "communityCertUrl")),
    },
    {
      key: "tc",
      icon: "bx bxs-file-pdf",
      title: "Transfer Certificate",
      number: text(student.OldTcNumber) || text(student.transferCertificateNo),
      url: resolveUploadUrl(pickDocUrl(student, "tcCertificate")),
    },
  ];

  return (
    <div className="stv-wrap">
      <div className="stv-topbar">
        <button
          type="button"
          className="stv-back"
          onClick={() => navigate("/admin/students")}
        >
          <i className="bx bx-arrow-back"></i> Back to list
        </button>
        <div className="stv-topbar-actions">
          <button
            type="button"
            className="stv-btn stv-btn-ghost"
            onClick={() => navigate(`/admin/studentinfo/${admissionNo}`)}
          >
            <i className="bx bx-folder-open"></i> Documents
          </button>
          <button
            type="button"
            className="stv-btn stv-btn-primary"
            onClick={() => navigate(`/admin/student/${admissionNo}`)}
          >
            <i className="bx bx-edit"></i> Edit
          </button>
        </div>
      </div>

      <header className="stv-hero">
        {photo ? (
          <img className="stv-hero-photo" src={photo} alt={name} />
        ) : (
          <div className="stv-hero-photo stv-hero-initials">{initials(name)}</div>
        )}
        <div className="stv-hero-main">
          <h2 className="stv-hero-name">{displayName || "Student"}</h2>
          <p className="stv-hero-sub">
            Admission No <strong>{admissionNo || "-"}</strong>
          </p>
          <div className="stv-chips">
            <span className="stv-chip">
              <i className="bx bxs-graduation"></i>
              Class {text(student.class) || "-"}
              {text(student.section) ? ` · ${text(student.section)}` : ""}
            </span>
            {text(student.gender) && (
              <span className="stv-chip">
                <i className="bx bx-user"></i> {text(student.gender)}
              </span>
            )}
            {text(student.bloodgroup) && (
              <span className="stv-chip">
                <i className="bx bx-droplet"></i> {text(student.bloodgroup)}
              </span>
            )}
          </div>
        </div>
        <div className="stv-hero-quick">
          <div className="stv-quick">
            <span className="stv-quick-label">Mobile</span>
            <span className="stv-quick-value">{text(student.mobile) || "-"}</span>
          </div>
          <div className="stv-quick">
            <span className="stv-quick-label">Email</span>
            <span className="stv-quick-value">{text(student.emailId) || "-"}</span>
          </div>
          <div className="stv-quick">
            <span className="stv-quick-label">Joined</span>
            <span className="stv-quick-value">
              {date(student.dateOfJoining) || "-"}
            </span>
          </div>
        </div>
      </header>

      <div className="stv-body">
        <Section icon="bx bxs-graduation" title="Academic">
          <Field label="Admission No" value={admissionNo} />
          <Field label="Registration No" value={text(student.registrationNo)} />
          <Field label="EMIS No" value={text(student.emisNo)} />
          <Field label="Class" value={text(student.class)} />
          <Field label="Section" value={text(student.section)} />
          <Field label="Date of Joining" value={date(student.dateOfJoining)} />
        </Section>

        <Section icon="bx bxs-user-detail" title="Personal">
          <Field label="Full Name" value={displayName} />
          <Field label="Gender" value={text(student.gender)} />
          <Field label="Date of Birth" value={date(student.dateOfBirth)} />
          <Field label="Blood Group" value={text(student.bloodgroup)} />
          <Field label="Religion" value={text(student.religion)} />
          <Field label="Community" value={text(student.community)} />
          <Field label="Nationality" value={text(student.nationality)} />
          <Field label="Aadhar No" value={text(student.adharcardNo)} />
        </Section>

        <Section icon="bx bxs-phone" title="Contact">
          <Field label="Mobile" value={text(student.mobile)} />
          <Field label="Email" value={text(student.emailId)} />
          <Field label="City" value={text(student.city)} />
          <Field label="State" value={text(student.state)} />
          <Field label="Pincode" value={text(student.pincode)} />
          <Field label="Address" value={address} wide />
        </Section>

        <Section icon="bx bxs-user-account" title="Parents & Guardian">
          <Field label="Father Name" value={text(student.fatherName)} />
          <Field label="Father Occupation" value={text(student.fatherOccupation)} />
          <Field
            label="Father Qualification"
            value={text(student.fatherQualification)}
          />
          <Field label="Father Income" value={money(student.fatherAnnualIncome)} />
          <Field label="Mother Name" value={text(student.motherName)} />
          <Field label="Mother Occupation" value={text(student.motherOccupation)} />
          <Field
            label="Mother Qualification"
            value={text(student.motherQualification)}
          />
          <Field label="Mother Income" value={money(student.motherAnnualIncome)} />
          <Field label="Guardian Name" value={text(student.guardianName)} />
          <Field
            label="Guardian Occupation"
            value={text(student.guardianOccupation)}
          />
          <Field
            label="Guardian Qualification"
            value={text(student.guardianQualification)}
          />
          <Field
            label="Guardian Income"
            value={money(student.guardianAnnualIncome)}
          />
          <Field
            label="Parent Mobile"
            value={joinText(
              [
                student.parentMobileNo1,
                student.parentMobileNo2,
                student.parentMobileNo3,
              ],
              ", "
            )}
          />
          <Field
            label="Parent Email"
            value={joinText([student.parentEmailId1, student.parentEmailId2], ", ")}
          />
        </Section>

        <section className="stv-card stv-card-docs">
          <header className="stv-card-head">
            <i className="bx bxs-folder"></i>
            <h3>Documents</h3>
          </header>
          <div className="stv-doc-list">
            {documents.map((doc) => (
              <DocumentRow
                key={doc.key}
                icon={doc.icon}
                title={doc.title}
                number={doc.number}
                url={doc.url}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
