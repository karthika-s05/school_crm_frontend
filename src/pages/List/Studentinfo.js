import { useFormik } from "formik";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  API_BASE_URLS,
  createStudentImage,
  createStudentadhar,
  createStudentbirth,
  createStudentcommuity,
  createStudentnumber,
  createStudenttc,
  deletetAadhar,
  getStudentlist,
} from "../../services/api";
import { getToken } from "../../services/auth";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./StudentDummyList.css";
import "./Studentinfo.css";

const MAX_SIZE = 2 * 1024 * 1024;
const NO_IMAGE = `${API_BASE_URLS.MASTER_URL}/uploads/noImage/men2.jpg`;

const initials = (name) =>
  (name || "?").split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

const isUploaded = (preview, name) => !!(preview || name);

export default function Studentinfo() {
  const navigate = useNavigate();
  const ids = useParams();

  const [loading, setLoading] = useState(true);
  const [tcNo, setTcNo] = useState("");
  const [comNo, setComNo] = useState("");
  const [birthNo, setBirthNo] = useState("");
  const [photoPreviewURL, setPhotoPreviewURL] = useState("");
  const [aadharPreviewURL, setAadharPreviewURL] = useState("");
  const [communityCertUrl, setCommunityCertUrl] = useState("");
  const [tcCertificate, setTcCertificate] = useState("");
  const [studentName, setStudentName] = useState("");
  const [admNo, setAdmNo] = useState("");
  const [photoName, setPhotoName] = useState("");
  const [aadarName, setAadarName] = useState("");
  const [commuName, setCommuName] = useState("");
  const [birthName, setBirthName] = useState("");
  const [tcName, setTcName] = useState("");
  const [birthCertificatePreview, setBirthCertificatePreview] = useState(null);
  const [birthCertificate, setBirthCertificate] = useState(null);
  const [communityCertificatePreview, setCommunityCertificatePreview] = useState(null);
  const [certificatePhotoPreview, setCertificatePhotoPreview] = useState(null);

  const formik = useFormik({
    initialValues: {
      photo: "",
      adharcardPhoto: "",
      oldCertificate: "",
      certificatephoto: "",
      birthNo: "",
      birthcertificate: "",
      communityNo: "",
      communityCertificate: null,
    },
    validate: (values) => {
      const errors = {};
      if (!photoName && !values.photo) errors.photo = "Please upload photo";
      if (!values.birthNo) errors.birthNo = "Please enter birth certificate no";
      if (!birthCertificate && !values.birthcertificate) {
        errors.birthcertificate = "Please upload birth certificate";
      }
      if (!values.communityNo) errors.communityNo = "Please enter community certificate no";
      if (!tcCertificate && !values.communityCertificate) {
        errors.communityCertificate = "Please upload community certificate";
      }
      return errors;
    },
    onSubmit: async (values, { setSubmitting }) => {
      const token = getToken();
      if (!aadharPreviewURL) {
        try {
          await deletetAadhar({ studentId: ids.id }, token);
        } catch (err) {
          console.log(err);
        }
      }
      if (formik.values.adharcardPhoto) {
        createStudentadhar({ id: ids.id, photoUrl: values.adharcardPhoto }, token);
      }
      if (formik.values.certificatephoto) {
        createStudenttc({ id: ids.id, photoUrl: values.certificatephoto }, token);
      }
      if (formik.values.communityCertificate) {
        createStudentcommuity({ id: ids.id, photoUrl: values.communityCertificate }, token);
      }
      if (formik.values.birthcertificate) {
        createStudentbirth({ id: ids.id, photoUrl: values.birthcertificate }, token);
      }
      if (formik.values.photo) {
        createStudentImage({ id: ids.id, photoUrl: values.photo }, token);
      }
      try {
        const response = await createStudentnumber(
          {
            studentId: ids.id,
            tcNo: tcNo || "",
            comNo: comNo || "",
            birthNo: birthNo || "",
          },
          token
        );
        if (response.status === "Error" || response.status === "error") {
          toast.error(response.data);
          throw new Error(response.message);
        }
        toast.success("Student documents saved successfully");
        setTimeout(() => navigate("/admin/students"), 1500);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.size > MAX_SIZE) {
      event.target.value = null;
      formik.setFieldError(
        event.target.name,
        `File exceeds 2MB limit for ${event.target.name === "photo" ? "photo" : "document"}.`
      );
      return;
    }
    formik.setFieldError(event.target.name, "");

    const reader = new FileReader();
    reader.onloadend = () => {
      if (event.target.name === "photo") {
        setPhotoPreviewURL(reader.result);
        setPhotoName(file?.name || "");
      } else if (event.target.name === "adharcardPhoto") {
        setAadharPreviewURL(reader.result);
        setAadarName(file?.name || "");
      }
    };

    if (file) {
      reader.readAsDataURL(file);
      formik.setFieldValue(event.target.name, file);
    } else if (event.target.name === "photo") {
      setPhotoPreviewURL("");
      setPhotoName("");
    } else if (event.target.name === "adharcardPhoto") {
      setAadharPreviewURL("");
      setAadarName("");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    formik.setFieldValue(name, value);
    if (name === "oldCertificate") setTcNo(value);
    if (name === "communityNo") setComNo(value);
    if (name === "birthNo") setBirthNo(value);
  };

  const handleFilePreview = (event, setPreview, setFileUrl) => {
    const file = event.target.files[0];
    if (!file) return;
    if (file.size > MAX_SIZE) {
      alert("File size exceeds 2MB limit.");
      event.target.value = null;
      return;
    }
    setPreview(file);
    setFileUrl(URL.createObjectURL(file));
    formik.setFieldValue(event.target.name, file);
  };

  const handlePreviewClick = (filePreview) => {
    if (filePreview) {
      const url = typeof filePreview === "string" ? filePreview : URL.createObjectURL(filePreview);
      window.open(url, "_blank");
    }
  };

  const clearImage = (name) => {
    const input = document.getElementsByName(name)[0];
    if (input) input.value = "";
    if (name === "photo") {
      setPhotoName("");
      setPhotoPreviewURL("");
      formik.setFieldValue("photo", "");
    } else {
      setAadarName("");
      setAadharPreviewURL("");
      formik.setFieldValue("adharcardPhoto", "");
    }
  };

  const clearPdf = (name, setPreview, setUrl, setFileName) => {
    const input = document.getElementsByName(name)[0];
    if (input) input.value = "";
    setPreview(null);
    setUrl("");
    setFileName?.("");
    formik.setFieldValue(name, null);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = getToken();
        const response = await getStudentlist({ userName: ids.id }, token);
        const studentData = response?.data?.[0];
        if (!studentData) return;

        setStudentName(studentData.studentName || "");
        setAdmNo(studentData.admissionNo || ids.id || "");
        setPhotoPreviewURL(
          studentData.photoUrl && studentData.photoUrl !== NO_IMAGE ? studentData.photoUrl : ""
        );
        setBirthCertificatePreview(studentData.birthCertificate);
        setBirthCertificate(studentData.birthCertificate);
        setAadharPreviewURL(studentData.adharCard || "");
        setCommunityCertUrl(studentData.communityCertUrl || "");
        setCommunityCertificatePreview(studentData.communityCertUrl);
        setCertificatePhotoPreview(studentData.tcCertificate);
        setTcCertificate(studentData.tcCertificate || "");
        setPhotoName(
          studentData.photoUrl && studentData.photoUrl !== NO_IMAGE ? studentData.photoName || "photo.jpg" : ""
        );
        setAadarName(studentData.aadarName || "");
        setCommuName(studentData.commuName || "");
        setBirthName(studentData.birthName || "");
        setTcName(studentData.tcName || "");
        setComNo(studentData.communityCertNo || "");
        setTcNo(studentData.OldTcNumber || "");
        setBirthNo(studentData.birthCertNo || "");
        formik.setValues({
          oldCertificate: studentData.OldTcNumber || "",
          communityNo: studentData.communityCertNo || "",
          birthNo: studentData.birthCertNo || "",
        });
      } catch (error) {
        console.error("Error fetching student data:", error);
        setStudentName("Student");
        setAdmNo(ids.id || "");
      } finally {
        setLoading(false);
      }
    };
    if (ids?.id) fetchData();
  }, [ids]);

  const uploadedCount = [
    isUploaded(photoPreviewURL, photoName),
    isUploaded(aadharPreviewURL, aadarName),
    !!formik.values.oldCertificate || isUploaded(tcCertificate, tcName),
    !!formik.values.birthNo && isUploaded(birthCertificate, birthName),
    !!formik.values.communityNo && isUploaded(communityCertUrl, commuName),
  ].filter(Boolean).length;

  const progressPct = Math.round((uploadedCount / 5) * 100);

  const showError = (field) =>
    (formik.touched[field] || formik.submitCount > 0) && formik.errors[field];

  if (loading) {
    return (
      <div className="si-wrap">
        <div className="si-loading">
          <i className="bx bx-loader-alt bx-spin"></i>
          Loading student documents…
        </div>
      </div>
    );
  }

  return (
    <div className="si-wrap">
      {/* Header */}
      <div className="si-header">
        <div className="si-header-left">
          <button type="button" className="si-back-btn" onClick={() => navigate("/admin/students")} title="Back to list">
            <i className="bx bx-arrow-back"></i>
          </button>
          <div className="si-avatar">{initials(studentName)}</div>
          <div>
            <h1 className="si-title">Document Upload</h1>
            <p className="si-subtitle">
              <strong>{studentName}</strong> · {admNo}
            </p>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="si-progress-card">
        <div className="si-progress-top">
          <span className="si-progress-label">Upload progress</span>
          <span className="si-progress-pct">{uploadedCount}/5 complete ({progressPct}%)</span>
        </div>
        <div className="si-progress-bar">
          <div className="si-progress-fill" style={{ width: `${progressPct}%` }}></div>
        </div>
      </div>

      <form onSubmit={formik.handleSubmit}>
        <div className="si-grid">

          {/* Photo */}
          <div className={`si-doc-card ${isUploaded(photoPreviewURL, photoName) ? "si-done" : showError("photo") ? "si-error" : ""}`}>
            <div className="si-doc-top">
              <div className="si-doc-icon" style={{ background: "#eef0fb", color: "#2D3A8C" }}>
                <i className="bx bxs-camera"></i>
              </div>
              <div className="si-doc-meta">
                <p className="si-doc-name">Student Photo <span className="si-req">*</span></p>
                <p className="si-doc-hint">JPG, PNG, JPEG · max 2MB</p>
              </div>
              <span className={`si-badge ${isUploaded(photoPreviewURL, photoName) ? "done" : "pending"}`}>
                {isUploaded(photoPreviewURL, photoName) ? "Uploaded" : "Required"}
              </span>
            </div>
            {photoPreviewURL ? (
              <div className="si-preview-row">
                <img src={photoPreviewURL} alt="Student" className="si-preview-thumb" />
                <div className="si-preview-info">
                  <p className="si-preview-name">{photoName || "photo.jpg"}</p>
                  <p className="si-preview-type">Image file</p>
                </div>
                <div className="si-preview-actions">
                  <button type="button" className="si-icon-btn view" onClick={() => window.open(photoPreviewURL, "_blank")}>
                    <i className="bx bx-show"></i>
                  </button>
                  <button type="button" className="si-icon-btn remove" onClick={() => clearImage("photo")}>
                    <i className="bx bx-trash"></i>
                  </button>
                </div>
              </div>
            ) : (
              <div className="si-upload-zone">
                <input accept=".jpg,.jpeg,.png" type="file" name="photo" onChange={handleFileChange} />
                <i className="bx bx-cloud-upload si-upload-icon"></i>
                <p className="si-upload-text">Click to upload photo</p>
                <p className="si-upload-sub">or drag and drop here</p>
              </div>
            )}
            {showError("photo") && !photoPreviewURL && (
              <p className="si-error-msg">{formik.errors.photo}</p>
            )}
          </div>

          {/* Aadhar */}
          <div className={`si-doc-card ${isUploaded(aadharPreviewURL, aadarName) ? "si-done" : ""}`}>
            <div className="si-doc-top">
              <div className="si-doc-icon" style={{ background: "#fdf0eb", color: "#E8541A" }}>
                <i className="bx bxs-id-card"></i>
              </div>
              <div className="si-doc-meta">
                <p className="si-doc-name">Aadhar Card</p>
                <p className="si-doc-hint">JPG, PNG, JPEG · max 2MB</p>
              </div>
              <span className={`si-badge ${isUploaded(aadharPreviewURL, aadarName) ? "done" : "optional"}`}>
                {isUploaded(aadharPreviewURL, aadarName) ? "Uploaded" : "Optional"}
              </span>
            </div>
            {aadharPreviewURL ? (
              <div className="si-preview-row">
                <img src={aadharPreviewURL} alt="Aadhar" className="si-preview-thumb" />
                <div className="si-preview-info">
                  <p className="si-preview-name">{aadarName || "aadhar.jpg"}</p>
                  <p className="si-preview-type">Image file</p>
                </div>
                <div className="si-preview-actions">
                  <button type="button" className="si-icon-btn view" onClick={() => window.open(aadharPreviewURL, "_blank")}>
                    <i className="bx bx-show"></i>
                  </button>
                  <button type="button" className="si-icon-btn remove" onClick={() => clearImage("adharcardPhoto")}>
                    <i className="bx bx-trash"></i>
                  </button>
                </div>
              </div>
            ) : (
              <div className="si-upload-zone">
                <input accept=".jpg,.jpeg,.png" type="file" name="adharcardPhoto" onChange={handleFileChange} />
                <i className="bx bx-cloud-upload si-upload-icon"></i>
                <p className="si-upload-text">Click to upload Aadhar</p>
                <p className="si-upload-sub">or drag and drop here</p>
              </div>
            )}
          </div>

          {/* Transfer Certificate */}
          <div className={`si-doc-card ${isUploaded(tcCertificate, tcName) ? "si-done" : ""}`}>
            <div className="si-doc-top">
              <div className="si-doc-icon" style={{ background: "#f5f3ff", color: "#7c3aed" }}>
                <i className="bx bxs-file-pdf"></i>
              </div>
              <div className="si-doc-meta">
                <p className="si-doc-name">Transfer Certificate</p>
                <p className="si-doc-hint">PDF · max 2MB</p>
              </div>
              <span className={`si-badge ${isUploaded(tcCertificate, tcName) ? "done" : "optional"}`}>
                {isUploaded(tcCertificate, tcName) ? "Uploaded" : "Optional"}
              </span>
            </div>
            <div className="si-field">
              <label>Existing TC Number</label>
              <input
                type="text"
                name="oldCertificate"
                placeholder="Enter TC number"
                value={formik.values.oldCertificate}
                onChange={handleInputChange}
                onBlur={formik.handleBlur}
              />
            </div>
            {certificatePhotoPreview || tcCertificate ? (
              <div className="si-pdf-preview">
                <i className="bx bxs-file-pdf"></i>
                <span>{tcName || "transfer-certificate.pdf"}</span>
                <button type="button" className="si-icon-btn view" onClick={() => handlePreviewClick(tcCertificate || certificatePhotoPreview)}>
                  <i className="bx bx-show"></i>
                </button>
                <button type="button" className="si-icon-btn remove" onClick={() => {
                  clearPdf("certificatephoto", setCertificatePhotoPreview, setTcCertificate, setTcName);
                }}>
                  <i className="bx bx-trash"></i>
                </button>
              </div>
            ) : (
              <div className="si-upload-zone">
                <input
                  type="file"
                  name="certificatephoto"
                  accept="application/pdf"
                  onChange={(e) => {
                    handleFilePreview(e, setCertificatePhotoPreview, setTcCertificate);
                    if (e.target.files[0]) setTcName(e.target.files[0].name);
                  }}
                />
                <i className="bx bx-cloud-upload si-upload-icon"></i>
                <p className="si-upload-text">Upload TC document</p>
                <p className="si-upload-sub">PDF only · max 2MB</p>
              </div>
            )}
          </div>

          {/* Birth Certificate */}
          <div className={`si-doc-card ${isUploaded(birthCertificate, birthName) && formik.values.birthNo ? "si-done" : showError("birthNo") || showError("birthcertificate") ? "si-error" : ""}`}>
            <div className="si-doc-top">
              <div className="si-doc-icon" style={{ background: "#dcfce7", color: "#16a34a" }}>
                <i className="bx bxs-certification"></i>
              </div>
              <div className="si-doc-meta">
                <p className="si-doc-name">Birth Certificate <span className="si-req">*</span></p>
                <p className="si-doc-hint">PDF · max 2MB</p>
              </div>
              <span className={`si-badge ${isUploaded(birthCertificate, birthName) && formik.values.birthNo ? "done" : "pending"}`}>
                {isUploaded(birthCertificate, birthName) && formik.values.birthNo ? "Uploaded" : "Required"}
              </span>
            </div>
            <div className="si-field">
              <label>Certificate Number <span className="si-req">*</span></label>
              <input
                type="text"
                name="birthNo"
                placeholder="Enter birth certificate no"
                className={showError("birthNo") ? "si-invalid" : ""}
                value={formik.values.birthNo}
                onChange={handleInputChange}
                onBlur={formik.handleBlur}
              />
              {showError("birthNo") && <p className="si-error-msg">{formik.errors.birthNo}</p>}
            </div>
            {birthCertificatePreview || birthCertificate ? (
              <div className="si-pdf-preview">
                <i className="bx bxs-file-pdf"></i>
                <span>{birthName || "birth-certificate.pdf"}</span>
                <button type="button" className="si-icon-btn view" onClick={() => handlePreviewClick(birthCertificate || birthCertificatePreview)}>
                  <i className="bx bx-show"></i>
                </button>
                <button type="button" className="si-icon-btn remove" onClick={() => {
                  clearPdf("birthcertificate", setBirthCertificatePreview, setBirthCertificate, setBirthName);
                }}>
                  <i className="bx bx-trash"></i>
                </button>
              </div>
            ) : (
              <div className="si-upload-zone">
                <input
                  type="file"
                  name="birthcertificate"
                  accept="application/pdf"
                  onChange={(e) => {
                    handleFilePreview(e, setBirthCertificatePreview, setBirthCertificate);
                    formik.setFieldTouched("birthcertificate", true);
                    if (e.target.files[0]) {
                      setBirthName(e.target.files[0].name);
                      formik.setFieldValue("birthcertificate", e.target.files[0]);
                    }
                  }}
                  onBlur={formik.handleBlur}
                />
                <i className="bx bx-cloud-upload si-upload-icon"></i>
                <p className="si-upload-text">Upload birth certificate</p>
                <p className="si-upload-sub">PDF only · max 2MB</p>
              </div>
            )}
            {showError("birthcertificate") && !birthCertificatePreview && (
              <p className="si-error-msg">{formik.errors.birthcertificate}</p>
            )}
          </div>

          {/* Community Certificate */}
          <div className={`si-doc-card ${isUploaded(communityCertUrl, commuName) && formik.values.communityNo ? "si-done" : showError("communityNo") || showError("communityCertificate") ? "si-error" : ""}`}>
            <div className="si-doc-top">
              <div className="si-doc-icon" style={{ background: "#fef3c7", color: "#d97706" }}>
                <i className="bx bxs-file-doc"></i>
              </div>
              <div className="si-doc-meta">
                <p className="si-doc-name">Community Certificate <span className="si-req">*</span></p>
                <p className="si-doc-hint">PDF · max 2MB</p>
              </div>
              <span className={`si-badge ${isUploaded(communityCertUrl, commuName) && formik.values.communityNo ? "done" : "pending"}`}>
                {isUploaded(communityCertUrl, commuName) && formik.values.communityNo ? "Uploaded" : "Required"}
              </span>
            </div>
            <div className="si-field">
              <label>Certificate Number <span className="si-req">*</span></label>
              <input
                type="text"
                name="communityNo"
                placeholder="Enter community certificate no"
                className={showError("communityNo") ? "si-invalid" : ""}
                value={formik.values.communityNo}
                onChange={handleInputChange}
                onBlur={formik.handleBlur}
              />
              {showError("communityNo") && <p className="si-error-msg">{formik.errors.communityNo}</p>}
            </div>
            {communityCertificatePreview || communityCertUrl ? (
              <div className="si-pdf-preview">
                <i className="bx bxs-file-pdf"></i>
                <span>{commuName || "community-certificate.pdf"}</span>
                <button type="button" className="si-icon-btn view" onClick={() => handlePreviewClick(communityCertUrl || communityCertificatePreview)}>
                  <i className="bx bx-show"></i>
                </button>
                <button type="button" className="si-icon-btn remove" onClick={() => {
                  clearPdf("communityCertificate", setCommunityCertificatePreview, setCommunityCertUrl, setCommuName);
                }}>
                  <i className="bx bx-trash"></i>
                </button>
              </div>
            ) : (
              <div className="si-upload-zone">
                <input
                  type="file"
                  name="communityCertificate"
                  accept=".pdf"
                  onChange={(e) => {
                    handleFilePreview(e, setCommunityCertificatePreview, setCommunityCertUrl);
                    formik.setFieldTouched("communityCertificate", true);
                    if (e.target.files[0]) {
                      setCommuName(e.target.files[0].name);
                      formik.setFieldValue("communityCertificate", e.target.files[0]);
                    }
                  }}
                  onBlur={formik.handleBlur}
                />
                <i className="bx bx-cloud-upload si-upload-icon"></i>
                <p className="si-upload-text">Upload community certificate</p>
                <p className="si-upload-sub">PDF only · max 2MB</p>
              </div>
            )}
            {showError("communityCertificate") && !communityCertificatePreview && (
              <p className="si-error-msg">{formik.errors.communityCertificate}</p>
            )}
          </div>
        </div>

        <div className="si-footer">
          <button type="button" className="si-btn-cancel" onClick={() => navigate("/admin/students")}>
            Cancel
          </button>
          <button type="submit" className="si-btn-submit" disabled={formik.isSubmitting}>
            {formik.isSubmitting ? "Saving…" : "Save Documents"}
          </button>
        </div>
      </form>

      <ToastContainer position="bottom-right" autoClose={2500} style={{ zIndex: 99999, fontSize: 14 }} />
    </div>
  );
}
