import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getBloodGroup, getCity, getClass, getCommunity,
  getNationality, getReligion, getSection, getState, studentStaff,
  getStudentlist, updateStudent, getsectionList, createStudentImage,
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
  requiredError,
  isBlank,
} from "../../utils/validators";

const STEPS = [
  { label: "Basic Info",    icon: "bx bxs-user" },
  { label: "Academic",      icon: "bx bxs-book" },
  { label: "Parent/Guardian", icon: "bx bxs-home-heart" },
  { label: "Address",       icon: "bx bxs-map" },
  { label: "Review",        icon: "bx bxs-check-shield" },
];

const DRAFT_KEY = "student_reg_draft";
const NO_IMAGE_HINT = "noImage";

// Clear any previously saved registration draft so forms always start empty.
try {
  localStorage.removeItem(DRAFT_KEY);
} catch {}

const initForm = {
  firstName: "",
  lastName: "",
  gender: "",
  dateOfBirth: "",
  bloodGroupId: "",
  nationalityId: "",
  religionId: "",
  communityId: "",
  photo: null,
  photoUrl: "",
  academicYear: "",
  classId: "",
  sectionId: "",
  rollNo: "",
  admissionDate: "",
  previousSchool: "",
  previousReason: "",
  fatherName: "",
  fatherMobile: "",
  fatherOccupation: "",
  motherName: "",
  motherMobile: "",
  motherOccupation: "",
  guardianName: "",
  guardianMobile: "",
  guardianRelation: "",
  address1: "",
  address2: "",
  cityId: "",
  stateId: "",
  country: "India",
  pincode: "",
  aadhaarDoc: null,
  birthCert: null,
  tc: null,
  otherDoc: null,
};

const idStr = (value) =>
  value === null || value === undefined || value === "" ? "" : String(value);

const Field = ({
  label, name, type = "text", value, onChange, error, options, required, placeholder,
  maxLength, inputMode, pattern, previewUrl, accept,
}) => (
  <div className="wz-field">
    <label className="wz-label">
      {label}{required && <span className="wz-req">*</span>}
    </label>
    {type === "select" ? (
      <select
        className={`wz-input${error ? " wz-error-border" : ""}`}
        name={name}
        value={idStr(value)}
        onChange={onChange}
      >
        <option value="">Select {label}</option>
        {(options || []).map((o) => (
          <option key={o.id} value={idStr(o.id)}>{o.value}</option>
        ))}
      </select>
    ) : type === "file" ? (
      <div className="wz-file-wrap">
        {previewUrl ? (
          <div className="wz-photo-preview">
            <img src={previewUrl} alt={label} />
          </div>
        ) : null}
        <input
          className={`wz-input wz-file${error ? " wz-error-border" : ""}`}
          type="file"
          name={name}
          accept={accept || "image/*"}
          onChange={onChange}
        />
      </div>
    ) : type === "textarea" ? (
      <textarea className={`wz-input wz-textarea${error ? " wz-error-border" : ""}`} name={name} value={value} onChange={onChange} placeholder={placeholder} rows={3} />
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

const GENDER_ID_MAP = { Male: 1, Female: 2 };
const GENDER_LABEL_MAP = { 1: "Male", 2: "Female", Male: "Male", Female: "Female" };

const formatDate = (value) => {
  if (!value) return "";
  const str = String(value);
  return str.includes("T") ? str.split("T")[0] : str.slice(0, 10);
};

const hasExistingPhoto = (url) => {
  const value = String(url || "").trim().toLowerCase();
  return (
    !!value &&
    !value.includes(NO_IMAGE_HINT.toLowerCase()) &&
    !value.includes("men2.jpg")
  );
};

const resolveStudentPhotoUrl = (url) => {
  if (!hasExistingPhoto(url)) return "";
  const raw = String(url).trim().replace(/\\/g, "/");
  const adminBase = String(
    process.env.REACT_APP_ADMIN_URL || ""
  ).replace(/\/$/, "");
  const uploadsIdx = raw.toLowerCase().indexOf("/uploads/");
  if (adminBase && uploadsIdx >= 0) {
    return `${adminBase}${raw.slice(uploadsIdx)}`;
  }
  if (adminBase && raw.startsWith("uploads/")) {
    return `${adminBase}/${raw}`;
  }
  return raw;
};

const mapStudentToForm = (student) => ({
  firstName: student.firstName || "",
  lastName: student.lastName || "",
  gender: GENDER_LABEL_MAP[student.genderId] || student.gender || "",
  dateOfBirth: formatDate(student.dateOfBirth),
  bloodGroupId: idStr(student.bloodGroupId),
  nationalityId: idStr(student.nationalityId),
  religionId: idStr(student.religionId),
  communityId: idStr(student.communityId),
  photo: null,
  photoUrl: resolveStudentPhotoUrl(student.photoUrl || student.image),
  academicYear: student.academicYear || student.academicyear || "",
  classId: idStr(student.classId),
  sectionId: idStr(student.sectionId),
  rollNo: student.registrationNo || student.rollNo || "",
  admissionDate: formatDate(student.dateOfJoining || student.admissionDate),
  previousSchool: student.previousSchool || student.schoolName || "",
  previousReason:
    student.reasonForReleaving ||
    student.studentReleavingReason ||
    student.previousReason ||
    "",
  fatherName: student.fatherName || "",
  fatherMobile: student.parentMobileNo1 || student.fatherMobileNo || student.mobile || "",
  fatherOccupation: student.fatherOccupation || "",
  motherName: student.motherName || "",
  motherMobile: student.parentMobileNo2 || student.motherMobileNo || "",
  motherOccupation: student.motherOccupation || "",
  guardianName: student.guardianName || "",
  guardianMobile:
    student.parentMobileNo3 ||
    student.parentMobileNo4 ||
    student.guardianMobileno ||
    student.guardianMobile ||
    "",
  guardianRelation:
    student.guardianRelation ||
    student.relation ||
    student.guardianrelation ||
    "",
  address1: student.address1 || student.address || "",
  address2: student.address2 || "",
  cityId: idStr(student.cityId),
  stateId: idStr(student.stateId),
  country: student.country || "India",
  pincode: student.pincode || "",
});

const buildStudentUpdatePayload = (form, admissionNo) => ({
  basicInfo: {
    admissionNo,
    firstName: form.firstName?.trim() || "",
    lastName: form.lastName?.trim() || "",
    genderId: GENDER_ID_MAP[form.gender] || Number(form.gender) || 1,
    dateOfBirth: form.dateOfBirth || "",
    nationalityId: Number(form.nationalityId) || 1,
    stateId: Number(form.stateId) || 1,
    cityId: Number(form.cityId) || 1,
    address: form.address1?.trim() || "",
    pincode: form.pincode?.trim() || "",
    stdMobileNo: form.fatherMobile?.trim() || form.guardianMobile?.trim() || "",
    stdEmail: "",
    religionId: Number(form.religionId) || 1,
    communityId: Number(form.communityId) || 1,
    bloodGroupId: Number(form.bloodGroupId) || 1,
    adharNo: "",
    classId: Number(form.classId) || 0,
    sectionId: Number(form.sectionId) || 0,
    dateOfJoining: form.admissionDate || "",
    emisNo: "",
    rollNo: form.rollNo || "",
    contactType: "parent",
    fatherName: form.fatherName?.trim() || "",
    fatherQualification: "",
    fatherOccupation: form.fatherOccupation?.trim() || "",
    fatherAnnualIncome: "",
    fatherMobileNo: form.fatherMobile?.trim() || "",
    fatherEmail: "",
    motherName: form.motherName?.trim() || "",
    motherQualification: "",
    motherOccupation: form.motherOccupation?.trim() || "",
    motherAnnualIncome: "",
    motherMobileNo: form.motherMobile?.trim() || "",
    motherEmail: "",
    guardianName: form.guardianName?.trim() || "",
    guardianQualification: "",
    guardianOccupation: "",
    guardianAnnualincome: "",
    guardianMobileno: form.guardianMobile?.trim() || "",
    guardianEmail: "",
  },
  otherDetails: {
    isSiblings: "no",
    siblingsId1: "",
    siblingsId2: "",
    siblingsId3: "",
    isParent: "no",
    parentId1: "",
    parentId2: "",
    isPreviousSchool: form.previousSchool ? "yes" : "no",
    schoolName: form.previousSchool || "",
    reasonForReleaving: form.previousReason || "",
  },
});

const buildStudentStaffPayload = (form) => ({
  initial: "",
  firstName: form.firstName?.trim() || "",
  middleName: "",
  lastName: form.lastName?.trim() || "",
  genderId: GENDER_ID_MAP[form.gender] || Number(form.gender) || 1,
  dateOfBirth: form.dateOfBirth || "",
  nationalityId: Number(form.nationalityId) || 1,
  stateId: Number(form.stateId) || 1,
  cityId: Number(form.cityId) || 1,
  address1: form.address1?.trim() || "",
  address2: form.address2?.trim() || "",
  pincode: form.pincode?.trim() || "",
  studentMobile: form.fatherMobile?.trim() || form.guardianMobile?.trim() || "",
  studentEmail: "",
  religionId: Number(form.religionId) || 1,
  communityId: Number(form.communityId) || 1,
  bloodGroupId: Number(form.bloodGroupId) || 1,
  aadhaarNo: "",
  classId: Number(form.classId),
  sectionId: Number(form.sectionId),
  admissionDate: form.admissionDate || "",
  dateOfJoining: form.admissionDate || "",
  fatherName: form.fatherName?.trim() || "",
  fatherQualification: "",
  fatherOccupation: form.fatherOccupation?.trim() || "",
  fatherAnnualIncome: 0,
  fatherMobile: form.fatherMobile?.trim() || "",
  fatherEmail: "",
  motherName: form.motherName?.trim() || "",
  motherQualification: "",
  motherOccupation: form.motherOccupation?.trim() || "",
  motherAnnualIncome: 0,
  motherMobile: form.motherMobile?.trim() || "",
  motherEmail: "",
  guardianName: form.guardianName?.trim() || "",
  guardianQualification: "",
  guardianOccupation: "",
  guardianMobile: form.guardianMobile?.trim() || "",
  caretakerName: "",
  caretakerOccupation: "",
  caretakerQualification: "",
});

export default function StudentWizard() {
  const navigate = useNavigate();
  const { id: routeId } = useParams();
  const isEdit = routeId && routeId !== "new";
  const token = getToken();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initForm);
  const [errors, setErrors] = useState({});
  const [dd, setDd] = useState({ genderId: [{ id: "Male", value: "Male" }, { id: "Female", value: "Female" }], nationalityId: [], religionId: [], communityId: [], bloodGroupId: [], classId: [], sectionId: [], stateId: [], cityId: [] });
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [editStep, setEditStep] = useState(null);

  const photoPreviewUrl = useMemo(() => {
    if (form.photo instanceof File) {
      return URL.createObjectURL(form.photo);
    }
    return hasExistingPhoto(form.photoUrl) ? form.photoUrl : "";
  }, [form.photo, form.photoUrl]);

  useEffect(() => {
    if (!(form.photo instanceof File)) return undefined;
    return () => {
      if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl);
    };
  }, [form.photo, photoPreviewUrl]);

  useEffect(() => {
    const load = async (fn, id, key, map) => {
      try {
        const res = await fn(id, token);
        const data = (map ? map(res) : res).map((v) => ({
          id: idStr(v.id),
          value: v.name || v.value,
        }));
        setDd(p => ({ ...p, [key]: data }));
      } catch {}
    };
    load(getNationality, 0, "nationalityId");
    load(getReligion, 0, "religionId");
    load(getCommunity, 0, "communityId");
    load(getBloodGroup, 0, "bloodGroupId");
    load(getClass, 0, "classId");
    load(getSection, 0, "sectionId");
    load(r => getState({ id: 0, nationId: form.nationalityId || 0 }, r), token, "stateId", v => v);
    load(r => getCity({ id: 0, stateId: form.stateId || 0 }, r), token, "cityId", v => v);
  }, [form.nationalityId, form.stateId, token]);

  useEffect(() => {
    if (!form.classId) return;
    const loadSections = async () => {
      try {
        const res = await getsectionList({ id: 0, classId: form.classId }, token);
        const sections = (res?.data || []).map((v) => ({
          id: idStr(v.id),
          value: v.name,
        }));
        setDd((p) => ({ ...p, sectionId: sections }));
      } catch {}
    };
    loadSections();
  }, [form.classId, token]);

  useEffect(() => {
    if (!isEdit) return;
    let cancelled = false;
    const loadStudent = async () => {
      setLoading(true);
      try {
        const res = await getStudentlist(
          { userName: routeId, classId: 0, sectionId: 0 },
          token
        );
        const student = res?.data?.[0];
        if (!student) {
          toast.error("Student not found.");
          return;
        }
        if (cancelled) return;
        setForm((prev) => ({ ...prev, ...mapStudentToForm(student) }));
      } catch {
        if (!cancelled) toast.error("Failed to load student details.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadStudent();
    return () => { cancelled = true; };
  }, [isEdit, routeId, token]);

  const handleChange = e => {
    const { name, value, files } = e.target;
    if (files) {
      const file = files[0] || null;
      setForm((p) => ({
        ...p,
        [name]: file,
        ...(name === "photo" && file ? { photoUrl: p.photoUrl } : {}),
      }));
      setErrors((p) => ({ ...p, [name]: "" }));
      return;
    }
    const nextValue = isMobileFieldName(name) ? sanitizeMobileInput(value) : value;
    setForm(p => ({ ...p, [name]: nextValue }));
    if (isMobileFieldName(name) && nextValue.length === 10) {
      const labels = {
        fatherMobile: "Father Mobile",
        motherMobile: "Mother Mobile",
        guardianMobile: "Guardian Mobile",
        studentMobile: "Student Mobile",
      };
      const err = validateMobile(nextValue, {
        required: name !== "guardianMobile",
        label: labels[name] || "Mobile",
      });
      setErrors(p => ({ ...p, [name]: err }));
    } else {
      setErrors(p => ({ ...p, [name]: "" }));
    }
  };

  const validate = (s) => {
    const e = {};
    if (s === 0) {
      if (isBlank(form.firstName)) e.firstName = requiredError("First Name");
      if (isBlank(form.lastName)) e.lastName = requiredError("Last Name");
      if (isBlank(form.gender)) e.gender = requiredError("Gender");
      if (isBlank(form.dateOfBirth)) e.dateOfBirth = requiredError("Date of Birth");
      if (isBlank(form.bloodGroupId)) e.bloodGroupId = requiredError("Blood Group");
      if (isBlank(form.nationalityId)) e.nationalityId = requiredError("Nationality");
      if (isBlank(form.religionId)) e.religionId = requiredError("Religion");
      if (isBlank(form.communityId)) e.communityId = requiredError("Community");
      if (!(form.photo instanceof File) && !hasExistingPhoto(form.photoUrl)) {
        e.photo = requiredError("Student Photo");
      }
    }
    if (s === 1) {
      if (isBlank(form.academicYear)) e.academicYear = requiredError("Academic Year");
      if (isBlank(form.classId)) e.classId = requiredError("Class");
      if (isBlank(form.sectionId)) e.sectionId = requiredError("Section");
      if (isBlank(form.rollNo)) e.rollNo = requiredError("Roll Number");
      if (isBlank(form.admissionDate)) e.admissionDate = requiredError("Admission Date");
      // Reason for Leaving is optional
    }
    if (s === 2) {
      if (isBlank(form.fatherName)) e.fatherName = requiredError("Father Name");
      const fatherMobileErr = validateMobile(form.fatherMobile, {
        required: true,
        label: "Father Mobile",
      });
      if (fatherMobileErr) {
        e.fatherMobile = fatherMobileErr.endsWith(".")
          ? fatherMobileErr
          : `${fatherMobileErr}.`;
      }
      if (isBlank(form.fatherOccupation)) {
        e.fatherOccupation = requiredError("Father Occupation");
      }
      if (isBlank(form.motherName)) e.motherName = requiredError("Mother Name");
      const motherMobileErr = validateMobile(form.motherMobile, {
        required: true,
        label: "Mother Mobile",
      });
      if (motherMobileErr) {
        e.motherMobile = motherMobileErr.endsWith(".")
          ? motherMobileErr
          : `${motherMobileErr}.`;
      }
      if (isBlank(form.motherOccupation)) {
        e.motherOccupation = requiredError("Mother Occupation");
      }
      // Guardian Details are optional — validate format only when provided
      if (!isBlank(form.guardianMobile)) {
        const guardianMobileErr = validateMobile(form.guardianMobile, {
          required: false,
          label: "Guardian Mobile",
        });
        if (guardianMobileErr) {
          e.guardianMobile = guardianMobileErr.endsWith(".")
            ? guardianMobileErr
            : `${guardianMobileErr}.`;
        }
      }
      if (form.fatherEmail?.trim()) {
        const err = validateEmail(form.fatherEmail, { label: "Father Email" });
        if (err) e.fatherEmail = err.endsWith(".") ? err : `${err}.`;
      }
      if (form.motherEmail?.trim()) {
        const err = validateEmail(form.motherEmail, { label: "Mother Email" });
        if (err) e.motherEmail = err.endsWith(".") ? err : `${err}.`;
      }
      if (form.stdEmail?.trim()) {
        const err = validateEmail(form.stdEmail, { label: "Student Email" });
        if (err) e.stdEmail = err.endsWith(".") ? err : `${err}.`;
      }
      if (form.studentMobile?.trim()) {
        const err = validateMobile(form.studentMobile, { label: "Student Mobile" });
        if (err) e.studentMobile = err.endsWith(".") ? err : `${err}.`;
      }
    }
    if (s === 3) {
      if (isBlank(form.address1)) e.address1 = requiredError("Address Line 1");
      if (isBlank(form.address2)) e.address2 = requiredError("Address Line 2");
      if (isBlank(form.stateId)) e.stateId = requiredError("State");
      if (isBlank(form.cityId)) e.cityId = requiredError("City");
      if (isBlank(form.country)) e.country = requiredError("Country");
      if (isBlank(form.pincode)) e.pincode = requiredError("Pincode");
      else if (!/^\d{6}$/.test(String(form.pincode).trim())) {
        e.pincode = "Pincode must be 6 digits.";
      }
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
    setStep(s => s + 1);
    setEditStep(null);
  };

  const [showDiscardModal, setShowDiscardModal] = useState(false);

  const prev = () => setStep(s => s - 1);

  const goEdit = (s) => { setEditStep(s); setStep(s); };

  const hasDraft = () => {
    const skip = new Set(["country"]);
    return Object.entries(form).some(([k, v]) => !skip.has(k) && v !== "" && v !== null);
  };

  const handleCancel = () => {
    if (!isEdit && hasDraft()) {
      setShowDiscardModal(true);
      return;
    }
    navigate("/admin/students", { state: "Student List" });
  };

  const handleDiscardConfirm = () => {
    navigate("/admin/students", { state: "Student List" });
  };

  const getRegistrationErrorMessage = (res) => {
    if (!res) return "Registration failed.";
    const sqlMsg = res?.data?.sqlMessage || res?.data?.message;
    if (res.message) return res.message;
    if (typeof res.data === "string") return res.data;
    if (sqlMsg) return sqlMsg;
    return "Registration failed.";
  };

  const uploadStudentPhotoIfNeeded = async (admissionNo) => {
    if (!(form.photo instanceof File) || !admissionNo) return;
    try {
      await createStudentImage(
        { id: admissionNo, photoUrl: form.photo },
        token
      );
    } catch (err) {
      toast.warning(
        err?.response?.data?.message ||
          "Student saved, but photo upload failed. You can upload it from Student Documents."
      );
    }
  };

  const handleSubmit = async () => {
    const stepErrors = [validate(0), validate(1), validate(2), validate(3)];
    const allErrors = Object.assign({}, ...stepErrors);
    if (Object.keys(allErrors).length) {
      setErrors(allErrors);
      const firstStep = stepErrors.findIndex((err) => Object.keys(err).length);
      if (firstStep >= 0) setStep(firstStep);
      toast.error(
        Object.values(allErrors)[0] ||
          "Please complete all required fields before submitting."
      );
      return;
    }

    setSubmitting(true);
    try {
      if (isEdit) {
        const res = await updateStudent(buildStudentUpdatePayload(form, routeId), token);
        if (res.status?.toLowerCase() === "success") {
          await uploadStudentPhotoIfNeeded(routeId);
          toast.success(res.message || "Student updated successfully!", {
            onClose: () => navigate("/admin/students"),
          });
          navigate("/admin/students");
        } else {
          toast.error(getRegistrationErrorMessage(res));
        }
        return;
      }

      const payload = buildStudentStaffPayload(form);
      const res = await studentStaff(payload, token);
      if (res.status?.toLowerCase() === "success") {
        const admissionNo = res.admissionNo || res.data?.admissionNo || "";
        await uploadStudentPhotoIfNeeded(admissionNo);
        const adm = admissionNo ? ` Admission No: ${admissionNo}.` : "";
        toast.success((res.message || "Student registered successfully!") + adm, {
          onClose: () => navigate("/admin/students"),
        });
        navigate("/admin/students");
      } else {
        toast.error(getRegistrationErrorMessage(res));
      }
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          getRegistrationErrorMessage(err?.response?.data) ||
          "An error occurred. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const pct = Math.round((step / (STEPS.length - 1)) * 100);

  if (loading) {
    return (
      <div className="wz-wrap" style={{ padding: 48, textAlign: "center" }}>
        <i className="bx bx-loader-alt bx-spin" style={{ fontSize: 36, color: "#2D3A8C" }}></i>
        <p style={{ marginTop: 12, color: "#64748b" }}>Loading student details…</p>
      </div>
    );
  }

  return (
    <div className="wz-wrap">
      {/* Header */}
      {/* <div className="wz-header">
        <div>
          <h2 className="wz-title">{isEdit ? "Edit Student" : "Student Registration"}</h2>
          <p className="wz-subtitle">
            {isEdit
              ? `Update details for admission no. ${routeId}`
              : "Fill in the details across all steps to register a new student"}
          </p>
        </div>
        {!isEdit && (
        <button className="wz-draft-btn" onClick={saveDraft}>
          <i className="bx bx-save"></i> Save Draft
        </button>
        )}
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

      {/* Form card */}
      <div className="wz-card">
        <div className="wz-card-title">
          <i className={STEPS[step].icon}></i>
          <span>{STEPS[step].label}</span>
        </div>

        {/*  Step 0: Basic Info  */}
        {step === 0 && (
          <div className="wz-grid">
            <Field label="First Name" name="firstName" value={form.firstName} onChange={handleChange} error={errors.firstName} required />
            <Field label="Last Name" name="lastName" value={form.lastName} onChange={handleChange} error={errors.lastName} required />
            <Field label="Gender" name="gender" type="select" value={form.gender} onChange={handleChange} error={errors.gender} options={dd.genderId} required />
            <Field label="Date of Birth" name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={handleChange} error={errors.dateOfBirth} required />
            <Field label="Blood Group" name="bloodGroupId" type="select" value={form.bloodGroupId} onChange={handleChange} error={errors.bloodGroupId} options={dd.bloodGroupId} required />
            <Field label="Nationality" name="nationalityId" type="select" value={form.nationalityId} onChange={handleChange} error={errors.nationalityId} options={dd.nationalityId} required />
            <Field label="Religion" name="religionId" type="select" value={form.religionId} onChange={handleChange} error={errors.religionId} options={dd.religionId} required />
            <Field label="Community" name="communityId" type="select" value={form.communityId} onChange={handleChange} error={errors.communityId} options={dd.communityId} required />
            <Field
              label="Student Photo"
              name="photo"
              type="file"
              onChange={handleChange}
              error={errors.photo}
              previewUrl={photoPreviewUrl}
              accept="image/*"
              required
            />
          </div>
        )}

        {/*  Step 1: Academic  */}
        {step === 1 && (
          <div className="wz-grid">
            <Field label="Academic Year" name="academicYear" value={form.academicYear} onChange={handleChange} error={errors.academicYear} placeholder="e.g. 2024-25" required />
            <Field label="Class" name="classId" type="select" value={form.classId} onChange={handleChange} error={errors.classId} options={dd.classId} required />
            <Field label="Section" name="sectionId" type="select" value={form.sectionId} onChange={handleChange} error={errors.sectionId} options={dd.sectionId} required />
            <Field label="Roll Number" name="rollNo" value={form.rollNo} onChange={handleChange} error={errors.rollNo} required />
            <Field label="Admission Date" name="admissionDate" type="date" value={form.admissionDate} onChange={handleChange} error={errors.admissionDate} required />
            <Field label="Previous School" name="previousSchool" value={form.previousSchool} onChange={handleChange} error={errors.previousSchool} />
            <Field label="Reason for Leaving" name="previousReason" value={form.previousReason} onChange={handleChange} error={errors.previousReason} />
          </div>
        )}

        {/*  Step 2: Parent/Guardian  */}
        {step === 2 && (
          <>
            <p className="wz-section-hdr"><i className="bx bxs-user"></i> Father Details</p>
            <div className="wz-grid">
              <Field label="Father Name" name="fatherName" value={form.fatherName} onChange={handleChange} error={errors.fatherName} required />
              <Field
                label="Father Mobile"
                name="fatherMobile"
                type="tel"
                value={form.fatherMobile}
                onChange={handleChange}
                error={errors.fatherMobile}
                required
                maxLength={10}
                inputMode="numeric"
                pattern="[6-9][0-9]{9}"
                placeholder="10-digit mobile (starts with 6–9)"
              />
              <Field label="Father Occupation" name="fatherOccupation" value={form.fatherOccupation} onChange={handleChange} error={errors.fatherOccupation} required />
            </div>
            <p className="wz-section-hdr"><i className="bx bxs-user"></i> Mother Details</p>
            <div className="wz-grid">
              <Field label="Mother Name" name="motherName" value={form.motherName} onChange={handleChange} error={errors.motherName} required />
              <Field
                label="Mother Mobile"
                name="motherMobile"
                type="tel"
                value={form.motherMobile}
                onChange={handleChange}
                error={errors.motherMobile}
                required
                maxLength={10}
                inputMode="numeric"
                pattern="[6-9][0-9]{9}"
                placeholder="10-digit mobile"
              />
              <Field label="Mother Occupation" name="motherOccupation" value={form.motherOccupation} onChange={handleChange} error={errors.motherOccupation} required />
            </div>
            <p className="wz-section-hdr">
              <i className="bx bxs-user-circle"></i> Guardian Details
              <span className="wz-optional-tag">Optional</span>
            </p>
            <div className="wz-grid">
              <Field label="Guardian Name" name="guardianName" value={form.guardianName} onChange={handleChange} error={errors.guardianName} />
              <Field
                label="Guardian Mobile"
                name="guardianMobile"
                type="tel"
                value={form.guardianMobile}
                onChange={handleChange}
                error={errors.guardianMobile}
                maxLength={10}
                inputMode="numeric"
                pattern="[6-9][0-9]{9}"
                placeholder="10-digit mobile"
              />
              <Field label="Relation" name="guardianRelation" value={form.guardianRelation} onChange={handleChange} error={errors.guardianRelation} />
            </div>
          </>
        )}

        {/*  Step 3: Address  */}
        {step === 3 && (
          <div className="wz-grid">
            <Field label="Address Line 1" name="address1" value={form.address1} onChange={handleChange} error={errors.address1} required />
            <Field label="Address Line 2" name="address2" value={form.address2} onChange={handleChange} error={errors.address2} required />
            <Field label="State" name="stateId" type="select" value={form.stateId} onChange={handleChange} error={errors.stateId} options={dd.stateId} required />
            <Field label="City" name="cityId" type="select" value={form.cityId} onChange={handleChange} error={errors.cityId} options={dd.cityId} required />
            <Field label="Country" name="country" value={form.country} onChange={handleChange} error={errors.country} required />
            <Field label="Pincode" name="pincode" value={form.pincode} onChange={handleChange} error={errors.pincode} required />
          </div>
        )}

        {/*  Step 4: Review  */}
        {step === 4 && (
          <div className="wz-review">
            {[
              { title: "Basic Information", editStep: 0, fields: [
                ["First Name", form.firstName],
                ["Last Name", form.lastName], ["Gender", form.gender],
                ["Date of Birth", form.dateOfBirth],
                ["Blood Group", dd.bloodGroupId.find(o => String(o.id) === String(form.bloodGroupId))?.value || form.bloodGroupId],
                ["Nationality", dd.nationalityId.find(o => String(o.id) === String(form.nationalityId))?.value || form.nationalityId],
                ["Religion", dd.religionId.find(o => String(o.id) === String(form.religionId))?.value || form.religionId],
                ["Community", dd.communityId.find(o => String(o.id) === String(form.communityId))?.value || form.communityId],
                ["Student Photo", form.photo instanceof File ? form.photo.name : (hasExistingPhoto(form.photoUrl) ? "Uploaded" : "")],
              ]},
              { title: "Academic Information", editStep: 1, fields: [
                ["Academic Year", form.academicYear], ["Class", dd.classId.find(o => String(o.id) === String(form.classId))?.value || form.classId],
                ["Section", dd.sectionId.find(o => String(o.id) === String(form.sectionId))?.value || form.sectionId],
                ["Roll No", form.rollNo], ["Admission Date", form.admissionDate],
                ["Previous School", form.previousSchool],
                ["Reason for Leaving", form.previousReason],
              ]},
              { title: "Parent / Guardian", editStep: 2, fields: [
                ["Father Name", form.fatherName], ["Father Mobile", form.fatherMobile],
                ["Father Occupation", form.fatherOccupation],
                ["Mother Name", form.motherName], ["Mother Mobile", form.motherMobile],
                ["Mother Occupation", form.motherOccupation],
                ["Guardian Name", form.guardianName],
                ["Guardian Mobile", form.guardianMobile],
                ["Guardian Relation", form.guardianRelation],
              ]},
              { title: "Address", editStep: 3, fields: [
                ["Address Line 1", form.address1],
                ["Address Line 2", form.address2],
                ["City", dd.cityId.find(o => String(o.id) === String(form.cityId))?.value || form.cityId],
                ["State", dd.stateId.find(o => String(o.id) === String(form.stateId))?.value || form.stateId],
                ["Pincode", form.pincode], ["Country", form.country],
              ]},
            ].map((sec, si) => (
              <div className="wz-review-card" key={si}>
                <div className="wz-review-card-hdr">
                  <span>{sec.title}</span>
                  <button className="wz-edit-btn" onClick={() => goEdit(sec.editStep)}>
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
        )}
      </div>

      {/* Navigation */}
      <div className="wz-nav">
        <button className="wz-btn wz-btn-ghost" onClick={handleCancel}>
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
              {submitting ? <><i className="bx bx-loader-alt bx-spin"></i> Submitting…</> : <><i className="bx bx-check"></i> {isEdit ? "Update Student" : "Submit Registration"}</>}
            </button>
          )}
        </div>
      </div>

      <ToastContainer position="bottom-right" autoClose={2500} style={{ zIndex: 99999, fontSize: 14 }} />

      {showDiscardModal && (
        <div className="wz-confirm-overlay">
          <div className="wz-confirm-modal">
            <p className="wz-confirm-msg">You have unsaved changes. Discard and leave?</p>
            <div className="wz-confirm-actions">
              <button className="wz-btn wz-btn-ghost" onClick={() => setShowDiscardModal(false)}>
                Cancel
              </button>
              <button className="wz-btn wz-btn-primary" onClick={handleDiscardConfirm}>
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
