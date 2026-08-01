import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getBloodGroup, getCity, getCommunity, getNationality,
  getReligion, getState, registerStaff, getStafflist, updateStaff,
} from "../../services/api";
import { getToken } from "../../services/auth";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./wizard.css";
import {
  validateEmail,
  validateMobile,
  sanitizeMobileInput,
  isMobileFieldName,
  isBlank,
} from "../../utils/validators";

const STEPS = [
  { label: "Personal",     icon: "bx bxs-user" },
  { label: "Professional", icon: "bx bxs-briefcase" },
  { label: "Contact",      icon: "bx bxs-phone" },
  { label: "Address",      icon: "bx bxs-map" },
  { label: "Bank & Docs",  icon: "bx bxs-bank" },
];

const DRAFT_KEY = "staff_reg_draft";
const REQUIRED_MSG = "This field is required.";
const GENDER_ID_MAP = { Male: 1, Female: 2 };
const GENDER_LABEL_MAP = { 1: "Male", 2: "Female", Male: "Male", Female: "Female" };

// Clear any previously saved registration draft so forms always start empty.
try {
  localStorage.removeItem(DRAFT_KEY);
} catch {}

const hasStaffPhoto = (form) =>
  form.photo instanceof File ||
  (!!String(form.photoUrl || "").trim() &&
    !String(form.photoUrl).toLowerCase().includes("noimage") &&
    !String(form.photoUrl).toLowerCase().includes("men2.jpg"));

const formatDate = (value) => {
  if (!value) return "";
  const str = String(value);
  return str.includes("T") ? str.split("T")[0] : str.slice(0, 10);
};

const mapStaffToForm = (staff) => ({
  employeeId: staff.staffId || staff.staffID || staff.employeeId || "",
  firstName: staff.firstName || "",
  lastName: staff.lastName || "",
  gender: GENDER_LABEL_MAP[staff.genderId] || staff.gender || "",
  dateOfBirth: formatDate(staff.dateOfBirth || staff.date_of_birth),
  bloodGroupId: staff.bloodGroupId || "",
  maritalStatus: staff.maritalStatus || "",
  photo: null,
  photoUrl: staff.photoUrl || staff.image || "",
  department: staff.department || "",
  designation: staff.designation || staff.position || "",
  dateOfJoining: formatDate(staff.dateOfJoining || staff.date_of_joining),
  qualification: staff.qualification || "",
  experience: staff.experience ?? "",
  employmentType: staff.employmentType || "Full-Time",
  email: staff.email || staff.emailID || "",
  mobile: staff.mobile || staff.contact_number || "",
  alternateMobile: staff.alternateMobile || "",
  emergencyContact: staff.emergencyContact || "",
  address1: staff.address1 || "",
  address2: staff.address2 || "",
  cityId: staff.cityId || "",
  stateId: staff.stateId || "",
  country: staff.country || "India",
  pincode: staff.pincode || "",
  nationalityId: staff.nationalityId || "",
  bankName: staff.bankName || "",
  accountNo: staff.accountNo || staff.account_no || "",
  ifscNo: staff.ifscNo || staff.ifsc_no || "",
  adharCardNo: staff.adharCardNo || "",
  panCard: staff.panCard || "",
  religionId: staff.religionId || "",
  communityId: staff.communityId || "",
});

const buildStaffPayload = (form, staffId) => ({
  staffId,
  firstName: form.firstName?.trim() || "",
  lastName: form.lastName?.trim() || "",
  email: form.email?.trim() || "",
  department: form.department?.trim() || "",
  designation: form.designation?.trim() || "",
  mobile: form.mobile?.trim() || "",
  alternateMobile: form.alternateMobile?.trim() || "",
  emergencyContact: form.emergencyContact?.trim() || "",
  address1: form.address1?.trim() || "",
  address2: form.address2?.trim() || "",
  country: form.country?.trim() || "India",
  pincode: form.pincode?.trim() || "",
  nationalityId: Number(form.nationalityId) || 1,
  stateId: Number(form.stateId) || 1,
  cityId: Number(form.cityId) || 1,
  dateOfJoining: form.dateOfJoining || "",
  dateOfBirth: form.dateOfBirth || "",
  genderId: GENDER_ID_MAP[form.gender] || Number(form.gender) || 1,
  qualification: form.qualification?.trim() || "",
  experience: Number(form.experience) || 0,
  employmentType: form.employmentType || "Full-Time",
  adharCardNo: form.adharCardNo?.trim() || "",
  panCard: form.panCard?.trim() || "",
  bankName: form.bankName?.trim() || "",
  accountNo: form.accountNo?.trim() || "",
  ifscNo: form.ifscNo?.trim() || "",
  maritalStatus: form.maritalStatus || "",
  religionId: Number(form.religionId) || 1,
  communityId: Number(form.communityId) || 1,
  bloodGroupId: Number(form.bloodGroupId) || 1,
});

const initForm = {
  employeeId: "", firstName: "", lastName: "", gender: "",
  dateOfBirth: "", bloodGroupId: "", maritalStatus: "", photo: null, photoUrl: "",
  department: "", designation: "", dateOfJoining: "", qualification: "",
  experience: "", employmentType: "Full-Time",
  email: "", mobile: "", alternateMobile: "", emergencyContact: "",
  address1: "", address2: "", cityId: "", stateId: "", country: "India", pincode: "", nationalityId: "",
  bankName: "", accountNo: "", ifscNo: "", adharCardNo: "", panCard: "",
  religionId: "", communityId: "",
  certDoc: null, idProof: null,
};

const Field = ({
  label, name, type = "text", value, onChange, error, options, required, placeholder,
  maxLength, inputMode, pattern, accept,
}) => (
  <div className="wz-field">
    <label className="wz-label">
      {label}{required && <span className="wz-req">*</span>}
    </label>
    {type === "select" ? (
      <select className={`wz-input${error ? " wz-error-border" : ""}`} name={name} value={value} onChange={onChange}>
        <option value="">Select {label}</option>
        {(options || []).map(o => <option key={o.id} value={o.id}>{o.value}</option>)}
      </select>
    ) : type === "file" ? (
      <input
        className={`wz-input wz-file${error ? " wz-error-border" : ""}`}
        type="file"
        name={name}
        accept={accept}
        onChange={onChange}
      />
    ) : (
      <input
        className={`wz-input${error ? " wz-error-border" : ""}`}
        type={type === "tel" ? "tel" : type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        inputMode={inputMode}
        pattern={pattern}
        max={type === "date" ? new Date().toISOString().split("T")[0] : undefined}
      />
    )}
    {error && <span className="wz-error">{error}</span>}
  </div>
);

export default function StaffWizard() {
  const navigate = useNavigate();
  const { id: routeId } = useParams();
  const isEdit = routeId && routeId !== "new";
  const token = getToken();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initForm);
  const [errors, setErrors] = useState({});
  const [dd, setDd] = useState({
    gender: [{ id: "Male", value: "Male" }, { id: "Female", value: "Female" }],
    maritalStatus: [{ id: "Single", value: "Single" }, { id: "Married", value: "Married" }, { id: "Other", value: "Other" }],
    employmentType: [{ id: "Full-Time", value: "Full-Time" }, { id: "Part-Time", value: "Part-Time" }, { id: "Contract", value: "Contract" }],
    nationalityId: [], religionId: [], communityId: [], bloodGroupId: [], stateId: [], cityId: [],
  });
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    const load = async (fn, id, key) => {
      try {
        const res = await fn(id, token);
        setDd(p => ({ ...p, [key]: res.map(v => ({ id: v.id, value: v.name })) }));
      } catch {}
    };
    const loadState = async () => {
      try {
        const res = await getState({ id: 0, nationId: form.nationalityId || 0 }, token);
        setDd(p => ({ ...p, stateId: res.map(v => ({ id: v.id, value: v.name })) }));
      } catch {}
    };
    const loadCity = async () => {
      try {
        const res = await getCity({ id: 0, stateId: form.stateId || 0 }, token);
        setDd(p => ({ ...p, cityId: res.map(v => ({ id: v.id, value: v.name })) }));
      } catch {}
    };
    load(getNationality, 0, "nationalityId");
    load(getReligion, 0, "religionId");
    load(getCommunity, 0, "communityId");
    load(getBloodGroup, 0, "bloodGroupId");
    loadState();
    loadCity();
  }, [form.nationalityId, form.stateId]);

  useEffect(() => {
    if (!isEdit || !token) return;
    let cancelled = false;
    const loadStaff = async () => {
      setLoading(true);
      try {
        const res = await getStafflist(routeId, token);
        const rows = Array.isArray(res?.data) ? res.data : [];
        const staff = rows[0];
        if (!staff) {
          toast.error("Staff not found.");
          return;
        }
        if (cancelled) return;
        setForm((p) => ({ ...p, ...mapStaffToForm(staff) }));
      } catch {
        if (!cancelled) toast.error("Failed to load staff details.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadStaff();
    return () => { cancelled = true; };
  }, [isEdit, routeId, token]);

  const handleChange = e => {
    const { name, value, files } = e.target;
    if (files) {
      setForm(p => ({ ...p, [name]: files[0] }));
      setErrors(p => ({ ...p, [name]: "" }));
      return;
    }
    const nextValue = isMobileFieldName(name) ? sanitizeMobileInput(value) : value;
    setForm(p => ({ ...p, [name]: nextValue }));
    if (isMobileFieldName(name) && nextValue.length === 10) {
      const err = validateMobile(nextValue, {
        label:
          name === "mobile"
            ? "Mobile"
            : name === "alternateMobile"
            ? "Alternate mobile"
            : "Emergency contact",
      });
      setErrors(p => ({ ...p, [name]: err }));
    } else {
      setErrors(p => ({ ...p, [name]: "" }));
    }
  };

  const validate = (s) => {
    const e = {};
    const req = (value) => (isBlank(value) ? REQUIRED_MSG : "");

    if (s === 0) {
      if (req(form.firstName)) e.firstName = REQUIRED_MSG;
      if (req(form.lastName)) e.lastName = REQUIRED_MSG;
      if (req(form.gender)) e.gender = REQUIRED_MSG;
      if (req(form.dateOfBirth)) e.dateOfBirth = REQUIRED_MSG;
      if (req(form.bloodGroupId)) e.bloodGroupId = REQUIRED_MSG;
      if (req(form.maritalStatus)) e.maritalStatus = REQUIRED_MSG;
      if (req(form.religionId)) e.religionId = REQUIRED_MSG;
      if (req(form.communityId)) e.communityId = REQUIRED_MSG;
      if (!hasStaffPhoto(form)) e.photo = REQUIRED_MSG;
    }
    if (s === 1) {
      if (req(form.department)) e.department = REQUIRED_MSG;
      if (req(form.designation)) e.designation = REQUIRED_MSG;
      if (req(form.dateOfJoining)) e.dateOfJoining = REQUIRED_MSG;
      if (req(form.qualification)) e.qualification = REQUIRED_MSG;
      if (req(form.experience)) e.experience = REQUIRED_MSG;
      if (req(form.employmentType)) e.employmentType = REQUIRED_MSG;
    }
    if (s === 2) {
      if (isBlank(form.email)) e.email = REQUIRED_MSG;
      else {
        const emailErr = validateEmail(form.email, { required: true, label: "Email" });
        if (emailErr) e.email = emailErr.endsWith(".") ? emailErr : `${emailErr}.`;
      }
      if (isBlank(form.mobile)) e.mobile = REQUIRED_MSG;
      else {
        const mobileErr = validateMobile(form.mobile, { required: true, label: "Mobile" });
        if (mobileErr) e.mobile = mobileErr.endsWith(".") ? mobileErr : `${mobileErr}.`;
      }
      if (isBlank(form.alternateMobile)) e.alternateMobile = REQUIRED_MSG;
      else {
        const altErr = validateMobile(form.alternateMobile, {
          required: true,
          label: "Alternate mobile",
        });
        if (altErr) e.alternateMobile = altErr.endsWith(".") ? altErr : `${altErr}.`;
      }
      if (isBlank(form.emergencyContact)) e.emergencyContact = REQUIRED_MSG;
      else {
        const emErr = validateMobile(form.emergencyContact, {
          required: true,
          label: "Emergency contact",
        });
        if (emErr) e.emergencyContact = emErr.endsWith(".") ? emErr : `${emErr}.`;
      }
    }
    if (s === 3) {
      if (req(form.address1)) e.address1 = REQUIRED_MSG;
      if (req(form.address2)) e.address2 = REQUIRED_MSG;
      if (req(form.nationalityId)) e.nationalityId = REQUIRED_MSG;
      if (req(form.stateId)) e.stateId = REQUIRED_MSG;
      if (req(form.cityId)) e.cityId = REQUIRED_MSG;
      if (req(form.country)) e.country = REQUIRED_MSG;
      if (isBlank(form.pincode)) e.pincode = REQUIRED_MSG;
      else if (!/^\d{6}$/.test(String(form.pincode).trim())) {
        e.pincode = "Pincode must be 6 digits.";
      }
    }
    if (s === 4) {
      if (req(form.bankName)) e.bankName = REQUIRED_MSG;
      if (req(form.accountNo)) e.accountNo = REQUIRED_MSG;
      if (req(form.ifscNo)) e.ifscNo = REQUIRED_MSG;
      if (req(form.adharCardNo)) e.adharCardNo = REQUIRED_MSG;
      if (req(form.panCard)) e.panCard = REQUIRED_MSG;
      if (!(form.certDoc instanceof File) && !isEdit) e.certDoc = REQUIRED_MSG;
      if (!(form.idProof instanceof File) && !isEdit) e.idProof = REQUIRED_MSG;
    }
    return e;
  };

  const next = () => {
    const e = validate(step);
    if (Object.keys(e).length) {
      setErrors(e);
      toast.error(Object.values(e)[0]);
      return;
    }
    setStep((s) => s + 1);
  };

  const prev = () => setStep((s) => s - 1);

  const handleSubmit = async () => {
    const stepErrors = [
      validate(0),
      validate(1),
      validate(2),
      validate(3),
      validate(4),
    ];
    const allErrors = Object.assign({}, ...stepErrors);
    if (Object.keys(allErrors).length) {
      setErrors(allErrors);
      const firstStep = stepErrors.findIndex((err) => Object.keys(err).length);
      if (firstStep >= 0) setStep(firstStep);
      toast.error(Object.values(allErrors)[0] || "This field is required.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = buildStaffPayload(form, isEdit ? routeId : undefined);
      const res = isEdit
        ? await updateStaff(payload, token)
        : await registerStaff(payload, token);
      if (res.status?.toLowerCase() === "success") {
        toast.success(res.message || (isEdit ? "Staff updated!" : "Staff registered successfully!"), {
          onClose: () => navigate("/admin/staff", { state: "Staff List" }),
        });
      } else {
        toast.error(res.message || "Operation failed.");
      }
    } catch {
      toast.error("An error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const pct = Math.round((step / (STEPS.length - 1)) * 100);
  const ddVal = (key, val) => (dd[key] || []).find(o => String(o.id) === String(val))?.value || val;

  if (loading) {
    return (
      <div className="wz-wrap" style={{ padding: 48, textAlign: "center" }}>
        <i className="bx bx-loader-alt bx-spin" style={{ fontSize: 36, color: "#2D3A8C" }}></i>
        <p style={{ marginTop: 12, color: "#64748b" }}>Loading staff details…</p>
      </div>
    );
  }

  return (
    <div className="wz-wrap">
      {/* Header */}
      {/* <div className="wz-header">
        <div>
          <h2 className="wz-title">Staff Registration</h2>
          <p className="wz-subtitle">Complete all steps to register a new staff member</p>
        </div>
        <button className="wz-draft-btn" onClick={saveDraft}>
          <i className="bx bx-save"></i> Save Draft
        </button>
      </div> */}

      {/* Stepper */}
      <div className="wz-stepper">
        {STEPS.map((s, i) => (
          <React.Fragment key={i}>
            <div className={`wz-step${i === step ? " active" : ""}${i < step ? " done" : ""}`}>
              <div className="wz-step-circle">
                {i < step ? <i className="bx bx-check"></i> : <i className={s.icon} style={{fontSize: "18px"}}></i>}
              </div>
              <span className="wz-step-label">{s.label}</span>
            </div>
            {i < STEPS.length - 1 && <div className={`wz-step-line${i < step ? " done" : ""}`}></div>}
          </React.Fragment>
        ))}
      </div>

      {/* Progress bar */}
      <div className="wz-progress-wrap">
        <div className="wz-progress-bar">
          <div className="wz-progress-fill" style={{ width: `${pct}%` }}></div>
        </div>
        <span className="wz-progress-pct">Step {step + 1} of {STEPS.length} - {pct}% complete</span>
      </div>

      {/* Card */}
      <div className="wz-card">
        <div className="wz-card-title">
          <i className={STEPS[step].icon}></i>
          <span>{STEPS[step].label}</span>
        </div>

        {/* Step 0: Personal */}
        {step === 0 && (
          <div className="wz-grid">
            <Field label="First Name" name="firstName" value={form.firstName} onChange={handleChange} error={errors.firstName} required />
            <Field label="Last Name" name="lastName" value={form.lastName} onChange={handleChange} error={errors.lastName} required />
            <Field label="Gender" name="gender" type="select" value={form.gender} onChange={handleChange} error={errors.gender} options={dd.gender} required />
            <Field label="Date of Birth" name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={handleChange} error={errors.dateOfBirth} required />
            <Field label="Blood Group" name="bloodGroupId" type="select" value={form.bloodGroupId} onChange={handleChange} error={errors.bloodGroupId} options={dd.bloodGroupId} required />
            <Field label="Marital Status" name="maritalStatus" type="select" value={form.maritalStatus} onChange={handleChange} error={errors.maritalStatus} options={dd.maritalStatus} required />
            <Field label="Religion" name="religionId" type="select" value={form.religionId} onChange={handleChange} error={errors.religionId} options={dd.religionId} required />
            <Field label="Community" name="communityId" type="select" value={form.communityId} onChange={handleChange} error={errors.communityId} options={dd.communityId} required />
            <Field
              label="Staff Photo"
              name="photo"
              type="file"
              onChange={handleChange}
              error={errors.photo}
              accept="image/*"
              required
            />
            {hasStaffPhoto(form) && !(form.photo instanceof File) && form.photoUrl ? (
              <p className="wz-hint" style={{ gridColumn: "1 / -1", margin: 0, color: "#64748b", fontSize: 12 }}>
                Existing photo on file. Upload a new file to replace it.
              </p>
            ) : null}
          </div>
        )}

        {/* Step 1: Professional */}
        {step === 1 && (
          <div className="wz-grid">
            <Field label="Department" name="department" value={form.department} onChange={handleChange} error={errors.department} required />
            <Field label="Designation / Position" name="designation" value={form.designation} onChange={handleChange} error={errors.designation} required />
            <Field label="Date of Joining" name="dateOfJoining" type="date" value={form.dateOfJoining} onChange={handleChange} error={errors.dateOfJoining} required />
            <Field label="Qualification" name="qualification" value={form.qualification} onChange={handleChange} error={errors.qualification} required />
            <Field label="Experience (Years)" name="experience" type="number" value={form.experience} onChange={handleChange} error={errors.experience} required />
            <Field label="Employment Type" name="employmentType" type="select" value={form.employmentType} onChange={handleChange} error={errors.employmentType} options={dd.employmentType} required />
          </div>
        )}

        {/* Step 2: Contact */}
        {step === 2 && (
          <div className="wz-grid">
            <Field label="Email Address" name="email" type="email" value={form.email} onChange={handleChange} error={errors.email} required />
            <Field
              label="Mobile Number"
              name="mobile"
              type="tel"
              value={form.mobile}
              onChange={handleChange}
              error={errors.mobile}
              required
              maxLength={10}
              inputMode="numeric"
              pattern="[6-9][0-9]{9}"
              placeholder="10-digit mobile (starts with 6–9)"
            />
            <Field
              label="Alternate Mobile"
              name="alternateMobile"
              type="tel"
              value={form.alternateMobile}
              onChange={handleChange}
              error={errors.alternateMobile}
              required
              maxLength={10}
              inputMode="numeric"
              pattern="[6-9][0-9]{9}"
              placeholder="10-digit mobile"
            />
            <Field
              label="Emergency Contact"
              name="emergencyContact"
              type="tel"
              value={form.emergencyContact}
              onChange={handleChange}
              error={errors.emergencyContact}
              required
              maxLength={10}
              inputMode="numeric"
              pattern="[6-9][0-9]{9}"
              placeholder="10-digit mobile"
            />
          </div>
        )}

        {/* Step 3: Address */}
        {step === 3 && (
          <div className="wz-grid">
            <Field label="Address Line 1" name="address1" value={form.address1} onChange={handleChange} error={errors.address1} required />
            <Field label="Address Line 2" name="address2" value={form.address2} onChange={handleChange} error={errors.address2} required />
            <Field label="Nationality" name="nationalityId" type="select" value={form.nationalityId} onChange={handleChange} error={errors.nationalityId} options={dd.nationalityId} required />
            <Field label="State" name="stateId" type="select" value={form.stateId} onChange={handleChange} error={errors.stateId} options={dd.stateId} required />
            <Field label="City" name="cityId" type="select" value={form.cityId} onChange={handleChange} error={errors.cityId} options={dd.cityId} required />
            <Field label="Country" name="country" value={form.country} onChange={handleChange} error={errors.country} required />
            <Field label="Pincode" name="pincode" value={form.pincode} onChange={handleChange} error={errors.pincode} required />
          </div>
        )}

        {/* Step 4: Bank & Docs + Review */}
        {step === 4 && (
          <>
            <p className="wz-section-hdr"><i className="bx bxs-bank"></i> Bank Details</p>
            <div className="wz-grid">
              <Field label="Bank Name" name="bankName" value={form.bankName} onChange={handleChange} error={errors.bankName} required />
              <Field label="Account Number" name="accountNo" value={form.accountNo} onChange={handleChange} error={errors.accountNo} required />
              <Field label="IFSC Code" name="ifscNo" value={form.ifscNo} onChange={handleChange} error={errors.ifscNo} required />
            </div>
            <p className="wz-section-hdr"><i className="bx bxs-id-card"></i> Identity Documents</p>
            <div className="wz-grid">
              <Field label="Aadhaar Number" name="adharCardNo" value={form.adharCardNo} onChange={handleChange} error={errors.adharCardNo} required />
              <Field label="PAN Number" name="panCard" value={form.panCard} onChange={handleChange} error={errors.panCard} required />
              <Field label="Upload Certificate" name="certDoc" type="file" onChange={handleChange} error={errors.certDoc} required />
              <Field label="Upload ID Proof" name="idProof" type="file" onChange={handleChange} error={errors.idProof} required />
            </div>

            {/* Review summary */}
            <p className="wz-section-hdr" style={{ marginTop: 24 }}><i className="bx bxs-spreadsheet"></i> Review Summary</p>
            <div className="wz-review">
              {[
                { title: "Personal Information", editStep: 0, fields: [
                  ["First Name", form.firstName], ["Last Name", form.lastName],
                  ["Gender", form.gender], ["Date of Birth", form.dateOfBirth],
                  ["Marital Status", form.maritalStatus],
                ]},
                { title: "Professional Information", editStep: 1, fields: [
                  ["Department", form.department], ["Designation", form.designation],
                  ["Date of Joining", form.dateOfJoining], ["Qualification", form.qualification],
                  ["Experience", form.experience], ["Employment Type", form.employmentType],
                ]},
                { title: "Contact Information", editStep: 2, fields: [
                  ["Email", form.email], ["Mobile", form.mobile],
                  ["Alternate Mobile", form.alternateMobile],
                ]},
                { title: "Address", editStep: 3, fields: [
                  ["Address", form.address1], ["State", ddVal("stateId", form.stateId)],
                  ["City", ddVal("cityId", form.cityId)], ["Pincode", form.pincode],
                ]},
              ].map((sec, si) => (
                <div className="wz-review-card" key={si}>
                  <div className="wz-review-card-hdr">
                    <span>{sec.title}</span>
                    <button className="wz-edit-btn" onClick={() => setStep(sec.editStep)}>
                      <i className="bx bx-edit-alt"></i> Edit
                    </button>
                  </div>
                  <div className="wz-review-grid">
                    {sec.fields.filter(([, v]) => v).map(([k, v]) => (
                      <div className="wz-review-field" key={k}>
                        <span className="wz-review-key">{k}</span>
                        <span className="wz-review-val">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Navigation */}
      <div className="wz-nav">
        <button className="wz-btn wz-btn-ghost" onClick={() => navigate("/admin/staff", { state: "Staff List" })}>
          <i className="bx bx-x"></i> Cancel
        </button>
        <div className="wz-nav-right">
          {step > 0 && (
            <button className="wz-btn wz-btn-outline" onClick={prev}>
              <i className="bx bx-chevron-left"></i> Previous
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button className="wz-btn wz-btn-primary" onClick={next}>
              Next <i className="bx bx-chevron-right"></i>
            </button>
          ) : (
            <button className="wz-btn wz-btn-success" onClick={handleSubmit} disabled={submitting}>
              {submitting ? <><i className="bx bx-loader-alt bx-spin"></i> Submitting…</> : <><i className="bx bx-check"></i> {isEdit ? "Update Staff" : "Submit Registration"}</>}
            </button>
          )}
        </div>
      </div>

      <ToastContainer position="bottom-right" autoClose={2500} style={{ zIndex: 99999, fontSize: 14 }} />
    </div>
  );
}
