import React, { useState, useEffect } from "react";
import "./modal.css"; // Import your CSS file for modal styles
import InputWithLabel from "../InputText/InputWithLabel";
import {
  getClass,
  getDay,
  getExam,
  getNationality,
  getPeriodSlot,
  getSection,
  getStafflist,
  getState,
  getStudentlist,
  getSubject,
  getTimeTable,
} from "../../services/api";
import { getToken } from "../../services/auth";
import { toast } from "react-toastify";
import {
  firstErrorMessage,
  validateFormField,
  validateFormValues,
  sanitizeMobileInput,
  isMobileFieldName,
} from "../../utils/validators";

const toSelectOptions = (rows, labelKey = "name") =>
  (Array.isArray(rows) ? rows : []).map((row) => ({
    id: row.id ?? row.staffId ?? row.admissionNo,
    value:
      row[labelKey] ||
      row.name ||
      row.State ||
      row.state ||
      row.staffName ||
      row.studentName ||
      row.slotName ||
      row.dayName ||
      row.exam ||
      "",
  }));

const Modal = ({
  onSubmit,
  setFormData,
  formData = {},
  closeModal,
  inputData,
  propsData,
  editData,
}) => {
  const [showHTML, setShowHTML] = useState(false);
  const [dropdown, setDropdown] = useState([]);
  const [isSuccessVisible, setIsSuccessVisible] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [message, setMessage] = useState();
  const [date, setDate] = useState();

  // useEffect(() => {
  //   const handleClickOutside = (event) => {
  //     if (event.target.classList.contains("modal-overlay")) {
  //       closeModal();
  //     }
  //   };

  //   document.addEventListener("mousedown", handleClickOutside);

  //   return () => {
  //     document.removeEventListener("mousedown", handleClickOutside);
  //   };
  // }, [closeModal]);

  useEffect(() => {
    setDropdown([]);
    setShowHTML(false);

    const loadClassSectionDropdown = async () => {
      try {
        const token = getToken();
        const [classRes, sectionRes] = await Promise.all([
          getClass(0, token),
          getSection(0, token),
        ]);
        setDropdown([
          { classId: toSelectOptions(classRes) },
          { sectionId: toSelectOptions(sectionRes) },
        ]);
      } catch (err) {
        console.error("Class & Section dropdown load failed:", err);
        setDropdown([]);
      }
    };

    switch (propsData) {
      case "State":
        (async () => {
          try {
            const response = await getNationality(0, getToken());
            setDropdown(Array.isArray(response) ? response : []);
          } catch (err) {
            console.error("State dropdown load failed:", err);
            setDropdown([]);
          }
        })();
        break;
      case "City":
        (async () => {
          try {
            const response = await getState({ id: 0, nationId: 0 }, getToken());
            setDropdown(Array.isArray(response) ? response : []);
          } catch (err) {
            console.error("City dropdown load failed:", err);
            setDropdown([]);
          }
        })();
        break;
      case "Class & Section":
      case "Products":
        loadClassSectionDropdown();
        break;
      case "Class Teacher":
        (async () => {
          try {
            const token = getToken();
            const [classRes, sectionRes, staffRes] = await Promise.all([
              getClass(0, token),
              getSection(0, token),
              getStafflist("0", token),
            ]);
            const staffRows = Array.isArray(staffRes?.data) ? staffRes.data : [];
            setDropdown([
              { classId: toSelectOptions(classRes) },
              { sectionId: toSelectOptions(sectionRes) },
              { staffId: toSelectOptions(staffRows, "staffName") },
            ]);
          } catch (err) {
            console.error("Class Teacher dropdown load failed:", err);
            setDropdown([]);
          }
        })();
        break;
      case "Subject Teacher":
        let subjectTeacher = [];
        const getSubjectClass = async () => {
          try {
            const response = await getClass(0, getToken());
            const classTeacher = response.map((value, index) => ({
              id: value.id,
              value: value.name,
            }));
            subjectTeacher.push({ classId: classTeacher });
          } catch (err) {
          }
        };
        const getSubjectSection = async () => {
          try {
            const response = await getSection(0, getToken());
            const sectionTeacher = response.map((value, index) => ({
              id: value.id,
              value: value.name,
            }));
            subjectTeacher.push({ sectionId: sectionTeacher });
          } catch (err) {
          }
        };
        const getsubjectStaff = async () => {
          try {
            const response = await getStafflist("0", getToken());
            const staff = response.data.map((value, index) => ({
              id: value.staffId,
              value: value.staffName,
            }));
            subjectTeacher.push({ staffId: staff });
          } catch (err) {
          }
        };
        const getSubject1 = async () => {
          try {
            const response = await getSubject(0, getToken());
            const subject = response.map((value, index) => ({
              id: value.id,
              value: value.name,
            }));
            subjectTeacher.push({ subjectId: subject });
          } catch (err) {
          }
        };
        getSubjectClass();
        getSubjectSection();
        getsubjectStaff();
        getSubject1();
        setDropdown(subjectTeacher);
        break;
      case "Period Slot":
        const getperiod = async () => {
          try {
            const response = await getClass(0, getToken());
            const classTeachers = response.map((value, index) => ({
              id: value.id,
              value: value.name,
            }));
            setDropdown([{ classId: classTeachers }]);
          } catch (err) {
          }
        };
        getperiod();
        break;
      case "Class Time Table":
        let classSection1 = [];
        const getClassdata1 = async () => {
          try {
            const response = await getClass(0, getToken());
            const class1 = response.map((value, index) => ({
              id: value.id,
              value: value.name,
            }));
            classSection1.push({ classId: class1 });
          } catch (err) {
          }
        };
        const getSectiondata1 = async () => {
          try {
            const response = await getSection(0, getToken());
            const section = response.map((value, index) => ({
              id: value.id,
              value: value.name,
            }));
            classSection1.push({ sectionId: section });
          } catch (err) {
          }
        };
        const getSubjectTime = async () => {
          try {
            const response = await getSubject(0, getToken());
            const subject = response.map((value, index) => ({
              id: value.id,
              value: value.name,
            }));
            classSection1.push({ subjectId: subject });
          } catch (err) {
          }
        };
        const getperiodTime = async () => {
          try {
            const response = await getPeriodSlot(getToken());
            const classTeachers = response.map((value, index) => ({
              id: value.id,
              value: value.slotName,
            }));
            classSection1.push({ periodSlotId: classTeachers });
          } catch (err) {
          }
        };
        const getDays = async () => {
          try {
            const response = await getDay(getToken());
            const classTeachers = response.map((value, index) => ({
              id: value.id,
              value: value.dayName,
            }));
            classSection1.push({ dayId: classTeachers });
          } catch (err) {
          }
        };
        getperiodTime();
        getClassdata1();
        getSectiondata1();
        getSubjectTime();
        getDays();
        setDropdown(classSection1);
        break;
      case "Assignment":
        let assignment = [];
        const getClassstaff = async () => {
          try {
            const response = await getClass(0, getToken());
            const class1 = response.map((value, index) => ({
              id: value.id,
              value: value.name,
            }));
            assignment.push({ classId: class1 });
          } catch (err) {
          }
        };
        const getSectionstaff = async () => {
          try {
            const response = await getSection(0, getToken());
            const section = response.map((value, index) => ({
              id: value.id,
              value: value.name,
            }));
            assignment.push({ sectionId: section });
          } catch (err) {
          }
        };
        const getSubjectstaff = async () => {
          try {
            const response = await getSubject(0, getToken());
            const subject = response.map((value, index) => ({
              id: value.id,
              value: value.name,
            }));
            assignment.push({ subjectId: subject });
          } catch (err) {
          }
        };

        getClassstaff();
        getSectionstaff();
        getSubjectstaff();
        setDropdown(assignment);
        break;
      case "Homework":
        let homework = [];
        const getClassstaffs = async () => {
          try {
            const response = await getClass(0, getToken());
            const class1 = response.map((value, index) => ({
              id: value.id,
              value: value.name,
            }));
            homework.push({ classId: class1 });
          } catch (err) {
          }
        };
        const getSectionstaffs = async () => {
          try {
            const response = await getSection(0, getToken());
            const section = response.map((value, index) => ({
              id: value.id,
              value: value.name,
            }));
            homework.push({ sectionId: section });
          } catch (err) {
          }
        };
        const getSubjectstaffs = async () => {
          try {
            const response = await getSubject(0, getToken());
            const subject = response.map((value, index) => ({
              id: value.id,
              value: value.name,
            }));
            homework.push({ subjectId: subject });
          } catch (err) {
          }
        };
        const getStaffLists = async () => {
          try {
            const response = await getStafflist("0", getToken());
            const staff = response.data.map((value, index) => ({
              id: value.staffId,
              value: value.staffName,
            }));
            homework.push({ staffId: staff });
          } catch (err) {
          }
        };
        getClassstaffs();
        getSectionstaffs();
        getSubjectstaffs();
        getStaffLists();
        setDropdown(homework);
        break;
      case "Exam Type":
        let exam = [];
        const getClassstaffExam = async () => {
          try {
            const response = await getClass(0, getToken());
            const class1 = response.map((value, index) => ({
              id: value.id,
              value: value.name,
            }));
            exam.push({ classId: class1 });
          } catch (err) {
          }
        };
        const getSectionstaffExam = async () => {
          try {
            const response = await getSection(0, getToken());
            const section = response.map((value, index) => ({
              id: value.id,
              value: value.name,
            }));
            exam.push({ sectionId: section });
          } catch (err) {
          }
        };

        getClassstaffExam();
        getSectionstaffExam();
        setDropdown(exam);
        break;
      case "Exam Portion":
        let examportion = [];
        const ClassstaffExam = async () => {
          try {
            const response = await getClass(0, getToken());
            const class1 = response.map((value, index) => ({
              id: value.id,
              value: value.name,
            }));
            examportion.push({ classId: class1 });
          } catch (err) {
          }
        };
        const SectionstaffExam = async () => {
          try {
            const response = await getSection(0, getToken());
            const section = response.map((value, index) => ({
              id: value.id,
              value: value.name,
            }));
            examportion.push({ sectionId: section });
          } catch (err) {
          }
        };
        const subjectStaff = async () => {
          try {
            const response = await getStafflist("0", getToken());
            const staff = response.data.map((value, index) => ({
              id: value.staffId,
              value: value.staffName,
            }));
            examportion.push({ staffId: staff });
          } catch (err) {
          }
        };
        const SubjectExam = async () => {
          try {
            const response = await getSubject(0, getToken());
            const subject = response.map((value, index) => ({
              id: value.id,
              value: value.name,
            }));
            examportion.push({ subjectId: subject });
          } catch (err) {
          }
        };
        const getExamstaffExam1 = async () => {
          try {
            const response = await getExam({}, getToken());
            const examName = response.data.map((value, index) => ({
              id: value.id,
              value: value.exam,
            }));
            examportion.push({ examId: examName });
          } catch (err) {
          }
        };

        getExamstaffExam1();
        ClassstaffExam();
        SectionstaffExam();
        subjectStaff();
        SubjectExam();
        setDropdown(examportion);
        break;
      case "Events":
        const getEvents = async () => {
          try {
            const response = await getClass(0, getToken());
            const classTeachers = response.map((value, index) => ({
              id: value.id,
              value: value.name,
            }));
            setDropdown([{ classId: classTeachers }]);
          } catch (err) {
          }
        };
        getEvents();
        break;
      case "Exam Report List":
        let subjectreport = [];
        const getClassstaffreport = async () => {
          try {
            const response = await getClass(0, getToken());
            const class1 = response.map((value, index) => ({
              id: value.id,
              value: value.name,
            }));
            subjectreport.push({ classId: class1 });
          } catch (err) {
          }
        };
        const getSectionstaffeport = async () => {
          try {
            const response = await getSection(0, getToken());
            const section = response.map((value, index) => ({
              id: value.id,
              value: value.name,
            }));
            subjectreport.push({ sectionId: section });
          } catch (err) {
          }
        };
        const getSubjectstaffeport = async () => {
          try {
            const response = await getSubject(0, getToken());
            const subject = response.map((value, index) => ({
              id: value.id,
              value: value.name,
            }));
            subjectreport.push({ subjectId: subject });
          } catch (err) {
          }
        };
        const getExamstaffExam2 = async () => {
          try {
            const response = await getExam({}, getToken());
            const examName = response.data.map((value, index) => ({
              id: value.id,
              value: value.exam,
            }));
            subjectreport.push({ examId: examName });
          } catch (err) {
          }
        };
        const StudentsExams = async () => {
          try {
            const response = await getStudentlist({ userName: 0 }, getToken());
            const studentlist = response.data.map((value, index) => ({
              id: value.admissionNo,
              value: value.studentName,
            }));
            subjectreport.push({ studentId: studentlist });
          } catch (err) {
          }
        };
        StudentsExams();
        getExamstaffExam2();
        getClassstaffreport();
        getSectionstaffeport();
        getSubjectstaffeport();
        setDropdown(subjectreport);
        break;
      default:
        setDropdown("");
    }
    const timer = setTimeout(() => {
      setShowHTML(true);
    }, 500);

    return () => clearTimeout(timer);
  }, [propsData]);

  const handleInputChange = async (e) => {
    let { name, value, type } = e.target;

    if (type !== "file" && typeof value === "string") {
      value = value.replace(/['"]/g, " ");
    }

    if (type !== "file" && isMobileFieldName(name)) {
      value = sanitizeMobileInput(value);
    }

    let errorMessage = "";
    const fieldMeta = (inputData || []).find((f) => f.name === name);
    const label = fieldMeta?.label || name;

    if (type === "file") {
      errorMessage = validateFormField(name, e.target.files?.[0], {
        required: true,
        label,
      });
    } else {
      errorMessage = validateFormField(name, value, { required: true, label });
      // While typing mobile, only show format error once 10 digits entered
      if (isMobileFieldName(name) && String(value).length > 0 && String(value).length < 10) {
        errorMessage = "";
      }
    }

    if (name === "fromDate" || name === "startDate") {
      setDate(value);
    }

    setValidationErrors({ ...validationErrors, [name]: errorMessage });

    setFormData((prevInputValue) => ({
      ...prevInputValue,
      [name]: type === "file" ? e.target.files[0] : value,
    }));
  };

  const handleFormSubmit = (e) => {
    if (e?.preventDefault) e.preventDefault();
    const fields = (inputData || []).map((f) => ({
      name: f.name,
      label: f.label,
      required: true,
    }));
    const errors = validateFormValues(fields, formData || {});
    setValidationErrors(errors);
    if (Object.keys(errors).length) {
      toast.error(firstErrorMessage(errors));
      return;
    }
    if (typeof onSubmit === "function") onSubmit(e);
  };


  if (!Array.isArray(inputData)) return null;

  if (editData) {
    inputData.forEach((obj1) => {
      const fromForm = formData?.[obj1.name];
      if (fromForm !== undefined && fromForm !== null) {
        obj1.value = fromForm;
      }
    });
  } else {
    inputData.forEach((value) => {
      delete value.value;
    });
  }

  const fieldValue = (name) => {
    const v = formData?.[name];
    return v === undefined || v === null ? "" : v;
  };

  return (
    <>
      {showHTML ? (
        <div className="container">
          <div className="modal-overlay">
            <div className="modal-content">
              <span className="modal-close" onClick={closeModal}>
                {/* <i class='bx bx-x'></i> */}
                <i
                  class="bx bxs-x-circle"
                  style={{ fontSize: "25px", color: "gray" }}
                ></i>
              </span>
              <div className="app-container" style={{ marginRight: "-7px" }}>
                <h1
                  className="header-model"
                  style={{ color: "rgb(5, 31, 62)", fontWeight: "400",marginTop:"-10px",marginBottom:"10px" }}
                >
                  {editData ? `Edit ${propsData}` : `Create ${propsData}`}
                </h1>
                {/* {isSuccessVisible && <h1 className="success-message">{message}</h1>} */}
                <div className="modal-scroll-content">
                  {inputData.map((data, index) => (
                    <React.Fragment key={`${data.name}-${index}`}>
                      <InputWithLabel
                        type={data.type}
                        label={data.label}
                        name={data.name}
                        value={fieldValue(data.name)}
                        onChange={handleInputChange}
                        data={dropdown}
                        propsData={propsData}
                        dateValue={date}
                        required
                      />
                      {validationErrors[data.name] && (
                        <p className="error-messages" style={{ color: "red" }}>
                          {validationErrors[data.name]}
                        </p>
                      )}
                    </React.Fragment>
                  ))}
                </div>

                <div className="btn-style" style={{gap:'10px'}}>
                  <button type="button" className="custom-button" onClick={handleFormSubmit}>
                    {editData ? "Update" : "Submit"}
                  </button>
                  <button type="button" className="cancel-button" onClick={closeModal}>
                    Cancel
                  </button>
                  &nbsp;&nbsp;
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default Modal;
