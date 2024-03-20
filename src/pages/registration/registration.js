import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import "./registration.css";
import "../../App.css";
import {
  AdminRegistration,
  StaffRegistration,
  StudentRegistration,
  StaffRelieving,
  StudentRelieving,
  examreport,
} from "../../assets/constant";
import {
  getBloodGroup,
  getCity,
  getClass,
  getCommunity,
  getNationality,
  getReligion,
  getSection,
  getState,
  registerStaff,
  relieveStaff,
  relieveStud,
  studentStaff,
} from "../../services/api";
import { TOKEN_KEY } from "../../services/auth";
import {
  splitArrayIntoPairs,
  splitArrayIntoPairs2,
} from "../../services/common";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Registration = () => {
  const ids = useParams();
  console.log(ids.id, "love");
  const location = useLocation();
  const navigate = useNavigate();
  const propsData = location.state;
  const [formData, setFormData] = useState({});
  const [dropDown, SetDropDown] = useState({
    genderId: [
      { id: 1, value: "Male" },
      { id: 2, value: "Female" },
    ],
  });
  const [message, setMessage] = useState();
  const [state, setState] = useState();
  const [city, setCity] = useState();
  const [isSuccessVisible, setIsSuccessVisible] = useState(false);

  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    const getDropdownData = async (funcName, id, name) => {
      console.log(funcName);
      try {
        const response = await funcName(id, TOKEN_KEY);
        console.log(`${name} dropdown:`, response);
        const data = response.map((value, index) => ({
          id: value.id,
          value: value.name,
        }));
        SetDropDown((prevData) => ({
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
        SetDropDown((prevData) => ({
          ...prevData,
          stateId: data,
        }));
      } catch (err) {
        console.log(err);
      }
    };
    getStatedata();
    const getCitydata = async () => {
      try {
        const response = await getCity({ id: 0, stateId: city }, TOKEN_KEY);
        console.log("Citydropdownedsgedesaegfdasggasgedswretgsdg ", response);
        const data = response.map((value, index) => ({
          id: value.id,
          value: value.name,
        }));
        SetDropDown((prevData) => ({
          ...prevData,
          cityId: data,
        }));
      } catch (err) {
        console.log(err);
      }
    };
    getCitydata();
    getDropdownData(getNationality, 0, "nationalityId");
    getDropdownData(getClass, 0, "classId");
    getDropdownData(getSection, 0, "sectionId");
    getDropdownData(getCommunity, 0, "communityId");
    getDropdownData(getBloodGroup, 0, "bloodGroupId");
    getDropdownData(getReligion, 0, "religionId");
  }, [state, city]);

  function showMessage(response, duration = 5000) {
    setMessage(response.message);
    setIsSuccessVisible(true);
    setTimeout(() => {
      setIsSuccessVisible(false);
      setMessage(response.message);
      if (response.status === "Error" || response.status === "error") {
        toast.error(response.message);
      } else if (response.status === "Success" || response.status === "success") {
        toast.success(response.message);
      }
    }, duration);
  }
  function showMessages(response, duration = 5000) {
    console.log(response);
    setMessage(response);
    if (response.status === "Error" || response.status === "error") {
      toast.error(response.message);
    } else if (response.status === "Success" || response.status === "success") {
      toast.success(response.message);
    }
    setIsSuccessVisible(true);
    setTimeout(() => {
      setIsSuccessVisible(false);
      setMessage(response);
    }, duration);
  }
  function findMissingKeys(array, object) {
    return array.filter((key) => !object.hasOwnProperty(key));
  }
  function identifyCase(str) {
    // Check if string contains underscores or hyphens
    if (str.includes('_')) {
      return 'snake_case';
    } else if (str.includes('-')) {
      return 'kebab-case';
    }
  
    // Check if string contains uppercase letters other than the first character
    if (str !== str.toLowerCase()) {
      // Check if string starts with a lowercase letter
      if (str.charAt(0) === str.charAt(0).toLowerCase()) {
        return 'camelCase';
      } else {
        return 'PascalCase';
      }
    }
  
    // If none of the above conditions are met, it's likely in lowercase
    return 'lowercase';
  }
  function convertToTitleCase(inputString) {
    const words = inputString.split('_');

    let titleCaseString = words[0].charAt(0).toUpperCase() + words[0].slice(1).toLowerCase();
  
    for (let i = 1; i < words.length; i++) {
      titleCaseString += ' ' + words[i].charAt(0).toLowerCase() + words[i].slice(1).toLowerCase();
      console.log(words[i].charAt(0).toUpperCase())
    }
  
    return titleCaseString;
  }
  function camelCaseToWords(str) {
    const words = str.split(/(?=[A-Z])/);
    const result = words.map(word => word.charAt(0).toLowerCase() + word.slice(1)).join(' ');
    return result.charAt(0).toUpperCase() + result.slice(1);
  }

  function handleValidationErrors(missingKeys) {
    const newValidationErrors = {};
    Object.assign(newValidationErrors, validationErrors);
    missingKeys.forEach(key => {
      let title;
      if(identifyCase(key)==='snake_case'){
        title = convertToTitleCase(key)
     }else{
       title=camelCaseToWords(key)
     }
      newValidationErrors[key] = `${title} is required.`;
    });
    setValidationErrors(newValidationErrors);
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "nationalityId") {
      console.log(value);
      setState(value);
    }
    if (name === "stateId") {
      console.log("dkhsgjbavkjasghfuakjbk", value);
      setCity(value);
    }
    let errorMessage = "";

    if (name && value.trim() === "") {
      let title;
      if(identifyCase(name)==='snake_case'){
         title = convertToTitleCase(name)
      }else{
        title=camelCaseToWords(name)
      }
      errorMessage = `${title} is required.`;
    }
    setValidationErrors({ ...validationErrors, [name]: errorMessage });

    // const parsedValue = name === "stateId" ? parseInt(value, 10) : value;
    setFormData((prevInputValue) => ({
      ...prevInputValue,
      [name]: value,
    }));
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    const hasErrors = Object.values(validationErrors).some(
      (error) => error !== ""
    );
    console.log(validationErrors,"love")
  
    console.log(validationErrors);
    if (hasErrors) {
      console.log("Form has validation errors. Please correct them.");
      return; // Prevent form submission
    }
    switch (propsData) {
      case "Staff Registration":
        const postAdmin = async () => {
          try {
            let data = StaffRegistration.map((value) => value.name);
            const missingKeys = findMissingKeys(data, formData);
            console.log(missingKeys);
            if (missingKeys.length === 0) {
              const response = await registerStaff(formData, TOKEN_KEY);
              if (response.status === "success") {
                setFormData({});
              }
            } else {
              showMessages(missingKeys);
            }
          } catch (err) {
            console.log(err);
          }
        };
        postAdmin();
        break;
      case "Student Registration":
        const poststud = async () => {
          try {
            let data = StudentRegistration.map((value) => value.name);
            const missingKeys = findMissingKeys(data, formData);
            if (missingKeys.length === 0) {
              const response = await studentStaff(formData, TOKEN_KEY);
              if (response.status === "success") {
                setFormData({});
              }
            } else {
              showMessages(missingKeys);
            }
          } catch (err) {
            console.log(err);
          }
        };
        poststud();
        break;
      case "Student Relieving":
        const releivestud = async () => {
          try {
            let data = StudentRelieving.map((value) => value.name);
            formData.studentID=ids.id
            const missingKeys = findMissingKeys(data, formData);
            handleValidationErrors(missingKeys)
            if (missingKeys.length === 0) {
              const response = await relieveStud(formData, TOKEN_KEY);
              console.log(response,"love")
              if (response.status === "success") {
                setFormData({});
                toast.success(response.message, {
                  onClose: () => {
                    navigate("/list", { state: "Student List" });
                  },
                });
              }else{
                throw response.data
              }
            } else {
              console.log(missingKeys,"love")
              // toast.error("Fields are mandatory", {
              //   onClose: () => {
              //   },
              // });
            }
          } catch (err) {
            toast.error(err, {
              onClose: () => {
                // navigate("/studentinfo");
              },
            });
            console.log(err,"love");
          }
        };
        releivestud();
        break;
      case "Staff Relieving":
        const releivestaff = async () => {
          try {
            let data = StaffRelieving.map((value) => value.name);
            formData.staffId=ids.id
            const missingKeys = findMissingKeys(data, formData);
            handleValidationErrors(missingKeys)
            if (missingKeys.length === 0) {
              const response = await relieveStaff(formData, TOKEN_KEY);
              if (response.status === "success") {
                setFormData({});
                toast.success(response.message, {
                  onClose: () => {
                    navigate("/list", { state: "Staff List" });
                  },
                });
              } else {
                throw response.data
              }
            }
          } catch (err) {
            toast.error(err, {
              onClose: () => {
                // navigate("/studentinfo");
              },
            });
          }
        };
        releivestaff();
        break;
      default:
        console.log("No matching data scenario");
    }
    console.log(formData);
  };
  console.log("love",validationErrors)
  // const arrayOfPairs =propsData==='Admin Registration'?splitArrayIntoPairs(AdminRegistration):propsData==='Staff Registration'?splitArrayIntoPairs(StaffRegistration):splitArrayIntoPairs(StudentRegistration);
  let arrayOfPairs;

  switch (propsData) {
    case "Admin Registration":
      arrayOfPairs = splitArrayIntoPairs(AdminRegistration);
      break;
    case "Staff Registration":
      arrayOfPairs = splitArrayIntoPairs2(StaffRegistration);
      break;
    case "Student Registration":
      arrayOfPairs = splitArrayIntoPairs2(StudentRegistration);
      break;
    case "Student Relieving":
      arrayOfPairs = splitArrayIntoPairs(StudentRelieving);
      break;
    case "Staff Relieving":
      arrayOfPairs = splitArrayIntoPairs(StaffRelieving);
      break;
    case "Admin Relieving":
      arrayOfPairs = splitArrayIntoPairs([]);
      break;
    case "Exam Report":
      arrayOfPairs = splitArrayIntoPairs(examreport);
      break;
    default:
      arrayOfPairs = splitArrayIntoPairs(StudentRegistration);
  }

  function InputField({ data, formData, handleInputChange }) {
    return (
      <>
        <div className="input-container">
          <label className="input-label">{data.label} &nbsp; <span style={{color:'red'}}>*</span></label>
          <input
           style={{
            border: `1px solid ${validationErrors[data.name]
              ? "red"
              : "#cdcbcb"
              }`
          }}
            className="effect-1"
            type={data.type}
            name={data.name}
            value={data.name=='studentID'||data.name=='staffId'?ids.id:formData[data.name] || ""}
            disabled={data.name=='studentID'||data.name=='staffId'?true:false}
            onChange={handleInputChange}
          />
        </div>
        {validationErrors[data.name] && (
          <div className="error-message1">{validationErrors[data.name]}</div>
        )}
      </>
    );
  }
  function SelectField({ data, dropDown, handleInputChange }) {
    return (
      <>
        {" "}
        <div className="input-container">
          <label className="input-label">{data.label}</label>
          <select
            className="effect-1"
            name={data.name}
            value={data.value}
            onChange={handleInputChange}
          >
            {data.value ? (
              <option value={data.value}>{data.value}</option>
            ) : (
              <option value="">Select an option</option>
            )}
            {dropDown[data.name] && (
              <>
                {dropDown[data.name].map((option, index) => (
                  <option key={index} value={option.id}>
                    {option.value}
                  </option>
                ))}
              </>
            )}
          </select>
        </div>
        {validationErrors[data.name] && (
          <div className="error-message1">{validationErrors[data.name]}</div>
        )}
      </>
    );
  }

  console.log(propsData,"898989");

  return (
    <>
      <div>{/* <h3>{propsData}</h3> */}</div>
      <div className="table-container">
        <ul
          class="breadcrumb"
          style={{ display: "flex", alignItems: "center" }}
        >
          <li>
          <Link to={"/list"} state={propsData=='Student Relieving'?"Student List":"Staff List"}>
                <a style={{ color: "#051F3E" }}>
                  <h4>{propsData=='Student Relieving'?"Student":"Staff"}</h4>
                </a>
              </Link>
          </li>
          <li>
            <a>{propsData}</a>
          </li>
        </ul>
        <span
            class="horizontal-line"
            style={{ background: "#F0F1F3", marginTop: "20px",marginBottom:"20px" }}
          ></span>
        {/* {isSuccessVisible && <h1 className="success-message">{message}</h1>} */}
        <div style={{border:'1px solid rgb(207, 207, 207)',borderRadius:'7px',width:'50%',marginLeft:'250px'}}>
        {arrayOfPairs.map((value, index) => (
          <div
            className="input-group"
            key={index}
            style={{ gap: "13px", marginTop: "10px",display:"flex",justifyContent:"center" }}
          >
            {value.map((data, dataIndex) => (
              <div className="input-container-registers" key={dataIndex}>
                {data.type === "select"
                  ? SelectField({ data, dropDown, handleInputChange })
                  : InputField({ data, formData, handleInputChange })}

                {/* <label className="input-label">{data.label}</label>
                                <input 
                                    className="effect-1"
                                    type={data.type}
                                    name={data.name}
                                    value={formData[data.name] || ''} 
                                    onChange={handleInputChange}
                                /> */}

                {/* <label className="input-label">{data.label}</label>
                                <select
                                    className="effect-1"
                                    name={data.name}
                                    defaultValue={data.value}
                                    onChange={handleInputChange}
                                >
                                    {data.value ? <option value={data.value}>{data.value}</option> : <option value="">Select an option</option>
                                    }
                                    {dropDown.map((option, index) => (
                                        <option key={index} value={option.id}>
                                            {option.value}
                                        </option>
                                    ))}
                                </select> */}
              </div>
            ))}
          </div>
        ))}
       
        <div className="btn-style-registration" style={{padding:'10px'}}>
          <button class="cancel-button">Cancel</button>&nbsp;&nbsp;
          <button class="custom-button" onClick={handleSubmit}>
            Submit
          </button>
        </div>
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
    </>
  );
};

export default Registration;
