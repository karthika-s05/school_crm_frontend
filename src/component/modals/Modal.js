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
import { STAFF_KEY, TOKEN_KEY } from "../../services/auth";
import { examportion, homework, transport } from "../../assets/constant";
import { splitArrayIntoPairs } from "../../services/common";

const Modal = ({
  onSubmit,
  setFormData,
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
    switch (propsData) {
      case "State":
        const getData = async () => {
          try {
            const response = await getNationality(0, TOKEN_KEY);
            console.log("dropdown ", response);
            setDropdown(response);
          } catch (err) {
            console.log(err);
          }
        };
        getData();
        break;
      case "City":
        const getCitydata = async () => {
          try {
            const response = await getState({ id: 0, nationId: 0 }, TOKEN_KEY);
            console.log("dropdown ", response);
            setDropdown(response);
          } catch (err) {
            console.log(err);
          }
        };
        getCitydata();
        break;
      case "Class & Section":
      case "Products":
        let classSection = [];
        const getClassdata = async () => {
          try {
            const response = await getClass(0, TOKEN_KEY);
            const class1 = response.map((value, index) => ({
              id: value.id,
              value: value.name,
            }));
            classSection.push({ classId: class1 });
          } catch (err) {
            console.log(err);
          }
        };
        const getSectiondata = async () => {
          try {
            const response = await getSection(0, TOKEN_KEY);
            const section = response.map((value, index) => ({
              id: value.id,
              value: value.name,
            }));
            classSection.push({ sectionId: section });
          } catch (err) {
            console.log(err);
          }
        };
        getClassdata();
        getSectiondata();
        setDropdown(classSection);
        break;
      case "Class Teacher":
        let classTeacher = [];
        const getClassdat = async () => {
          try {
            const response = await getClass(0, TOKEN_KEY);
            const classTeachers = response.map((value, index) => ({
              id: value.id,
              value: value.name,
            }));
            classTeacher.push({ classId: classTeachers });
          } catch (err) {
            console.log(err);
          }
        };
        const getSectiondat = async () => {
          try {
            const response = await getSection(0, TOKEN_KEY);
            const sectionTeacher = response.map((value, index) => ({
              id: value.id,
              value: value.name,
            }));
            classTeacher.push({ sectionId: sectionTeacher });
          } catch (err) {
            console.log(err);
          }
        };
        const getStaffList = async () => {
          try {
            const response = await getStafflist("0", TOKEN_KEY);
            const staff = response.data.map((value, index) => ({
              id: value.staffId,
              value: value.staffName,
            }));
            classTeacher.push({ staffId: staff });
          } catch (err) {
            console.log(err);
          }
        };
        getClassdat();
        getSectiondat();
        getStaffList();
        setDropdown(classTeacher);
        break;
      case "Subject Teacher":
        let subjectTeacher = [];
        const getSubjectClass = async () => {
          try {
            const response = await getClass(0, TOKEN_KEY);
            console.log("dropdown ", response);
            const classTeacher = response.map((value, index) => ({
              id: value.id,
              value: value.name,
            }));
            subjectTeacher.push({ classId: classTeacher });
          } catch (err) {
            console.log(err);
          }
        };
        const getSubjectSection = async () => {
          try {
            const response = await getSection(0, TOKEN_KEY);
            const sectionTeacher = response.map((value, index) => ({
              id: value.id,
              value: value.name,
            }));
            subjectTeacher.push({ sectionId: sectionTeacher });
          } catch (err) {
            console.log(err);
          }
        };
        const getsubjectStaff = async () => {
          try {
            const response = await getStafflist("0", TOKEN_KEY);
            console.log(response);
            const staff = response.data.map((value, index) => ({
              id: value.staffId,
              value: value.staffName,
            }));
            subjectTeacher.push({ staffId: staff });
          } catch (err) {
            console.log(err);
          }
        };
        const getSubject1 = async () => {
          try {
            const response = await getSubject(0, TOKEN_KEY);
            const subject = response.map((value, index) => ({
              id: value.id,
              value: value.name,
            }));
            subjectTeacher.push({ subjectId: subject });
          } catch (err) {
            console.log(err);
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
            const response = await getClass(0, TOKEN_KEY);
            const classTeachers = response.map((value, index) => ({
              id: value.id,
              value: value.name,
            }));
            console.log(classTeachers);
            setDropdown([{ classId: classTeachers }]);
          } catch (err) {
            console.log(err);
          }
        };
        getperiod();
        break;
      case "Class Time Table":
        let classSection1 = [];
        const getClassdata1 = async () => {
          try {
            const response = await getClass(0, TOKEN_KEY);
            const class1 = response.map((value, index) => ({
              id: value.id,
              value: value.name,
            }));
            classSection1.push({ classId: class1 });
          } catch (err) {
            console.log(err);
          }
        };
        const getSectiondata1 = async () => {
          try {
            const response = await getSection(0, TOKEN_KEY);
            const section = response.map((value, index) => ({
              id: value.id,
              value: value.name,
            }));
            classSection1.push({ sectionId: section });
          } catch (err) {
            console.log(err);
          }
        };
        const getSubjectTime = async () => {
          try {
            const response = await getSubject(0, TOKEN_KEY);
            const subject = response.map((value, index) => ({
              id: value.id,
              value: value.name,
            }));
            classSection1.push({ subjectId: subject });
          } catch (err) {
            console.log(err);
          }
        };
        const getperiodTime = async () => {
          try {
            const response = await getPeriodSlot(TOKEN_KEY);
            const classTeachers = response.map((value, index) => ({
              id: value.id,
              value: value.slotName,
            }));
            console.log(classTeachers);
            classSection1.push({ periodSlotId: classTeachers });
          } catch (err) {
            console.log(err);
          }
        };
        const getDays = async () => {
          try {
            const response = await getDay(TOKEN_KEY);
            console.log("One", response);
            const classTeachers = response.map((value, index) => ({
              id: value.id,
              value: value.dayName,
            }));
            classSection1.push({ dayId: classTeachers });
          } catch (err) {
            console.log(err);
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
        console.log("first123");
        let assignment = [];
        const getClassstaff = async () => {
          try {
            const response = await getClass(0, STAFF_KEY);
            console.log(response, "hello");
            const class1 = response.map((value, index) => ({
              id: value.id,
              value: value.name,
            }));
            assignment.push({ classId: class1 });
            console.log({ classId: class1 });
          } catch (err) {
            console.log(err);
          }
        };
        const getSectionstaff = async () => {
          try {
            const response = await getSection(0, STAFF_KEY);
            const section = response.map((value, index) => ({
              id: value.id,
              value: value.name,
            }));
            assignment.push({ sectionId: section });
          } catch (err) {
            console.log(err);
          }
        };
        const getSubjectstaff = async () => {
          try {
            const response = await getSubject(0, STAFF_KEY);
            const subject = response.map((value, index) => ({
              id: value.id,
              value: value.name,
            }));
            assignment.push({ subjectId: subject });
          } catch (err) {
            console.log(err);
          }
        };

        getClassstaff();
        getSectionstaff();
        getSubjectstaff();
        setDropdown(assignment);
        break;
      case "Homework":
        console.log("first123");
        let homework = [];
        const getClassstaffs = async () => {
          try {
            const response = await getClass(0, STAFF_KEY);
            console.log(response, "hello");
            const class1 = response.map((value, index) => ({
              id: value.id,
              value: value.name,
            }));
            homework.push({ classId: class1 });
            console.log({ classId: class1 });
          } catch (err) {
            console.log(err);
          }
        };
        const getSectionstaffs = async () => {
          try {
            const response = await getSection(0, STAFF_KEY);
            const section = response.map((value, index) => ({
              id: value.id,
              value: value.name,
            }));
            homework.push({ sectionId: section });
          } catch (err) {
            console.log(err);
          }
        };
        const getSubjectstaffs = async () => {
          try {
            const response = await getSubject(0, STAFF_KEY);
            const subject = response.map((value, index) => ({
              id: value.id,
              value: value.name,
            }));
            homework.push({ subjectId: subject });
          } catch (err) {
            console.log(err);
          }
        };
        const getStaffLists = async () => {
          try {
            const response = await getStafflist("0", TOKEN_KEY);
            const staff = response.data.map((value, index) => ({
              id: value.staffId,
              value: value.staffName,
            }));
            homework.push({ staffId: staff });
          } catch (err) {
            console.log(err);
          }
        };
        getClassstaffs();
        getSectionstaffs();
        getSubjectstaffs();
        getStaffLists();
        setDropdown(homework);
        break;
      case "Exam Type":
        console.log("first123");
        let exam = [];
        const getClassstaffExam = async () => {
          try {
            const response = await getClass(0, STAFF_KEY);
            console.log(response, "hello");
            const class1 = response.map((value, index) => ({
              id: value.id,
              value: value.name,
            }));
            exam.push({ classId: class1 });
            console.log({ classId: class1 });
          } catch (err) {
            console.log(err);
          }
        };
        const getSectionstaffExam = async () => {
          try {
            const response = await getSection(0, STAFF_KEY);
            const section = response.map((value, index) => ({
              id: value.id,
              value: value.name,
            }));
            exam.push({ sectionId: section });
          } catch (err) {
            console.log(err);
          }
        };

        getClassstaffExam();
        getSectionstaffExam();
        setDropdown(exam);
        break;
      case "Exam Portion":
        console.log("first123");
        let examportion = [];
        const ClassstaffExam = async () => {
          try {
            const response = await getClass(0, STAFF_KEY);
            console.log(response, "hello");
            const class1 = response.map((value, index) => ({
              id: value.id,
              value: value.name,
            }));
            examportion.push({ classId: class1 });
            console.log({ classId: class1 });
          } catch (err) {
            console.log(err);
          }
        };
        const SectionstaffExam = async () => {
          try {
            const response = await getSection(0, STAFF_KEY);
            const section = response.map((value, index) => ({
              id: value.id,
              value: value.name,
            }));
            examportion.push({ sectionId: section });
          } catch (err) {
            console.log(err);
          }
        };
        const subjectStaff = async () => {
          try {
            const response = await getStafflist("0", STAFF_KEY);
            console.log(response);
            const staff = response.data.map((value, index) => ({
              id: value.staffId,
              value: value.staffName,
            }));
            examportion.push({ staffId: staff });
          } catch (err) {
            console.log(err);
          }
        };
        const SubjectExam = async () => {
          try {
            const response = await getSubject(0, STAFF_KEY);
            const subject = response.map((value, index) => ({
              id: value.id,
              value: value.name,
            }));
            examportion.push({ subjectId: subject });
          } catch (err) {
            console.log(err);
          }
        };
        const getExamstaffExam1 = async () => {
          try {
            const response = await getExam({}, STAFF_KEY);
            const examName = response.data.map((value, index) => ({
              id: value.id,
              value: value.exam,
            }));
            console.log("examName", examName);
            examportion.push({ examId: examName });
          } catch (err) {
            console.log(err);
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
            const response = await getClass(0, TOKEN_KEY);
            const classTeachers = response.map((value, index) => ({
              id: value.id,
              value: value.name,
            }));
            console.log(classTeachers);
            setDropdown([{ classId: classTeachers }]);
          } catch (err) {
            console.log(err);
          }
        };
        getEvents();
        break;
      case "Exam Report List":
        console.log("first123");
        let subjectreport = [];
        const getClassstaffreport = async () => {
          try {
            const response = await getClass(0, STAFF_KEY);
            console.log(response, "hello");
            const class1 = response.map((value, index) => ({
              id: value.id,
              value: value.name,
            }));
            subjectreport.push({ classId: class1 });
            console.log({ classId: class1 });
          } catch (err) {
            console.log(err);
          }
        };
        const getSectionstaffeport = async () => {
          try {
            const response = await getSection(0, STAFF_KEY);
            const section = response.map((value, index) => ({
              id: value.id,
              value: value.name,
            }));
            subjectreport.push({ sectionId: section });
          } catch (err) {
            console.log(err);
          }
        };
        const getSubjectstaffeport = async () => {
          try {
            const response = await getSubject(0, STAFF_KEY);
            const subject = response.map((value, index) => ({
              id: value.id,
              value: value.name,
            }));
            subjectreport.push({ subjectId: subject });
          } catch (err) {
            console.log(err);
          }
        };
        const getExamstaffExam2 = async () => {
          try {
            const response = await getExam({}, STAFF_KEY);
            const examName = response.data.map((value, index) => ({
              id: value.id,
              value: value.exam,
            }));
            console.log("examName", examName);
            subjectreport.push({ examId: examName });
          } catch (err) {
            console.log(err);
          }
        };
        const StudentsExams = async () => {
          try {
            const response = await getStudentlist({ userName: 0 }, TOKEN_KEY);
            console.log(response);
            const studentlist = response.data.map((value, index) => ({
              id: value.admissionNo,
              value: value.studentName,
            }));
            subjectreport.push({ studentId: studentlist });
            console.log({ studentId: studentlist });
          } catch (err) {
            console.log(err);
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
        console.log("No matching data scenario");
    }
    const timer = setTimeout(() => {
      setShowHTML(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleInputChange = async (e) => {
    let { name, value, type } = e.target;
  
    // Trim leading and trailing spaces
    value = value.trim();
  
    console.log("test", value);
  
    let errorMessage = "";
  
    // Replace single quotes and double quotes with spaces
    value = value.replace(/['"]/g, " ");
  
    console.log("out", value);
  
    if (value === "") {
      errorMessage = `${name} is required.`;
    }
  
    if (name === "fromDate" || name === "startDate") {
      setDate(value);
      console.log("jsgaafgkjasdgut", value);
    }
  
    setValidationErrors({ ...validationErrors, [name]: errorMessage });
  
    console.log("insert", value);
  
    setFormData((prevInputValue) => ({
      ...prevInputValue,
      [name]: type === "file" ? e.target.files[0] : value,
    }));
  };
  
  console.log(closeModal,"123")

  console.log("formData", inputData);
  console.log("formDataEdit", editData);
  console.log("drop", dropdown);

  if (editData) {
    console.log("edit", editData);
    inputData.forEach(async (obj1) => {
      const matchingObj2 = await editData.find(
        (obj2) => obj2.name === obj1.name
      );
      if (matchingObj2) {
        obj1.value = matchingObj2.data;
      }
    });
  } else {
    console.log("firsmmjjj");
    inputData.map((value, index) => {
      delete value.value;
    });
  }

  console.log("data", dropdown);
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
                    <>
                      <InputWithLabel
                        key={index}
                        type={data.type}
                        label={data.label}
                        name={data.name}
                        value={data.value}
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
                    </>
                  ))}
                </div>

                <div className="btn-style" style={{gap:'10px'}}>
                  <button class="custom-button" onClick={onSubmit}>
                    {editData ? "Update" : "Submit"}
                  </button>
                  <button class="cancel-button" onClick={closeModal}>
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
