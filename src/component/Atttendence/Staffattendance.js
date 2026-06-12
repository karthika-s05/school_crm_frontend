import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useFormik } from "formik";
import { createStaffAttendance, getStafflist } from "../../services/api";
import { TOKEN_KEY } from "../../services/auth";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loader from "../loader/Loader";

export default function Staffattendance() {
  const [loading, setLoading] = useState(false);
  const [dropDown, setDropDown] = useState({
    staffId: [],
    studentId: [],
    classId: [],
    sectionId: [],
    subjectId: [],
    examId: [],
  });
  const formik = useFormik({
    initialValues: {
      classId: "",
      sectionId: "",
      stdAttendance: {},
    },
    onSubmit: async (values, { resetForm }) => {
      const selectedStaff = dropDown.staffId.map((data) => ({
        staffId: data.id,
        status: !!values.stdAttendance[data.id],
      }));
      try {
        const payload = {
          stffAttendance: selectedStaff,
        };
        console.log("Payload values:", payload);
        const response = await createStaffAttendance(payload, TOKEN_KEY);
        console.log("Attendance creation response:", response);
        if (response.status === "Error") {
          toast.error(response.message);
        } else if (response.status === "success") {
          toast.success(response.message);
          resetForm();
        }
      } catch (error) {
        console.error("Error creating staff attendance:", error);
      }

      //   try {
      //     const selectedStudents = dropDown.studentId.map((data) => ({
      //       studentId: data.id,
      //       status: !!values.stdAttendance[data.id],
      //     }));
      //     const payload = {
      //       classId: parseInt(values.classId),
      //       sectionId: parseInt(values.sectionId),
      //       stdAttendance: selectedStudents,
      //     };
      //     console.log("Payload values:", payload);
      //     const response = await createStudentAttendance(payload, TOKEN_KEY);
      //     console.log("Attendance creation response:", response);
      //     if (response.status === "Error") {
      //       toast.error(response.message);
      //     } else if (response.status === "success") {
      //       toast.success(response.message);
      //       resetForm();
      //     }
      //   } catch (error) {
      //     console.error("Error creating student attendance:", error);
      //   }
    },
  });
  useEffect(() => {
    setLoading(true);
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
    const getStaffList = async () => {
      try {
        setLoading(false);
        const response = await getStafflist("0", TOKEN_KEY);
        const staff = response.data.map((value, index) => ({
          id: value.staffId,
          value: value.staffName,
        }));
        setDropDown((prevData) => ({
          ...prevData,
          staffId: staff,
        }));
        setLoading(true);
      } catch (err) {
        console.log(err);
      }
    };
    getStaffList();
    getDropdownData(getStafflist, 0, "staffId");
  }, []);
  return (
    <>
      {loading ? (
        <div className="mt-5 mb-5">
          <Loader />
        </div>
      ) : (
        <form onSubmit={formik.handleSubmit}>
          <div className="table-container">
            <div className="table-main">
              <ul
                class="breadcrumb"
                style={{ display: "flex", alignItems: "center" }}
              >
                <li>
                  <Link to={"/dashboard"}>
                    <a style={{ color: "#051F3E" }}>
                      <h4>Home</h4>
                    </a>
                  </Link>
                </li>
                <li>
                  <a>Staff Attendance</a>
                </li>
              </ul>
             
              <div
                className="table-responsive"
                style={{ display: "flex", justifyContent: "center" }}
              >
                <table className="table table-striped table-hover">
                  <thead>
                    <tr>
                      <th style={{ textAlign: "center" }}>NO</th>
                      <th>STAFF NAME</th>
                      <th style={{ textAlign: "center" }}>PRESENT</th>
                      <th style={{ textAlign: "center" }}>ABSENT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dropDown.staffId.map((data, index) => (
                      <tr key={data.id}>
                        <td
                          className="attendances"
                          style={{
                            textAlign: "center",
                            color: "#051F3E",
                            fontSize: "12px",
                          }}
                        >
                          {index + 1}
                        </td>
                        <td>
                          <input
                            type="text"
                            id={data.id}
                            name={data.id}
                            value={data.value}
                            disabled
                            style={{
                              border: "0",
                              color: "#051F3E",
                              fontSize: "12px",
                            }}
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
              </div>
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
          </div>
        </form>
      )}
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
