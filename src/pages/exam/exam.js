import React, { useEffect, useState } from "react";
import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { useFormik } from "formik";
import { STAFF_KEY, TOKEN_KEY } from "../../services/auth";
import {
  createExamreport,
  getClass,
  getExam,
  getSection,
  getStudentlist,
  getSubject,
  getbyidExamreport,
} from "../../services/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import '../exam/exam.css'

export default function Examreport() {
  const location = useLocation();
  const propsData = location.state;
  const [dropDown, setDropDown] = useState({
    studentId: [],
    classId: [],
    sectionId: [],
    subjectId: [],
    examId: [],
  });

  const formik = useFormik({
    initialValues: {
      studentId: "",
      examId: "",
      classId: "",
      sectionId: "",
      subjectId: Array.from({ length: 8 }, () => ""),
      marks: Array.from({ length: 8 }, () => ""),
      remarks: Array.from({ length: 8 }, () => ""),
    },
    onSubmit: async (values, { resetForm }) => {
      const nonEmptySubjectId = values.subjectId.filter(
        (subject) => subject !== ""
      );
      if (nonEmptySubjectId.length === 0) {
        toast.error("Please select at least one subject.");
        return;
      }
      const nonEmptyMarks = values.marks.filter((mark) => mark !== "");
      const nonEmptyRemarks = values.remarks.filter((remark) => remark !== "");
      const requestBody = {
        examId: parseInt(values.examId),
        studentId: values.studentId,
        classId: parseInt(values.classId),
        sectionId: parseInt(values.sectionId),
        subjectId: nonEmptySubjectId.map((subject) => parseInt(subject)),
        mark: nonEmptyMarks,
        remark: nonEmptyRemarks,
        id: 0,
      };
      try {
        const response = await createExamreport(requestBody, STAFF_KEY);
        console.log("API Response:", response);
        if (response.status === "Error") {
          toast.error(response.message);
        } else if (response.status === "Success") {
          toast.success(response.message);
        }
        resetForm();
      } catch (error) {
        console.error(error);
        toast.error("Error making API call");
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
        const response = await getStudentlist({userName:0}, TOKEN_KEY);
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
    const getSubject1 = async () => {
      try {
        const response = await getSubject(0, TOKEN_KEY);
        const subjects = response.map((value, index) => ({
          id: value.id,
          value: value.name,
        }));
        setDropDown((prevData) => ({
          ...prevData,
          subjectId: subjects,
        }));
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
        setDropDown((prevData) => ({
          ...prevData,
          examId: examName,
        }));
      } catch (err) {
        console.log(err);
      }
    };
    getStudent();
    getSubject1();
    getExamstaffExam1();
    getDropdownData(getClass, 0, "classId");
    getDropdownData(getSection, 0, "sectionId");
  }, []);
  const calculateRemark = (mark) => {
    if (mark === "") {
      return "";
    }
    const numericMark = parseInt(mark, 10);
    if (numericMark < 40) {
      return "Below Average";
    } else if (numericMark >= 40 && numericMark <= 75) {
      return "Average";
    } else {
      return "Good";
    }
  };
  return (
    <>
      <div>
        {/* <h3>Subject Mark</h3> */}
        <div className="table-containers">
          <ul className="breadcrumb" style={{display:'flex'}}>
            <li >
              <Link to={"/exam"}>
                <a style={{ color: "#051F3E" }}><h4>Home</h4></a>
              </Link>
            </li>
            <li>
              <a>Subject Mark</a>
            </li>
          </ul>
        </div>
      </div>
      <div>
        <form style={{marginTop:'-25px'}} onSubmit={formik.handleSubmit}>
          <div className="table-container">
            <h3 style={{ color: "#051F3E",marginBottom:'20px' }}>Subject Mark</h3>
           <div className="img-boxs" style={{width:'270px',height:'270px',marginTop:'-25px'}}></div>
            <div className="input-groups">
              <div className="input-container-registers">
                <div className="input-group">
                  <label className="input-label" style={{fontWeight:"400"}}>Student</label>
                  <select
                    style={{ width: "200px" }}
                    id="studentId"
                    name="studentId"
                    className="effect-1"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.studentId}
                  >
                    <option value="">Select Student</option>
                    {dropDown.studentId.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.value}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="input-container-registers">
                <div className="input-group">
                  <label className="input-label" style={{fontWeight:"400"}}>Exam</label>
                  <select
                    style={{ width: "200px" }}
                    id="examId"
                    name="examId"
                    className="effect-1"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.examId}
                  >
                    <option value="">Select Exam</option>
                    {dropDown.examId.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.value}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="input-groups">
              <div className="input-container-registers">
                <div className="input-group">
                  <label className="input-label" style={{fontWeight:"400"}}>Class</label>
                  <select
                    style={{ width: "200px" }}
                    id="classId"
                    name="classId"
                    className="effect-1"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.classId}
                  >
                    <option value="">Select Class</option>
                    {dropDown.classId.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.value}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="input-container-registers">
                <div className="input-group">
                  <label className="input-label" style={{fontWeight:"400"}}>Section</label>
                  <select
                    style={{ width: "200px" }}
                    id="sectionId"
                    name="sectionId"
                    className="effect-1"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.sectionId}
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
            </div>
            <div className="table-responsive">
              <table class="table table-striped table-hover">
                <thead>
                  <tr>
                    <th style={{textAlign:'center'}}>SUBJECT</th>
                    <th style={{textAlign:'center'}}>MARK</th>
                    <th style={{textAlign:'center'}}>REMARK</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 8 }, (_, index) => (
                    <tr key={index}>
                      <td>
                        <select
                          style={{ height: "30px", width: "200px" }}
                          className="form-select"
                          id={`subjectId${index + 1}`}
                          name={`subjectId[${index}]`}
                          value={formik.values.subjectId[index]}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                        >
                          <option value="">Select Subject</option>
                          {dropDown.subjectId.map((option) => (
                            <option key={option.id} value={option.id}>
                              {option.value}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <input
                          style={{ height: "30px", width: "200px" }}
                          className="form-control"
                          type="number"
                          name={`marks[${index}]`}
                          onChange={(e) => {
                            formik.handleChange(e);

                            const mark = e.target.value;
                            const remark = calculateRemark(mark);
                            formik.setFieldValue(`remarks[${index}]`, remark);
                          }}
                          onBlur={formik.handleBlur}
                          value={formik.values.marks[index]}
                        />
                      </td>
                      <td>
                        <input
                          style={{ height: "30px", width: "200px" }}
                          className="form-control"
                          type="text"
                          name={`remarks[${index}]`}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          value={formik.values.remarks[index]}
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
