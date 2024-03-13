import { useFormik } from "formik";
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  createStudentImage,
  createStudentadhar,
  createStudentbirth,
  createStudentcommuity,
  createStudentnumber,
  createStudenttc,
  deletetAadhar,
  getStudentlist,
} from "../../services/api";
import { TOKEN_KEY } from "../../services/auth";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Studentinfo() {
  const navigate = useNavigate();
  const ids = useParams();
  const [tcNo, setTcNo] = useState();
  const [comNo, setComNo] = useState();
  const [birthNo, setBirthNo] = useState();
  const [photoPreviewURL, setPhotoPreviewURL] = useState("");
  const [aadharPreviewURL, setAadharPreviewURL] = useState("");
  const [communityCertUrl, setCommunityCertUrl] = useState("");
  const [tcCertificate, setTcCertificate] = useState("");
  const [studentName, setStudentName] = useState("");
  const [photoName, setPhotoName] = useState("");
  const [aadarName, setAadarName] = useState("");
  const [commuName, setCommuName] = useState("");
  const [birthName, setBirthName] = useState("");
  const [tcName, setTcName] = useState("");
  const [birthCertificatePreview, setBirthCertificatePreview] = useState(null);
  const [birthCertificate, setBirthCertificate] = useState(null);
  const [communityCertificatePreview, setCommunityCertificatePreview] =
    useState(null);
  const [certificatePhotoPreview, setCertificatePhotoPreview] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    const maxSize = 2 * 1024 * 1024;

    if (file && file.size > maxSize) {
      event.target.value = null;
      formik.setFieldError(
        event.target.name,
        `File size exceeds the limit (2MB). Please choose a smaller file for ${event.target.name === "photo" ? "photo" : "Aadhar card"
        }.`
      );
      return;
    } else {
      formik.setFieldError(event.target.name, "");
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (event.target.name === "photo") {
        setPhotoPreviewURL(reader.result);
        const filename = file.name;
        setPhotoName(filename);
      } else if (event.target.name === "adharcardPhoto") {
        setAadharPreviewURL(reader.result);
        const filename = file.name;
        setAadarName(filename);
      }
    };

    if (file) {
      reader.readAsDataURL(file);
    } else {
      if (event.target.name === "photo") {
        setPhotoPreviewURL("");
        setPhotoName("");
      } else if (event.target.name === "adharcardPhoto") {
        setAadharPreviewURL("");
        setAadarName("");
      }
    }

    formik.setFieldValue(event.target.name, file);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(name, "121");
    if (name === "oldCertificate") {
      formik.setFieldValue(name, value);
      setTcNo(value);
    }
    if (name === "communityNo") {
      formik.setFieldValue(name, value);
      setComNo(value);
    }
    if (name === "birthNo") {
      formik.setFieldValue(name, value);
      setBirthNo(value);
    }
  };
  const validate = (values) => {
    console.log(values, "vALUES");
    const errors = {};
    if (!photoName && !values.photo) {
      errors.photo = "Please upload photo";
    }
    if (!values.birthNo) {
      errors.birthNo = "Please enter birth certificate no";
    }
    if (!birthCertificate && !values.birthcertificate) {
      errors.birthcertificate = "Please upload birth certificate";
    }
    if (!values.communityNo) {
      errors.communityNo = "Please enter community certificate no";
    }
    if (!tcCertificate && !values.communityCertificate) {
      errors.communityCertificate = "Please upload community certificate";
    }
    return errors;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (ids) {
          const response = await getStudentlist(
            { userName: ids.id },
            TOKEN_KEY
          );
          const studentData = response.data[0];
          setStudentName(studentData.studentName);
          setPhotoPreviewURL(studentData.photoUrl === "http://49.207.183.18:8086/uploads/noImage/men2.jpg" ? "" : studentData.photoUrl);
          setBirthCertificatePreview(studentData.birthCertificate);
          setBirthCertificate(studentData.birthCertificate);
          setAadharPreviewURL(studentData.adharCard);
          setCommunityCertUrl(studentData.communityCertUrl);
          setCommunityCertificatePreview(studentData.communityCertUrl);
          setCertificatePhotoPreview(studentData.tcCertificate);
          setTcCertificate(studentData.tcCertificate);

          // setTransferCertificateNo(studentData.transferCertificateNo);
          setPhotoName(studentData.photoUrl === "http://49.207.183.18:8086/uploads/noImage/men2.jpg" ? "" : studentData.photoName);
          setAadarName(studentData.aadarName);
          setCommuName(studentData.commuName);
          setBirthName(studentData.birthName);
          setTcName(studentData.tcName);
          setComNo(studentData.communityCertNo);
          setTcNo(studentData.OldTcNumber);
          setBirthNo(studentData.birthCertNo);
          formik.setValues({
            oldCertificate: studentData.OldTcNumber,
            communityNo: studentData.communityCertNo,
            birthNo: studentData.birthCertNo,
          });
        }
      } catch (error) {
        console.error("Error fetching student data:", error);
      }
    };
    fetchData();
    // const getStudentList = async () => {
    //   try {
    //     const response = await getStudentlist(
    //       {
    //         userName: ids.id,
    //       },
    //       TOKEN_KEY
    //     );
    //     if (response.data && response.data.length > 0) {
    //       const studentData = response.data[0];
    //       formik.setValues({
    //         oldCertificate: studentData.OldTcNumber,
    //         communityNo: studentData.communityCertNo,
    //         birthNo: studentData.birthCertNo,
    //       });
    //     }
    //   } catch (err) {
    //     console.log(err);
    //   }
    // };
    // getStudentList();
    return () => { };
  }, [ids]);

  const handleBack = (ids) => {
    console.log(ids, "ids");
    navigate(`/studentlist/${ids.id}`);
  };
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
    validate,
    onSubmit: async (values, { setSubmitting }) => {
      if(!aadharPreviewURL){
        try {
          const response = await deletetAadhar({ studentId: ids.id }, TOKEN_KEY);
          console.log(response.data,"maram");
        } catch (err) {
          console.log(err);
        }
      }
      if (formik.values.adharcardPhoto) {
        createStudentadhar(
          { id: ids.id, photoUrl: values.adharcardPhoto },
          TOKEN_KEY
        );
      }
      if (formik.values.certificatephoto) {
        createStudenttc(
          { id: ids.id, photoUrl: values.certificatephoto },
          TOKEN_KEY
        );
      }
      if (formik.values.communityCertificate) {
        createStudentcommuity(
          { id: ids.id, photoUrl: values.communityCertificate },
          TOKEN_KEY
        );
      }
      if (formik.values.birthcertificate) {
        createStudentbirth(
          { id: ids.id, photoUrl: values.birthcertificate },
          TOKEN_KEY
        );
      }
      if (formik.values.photo) {
        createStudentImage({ id: ids.id, photoUrl: values.photo }, TOKEN_KEY);
      }
      try {
        const responses = await Promise.all([
          createStudentnumber(
            {
              studentId: ids.id,
              tcNo: tcNo ? tcNo : "",
              comNo: comNo ? comNo : "",
              birthNo: birthNo ? birthNo : "",
            },
            TOKEN_KEY
          ),
        ]);

        responses.forEach((response) => {
          if (response.status === "Error" || response.status === "error") {
            toast.error(response.data);
            throw new Error(response.message);
          }
        });

        // If all requests succeed
        toast.success("All requests succeeded!");
        setTimeout(() => {
          navigate("/list", { state: "Student List" });
        }, 1500);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleCloseAadharPreview = async () => {
    console.log(ids, "ids");
    setAadarName("");
    setAadharPreviewURL("");
    const inputElement = document.getElementsByName("adharcardPhoto")[0];
    if (inputElement) {
      inputElement.value = "";
    }
  };

  const handleClosePhotoPreview = () => {
    setPhotoName("");
    setPhotoPreviewURL("");
    const inputElement = document.getElementsByName("photo")[0];
    if (inputElement) {
      inputElement.value = "";
    }
  };
  const handleFilePreview = (event, setPreview, setFileUrl) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size <= 2 * 1024 * 1024) {
        setPreview(file);
        const fileUrl = URL.createObjectURL(file);
        setFileUrl(fileUrl);
      } else {
        alert("File size exceeds 2MB limit.");
      }
    }
  };

  const handlePreviewClick = (filePreview) => {
    if (filePreview) {
      const fileUrl = URL.createObjectURL(filePreview);
      window.open(fileUrl, "_blank");
    } else {
      alert("Please select a PDF file first.");
    }
  };
  return (
    <>
      <div className="table-container">
        <div>
          <ul
            class="breadcrumb"
            style={{ display: "flex", alignItems: "center" }}
          >
            <li>
              <Link to={"/dashboard"}>
                <a style={{ color: "#051F3E" }}>
                  <h4>Student</h4>
                </a>
              </Link>
            </li>
            <li>
              <a>Document Upload</a>
            </li>
          </ul>
          <h3
            style={{
              float: "inline-end",
              marginTop: "-10px",
              fontWeight: "600",
            }}
          >
            <span style={{ fontWeight: "300", color: "#646464" }}>
              Student Name:
            </span>{" "}
            {studentName}
          </h3>
          <span
            class="horizontal-line"
            style={{ background: "#F0F1F3", marginTop: "20px" }}
          ></span>
        </div>
        <form
          className="ng-untouched ng-pristine ng-invalid"
          onSubmit={formik.handleSubmit}
        >
          <div className="table-main" style={{ marginTop: "40px" }}>
            <div
              class="input-group"
              style={{
                gap: "10px",
                display: "flex",
                justifyContent: "space-around",
                marginBottom: "5px",
              }}
            >
              <div
                className="input-container-registers"
                style={{ marginBottom: "7px" }}
              >
                <div className="input-container">
                  <label className="input-label" style={{ gap: "5px" }}>
                    Photo Upload{" "}
                    <span
                      style={{
                        color: "red",
                        fontWeight: "400",
                        fontFamily: "sans-serif",
                      }}
                    >
                      *
                    </span>
                    <span
                      style={{ color: "rgb(143, 143, 143)", fontSize: "11px" }}
                    >
                      ( jpg, png, jpeg, max-size 2MB )
                    </span>
                  </label>
                  <input
                    style={{
                      padding: "3px",
                      cursor: "pointer",
                      border: `1px solid ${formik.errors.photo &&
                          !photoPreviewURL &&
                          formik.submitCount > 0
                          ? "red"
                          : "#cdcbcb"
                        }`,
                    }}
                    className={`effect-3 size`}
                    accept=".jpg ,.jpeg,.png"
                    type="file"
                    name="photo"
                    onChange={handleFileChange}
                  />
                  {photoPreviewURL && (
                    <>
                      <span
                        className="modal-clos2"
                        onClick={handleClosePhotoPreview}
                        style={{
                          position: "absolute",
                          top: "140px",
                          right: "575px",
                          cursor: "pointer",
                        }}
                      >
                        <i
                          className="bx bxs-x-circle"
                          style={{ fontSize: "20px", color: "gray" }}
                        ></i>
                      </span>
                      <img
                        src={photoPreviewURL}
                        alt="Photo Preview"
                        style={{
                          maxWidth: "90px",
                          maxHeight: "100px",
                          borderRadius: "5px",
                          margin: "-70px 310px",
                          border: "2px solid #c9c5c5",
                          padding: "1px",
                          objectFit: "fill",
                        }}
                      />
                    </>
                  )}
                  {formik.errors.photo &&
                    formik.submitCount > 0 &&
                    !photoPreviewURL && (
                      <div
                        className="text-danger"
                        style={{
                          color: "red",
                          fontSize: "12px",
                          marginBottom: "-10px",
                          marginTop: "1px",
                        }}
                      >
                        {formik.errors.photo}
                      </div>
                    )}
                  {photoName && (
                    <div>
                      <p
                        style={{
                          marginTop: "40px",
                          marginLeft: "10px",
                          color: "green",
                        }}
                      >
                        {photoName}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div
                className="input-container-registers"
                style={{ marginBottom: "px" }}
              >
                <div className="input-container">
                  <label className="input-label" style={{ gap: "5px" }}>
                    Aadharcard Upload{" "}
                    <span
                      style={{ color: "rgb(143, 143, 143)", fontSize: "11px" }}
                    >
                      {" "}
                      ( jpg, png, jpeg, max-size 2MP ){" "}
                    </span>
                  </label>
                  <input
                    style={{
                      padding: "3px",
                      cursor: "pointer",
                      border: `1px solid ${formik.errors.adharcardPhoto && formik.submitCount > 0
                          ? "red"
                          : "#cdcbcb"
                        }`,
                    }}
                    className={`effect-3 size`}
                    accept=".jpg ,.jpeg,.png"
                    type="file"
                    name="adharcardPhoto"
                    onChange={handleFileChange}
                  />
                  {aadharPreviewURL && (
                    <>
                      <span
                        className="modal-clos2"
                        onClick={handleCloseAadharPreview}
                        style={{
                          position: "absolute",
                          top: "140px",
                          right: "53px",
                          cursor: "pointer",
                        }}
                      >
                        <i
                          className="bx bxs-x-circle"
                          style={{ fontSize: "20px", color: "gray" }}
                        ></i>
                      </span>
                      <img
                        src={aadharPreviewURL}
                        alt="Aadhar Preview"
                        style={{
                          maxWidth: "90px",
                          maxHeight: "100px",
                          borderRadius: "5px",
                          margin: "-70px 310px -20px",
                          border: "2px solid #c9c5c5",
                          padding: "1px",
                          objectFit: "fill",
                        }}
                      />
                    </>
                  )}
                  {aadarName && (
                    <div>
                      <p
                        style={{
                          marginTop: "-10px",
                          marginLeft: "10px",
                          color: "green",
                        }}
                      >
                        {aadarName}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div
              class="input-group"
              style={{ gap: "10px", justifyContent: "space-around" }}
            >
              <div
                class="input-container-registers"
                style={{ marginBottom: "5px" }}
              >
                <div class="input-container">
                  <label class="input-label">
                    Existing Transfer Certificate No
                  </label>
                  <input
                    style={{
                      border: `1px solid ${formik.touched.oldCertificate &&
                          formik.errors.oldCertificate
                          ? "red"
                          : "#cdcbcb"
                        }`,
                    }}
                    className={`effect-3 size ${formik.touched.oldCertificate &&
                        formik.errors.oldCertificate
                        ? "is-invalid"
                        : ""
                      }`}
                    type="text"
                    name="oldCertificate"
                    onChange={handleInputChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.oldCertificate}
                  />
                  {formik.touched.oldCertificate &&
                    formik.errors.oldCertificate ? (
                    <div
                      className="text-danger"
                      style={{
                        color: "red",
                        fontSize: "12px",
                        marginBottom: "-10px",
                        marginTop: "1px",
                      }}
                    >
                      {formik.errors.oldCertificate}
                    </div>
                  ) : null}
                </div>
              </div>
              <div className="input-container-registers">
                <div className="input-container">
                  <label className="input-label" style={{ gap: "5px" }}>
                    Existing Transfer Certificate Upload{" "}
                    <span
                      style={{ color: "rgb(143, 143, 143)", fontSize: "11px" }}
                    >
                      {" "}
                      (pdf size-2MB){" "}
                    </span>{" "}
                  </label>
                  <input
                    style={{
                      padding: "3px",
                      border: `1px solid ${formik.touched.certificatephoto &&
                          formik.errors.certificatephoto
                          ? "red"
                          : "#cdcbcb"
                        }`,
                    }}
                    className={`effect-3 size ${formik.touched.certificatephoto &&
                        formik.errors.certificatephoto
                        ? "is-invalid"
                        : ""
                      }`}
                    type="file"
                    name="certificatephoto"
                    accept="application/pdf"
                    onChange={(event) => {
                      handleFilePreview(
                        event,
                        setCertificatePhotoPreview,
                        setTcCertificate
                      );
                      handleFileChange(event);
                    }}
                    onBlur={formik.handleBlur}
                  />

                  {formik.touched.certificatephoto &&
                    formik.errors.certificatephoto ? (
                    <div
                      className="text-danger"
                      style={{
                        color: "red",
                        fontSize: "12px",
                        marginBottom: "-10px",
                        marginTop: "1px",
                      }}
                    >
                      {formik.errors.certificatephoto}
                    </div>
                  ) : null}

                  {certificatePhotoPreview && (
                    <>
                      {tcCertificate ? (
                        <a
                          style={{
                            marginLeft: "310px",
                            marginTop: "-23px",
                            marginBottom: "5px",
                            background: "none ",
                            textDecoration: "underline",
                            color: "blue",
                            display: "flex",
                            alignItems: "center",
                            textDecorationLine: "none",
                            gap: "5px",
                            fontSize: "13px",
                          }}
                          href={tcCertificate}
                          target="_blank"
                        >
                          <i className="fa fa-eye"></i>
                          <span
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "5px",
                            }}
                          >
                            {" "}
                            Preview
                          </span>
                        </a>
                      ) : (
                        <button
                          style={{
                            marginLeft: "290px",
                            marginTop: "-32px",
                            background: "none ",
                            textDecoration: "underline",
                            color: "blue",
                            display: "flex",
                            alignItems: "center",
                            textDecorationLine: "none",
                            gap: "5px",
                          }}
                          onClick={() =>
                            handlePreviewClick(certificatePhotoPreview)
                          }
                        >
                          <i className="fa fa-eye"></i>
                          <span
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "5px",
                            }}
                          >
                            {" "}
                            Preview
                          </span>
                        </button>
                      )}
                    </>
                  )}
                  {tcName && (
                    <div>
                      <p style={{ marginLeft: "10px", color: "green" }}>
                        {tcName}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div
              class="input-group"
              style={{ gap: "10px", justifyContent: "space-around" }}
            >
              <div
                class="input-container-registers"
                style={{ marginBottom: "5px" }}
              >
                <div class="input-container">
                  <label class="input-label" style={{ gap: "5px" }}>
                    Birth Certificate No{" "}
                    <span
                      style={{
                        color: "red",
                        fontWeight: "400",
                        fontFamily: "sans-serif",
                      }}
                    >
                      *
                    </span>
                  </label>
                  <input
                    style={{
                      border: `1px solid ${formik.touched.birthNo && formik.errors.birthNo
                          ? "red"
                          : "#cdcbcb"
                        }`,
                    }}
                    className={`effect-3 size ${formik.touched.birthNo && formik.errors.birthNo
                        ? "is-invalid"
                        : ""
                      }`}
                    type="text"
                    name="birthNo"
                    onChange={handleInputChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.birthNo}
                  />
                  {formik.touched.birthNo && formik.errors.birthNo ? (
                    <div
                      className="text-danger"
                      style={{
                        color: "red",
                        fontSize: "12px",
                        marginBottom: "-10px",
                        marginTop: "1px",
                      }}
                    >
                      {formik.errors.birthNo}
                    </div>
                  ) : null}
                </div>
              </div>
              <div className="input-container-registers">
                <div className="input-container">
                  <label className="input-label" style={{ gap: "5px" }}>
                    Birth Certificate Upload{" "}
                    <span
                      style={{
                        color: "red",
                        fontWeight: "400",
                        fontFamily: "sans-serif",
                      }}
                    >
                      *
                    </span>
                    <span
                      style={{ color: "rgb(143, 143, 143)", fontSize: "11px" }}
                    >
                      {" "}
                      (pdf size-2MB){" "}
                    </span>{" "}
                  </label>
                  <input
                    style={{
                      padding: "3px",
                      border: `1px solid ${formik.errors.birthcertificate &&
                          formik.submitCount > 0 &&
                          !birthCertificatePreview
                          ? "red"
                          : "#cdcbcb"
                        }`,
                    }}
                    className={`effect-3 size ${formik.touched.birthcertificate &&
                        formik.errors.birthcertificate
                        ? "is-invalid"
                        : ""
                      }`}
                    type="file"
                    name="birthcertificate"
                    accept="application/pdf"
                    onChange={(event) => {
                      handleFilePreview(
                        event,
                        setBirthCertificatePreview,
                        setBirthCertificate
                      );
                      handleFileChange(event);
                      formik.setFieldTouched("birthcertificate", true);
                      if (event.currentTarget.files.length > 0) {
                        formik.setFieldValue(
                          "birthcertificate",
                          event.currentTarget.files[0]
                        );
                      } else {
                        formik.setFieldValue("birthcertificate", null);
                      }
                    }}
                    onBlur={formik.handleBlur}
                  />
                  {formik.errors.birthcertificate &&
                    formik.submitCount > 0 &&
                    !birthCertificatePreview && (
                      <div
                        className="text-danger"
                        style={{
                          color: "red",
                          fontSize: "12px",
                          marginBottom: "-10px",
                          marginTop: "1px",
                        }}
                      >
                        {formik.errors.birthcertificate}
                      </div>
                    )}

                  {birthCertificatePreview && (
                    <>
                      {birthCertificate ? (
                        <a
                          style={{
                            marginLeft: "310px",
                            marginTop: "-23px",
                            marginBottom: "5px",
                            background: "none ",
                            textDecoration: "underline",
                            color: "blue",
                            display: "flex",
                            alignItems: "center",
                            textDecorationLine: "none",
                            gap: "5px",
                            fontSize: "13px",
                          }}
                          href={birthCertificate}
                          target="_blank"
                        >
                          <i className="fa fa-eye"></i>
                          <span
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "5px",
                            }}
                          >
                            {" "}
                            Preview
                          </span>
                        </a>
                      ) : (
                        <button
                          style={{
                            marginLeft: "300px",
                            marginTop: "-32px",
                            background: "none ",
                            textDecoration: "underline",
                            color: "blue",
                            display: "flex",
                            alignItems: "center",
                            textDecorationLine: "none",
                            gap: "5px",
                          }}
                          onClick={() =>
                            handlePreviewClick(birthCertificatePreview)
                          }
                        >
                          <i className="fa fa-eye"></i>
                          <span
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "5px",
                            }}
                          >
                            {" "}
                            Preview
                          </span>
                        </button>
                      )}
                    </>
                  )}
                  {birthName && (
                    <div>
                      <p style={{ marginLeft: "10px", color: "green" }}>
                        {birthName}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div
              class="input-group"
              style={{ gap: "10px", justifyContent: "space-around" }}
            >
              <div
                class="input-container-registers"
                style={{ marginBottom: "5px" }}
              >
                <div class="input-container">
                  <label class="input-label" style={{ gap: "5px" }}>
                    Community Certificate No{" "}
                    <span
                      style={{
                        color: "red",
                        fontWeight: "400",
                        fontFamily: "sans-serif",
                      }}
                    >
                      *
                    </span>
                  </label>
                  <input
                    style={{
                      border: `1px solid ${formik.touched.communityNo && formik.errors.communityNo
                          ? "red"
                          : "#cdcbcb"
                        }`,
                    }}
                    className={`effect-3 size ${formik.touched.communityNo && formik.errors.communityNo
                        ? "is-invalid"
                        : ""
                      }`}
                    type="text"
                    name="communityNo"
                    onChange={handleInputChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.communityNo}
                  />
                  {formik.touched.communityNo && formik.errors.communityNo ? (
                    <div
                      className="text-danger"
                      style={{
                        color: "red",
                        fontSize: "12px",
                        marginBottom: "-10px",
                        marginTop: "1px",
                      }}
                    >
                      {formik.errors.communityNo}
                    </div>
                  ) : null}
                </div>
              </div>
              <div className="input-container-registers">
                <div className="input-container">
                  <label className="input-label" style={{ gap: "5px" }}>
                    Community Certificate Upload{" "}
                    <span
                      style={{
                        color: "red",
                        fontWeight: "400",
                        fontFamily: "sans-serif",
                      }}
                    >
                      *
                    </span>
                    <span
                      style={{ color: "rgb(143, 143, 143)", fontSize: "11px" }}
                    >
                      {" "}
                      (pdf size-2MB){" "}
                    </span>{" "}
                  </label>
                  <input
                    style={{
                      padding: "3px",
                      border: `1px solid ${formik.errors.communityCertificate &&
                          formik.submitCount > 0 &&
                          !communityCertificatePreview
                          ? "red"
                          : "#cdcbcb"
                        }`,
                    }}
                    className={`effect-3 size ${formik.touched.communityCertificate &&
                        formik.errors.communityCertificate
                        ? "is-invalid"
                        : ""
                      }`}
                    type="file"
                    name="communityCertificate"
                    accept=".pdf"
                    onChange={(event) => {
                      handleFilePreview(
                        event,
                        setCommunityCertificatePreview,
                        setCommunityCertUrl
                      );
                      handleFileChange(event);
                      formik.setFieldTouched("communityCertificate", true);
                      if (event.currentTarget.files.length > 0) {
                        formik.setFieldValue(
                          "communityCertificate",
                          event.currentTarget.files[0]
                        );
                      } else {
                        formik.setFieldValue("communityCertificate", null);
                      }
                    }}
                    onBlur={formik.handleBlur}
                  />
                  {formik.errors.communityCertificate &&
                    formik.submitCount > 0 &&
                    !communityCertificatePreview && (
                      <div
                        className="text-danger"
                        style={{
                          color: "red",
                          fontSize: "12px",
                          marginBottom: "-10px",
                          marginTop: "1px",
                        }}
                      >
                        {formik.errors.communityCertificate}
                      </div>
                    )}

                  {communityCertificatePreview && (
                    <>
                      {communityCertUrl ? (
                        <a
                          style={{
                            marginLeft: "310px",
                            marginTop: "-23px",
                            marginBottom: "5px",
                            background: "none ",
                            textDecoration: "underline",
                            color: "blue",
                            display: "flex",
                            alignItems: "center",
                            textDecorationLine: "none",
                            gap: "5px",
                            fontSize: "13px",
                          }}
                          href={communityCertUrl}
                          target="_blank"
                        >
                          <i className="fa fa-eye"></i>
                          <span
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "5px",
                            }}
                          >
                            {" "}
                            Preview
                          </span>
                        </a>
                      ) : (
                        <button
                          style={{
                            marginLeft: "300px",
                            marginTop: "-32px",
                            background: "none ",
                            textDecoration: "underline",
                            color: "blue",
                            display: "flex",
                            alignItems: "center",
                            textDecorationLine: "none",
                            gap: "5px",
                          }}
                          onClick={() =>
                            handlePreviewClick(communityCertificatePreview)
                          }
                        >
                          <i className="fa fa-eye"></i>
                          <span
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "5px",
                            }}
                          >
                            {" "}
                            Preview
                          </span>
                        </button>
                      )}
                    </>
                  )}
                  {commuName && (
                    <div>
                      <p style={{ marginLeft: "10px", color: "green" }}>
                        {commuName}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div
            class="btn-style-registration"
            style={{ gap: "10px", marginBottom: "12px" }}
          >
            <button
              type="button"
              class="cancel-button"
              onClick={() => handleBack(ids)}
            >
              Back
            </button>
            <button class="custom-button" type="submit">
              Submit
            </button>
          </div>
        </form>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        style={{ fontSize: "14px" }}
      />
    </>
  );
}
