import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { TOKEN_KEY, getUserData } from "../../services/auth";
import { useFormik } from "formik";
import { ToastContainer, toast } from "react-toastify";
import {
  createStudentAttendance,
  getClass,
  getSection,
  getStudentlist,
} from "../../services/api";

const Attendence = () => {
  const role = getUserData("role");
  const location = useLocation();
  const [dropDown, setDropDown] = useState({
    studentId: [],
    classId: [],
    sectionId: [],
    subjectId: [],
    examId: [],
  });
  const [selectedClassId, setSelectedClassId] = useState(0);
  const [selectedSectionId, setSelectedSectionId] = useState(0);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "classId") {
      setSelectedClassId(value);
      formik.setFieldValue("classId", value);
      console.log(value);
    } else if (name === "sectionId") {
      setSelectedSectionId(value);
      formik.setFieldValue("sectionId", value);
    }
  };
  const formik = useFormik({
    initialValues: {
      classId: "",
      sectionId: "",
      stdAttendance: {},
    },
    onSubmit: async (values, { resetForm }) => {
      try {
        const selectedStudents = dropDown.studentId.map((data) => ({
          studentId: data.id,
          status: !!values.stdAttendance[data.id],
        }));

        const payload = {
          classId: parseInt(values.classId),
          sectionId: parseInt(values.sectionId),
          stdAttendance: selectedStudents,
        };

        console.log("Payload values:", payload);
        const response = await createStudentAttendance(payload, TOKEN_KEY);
        console.log("Attendance creation response:", response);
        if (response.status === "Error") {
          toast.error(response.message);
        } else if (response.status === "success") {
          toast.success(response.message);
          resetForm();
        }
      } catch (error) {
        console.error("Error creating student attendance:", error);
      }
    },
  });

  useEffect(() => {
    const getDropdownData = async (funcName, id, name) => {
      try {
        const response = await funcName(id, TOKEN_KEY);
        console.log(`${name} dropdown:`, response);
        const data = response.map((value, index) => ({
          id: value.id,
          value: value.name,
        }));
        setDropDown((prevData) => ({
          ...prevData,
          [name]: data,
        }));
      } catch (err) {
        console.log(err);
      }
    };
    const getStudent = async () => {
      try {
        const response = await getStudentlist(
          {
            userName: 0,
            classId: selectedClassId,
            sectionId: selectedSectionId,
          },
          TOKEN_KEY
        );
        console.log(response);
        const studentlist = response.data.map((value, index) => ({
          id: value.admissionNo,
          value: value.studentName,
        }));
        setDropDown((prevData) => ({
          ...prevData,
          studentId: studentlist,
        }));
      } catch (err) {
        console.log(err);
      }
    };
    const getClassdata = async () => {
      try {
        const response = await getClass(0, TOKEN_KEY);
        const class1 = response.map((value, index) => ({
          id: value.id,
          value: value.name,
        }));
        setDropDown((prevData) => ({
          ...prevData,
          classId: class1,
        }));
      } catch (err) {
        console.log(err);
      }
    };
    getStudent();
    getClassdata();
    getDropdownData(getSection, 0, "sectionId");
  }, [selectedClassId, selectedSectionId]);

  return (
    <div>
      {location.pathname === "/attendence" ? (
        <div>
          {/* <h3>{role} Attendence</h3> */}
          <ul class="breadcrumb">
            <li>
              <Link to={"/staffview"}>
                <a style={{ color: "#646464" }}>Attendence</a>
              </Link>
            </li>
            <li>
              <a>{role} Attendence</a>
            </li>
          </ul>
        </div>
      ) : (
        <>
          <div>
            {/* <h3>Student Attendence</h3> */}
            <ul class="breadcrumb" style={{ display: "flex" }}>
              <li>
                <Link to={"/studentattendence"}>
                  <a style={{ color: "#051F3E" }}>
                    <h4>Student</h4>
                  </a>
                </Link>
              </li>
              <li>
                <a>Student Attendance</a>
              </li>
            </ul>
          </div>
        </>
      )}
      <form onSubmit={formik.handleSubmit}>
        <div className="table-container">
          <h3
            style={{
              color: "#051F3E",
              marginBottom: "20px",
            }}
          >
            Student Attendance
          </h3>
          <div className="input-container-registers">
            <div className="input-group" style={{ marginBottom: "5px" }}>
              <label className="input-label" style={{ fontWeight: "400" }}>
                Class
              </label>
              <select
                style={{ width: "200px" }}
                id="classId"
                name="classId"
                className="effect-1"
                onChange={handleInputChange}
                value={selectedClassId}
              >
                <option value="">Select Class</option>
                {dropDown.classId.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.value}
                  </option>
                ))}
              </select>
            </div>
            <div className="input-group">
              <label className="input-label" style={{ fontWeight: "400" }}>
                Section
              </label>
              <select
                style={{ width: "200px" }}
                id="sectionId"
                name="sectionId"
                className="effect-1"
                onChange={handleInputChange}
                value={selectedSectionId}
              >
                <option value="">Select Section</option>
                {dropDown.sectionId.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.value}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {selectedClassId && selectedSectionId ? (
            <div className="table-responsive">
              <table className="table table-striped table-hover">
                <thead>
                  <tr>
                    <th style={{ textAlign: "center" }}>NO</th>
                    <th>STUDENT NAME</th>
                    <th style={{ textAlign: "center" }}>PRESENT</th>
                    <th style={{ textAlign: "center" }}>ABSENT</th>
                  </tr>
                </thead>
                <tbody>
                  {dropDown.studentId.map((data, index) => (
                    <tr key={data.id}>
                      <td style={{ textAlign: "center", color: "#051F3E",fontSize:'12px' }}>
                        {index + 1}
                      </td>
                      <td>
                        <input
                          type="text"
                          id={data.id}
                          name={data.id}
                          value={data.value}
                          disabled
                          style={{ border: "0", color: "#051F3E",fontSize:'12px' }}
                          className={`${
                            formik.touched.username && formik.errors.username
                              ? "is-invalid"
                              : ""
                          }`}
                        />
                        {formik.touched.username && formik.errors.username ? (
                          <div className="text-danger">
                            {formik.errors.username}
                          </div>
                        ) : null}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <input
                          type="checkbox"
                          id={`present-${data.id}`}
                          name={`attendance-${data.id}`}
                          checked={
                            formik.values.stdAttendance[data.id] === true
                          }
                          onChange={() => {
                            const updatedAttendance = {
                              ...formik.values.stdAttendance,
                              [data.id]: true,
                            };
                            formik.setFieldValue(
                              "stdAttendance",
                              updatedAttendance
                            );
                          }}
                        />
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <input
                          type="checkbox"
                          id={`absent-${data.id}`}
                          name={`attendance-${data.id}`}
                          checked={
                            formik.values.stdAttendance[data.id] === false
                          }
                          onChange={() => {
                            const updatedAttendance = {
                              ...formik.values.stdAttendance,
                              [data.id]: false,
                            };
                            formik.setFieldValue(
                              "stdAttendance",
                              updatedAttendance
                            );
                          }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div
                className="btn-style-registration"
                style={{ marginTop: "20px" }}
              >
                <button className="cancel-button" type="button">
                  Cancel
                </button>
                &nbsp;&nbsp;
                <button className="custom-button" type="submit">
                  Submit
                </button>
              </div>
            </div>
          ) : (
            <>
              <table className="table">
                <thead>
                  <tr>
                    <th colSpan="11" style={{ textAlign: "center" }}>
                      No student data available for the selected class and
                      section.
                    </th>
                  </tr>
                </thead>
              </table>
            </>
          )}
        </div>
      </form>
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
    </div>
  );
};

export default Attendence;
