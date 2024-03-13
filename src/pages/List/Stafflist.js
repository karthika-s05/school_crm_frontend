import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useFormik } from "formik";
import { getBloodGroup, getCity, getCommunity, getNationality, getReligion, getState, registerStaff } from "../../services/api";
import { TOKEN_KEY } from "../../services/auth";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Stafflist() {
  const inputRef = useRef(null);
  useEffect(() => {
    inputRef.current.focus();
  }, []);
  const formatAadharCardNo = (value) => {
    const cleanedValue = value.replace(/\D/g, "");
    return cleanedValue
      .replace(/(\d{4})(\d{4})(\d{4})(\d{4})/, "$1 $2 $3 $4")
      .trim();
  };
  const handleAadharCardNoChange = (event) => {
    const formattedValue = formatAadharCardNo(event.target.value);
    formik.setFieldValue("adharCardNo", formattedValue);
  };
  const [dropDown, setDropDown] = useState({
    studentId: [],
    classId: [],
    sectionId: [],
    subjectId: [],
    examId: [],
    nationalityId: [],
    stateId: [],
    cityId: [],
    religionId: [],
    communityId: [],
    bloodGroupId: [],
    genderId: [
      { id: 1, value: "Male" },
      { id: 2, value: "Female" },
    ],
  });
  const [state, setState] = useState();
  const [city, setCity] = useState();
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(name, "121");
    if (name === "nationalityId") {
      formik.setFieldValue(name, value);
      setState(value);
    }
    if (name === "stateId") {
      formik.setFieldValue(name, value);
      setCity(value);
    }
  };
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
    const getStatedata = async () => {
      try {
        const response = await getState({ id: 0, nationId: state }, TOKEN_KEY);
        console.log("dropdown ", response);
        const data = response.map((value, index) => ({
          id: value.id,
          value: value.name,
        }));
        setDropDown((prevData) => ({
          ...prevData,
          stateId: data,
        }));
      } catch (err) {
        console.log(err);
      }
    };
    const getCitydata = async () => {
      try {
        const response = await getCity({ id: 0, stateId: city }, TOKEN_KEY);
        console.log("city ", response);
        const data = response.map((value, index) => ({
          id: value.id,
          value: value.name,
        }));
        setDropDown((prevData) => ({
          ...prevData,
          cityId: data,
        }));
      } catch (err) {
        console.log(err);
      }
    };
    getStatedata();
    getCitydata();
    getDropdownData(getNationality, 0, "nationalityId");
    getDropdownData(getReligion, 0, "religionId");
    getDropdownData(getCommunity, 0, "communityId");
    getDropdownData(getBloodGroup, 0, "bloodGroupId");
  }, [state, city]);

  const validate = (values) => {
    const errors = {};
    if (!values.firstName) {
      errors.firstName = "Please enter your firstName";
    }
    if (!values.lastName) {
      errors.lastName = "Please enter your lastName";
    }
    if (!values.email) {
      errors.email = "Please enter your email";
    }
    if (!values.department) {
      errors.department = "Please enter your department";
    }
    if (!values.position) {
      errors.position = "Please enter your position";
    }
    if (!values.address1) {
      errors.address1 = "Please enter your address1";
    }
    if (!values.address2) {
      errors.address2 = "Please enter your address2";
    }
    if (!values.pincode) {
      errors.pincode = "Please enter your pincode";
    }
    if (!values.nationalityId) {
      errors.nationalityId = "Please select your nationality";
    }
    if (!values.stateId) {
      errors.stateId = "Please select your state";
    }
    if (!values.cityId) {
      errors.cityId = "Please select your city";
    }
    if (!values.dateOfJoining) {
      errors.dateOfJoining = "Please select your date Of Joining";
    }
    if (!values.dateOfBirth) {
      errors.dateOfBirth = "Please select your date Of Birth";
    }
    if (!values.genderId) {
      errors.genderId = "Please select your gender";
    }
    if (!values.qualification) {
      errors.qualification = "Please enter your qualification";
    }
    if (!values.experience) {
      errors.experience = "Please enter your experience";
    }
    if (!values.roleofstaff) {
      errors.roleofstaff = "Please enter your role of staff";
    }
    if (!values.adharCardno) {
      errors.adharCardno = "Please enter your adharCardno";
    }
    if (!values.panCard) {
      errors.panCard = "Please enter your panCard";
    }
    if (!values.bankname) {
      errors.bankname = "Please enter your bankname";
    }
    if (!values.branch) {
      errors.branch = "Please enter your branch";
    }
    if (!values.accountno) {
      errors.accountno = "Please enter your accountno";
    }
    if (!values.ifscNo) {
      errors.ifscNo = "Please enter your ifsc No";
    }
    if (!values.fatherhusbandname) {
      errors.fatherhusbandname = "Please enter your father husbandname";
    }
    if (!values.fatherhusbandcontact) {
      errors.fatherhusbandcontact = "Please enter valid contact number";
    } else if (
      !/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/.test(values.fatherhusbandcontact)
    ) {
      errors.fatherhusbandcontact = "Enter valid contact number";
    }
    if (!values.maritalstatus) {
      errors.maritalstatus = "Please enter your maritalstatus";
    }
    if (!values.religion) {
      errors.religion = "Please enter your religion";
    }
    if (!values.community) {
      errors.community = "Please enter your community";
    }
    if (!values.bloodGroup) {
      errors.bloodGroup = "Please enter your bloodGroup";
    }
    return errors;
  };
  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      department: "",
      position: "",
      address1: "",
      address2: "",
      pincode: "",
      nationalityId: "",
      stateId: "",
      cityId: "",
      dateOfJoining: "",
      dateOfBirth: "",
      genderId: "",
      qualification: "",
      experience: "",
      roleofstaff: "",
      adharCardno: "",
      panCard: "",
      bankname: "",
      branch: "",
      accountno: "",
      ifscNo: "",
      fatherhusbandname: "",
      fatherhusbandcontact: "",
      maritalstatus: "",
      religion: "",
      community: "",
      bloodGroup: "",
    },
    validate,
    onSubmit: async (values,{resetForm}) => {
      console.log(values, "values");
      const response = await registerStaff(values, TOKEN_KEY);
       console.log("API Response:", response);
       const responseValue = response.status.toString().toLowerCase();
       const responseMessage =
         responseValue === "error" &&
         response.data === "Roll number already exists!"
           ? response.data
           : response.message;

       if (responseValue === "error") {
         toast.error(responseMessage, {
           onClose: () => {
             // navigate("/studentinfo");
           },
         });
       } else if (responseValue === "success") {
         toast.success(response.message, {
           onClose: () => {
             resetForm();
             // navigate("/studentinfo/:id");
           },
         });
       }
    },
  });

  return (
    <div>
      <div className="table-containers">
      </div>
      <div className="table-container">
      <ul class="breadcrumb" style={{ display: "flex",alignItems:"center" }}>
          <li>
            <Link to={"/dashboard"}>
              <a style={{ color: "#051F3E" }}>
                <h4>Home</h4>
              </a>
            </Link>
          </li>
          <li>
            <a> Add Staff Information </a>
          </li>
        </ul>
        <div>
          <span
            class="horizontal-line"
            style={{ background: "#F0F1F3", marginTop: "20px" }}
          ></span>
        </div>
        <form
          className="ng-untouched ng-pristine ng-invalid"
          onSubmit={formik.handleSubmit}
        >
          <div className="table-main">
            <div class="input-group" style={{ gap: "20px", marginTop: "10px" }}>
              <div class="input-container-registers">
                <div class="input-container">
                  <label class="input-label">First Name<span style={{ color: "red", fontWeight: "400",paddingLeft:'4px' }}>*</span></label>
                  <input
                   style={{
                    border: `1px solid ${
                      formik.touched.firstName && formik.errors.firstName
                        ? "red"
                        : "#c8c8c8"
                    }`,
                  }}
                    className={`effect-3 size ${
                      formik.touched.firstName && formik.errors.firstName
                        ? "is-invalid"
                        : ""
                    }`}
                    type="text"
                    ref={inputRef}
                    name="firstName"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.firstName}
                  />
                  {formik.touched.firstName && formik.errors.firstName ? (
                    <div
                      className="text-danger"
                      style={{
                        color: "red",
                        fontSize: "12px",
                        marginBottom: "-10px",
                        marginTop: "1px",
                      }}
                    >
                      {formik.errors.firstName}
                    </div>
                  ) : null}
                </div>
              </div>
              <div class="input-container-registers">
                <div class="input-container">
                  <label class="input-label">Last Name<span style={{ color: "red", fontWeight: "400",paddingLeft:'4px' }}>*</span></label>
                  <input
                   style={{
                    border: `1px solid ${
                      formik.touched.lastName && formik.errors.lastName
                        ? "red"
                        : "#c8c8c8"
                    }`,
                  }}
                    className={`effect-3 size ${
                      formik.touched.lastName && formik.errors.lastName
                        ? "is-invalid"
                        : ""
                    }`}
                    type="text"
                    name="lastName"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.lastName}
                  />
                  {formik.touched.lastName && formik.errors.lastName ? (
                    <div
                      className="text-danger"
                      style={{
                        color: "red",
                        fontSize: "12px",
                        marginBottom: "-10px",
                        marginTop: "1px",
                      }}
                    >
                      {formik.errors.lastName}
                    </div>
                  ) : null}
                </div>
              </div>
              <div class="input-container-registers">
                <div class="input-container">
                  <label class="input-label">E-mail <span style={{ color: "red", fontWeight: "400",paddingLeft:'4px' }}>*</span></label>
                  <input
                   style={{
                    border: `1px solid ${
                      formik.touched.email && formik.errors.email
                        ? "red"
                        : "#c8c8c8"
                    }`,
                  }}
                    className={`effect-3 size ${
                      formik.touched.email && formik.errors.email
                        ? "is-invalid"
                        : ""
                    }`}
                    type="text"
                    name="email"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.email}
                  />
                  {formik.touched.email && formik.errors.email ? (
                    <div
                      className="text-danger"
                      style={{
                        color: "red",
                        fontSize: "12px",
                        marginBottom: "-10px",
                        marginTop: "1px",
                      }}
                    >
                      {formik.errors.email}
                    </div>
                  ) : null}
                </div>
              </div>
              <div class="input-container-registers">
                <div class="input-container">
                  <label class="input-label">Department<span style={{ color: "red", fontWeight: "400",paddingLeft:'4px' }}>*</span></label>
                  <input
                   style={{
                    border: `1px solid ${
                      formik.touched.department && formik.errors.department
                        ? "red"
                        : "#c8c8c8"
                    }`,
                  }}
                    className={`effect-3 size ${
                      formik.touched.department && formik.errors.department
                        ? "is-invalid"
                        : ""
                    }`}
                    type="text"
                    name="department"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.department}
                  />
                  {formik.touched.department && formik.errors.department ? (
                    <div
                      className="text-danger"
                      style={{
                        color: "red",
                        fontSize: "12px",
                        marginBottom: "-10px",
                        marginTop: "1px",
                      }}
                    >
                      {formik.errors.department}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
            <div
              class="input-group"
              style={{ gap: "15px", marginTop: "-15px" }}
            >
              <div class="input-container-registers">
                <div class="input-container">
                  <label class="input-label">Position<span style={{ color: "red", fontWeight: "400",paddingLeft:'4px' }}>*</span></label>
                  <input
                   style={{
                    border: `1px solid ${
                      formik.touched.position && formik.errors.position
                        ? "red"
                        : "#c8c8c8"
                    }`,
                  }}
                    className={`effect-3 size ${
                      formik.touched.position && formik.errors.position
                        ? "is-invalid"
                        : ""
                    }`}
                    type="text"
                    name="position"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.position}
                  />
                  {formik.touched.position && formik.errors.position ? (
                    <div
                      className="text-danger"
                      style={{
                        color: "red",
                        fontSize: "12px",
                        marginBottom: "-10px",
                        marginTop: "1px",
                      }}
                    >
                      {formik.errors.position}
                    </div>
                  ) : null}
                </div>
              </div>
              <div class="input-container-registers">
                <div class="input-container">
                  <label class="input-label">Address 1<span style={{ color: "red", fontWeight: "400",paddingLeft:'4px' }}>*</span></label>
                  <input
                   style={{
                    border: `1px solid ${
                      formik.touched.address1 && formik.errors.address1
                        ? "red"
                        : "#c8c8c8"
                    }`,
                  }}
                    className={`effect-3 size ${
                      formik.touched.address1 && formik.errors.address1
                        ? "is-invalid"
                        : ""
                    }`}
                    type="text"
                    name="address1"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.address1}
                  />
                  {formik.touched.address1 && formik.errors.address1 ? (
                    <div
                      className="text-danger"
                      style={{
                        color: "red",
                        fontSize: "12px",
                        marginBottom: "-10px",
                        marginTop: "1px",
                      }}
                    >
                      {formik.errors.address1}
                    </div>
                  ) : null}
                </div>
              </div>
              <div class="input-container-registers">
                <div class="input-container">
                  <label class="input-label">Address 2</label>
                  <input
                   style={{
                    border: `1px solid ${
                      formik.touched.address2 && formik.errors.address2
                        ? "red"
                        : "#c8c8c8"
                    }`,
                  }}
                    className={`effect-3 size ${
                      formik.touched.address2 && formik.errors.address2
                        ? "is-invalid"
                        : ""
                    }`}
                    type="text"
                    name="address2"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.address2}
                  />
                  {formik.touched.address2 && formik.errors.address2 ? (
                    <div
                      className="text-danger"
                      style={{
                        color: "red",
                        fontSize: "12px",
                        marginBottom: "-10px",
                        marginTop: "1px",
                      }}
                    >
                      {formik.errors.address2}
                    </div>
                  ) : null}
                </div>
              </div>
              <div class="input-container-registers">
                <div class="input-container">
                  <label class="input-label">Pin Code<span style={{ color: "red", fontWeight: "400",paddingLeft:'4px' }}>*</span></label>
                  <input
                   style={{
                    border: `1px solid ${
                      formik.touched.pincode && formik.errors.pincode
                        ? "red"
                        : "#c8c8c8"
                    }`,
                  }}
                    className={`effect-3 size ${
                      formik.touched.pincode && formik.errors.pincode
                        ? "is-invalid"
                        : ""
                    }`}
                    type="text"
                    name="pincode"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.pincode}
                  />
                  {formik.touched.pincode && formik.errors.pincode ? (
                    <div
                      className="text-danger"
                      style={{
                        color: "red",
                        fontSize: "12px",
                        marginBottom: "-10px",
                        marginTop: "1px",
                      }}
                    >
                      {formik.errors.pincode}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
            <div
              class="input-group"
              style={{ gap: "15px", marginTop: "-15px" }}
            >
              <div class="input-container-registers">
                <div class="input-container">
                  <label class="input-label">
                    Nationality
                    <span style={{ color: "red", fontWeight: "400",paddingLeft:'4px' }}>*</span>
                  </label>
                  <select
                    style={{
                      border: `1px solid ${
                        formik.touched.nationalityId &&
                        formik.errors.nationalityId
                          ? "red"
                          : "#c8c8c8"
                      }`,
                    }}
                    id="nationalityId"
                    name="nationalityId"
                    className="effect-3"
                    onChange={(e) => handleInputChange(e)}
                    onBlur={formik.handleBlur}
                    value={formik.values.nationalityId}
                  >
                    <option value="">Select Nationality</option>
                    {dropDown.nationalityId.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.value}
                      </option>
                    ))}
                  </select>
                  {formik.touched.nationalityId &&
                  formik.errors.nationalityId ? (
                    <div
                      className="text-danger"
                      style={{
                        color: "red",
                        fontSize: "12px",
                        marginBottom: "-10px",
                        marginTop: "1px",
                      }}
                    >
                      {formik.errors.nationalityId}
                    </div>
                  ) : null}
                </div>
              </div>
              <div class="input-container-registers">
                <div class="input-container">
                  <label class="input-label">
                    State
                    <span style={{ color: "red", fontWeight: "400",paddingLeft:'4px' }}>*</span>
                  </label>
                  <select
                    style={{
                      border: `1px solid ${
                        formik.touched.stateId && formik.errors.stateId
                          ? "red"
                          : "#c8c8c8"
                      }`,
                    }}
                    id="stateId"
                    name="stateId"
                    className="effect-3"
                    onChange={(e) => handleInputChange(e)}
                    onBlur={formik.handleBlur}
                    value={formik.values.stateId}
                  >
                    <option value="">Select State</option>
                    {dropDown.stateId.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.value}
                      </option>
                    ))}
                  </select>
                  {formik.touched.stateId && formik.errors.stateId ? (
                    <div
                      className="text-danger"
                      style={{
                        color: "red",
                        fontSize: "12px",
                        marginBottom: "-10px",
                        marginTop: "1px",
                      }}
                    >
                      {formik.errors.stateId}
                    </div>
                  ) : null}
                </div>
              </div>
              <div class="input-container-registers">
                <div class="input-container">
                  <label class="input-label">
                    City
                    <span
                      style={{
                        color: "red",
                        fontWeight: "400",
                        paddingLeft: "5px",
                      }}
                    >
                      *
                    </span>
                  </label>
                  <select
                    style={{
                      border: `1px solid ${
                        formik.touched.cityId && formik.errors.cityId
                          ? "red"
                          : "#cdcbcb"
                      }`,
                    }}
                    id="cityId"
                    name="cityId"
                    className="effect-3"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.cityId}
                  >
                    <option value="">Select State</option>
                    {dropDown.cityId.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.value}
                      </option>
                    ))}
                  </select>
                  {formik.touched.cityId && formik.errors.cityId ? (
                    <div
                      className="text-danger"
                      style={{
                        color: "red",
                        fontSize: "12px",
                        marginBottom: "-10px",
                        marginTop: "1px",
                      }}
                    >
                      {formik.errors.cityId}
                    </div>
                  ) : null}
                </div>
              </div>
              <div class="input-container-registers">
                <div class="input-container">
                  <label class="input-label">
                    Date Of Joining
                    <span style={{ color: "red", fontWeight: "400",paddingLeft:'4px' }}>*</span>
                  </label>
                  <input
                    style={{
                      border: `1px solid ${
                        formik.touched.dateOfJoining &&
                        formik.errors.dateOfJoining
                          ? "red"
                          : "#c8c8c8"
                      }`,
                    }}
                    className={`effect-3 size ${
                      formik.touched.dateOfJoining &&
                      formik.errors.dateOfJoining
                        ? "is-invalid"
                        : ""
                    }`}
                    type="date"
                    name="dateOfJoining"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    max={new Date().toISOString().split("T")[0]}
                    value={formik.values.dateOfJoining}
                  />
                  {formik.touched.dateOfJoining &&
                  formik.errors.dateOfJoining ? (
                    <div
                      className="text-danger"
                      style={{
                        color: "red",
                        fontSize: "12px",
                        marginBottom: "-10px",
                        marginTop: "1px",
                      }}
                    >
                      {formik.errors.dateOfJoining}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
            <div
              class="input-group"
              style={{ gap: "15px", marginTop: "-15px" }}
            >
              <div class="input-container-registers">
                <div class="input-container">
                  <label class="input-label">
                    Date Of Birth
                    <span style={{ color: "red", fontWeight: "400",paddingLeft:'4px' }}>*</span>
                  </label>
                  <input
                    style={{
                      border: `1px solid ${
                        formik.touched.dateOfBirth && formik.errors.dateOfBirth
                          ? "red"
                          : "#c8c8c8"
                      }`,
                    }}
                    className={`effect-3 size ${
                      formik.touched.dateOfBirth && formik.errors.dateOfBirth
                        ? "is-invalid"
                        : ""
                    }`}
                    type="date"
                    name="dateOfBirth"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    max={new Date().toISOString().split("T")[0]}
                    value={formik.values.dateOfBirth}
                  />
                  {formik.touched.dateOfBirth && formik.errors.dateOfBirth ? (
                    <div
                      className="text-danger"
                      style={{
                        color: "red",
                        fontSize: "12px",
                        marginBottom: "-10px",
                        marginTop: "1px",
                      }}
                    >
                      {formik.errors.dateOfBirth}
                    </div>
                  ) : null}
                </div>
              </div>
              <div class="input-container-registers">
                <div class="input-container">
                  <label class="input-label">
                    Gender
                    <span
                      style={{
                        color: "red",
                        fontWeight: "400",
                        paddingLeft: "5px",
                      }}
                    >
                      *
                    </span>
                  </label>
                  <select
                    style={{
                      border: `1px solid ${
                        formik.touched.genderId && formik.errors.genderId
                          ? "red"
                          : "#cdcbcb"
                      }`,
                    }}
                    id="genderId"
                    name="genderId"
                    className="effect-3"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.genderId}
                  >
                    <option value="">Select Class</option>
                    {dropDown.genderId.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.value}
                      </option>
                    ))}
                  </select>
                  {formik.touched.genderId && formik.errors.genderId ? (
                    <div
                      className="text-danger"
                      style={{
                        color: "red",
                        fontSize: "12px",
                        marginBottom: "-10px",
                        marginTop: "1px",
                      }}
                    >
                      {formik.errors.genderId}
                    </div>
                  ) : null}
                </div>
              </div>
              <div class="input-container-registers">
                <div class="input-container">
                  <label class="input-label">Qualification<span style={{ color: "red", fontWeight: "400",paddingLeft:'4px' }}>*</span></label>
                  <input
                   style={{
                    border: `1px solid ${
                      formik.touched.qualification && formik.errors.qualification
                        ? "red"
                        : "#c8c8c8"
                    }`,
                  }}
                    className={`effect-3 size ${
                      formik.touched.qualification &&
                      formik.errors.qualification
                        ? "is-invalid"
                        : ""
                    }`}
                    type="text"
                    name="qualification"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.qualification}
                  />
                  {formik.touched.qualification &&
                  formik.errors.qualification ? (
                    <div
                      className="text-danger"
                      style={{
                        color: "red",
                        fontSize: "12px",
                        marginBottom: "-10px",
                        marginTop: "1px",
                      }}
                    >
                      {formik.errors.qualification}
                    </div>
                  ) : null}
                </div>
              </div>
              <div class="input-container-registers">
                <div class="input-container">
                  <label class="input-label">Experience<span style={{ color: "red", fontWeight: "400",paddingLeft:'4px' }}>*</span></label>
                  <input
                   style={{
                    border: `1px solid ${
                      formik.touched.experience && formik.errors.experience
                        ? "red"
                        : "#c8c8c8"
                    }`,
                  }}
                    className={`effect-3 size ${
                      formik.touched.experience && formik.errors.experience
                        ? "is-invalid"
                        : ""
                    }`}
                    type="text"
                    name="experience"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.experience}
                  />
                  {formik.touched.experience && formik.errors.experience ? (
                    <div
                      className="text-danger"
                      style={{
                        color: "red",
                        fontSize: "12px",
                        marginBottom: "-10px",
                        marginTop: "1px",
                      }}
                    >
                      {formik.errors.experience}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
            <div
              class="input-group"
              style={{ gap: "15px", marginTop: "-15px" }}
            >
              <div class="input-container-registers">
                <div class="input-container">
                  <label class="input-label">Role Of Staff<span style={{ color: "red", fontWeight: "400",paddingLeft:'4px' }}>*</span></label>
                  <input
                   style={{
                    border: `1px solid ${
                      formik.touched.roleofstaff && formik.errors.roleofstaff
                        ? "red"
                        : "#c8c8c8"
                    }`,
                  }}
                    className={`effect-3 size ${
                      formik.touched.roleofstaff && formik.errors.roleofstaff
                        ? "is-invalid"
                        : ""
                    }`}
                    type="text"
                    name="roleofstaff"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.roleofstaff}
                  />
                  {formik.touched.roleofstaff && formik.errors.roleofstaff ? (
                    <div
                      className="text-danger"
                      style={{
                        color: "red",
                        fontSize: "12px",
                        marginBottom: "-10px",
                        marginTop: "1px",
                      }}
                    >
                      {formik.errors.roleofstaff}
                    </div>
                  ) : null}
                </div>
              </div>
              <div className="input-container-registers">
                <div className="input-container">
                  <label className="input-label">
                    Aadhar Card No
                    <span
                      style={{
                        color: "red",
                        fontWeight: 400,
                        paddingLeft: "5px",
                      }}
                    >
                      *
                    </span>
                  </label>
                  <input
                    style={{
                      border: `1px solid ${
                        formik.touched.adharCardNo && formik.errors.adharCardNo
                          ? "red"
                          : "#cdcbcb"
                      }`,
                    }}
                    className={`effect-3 size ${
                      formik.touched.adharCardNo && formik.errors.adharCardNo
                        ? "is-invalid"
                        : ""
                    }`}
                    type="text"
                    name="adharCardNo"
                    onChange={handleAadharCardNoChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.adharCardNo}
                    maxLength={19}
                  />
                  {formik.touched.adharCardNo && formik.errors.adharCardNo ? (
                    <div
                      className="text-danger"
                      style={{
                        color: "red",
                        fontSize: "12px",
                        marginBottom: "-10px",
                        marginTop: "1px",
                      }}
                    >
                      {formik.errors.adharCardNo}
                    </div>
                  ) : null}
                </div>
              </div>
              <div class="input-container-registers">
                <div class="input-container">
                  <label class="input-label">PanCard No<span style={{ color: "red", fontWeight: "400",paddingLeft:'4px' }}>*</span></label>
                  <input
                   style={{
                    border: `1px solid ${
                      formik.touched.panCard && formik.errors.panCard
                        ? "red"
                        : "#c8c8c8"
                    }`,
                  }}
                    className={`effect-3 size ${
                      formik.touched.panCard && formik.errors.panCard
                        ? "is-invalid"
                        : ""
                    }`}
                    type="text"
                    name="panCard"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.panCard}
                  />
                  {formik.touched.panCard && formik.errors.panCard ? (
                    <div
                      className="text-danger"
                      style={{
                        color: "red",
                        fontSize: "12px",
                        marginBottom: "-10px",
                        marginTop: "1px",
                      }}
                    >
                      {formik.errors.panCard}
                    </div>
                  ) : null}
                </div>
              </div>
              <div class="input-container-registers">
                <div class="input-container">
                  <label class="input-label">Bank Name<span style={{ color: "red", fontWeight: "400",paddingLeft:'4px' }}>*</span></label>
                  <input
                   style={{
                    border: `1px solid ${
                      formik.touched.bankname && formik.errors.bankname
                        ? "red"
                        : "#c8c8c8"
                    }`,
                  }}
                    className={`effect-3 size ${
                      formik.touched.bankname && formik.errors.bankname
                        ? "is-invalid"
                        : ""
                    }`}
                    type="text"
                    name="bankname"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.bankname}
                  />
                  {formik.touched.bankname && formik.errors.bankname ? (
                    <div
                      className="text-danger"
                      style={{
                        color: "red",
                        fontSize: "12px",
                        marginBottom: "-10px",
                        marginTop: "1px",
                      }}
                    >
                      {formik.errors.bankname}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
            <div
              class="input-group"
              style={{ gap: "15px", marginTop: "-15px" }}
            >
              <div class="input-container-registers">
                <div class="input-container">
                  <label class="input-label">Branch<span style={{ color: "red", fontWeight: "400",paddingLeft:'4px' }}>*</span></label>
                  <input
                   style={{
                    border: `1px solid ${
                      formik.touched.branch && formik.errors.branch
                        ? "red"
                        : "#c8c8c8"
                    }`,
                  }}
                    className={`effect-3 size ${
                      formik.touched.branch && formik.errors.branch
                        ? "is-invalid"
                        : ""
                    }`}
                    type="text"
                    name="branch"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.branch}
                  />
                  {formik.touched.branch && formik.errors.branch ? (
                    <div
                      className="text-danger"
                      style={{
                        color: "red",
                        fontSize: "12px",
                        marginBottom: "-10px",
                        marginTop: "1px",
                      }}
                    >
                      {formik.errors.branch}
                    </div>
                  ) : null}
                </div>
              </div>
              <div class="input-container-registers">
                <div class="input-container">
                  <label class="input-label">Account No<span style={{ color: "red", fontWeight: "400",paddingLeft:'4px' }}>*</span></label>
                  <input
                   style={{
                    border: `1px solid ${
                      formik.touched.accountno && formik.errors.accountno
                        ? "red"
                        : "#c8c8c8"
                    }`,
                  }}
                    className={`effect-3 size ${
                      formik.touched.accountno && formik.errors.accountno
                        ? "is-invalid"
                        : ""
                    }`}
                    type="text"
                    name="accountno"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.accountno}
                  />
                  {formik.touched.accountno && formik.errors.accountno ? (
                    <div
                      className="text-danger"
                      style={{
                        color: "red",
                        fontSize: "12px",
                        marginBottom: "-10px",
                        marginTop: "1px",
                      }}
                    >
                      {formik.errors.accountno}
                    </div>
                  ) : null}
                </div>
              </div>
              <div class="input-container-registers">
                <div class="input-container">
                  <label class="input-label">Ifsc No<span style={{ color: "red", fontWeight: "400",paddingLeft:'4px' }}>*</span></label>
                  <input
                   style={{
                    border: `1px solid ${
                      formik.touched.ifscNo && formik.errors.ifscNo
                        ? "red"
                        : "#c8c8c8"
                    }`,
                  }}
                    className={`effect-3 size ${
                      formik.touched.ifscNo && formik.errors.ifscNo
                        ? "is-invalid"
                        : ""
                    }`}
                    type="text"
                    name="ifscNo"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.ifscNo}
                  />
                  {formik.touched.ifscNo && formik.errors.ifscNo ? (
                    <div
                      className="text-danger"
                      style={{
                        color: "red",
                        fontSize: "12px",
                        marginBottom: "-10px",
                        marginTop: "1px",
                      }}
                    >
                      {formik.errors.ifscNo}
                    </div>
                  ) : null}
                </div>
              </div>
              <div class="input-container-registers">
                <div class="input-container">
                  <label class="input-label">Father/Husband Name<span style={{ color: "red", fontWeight: "400",paddingLeft:'4px' }}>*</span></label>
                  <input
                   style={{
                    border: `1px solid ${
                      formik.touched.fatherhusbandname && formik.errors.fatherhusbandname
                        ? "red"
                        : "#c8c8c8"
                    }`,
                  }}
                    className={`effect-3 size ${
                      formik.touched.fatherhusbandname &&
                      formik.errors.fatherhusbandname
                        ? "is-invalid"
                        : ""
                    }`}
                    type="text"
                    name="fatherhusbandname"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.fatherhusbandname}
                  />
                  {formik.touched.fatherhusbandname &&
                  formik.errors.fatherhusbandname ? (
                    <div
                      className="text-danger"
                      style={{
                        color: "red",
                        fontSize: "12px",
                        marginBottom: "-10px",
                        marginTop: "1px",
                      }}
                    >
                      {formik.errors.fatherhusbandname}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
            <div
              class="input-group"
              style={{ gap: "15px", marginTop: "-15px" }}
            >
              <div class="input-container-registers">
                <div class="input-container">
                  <label class="input-label">Father/Husband Contact No<span style={{ color: "red", fontWeight: "400",paddingLeft:'4px' }}>*</span></label>
                  <input
                   style={{
                    border: `1px solid ${
                      formik.touched.fatherhusbandcontact && formik.errors.fatherhusbandcontact
                        ? "red"
                        : "#c8c8c8"
                    }`,
                  }}
                    className={`effect-3 size ${
                      formik.touched.fatherhusbandcontact &&
                      formik.errors.fatherhusbandcontact
                        ? "is-invalid"
                        : ""
                    }`}
                    type="text"
                    name="fatherhusbandcontact"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.fatherhusbandcontact}
                  />
                  {formik.touched.fatherhusbandcontact &&
                  formik.errors.fatherhusbandcontact ? (
                    <div
                      className="text-danger"
                      style={{
                        color: "red",
                        fontSize: "12px",
                        marginBottom: "-10px",
                        marginTop: "1px",
                      }}
                    >
                      {formik.errors.fatherhusbandcontact}
                    </div>
                  ) : null}
                </div>
              </div>
              <div class="input-container-registers">
                <div class="input-container">
                  <label class="input-label">Marital Status<span style={{ color: "red", fontWeight: "400",paddingLeft:'4px' }}>*</span></label>
                  <input
                   style={{
                    border: `1px solid ${
                      formik.touched.maritalstatus && formik.errors.maritalstatus
                        ? "red"
                        : "#c8c8c8"
                    }`,
                  }}
                    className={`effect-3 size ${
                      formik.touched.maritalstatus &&
                      formik.errors.maritalstatus
                        ? "is-invalid"
                        : ""
                    }`}
                    type="text"
                    name="maritalstatus"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.maritalstatus}
                  />
                  {formik.touched.maritalstatus &&
                  formik.errors.maritalstatus ? (
                    <div
                      className="text-danger"
                      style={{
                        color: "red",
                        fontSize: "12px",
                        marginBottom: "-10px",
                        marginTop: "1px",
                      }}
                    >
                      {formik.errors.maritalstatus}
                    </div>
                  ) : null}
                </div>
              </div>
              <div class="input-container-registers">
                <div class="input-container">
                  <label class="input-label">
                    Religion
                    <span
                      style={{
                        color: "red",
                        fontWeight: "400",
                        paddingLeft: "5px",
                      }}
                    >
                      *
                    </span>
                  </label>
                  <select
                    style={{
                      border: `1px solid ${
                        formik.touched.religionId && formik.errors.religionId
                          ? "red"
                          : "#cdcbcb"
                      }`,
                    }}
                    id="religionId"
                    name="religionId"
                    className="effect-3"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.religionId}
                  >
                    <option value="">Select Religion</option>
                    {dropDown.religionId.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.value}
                      </option>
                    ))}
                  </select>
                  {formik.touched.religionId && formik.errors.religionId ? (
                    <div
                      className="text-danger"
                      style={{
                        color: "red",
                        fontSize: "12px",
                        marginBottom: "-10px",
                        marginTop: "1px",
                      }}
                    >
                      {formik.errors.religionId}
                    </div>
                  ) : null}
                </div>
              </div>
              <div class="input-container-registers">
                <div class="input-container">
                  <label class="input-label">
                    Community
                    <span
                      style={{
                        color: "red",
                        fontWeight: "400",
                        paddingLeft: "5px",
                      }}
                    >
                      *
                    </span>
                  </label>
                  <select
                    style={{
                      border: `1px solid ${
                        formik.touched.communityId && formik.errors.communityId
                          ? "red"
                          : "#cdcbcb"
                      }`,
                    }}
                    id="communityId"
                    name="communityId"
                    className="effect-3"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.communityId}
                  >
                    <option value="">Select Community</option>
                    {dropDown.communityId.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.value}
                      </option>
                    ))}
                  </select>
                  {formik.touched.communityId && formik.errors.communityId ? (
                    <div
                      className="text-danger"
                      style={{
                        color: "red",
                        fontSize: "12px",
                        marginBottom: "-10px",
                        marginTop: "1px",
                      }}
                    >
                      {formik.errors.communityId}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
            <div
              class="input-group"
              style={{ gap: "15px", marginTop: "-15px" }}
            >
              <div class="input-container-registers">
                <div class="input-container">
                  <label class="input-label">
                    BloodGroup
                    <span
                      style={{
                        color: "red",
                        fontWeight: "400",
                        paddingLeft: "5px",
                      }}
                    >
                      *
                    </span>
                  </label>
                  <select
                    style={{
                      width:"250px",
                      border: `1px solid ${
                        formik.touched.bloodGroupId &&
                        formik.errors.bloodGroupId
                          ? "red"
                          : "#cdcbcb"
                      }`,
                    }}
                    id="bloodGroupId"
                    name="bloodGroupId"
                    className="effect-3"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.bloodGroupId}
                  >
                    <option value="">Select BloodGroup</option>
                    {dropDown.bloodGroupId.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.value}
                      </option>
                    ))}
                  </select>
                  {formik.touched.bloodGroupId && formik.errors.bloodGroupId ? (
                    <div
                      className="text-danger"
                      style={{
                        color: "red",
                        fontSize: "12px",
                        marginBottom: "-10px",
                        marginTop: "1px",
                      }}
                    >
                      {formik.errors.bloodGroupId}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
            <div
              class="btn-style-registration"
              style={{ gap: "10px", marginBottom: "12px" }}
            >
              <button type="button" class="cancel-button">
                Cancel
              </button>
              <button class="custom-button" type="submit">
                Submit
                <i
                  class="fas fa-chevron-right"
                  style={{ marginLeft: "5px" }}
                ></i>
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
    </div>
  );
}
