import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useFormik } from "formik";
import {
  createStudent,
  getBloodGroup,
  getCity,
  getClass,
  getCommunity,
  getExam,
  getNationality,
  getQualification,
  getReligion,
  getSection,
  getStafflist,
  getAdminlist,
  getState,
  getStudentlist,
  getSubject,
  getclassList,
  getsectionList,
  studentStaff,
  updateStudent,
  getStudentToCheck
} from "../../services/api";
import { STAFF_KEY, TOKEN_KEY, getToken } from "../../services/auth";
import "./list.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loader from "../../component/loader/Loader";

export default function Studendlist() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [view, setView] = useState();
  const [viewStaff, setViewStaff] = useState();
  const [emailRegex, setEmailRegex] = useState("/^[^s@]+@[^s@]+.[^s@]+$/");
  const ids = useParams();
  console.log(ids, "id");
  const inputRef = useRef(null);
  const token = getToken();
  useEffect(() => {
    inputRef.current.focus();
  }, []);

  const [values, setValues] = useState({
    contactType: "parent",
    isSiblings: "no",
    isParent: "no",
    isPreviousSchool: "no",
  });
  const handleRadioChange = (event) => {
    const { name, value } = event.target;
    setValues({ ...values, [name]: value });
    formik.setFieldValue(name, value);
    console.log(name, "name");
    if (name === "contactType" && value === "parent") {
      if (!formik.values.fatherName.trim()) {
        formik.setFieldError("fatherName", "Father's name is required.");
      }
      if (!formik.values.motherName.trim()) {
        formik.setFieldError("motherName", "Mother's name is required.");
      }
    }
    if (
      name === "isSiblings" &&
      value === "yes" &&
      !formik.values.siblingsId1.trim()
    ) {
      formik.setFieldError("siblingsId1", "admission ID is required.");
    } else if (
      name === "isParent" &&
      value === "yes" &&
      !formik.values.parentId1.trim()
    ) {
      formik.setFieldError("parentId1", "Parent ID is required.");
    } else if (
      name === "isPreviousSchool" &&
      value === "yes" &&
      !formik.values.schoolName.trim()
    ) {
      formik.setFieldError("schoolName", "school name is required.");
    }
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "nationalityId") {
      formik.values.stateId = "";
      console.log(value, "name");
      setState(-1);
      setCity(-1);
      formik.setFieldValue(name, value);
      setState(value);
    }
    if (name === "stateId") {
      formik.values.cityId = "";
      console.log(value, "name");
      formik.setFieldValue(name, value);
      setCity(value);
    }
    if (name === "classId") {
      formik.values.sectionId = "";
      formik.setFieldValue(name, value);
      setClasss(value);
      setSections(-1);
    }
    if (name === "sectionId") {
      formik.setFieldValue(name, value);
      setSections(value);
    }
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
    qualificationId: [],
  });
  const [state, setState] = useState();
  const [admissionValidate, setAdmissionValidate] = useState();
  const [city, setCity] = useState();
  const [viewAdminNo, SetviewAdminNo] = useState(0);
  const [classs, setClasss] = useState();
  const [sections, setSections] = useState(0);
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
  const formatPincode = (value) => {
    const cleanedValue = value.replace(/\D/g, "");
    return cleanedValue.replace(/(\d{3})(\d{3})/, "$1 $2").trim();
  };
  const handlePincodeChange = (event) => {
    const formattedValue = formatPincode(event.target.value);
    formik.setFieldValue("pincode", formattedValue);
  };
  const formatMobile = (value) => {
      const cleanedValue = value.replace(/\D/g, "");
      return cleanedValue.replace(/(\d{10})/, "$1 ").trim();
  };
  const handleKeyPress = (event) => {
    const keyCode = event.keyCode || event.which;

    if (keyCode < 48 || keyCode > 57) {
      event.preventDefault(); 
    }
  };

  const handleMobileChange = (event) => {
    const formattedValue = formatMobile(event.target.value);
    formik.setFieldValue("mobile", formattedValue);
    formik.setFieldValue("fatherMobile", formattedValue);
    formik.setFieldValue("motherMobile", formattedValue);
    formik.setFieldValue("guardianMobile", formattedValue);
  };

  const validate = (values) => {
    const errors = {};

    const regexNoSpace = /^[^\s](?:.*\S)?[^\s]$/;

    if (
      !values.admissionNo ||
      !regexNoSpace.test(values.admissionNo) ||
      values.admissionNo.includes("'")
    ) {
      errors.admissionNo = "Please enter admission no";
    }
    if (
      !values.firstName ||
      !regexNoSpace.test(values.firstName) ||
      values.firstName.includes("'")
    ) {
      errors.firstName = "Please enter first name";
    }
    if (!values.lastName) {
      errors.lastName = "Please enter last name";
    }
    if (!values.mobile) {
      errors.mobile = "Please enter valid mobile no";
    } else if (
      !/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/.test(values.mobile)
    ) {
      errors.mobile = "Please enter valid mobile no";
    }
    if (!values.pincode) {
      errors.pincode = "Please enter pin code";
    } else if (values.pincode.length < 7) {
      errors.pincode = "Pin Code must be 6 characters";
    }
    if (!values.genderId) {
      errors.genderId = "Please select gender";
    }
    if (!values.dateOfJoining) {
      errors.dateOfJoining = "Please select date of joining";
    }
    if (!values.dateOfBirth) {
      errors.dateOfBirth = "Please select date of birth";
    }
    if (!values.nationalityId) {
      errors.nationalityId = "Please select nationality";
    }
    if (!values.cityId) {
      errors.cityId = "Please select city";
    }
    if (!values.stateId) {
      errors.stateId = "Please select state";
    }

    if (!values.religionId) {
      errors.religionId = "Please select religion";
    }
    if (!values.communityId) {
      errors.communityId = "Please select community";
    }
    if (!values.bloodGroupId) {
      errors.bloodGroupId = "Please select blood group";
    }
    if (!values.adharCardNo) {
      errors.adharCardNo = "Please enter aadhar no";
    } else if (values.adharCardNo.length < 19) {
      errors.adharCardNo = "Aadhar must be 16 characters";
    }

    if (!values.classId) {
      errors.classId = "Please select class";
    }
    if (!values.sectionId) {
      errors.sectionId = "Please select section";
    }
    if (!values.emisNo) {
      errors.emisNo = "Please enter emis no";
    }
    if (!values.address1) {
      errors.address1 = "Please enter address";
    }
    if (!values.emailId || !/^\S+@\S+\.\S+$/.test(values.emailId)) {
      errors.emailId = "Please enter valid e-mail";
    }
    return errors;
  };
  console.log(dropDown, "name");

  const formik = useFormik({
    initialValues: {
      admissionNo: "",
      firstName: "",
      lastName: "",
      genderId: "",
      dateOfBirth: "",
      nationalityId: "",
      stateId: "",
      cityId: "",
      pincode: "",
      mobile: "",
      genderId: "",
      address1: "",
      emailId: "",
      religionId: "",
      communityId: "",
      bloodGroupId: "",
      adharCardNo: "",
      classId: "",
      sectionId: "",
      dateOfJoining: "",
      emisNo: "",
      rollNo: "-",
      fatherName: "",
      fatherQualification: "",
      fatherOccupation: "",
      fatherAnnualIncome: "",
      fatherMobileNo: "",
      fatherEmailId: "",
      motherName: "",
      motherQualification: "",
      motherOccupation: "",
      motherAnnualIncome: "",
      motherMobileNo: "",
      motherEmailId: "",
      guardianName: "",
      guardianQualification: "",
      guardianOccupation: "",
      guardianAnnualincome: "",
      guardianMobileNo: "",
      guardianEmail: "",
      contactType: "parent",
      isParent: "no",
      schoolName: "",
      reasonForReleaving: "",
      isPreviousSchool: "no",
      isSiblings: "no",
      parentId1: "",
      parentId2: "",
      siblingsId1: "",
      siblingsId2: "",
      siblingsId3: "",
    },
    validate,
    onSubmit: async (values, { resetForm }) => {
      if (values.contactType === "parent") {
        if (
          !values.fatherName ||
          !values.fatherQualification ||
          !values.fatherOccupation ||
          !values.fatherAnnualIncome ||
          !values.fatherEmailId ||
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.fatherEmailId) ||
          !values.fatherMobileNo ||
          values.fatherMobileNo.length < 10
        ) {
          return;
        }

        if (
          !values.motherName ||
          !values.motherQualification ||
          !values.motherOccupation ||
          !values.motherAnnualIncome ||
          !values.motherEmailId ||
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.motherEmailId) ||
          !values.motherMobileNo ||
          values.motherMobileNo.length < 10
        ) {
          return;
        }
      }
      if (values.contactType === "guardians") {
        if (
          !values.guardianName ||
          !values.guardianQualification ||
          !values.guardianOccupation ||
          !values.guardianAnnualincome ||
          !values.guardianEmail ||
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.guardianEmail) ||
          !values.guardianMobileNo ||
          values.guardianMobileNo.length < 10
        ) {
          return;
        }
      }

      if (values.isSiblings === "yes") {
        if (!values.siblingsId1) {
          return;
        }
      }

      if (values.isParent === "yes") {
        if (!values.parentId1) {
          return;
        }
      }
      if (values.isPreviousSchool === "yes") {
        if (!values.schoolName) {
          return;
        }
      }
      console.log(values, "values");
      try {
        const payload = {
          basicInfo: {
            admissionNo: values.admissionNo
              ? values.admissionNo.toString()
              : "",
            firstName: values.firstName ? values.firstName.toString() : "",
            lastName: values.lastName ? values.lastName.toString() : "",
            genderId: values.genderId ? parseInt(values.genderId) : 0,
            dateOfBirth: values.dateOfBirth
              ? values.dateOfBirth.toString()
              : "",
            nationalityId: values.nationalityId
              ? parseInt(values.nationalityId)
              : 0,
            stateId: values.stateId ? parseInt(values.stateId) : 0,
            cityId: values.cityId ? parseInt(values.cityId) : 0,
            address: values.address1 ? values.address1.toString() : "",
            pincode: values.pincode ? values.pincode.toString() : "",
            stdMobileNo: values.mobile ? values.mobile.toString() : "",
            stdEmail: values.emailId ? values.emailId.toString() : "",
            religionId: values.religionId ? parseInt(values.religionId) : 0,
            communityId: values.communityId ? parseInt(values.communityId) : 0,
            bloodGroupId: values.bloodGroupId
              ? parseInt(values.bloodGroupId)
              : 0,
            adharNo: values.adharCardNo ? values.adharCardNo.toString() : "",
            classId: values.classId ? parseInt(values.classId) : 0,
            sectionId: values.sectionId ? parseInt(values.sectionId) : 0,
            dateOfJoining: values.dateOfJoining
              ? values.dateOfJoining.toString()
              : "",
            emisNo: values.emisNo ? values.emisNo.toString() : "",
            rollNo: values.rollNo ? values.rollNo.toString() : "",
            contactType: values.contactType
              ? values.contactType.toString()
              : "",
            fatherName: values.fatherName ? values.fatherName.toString() : "",
            fatherQualification: values.fatherQualification
              ? values.fatherQualification.toString()
              : "",
            fatherOccupation: values.fatherOccupation
              ? values.fatherOccupation.toString()
              : "",
            fatherAnnualIncome: values.fatherAnnualIncome
              ? values.fatherAnnualIncome.toString()
              : "",
            fatherMobileNo: values.fatherMobileNo
              ? values.fatherMobileNo.toString()
              : "",
            fatherEmail: values.fatherEmailId
              ? values.fatherEmailId.toString()
              : "",
            motherName: values.motherName ? values.motherName.toString() : "",
            motherQualification: values.motherQualification
              ? values.motherQualification.toString()
              : "",
            motherOccupation: values.motherOccupation
              ? values.motherOccupation.toString()
              : "",
            motherAnnualIncome: values.motherAnnualIncome
              ? values.motherAnnualIncome.toString()
              : "",
            motherMobileNo: values.motherMobileNo
              ? values.motherMobileNo.toString()
              : "",
            motherEmail: values.motherEmailId
              ? values.motherEmailId.toString()
              : "",
            guardianName: values.guardianName
              ? values.guardianName.toString()
              : "",
            guardianQualification: values.guardianQualification
              ? values.guardianQualification.toString()
              : "",
            guardianOccupation: values.guardianOccupation
              ? values.guardianOccupation.toString()
              : "",
            guardianAnnualincome: values.guardianAnnualincome
              ? values.guardianAnnualincome.toString()
              : "",
            guardianMobileno: values.guardianMobileNo
              ? values.guardianMobileNo.toString()
              : "",
            guardianEmail: values.guardianEmail
              ? values.guardianEmail.toString()
              : "",
          },
          otherDetails: {
            isSiblings: values.isSiblings ? values.isSiblings.toString() : "",
            siblingsId1: values.siblingsId1
              ? values.siblingsId1.toString()
              : "",
            siblingsId2: values.siblingsId2
              ? values.siblingsId2.toString()
              : "",
            siblingsId3: values.siblingsId3
              ? values.siblingsId3.toString()
              : "",
            isParent: values.isParent ? values.isParent.toString() : "",
            parentId1: values.parentId1 ? values.parentId1.toString() : "",
            parentId2: values.parentId2 ? values.parentId2.toString() : "",
            isPreviousSchool: values.isPreviousSchool
              ? values.isPreviousSchool.toString()
              : "",
            schoolName: values.schoolName ? values.schoolName.toString() : "",
            reasonForReleaving: values.reasonForReleaving
              ? values.reasonForReleaving.toString()
              : "",
          },
        };

        console.log(payload);

        if (ids.id !== ":id") {
          const response = await updateStudent(payload, token);
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
                // resetForm();
                navigate(`/studentinfo/${response.id}`);
              },
            });
          }
        } else {
          const response = await createStudent(payload, token);
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
                // resetForm();
                navigate(`/studentinfo/${response.id}`);
              },
            });
          }
        }
      } catch (error) {
        console.error(error);
        toast.error("Error making API call");
      }
    },
  });

  useEffect(()=>{
    console.log("11111")
    if (ids.id == ":id") {
      const fetchData = async () => {
        try {
          const response = await getStudentToCheck({ userName: formik.values.admissionNo }, TOKEN_KEY);
          setAdmissionValidate(response.data)    
        } catch (error) {
          console.error("Error fetching student data:", error);
        }
      };
      fetchData()
    }
  },[ids,formik.values.admissionNo])

  useEffect(() => {
    if (ids.id === ":id") {
      formik.resetForm();
    }

  }, [ids]);
  const handleReset = () => {
    formik.resetForm();
  };
  useEffect(() => {
    setLoading(true);
    if (ids.id !== ":id") {
      console.log("firsttttt", ids);
      const getStatedata = async () => {
        try {
          const response = await getState({ id: 0, nationId: 0 }, TOKEN_KEY);
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
          const response = await getCity({ id: 0, stateId: 0 }, TOKEN_KEY);
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
      const getStudentList = async () => {
        try {
          const response = await getStudentlist(
            {
              classId: classs,
              sectionId: sections,
              userName: ids.id,
            },
            TOKEN_KEY
          );
          if (response.data && response.data.length > 0) {
            const studentData = response.data[0];
            setClasss(studentData.classId);
            formik.setValues({
              admissionNo: studentData.admissionNo,
              firstName: studentData.firstName,
              lastName: studentData.lastName,
              genderId: studentData.genderId,
              adharCardNo: parseInt(studentData.adharcardNo),
              pincode: studentData.pincode,
              mobile: studentData.mobile,
              emailId: studentData.emailId,
              address1: studentData.address1,
              dateOfBirth: studentData.dateOfBirth,
              dateOfJoining: studentData.dateOfJoining,
              nationalityId: studentData.nationalityId,
              cityId: studentData.cityId,
              stateId: studentData.stateId,
              classId: studentData.classId,
              sectionId: studentData.sectionId,
              religionId: studentData.religionId,
              communityId: studentData.communityId,
              bloodGroupId: studentData.bloodGroupId,
              emisNo: studentData.emisNo,
              rollNo: studentData.registrationNo,
              fatherName: studentData.fatherName,
              fatherOccupation: studentData.fatherOccupation,
              fatherQualification: studentData.fatherQualification,
              fatherAnnualIncome: studentData.fatherAnnualIncome,
              fatherMobileNo: studentData.parentMobileNo1,
              fatherEmailId: studentData.parentEmailId1,
              motherMobileNo: studentData.parentMobileNo2,
              motherEmailId: studentData.parentEmailId2,
              motherName: studentData.motherName,
              motherOccupation: studentData.motherOccupation,
              motherQualification: studentData.motherQualification,
              motherAnnualIncome: studentData.motherAnnualIncome,
              guardianMobileNo: studentData.parentMobileNo4,
              guardianEmail: studentData.parentEmailId3,
              guardianName: studentData.guardianName,
              guardianOccupation: studentData.guardianOccupation,
              guardianQualification: studentData.guardianQualification,
              guardianAnnualincome: studentData.guardianAnnualIncome,
              contactType: studentData.contactType,
              isSiblings: studentData.isSiblings,
              siblingsId1: studentData.siblingId1,
              siblingsId2: studentData.siblingId2,
              siblingsId3: studentData.siblingId3,
              parentId1: studentData.parentId1,
              parentId2: studentData.parentId2,
              isParent: studentData.isParent,
              isPreviousSchool: studentData.isPreviousSchool,
              schoolName: studentData.previousSchool,
              reasonForReleaving: studentData.reasonForReleaving,
            });
            setValues({
              ...values,
              contactType: studentData.contactType,
              isSiblings: studentData.isSiblings,
              isParent: studentData.isParent,
              isPreviousSchool: studentData.isPreviousSchool,
            });
          }
        } catch (err) {
          console.log(err);
        }
      };
      const getSectionlist = async () => {
        try {
          const response = await getsectionList(
            { id: 0, classId: classs },
            TOKEN_KEY
          );
          const section1 = response.data.map((value, index) => ({
            id: value.id,
            value: value.name,
          }));
          setDropDown((prevData) => ({
            ...prevData,
            sectionId: section1,
          }));
        } catch (err) {
          console.log(err);
        }
      };
      getSectionlist();
      getCitydata();
      getStatedata();
      getStudentList();
    }
    setLoading(false);
  }, [ids, classs, sections]);

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
    const getStudent = async () => {
      try {
        const response = await getStudentlist({ userName: 0 }, TOKEN_KEY);
        // console.log(response);
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
    const getStatedata = async () => {
      try {
        console.log("123456678", "123");
        const response = await getState({ id: 0, nationId: state }, TOKEN_KEY);
        console.log("state ", response);
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
        console.log("123456678", "1223");

        console.log(city, "name");
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
    const getClasslist = async () => {
      try {
        const response = await getclassList({ id: 0 }, TOKEN_KEY);
        const class1 = response.data.map((value, index) => ({
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
    const getSectionlist = async () => {
      try {
        const response = await getsectionList(
          { id: 0, classId: classs },
          TOKEN_KEY
        );
        const section1 = response.data.map((value, index) => ({
          id: value.id,
          value: value.name,
        }));
        setDropDown((prevData) => ({
          ...prevData,
          sectionId: section1,
        }));
      } catch (err) {
        console.log(err);
      }
    };
    getSectionlist();
    getClasslist();
    getStatedata();
    getCitydata();
    getStudent();
    getSubject1();
    getExamstaffExam1();
    getDropdownData(getNationality, 0, "nationalityId");
    getDropdownData(getReligion, 0, "religionId");
    getDropdownData(getCommunity, 0, "communityId");
    getDropdownData(getBloodGroup, 0, "bloodGroupId");
    getDropdownData(getQualification, 0, "qualificationId");
    setLoading(false);
  }, [state, city, classs]);

  const [studentData, setStudentData] = useState({ sibling1: {}, sibling2: {}, sibling3: {} });
  const [staffData, setStaffData] = useState({ parent1: {}, parent2: {} });
  const updateStudentData = (student, newData) => {
    // Update the state with new data for the specified student
    setStudentData(prevState => ({
      ...prevState,
      [student]: newData
    }));
  };
  const updateStaffData = (staff, newData) => {
    // Update the state with new data for the specified staff
    setStaffData(prevState => ({
      ...prevState,
      [staff]: newData
    }));
  };
  useEffect(() => {
    let data =
      view === 1
        ? formik.values.siblingsId1
        : view === 2
          ? formik.values.siblingsId2
          : formik.values.siblingsId3;
    const fetchData = async () => {
      try {
        const response = await getStudentlist({ userName: data }, TOKEN_KEY);
        console.log(response.data, "gokul")
        if (view === 1) {
          updateStudentData("sibling1", response.data);
        } else if (view === 2) {
          updateStudentData("sibling2", response.data);
        } else if (view === 3) {
          updateStudentData("sibling3", response.data);
        }


      } catch (error) {
        console.error("Error fetching student data:", error);
      }
    };
    fetchData();
    console.log(studentData, "1212")
  }, [
    view,
    formik.values.siblingsId1,
    formik.values.siblingsId2,
    formik.values.siblingsId3,
  ]);
  useEffect(() => {
    let data =
      viewStaff === 1
        ? formik.values.parentId1
        : formik.values.parentId2;
    const fetchData = async () => {
      try {
        const response = await getStafflist(data, TOKEN_KEY);
        const response1 = await getAdminlist(data, TOKEN_KEY);
        let dataValue = response.data.length !== 0 ? response.data : response1.data.length !== 0 ? response1.data : [];
        if (viewStaff === 1) {
          updateStaffData("parent1", dataValue);
        } else if (viewStaff === 2) {
          updateStaffData("parent2", dataValue);
        }

      } catch (error) {
        console.error("Error fetching student data:", error);
      }
    };
    fetchData();
    console.log(staffData, "1212")
  }, [
    viewStaff,
    formik.values.parentId1,
    formik.values.parentId2
  ]);

  const [modalOpen, setModalOpen] = useState(false);

  const handleFile = (id) => {
    setView(id);
    setModalOpen(true);
  };
  const handleFileParent = (id) => {
    setViewStaff(id);
    setModalOpen(true);
  };
  const viewData = (id) => {
    setView(id);
    console.log(studentData, "gokul")
  };
  const viewDataParent = (id) => {
    setViewStaff(id);
    console.log(staffData, "gokul")
  };

  const closeModal = () => {
    setView();
    setViewStaff();
    setModalOpen(false);
  };
  const handleBack = () => {
    navigate("/list", { state: "Student List" });
  };
  return (
    <div>
      <div className="table-container">
        <div>
          <ul
            class="breadcrumb"
            style={{ display: "flex", alignItems: "center" }}
          >
            <li>
              <Link to={"/list"} state={"Student List"}>
                <a style={{ color: "#051F3E" }}>
                  <h4>Student</h4>
                </a>
              </Link>
            </li>
            <li>
              <a>Basic Info</a>
            </li>
          </ul>
          <span
            className="horizontal-line"
            style={{ background: "#F0F1F3", marginTop: "20px" }}
          ></span>
        </div>
        {loading ? (
          <div className="mt-5 mb-5">
            <Loader />
          </div>
        ) : (
          <form
            className="ng-untouched ng-pristine ng-invalid"
            onSubmit={formik.handleSubmit}
          >
            <div className="table-main">
              <div
                class="input-group"
                style={{ gap: "20px", marginTop: "10px" }}
              >
                <div class="input-container-registers">
                  <div class="input-container">
                    <label class="input-label">
                      Admission No
                      <span
                        style={{
                          color: "red",
                          fontWeight: "400",
                          paddingLeft: "5px",
                        }}
                      >
                        *
                      </span>{" "}
                    </label>
                    <input
                      ref={inputRef}
                      style={{
                        border: `1px solid ${(formik.touched.admissionNo &&
                          formik.errors.admissionNo) ||(admissionValidate?.length>0 && formik.values.admissionNo)
                          ? "red"
                          : "#cdcbcb"
                          }`,
                        width: "240px"
                      }}
                      disabled={ids.id !== ":id" ? true : false}
                      className={`effect-3 size ${formik.touched.admissionNo && formik.errors.admissionNo
                        ? "is-invalid"
                        : ""
                        }`}
                      type="text"
                      name="admissionNo"
                      onChange={formik.handleChange}
                      // onBlur={(e) => {
                      //   formik.handleBlur(e)
                      //   SetviewAdminNo(!viewAdminNo)
                      // }}
                      onBlur={formik.handleBlur}
                      value={formik.values.admissionNo}
                    />
                    {formik.touched.admissionNo && formik.errors.admissionNo  ? (
                      <div
                        className="text-danger"
                        style={{
                          color: "red",
                          fontSize: "12px",
                          marginBottom: "-10px",
                          marginTop: "1px",
                        }}
                      >
                        {formik.errors.admissionNo}.
                      </div>
                    ) : null}
                       {admissionValidate?.length>0 && formik.values.admissionNo ? (
                      <div
                        className="text-danger"
                        style={{
                          color: "red",
                          fontSize: "12px",
                          marginBottom: "-10px",
                          marginTop: "1px",
                        }}
                      >
                        Admission no. already exists.
                      </div>
                    ) : null}
                  </div>
                </div>
                <div class="input-container-registers">
                  <div class="input-container">
                    <label class="input-label">
                      First Name
                      <span
                        style={{
                          color: "red",
                          fontWeight: "400",
                          paddingLeft: "5px",
                        }}
                      >
                        *
                      </span>{" "}
                    </label>
                    <input
                      style={{
                        border: `1px solid ${formik.touched.firstName && formik.errors.firstName
                          ? "red"
                          : "#cdcbcb"
                          }`,
                        width: "240px"
                      }}
                      className={`effect-3 size ${formik.touched.firstName && formik.errors.firstName
                        ? "is-invalid"
                        : ""
                        }`}
                      type="text"
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
                    <label class="input-label">
                      Last Name
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
                    <input
                      style={{
                        border: `1px solid ${formik.touched.lastName && formik.errors.lastName
                          ? "red"
                          : "#cdcbcb"
                          }`,
                      }}
                      className={`effect-3 size ${formik.touched.lastName && formik.errors.lastName
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
                        border: `1px solid ${formik.touched.genderId && formik.errors.genderId
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
                      <option value="">Select Gender</option>
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
              </div>
              <div
                class="input-group"
                style={{ gap: "15px", marginTop: "-15px" }}
              >
                <div class="input-container-registers">
                  <div class="input-container">
                    <label class="input-label">
                      Date Of Birth
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
                    <input
                      style={{
                        border: `1px solid ${formik.touched.dateOfBirth &&
                          formik.errors.dateOfBirth
                          ? "red"
                          : "#cdcbcb"
                          }`,
                        width: "240px"
                      }}
                      className={`effect-3 size ${formik.touched.dateOfBirth && formik.errors.dateOfBirth
                        ? "is-invalid"
                        : ""
                        }`}
                      type="date"
                      max={new Date().toISOString().split("T")[0]}
                      name="dateOfBirth"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
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
                      Nationality
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
                        border: `1px solid ${formik.touched.nationalityId &&
                          formik.errors.nationalityId
                          ? "red"
                          : "#cdcbcb"
                          }`,
                      }}
                      id="nationalityId"
                      name="nationalityId"
                      className="effect-3"
                      // onChange={formik.handleChange}
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
                        border: `1px solid ${formik.touched.stateId && formik.errors.stateId
                          ? "red"
                          : "#cdcbcb"
                          }`,
                      }}
                      id="stateId"
                      name="stateId"
                      className="effect-3"
                      onChange={(e) => handleInputChange(e)}
                      onBlur={formik.handleBlur}
                      value={formik.values.stateId}
                    >
                      <option selected>Select State</option>
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
                        border: `1px solid ${formik.touched.cityId && formik.errors.cityId
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
                      <option value="">Select City</option>
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
              </div>
              <div
                class="input-group"
                style={{ gap: "15px", marginTop: "-15px" }}
              >
                <div class="input-container-registers">
                  <div class="input-container">
                    <label class="input-label">
                      Address
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
                    <textarea
                      style={{
                        height: "100px",
                        resize: "none",
                        border: `1px solid ${formik.touched.address1 && formik.errors.address1
                          ? "red"
                          : "#cdcbcb"
                          }`,
                      }}
                      className={`effect-3 size ${formik.touched.address1 && formik.errors.address1
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
                    <label class="input-label">
                      Pin Code
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
                    <input
                      style={{
                        border: `1px solid ${formik.touched.pincode && formik.errors.pincode
                          ? "red"
                          : "#cdcbcb"
                          }`,
                      }}
                      className={`effect-3 size ${formik.touched.pincode && formik.errors.pincode
                        ? "is-invalid"
                        : ""
                        }`}
                      type="text"
                      name="pincode"
                      maxLength={6}
                      onChange={handlePincodeChange}
                      onBlur={formik.handleBlur}
                      value={formatPincode(formik.values.pincode)}
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
                <div class="input-container-registers">
                  <div class="input-container">
                    <label class="input-label">
                      Mobile No
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
                    <input
                      style={{
                        border: `1px solid ${formik.touched.mobile && formik.errors.mobile
                          ? "red"
                          : "#cdcbcb"
                          }`,
                      }}
                      className={`effect-3 size ${formik.touched.mobile && formik.errors.mobile
                        ? "is-invalid"
                        : ""
                        }`}
                      type="text"
                      name="mobile"
                      maxLength={10}
                      // minLength={10}
                      onChange={handleMobileChange}
                      onBlur={formik.handleBlur}
                      value={formatMobile(formik.values.mobile)}
                    />
                    {formik.touched.mobile && formik.errors.mobile ? (
                      <div
                        className="text-danger"
                        style={{
                          color: "red",
                          fontSize: "12px",
                          marginBottom: "-10px",
                          marginTop: "1px",
                        }}
                      >
                        {formik.errors.mobile}
                      </div>
                    ) : null}
                  </div>
                </div>
                <div class="input-container-registers">
                  <div class="input-container">
                    <label class="input-label">
                      Email-Id
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
                    <input
                      style={{
                        border: `1px solid ${formik.touched.emailId && formik.errors.emailId
                          ? "red"
                          : "#cdcbcb"
                          }`,
                      }}
                      className={`effect-3 size ${formik.touched.emailId && formik.errors.emailId
                        ? "is-invalid"
                        : ""
                        }`}
                      type="email"
                      name="emailId"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.emailId}
                    />
                    {formik.touched.emailId && formik.errors.emailId ? (
                      <div
                        className="text-danger"
                        style={{
                          color: "red",
                          fontSize: "12px",
                          marginBottom: "-10px",
                          marginTop: "1px",
                        }}
                      >
                        {formik.errors.emailId}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
              <div
                class="input-group"
                style={{ gap: "15px", marginTop: "-76px" }}
              >
                <div class="input-container-registers">
                  <div class="input-container">
                    <label class="input-label"></label>
                    <select
                      hidden
                      style={{
                        border: `1px solid ${formik.touched.religionId && formik.errors.religionId
                          ? "red"
                          : "#cdcbcb"
                          }`,
                      }}
                      id="religionId"
                      name="religionId"
                      className="effect-3"
                    // onChange={formik.handleChange}
                    // onBlur={formik.handleBlur}
                    // value={formik.values.religionId}
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
                        border: `1px solid ${formik.touched.religionId && formik.errors.religionId
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
                        border: `1px solid ${formik.touched.communityId &&
                          formik.errors.communityId
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
                <div class="input-container-registers">
                  <div class="input-container">
                    <label class="input-label">
                      Blood Group
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
                        border: `1px solid ${formik.touched.bloodGroupId &&
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
                      <option value="">Select Blood Group</option>
                      {dropDown.bloodGroupId.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.value}
                        </option>
                      ))}
                    </select>
                    {formik.touched.bloodGroupId &&
                      formik.errors.bloodGroupId ? (
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
                class="input-group"
                style={{ gap: "15px", marginTop: "-15px" }}
              >
                <div className="input-container-registers">
                  <div className="input-container">
                    <label className="input-label">
                      Aadhar No
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
                        border: `1px solid ${formik.touched.adharCardNo &&
                          formik.errors.adharCardNo
                          ? "red"
                          : "#cdcbcb"
                          }`,
                      }}
                      className={`effect-3 size ${formik.touched.adharCardNo && formik.errors.adharCardNo
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
                    <label class="input-label">
                      Class
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
                        border: `1px solid ${formik.touched.classId && formik.errors.classId
                          ? "red"
                          : "#cdcbcb"
                          }`,
                      }}
                      id="classId"
                      name="classId"
                      className="effect-3"
                      onChange={(e) => handleInputChange(e)}
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
                    {formik.touched.classId && formik.errors.classId ? (
                      <div
                        className="text-danger"
                        style={{
                          color: "red",
                          fontSize: "12px",
                          marginBottom: "-10px",
                          marginTop: "1px",
                        }}
                      >
                        {formik.errors.classId}
                      </div>
                    ) : null}
                  </div>
                </div>
                <div class="input-container-registers">
                  <div class="input-container">
                    <label class="input-label">
                      Section
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
                        border: `1px solid ${formik.touched.sectionId && formik.errors.sectionId
                          ? "red"
                          : "#cdcbcb"
                          }`,
                      }}
                      id="sectionId"
                      name="sectionId"
                      className="effect-3"
                      onBlur={formik.handleBlur}
                      onChange={(e) => handleInputChange(e)}
                      value={formik.values.sectionId}
                    >
                      <option value="">Select Section</option>
                      {dropDown.sectionId.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.value}
                        </option>
                      ))}
                    </select>
                    {formik.touched.sectionId && formik.errors.sectionId ? (
                      <div
                        className="text-danger"
                        style={{
                          color: "red",
                          fontSize: "12px",
                          marginBottom: "-10px",
                          marginTop: "1px",
                        }}
                      >
                        {formik.errors.sectionId}
                      </div>
                    ) : null}
                  </div>
                </div>
                <div class="input-container-registers">
                  <div class="input-container">
                    <label class="input-label">
                      Date of joining
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
                    <input
                      style={{
                        border: `1px solid ${formik.touched.dateOfJoining &&
                          formik.errors.dateOfJoining
                          ? "red"
                          : "#cdcbcb"
                          }`,
                      }}
                      className={`effect-3 size ${formik.touched.dateOfJoining &&
                        formik.errors.dateOfJoining
                        ? "is-invalid"
                        : ""
                        }`}
                      type="date"
                      name="dateOfJoining"
                      max={new Date().toISOString().split("T")[0]}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
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
                style={{
                  gap: "15px",
                  marginTop: "-15px",
                  display: "flex",
                  justifyContent: "Start",
                }}
              >
                <div class="input-container-registers">
                  <div class="input-container">
                    <label class="input-label">
                      Emis No
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
                    <input
                      style={{
                        width: "240px",
                        border: `1px solid ${formik.touched.emisNo && formik.errors.emisNo
                          ? "red"
                          : "#cdcbcb"
                          }`,
                      }}
                      className={`effect-3 size ${formik.touched.emisNo && formik.errors.emisNo
                        ? "is-invalid"
                        : ""
                        }`}
                      type="text"
                      name="emisNo"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.emisNo}
                    />
                    {formik.touched.emisNo && formik.errors.emisNo ? (
                      <div
                        className="text-danger"
                        style={{
                          color: "red",
                          fontSize: "12px",
                          marginBottom: "-10px",
                          marginTop: "1px",
                        }}
                      >
                        {formik.errors.emisNo}
                      </div>
                    ) : null}
                  </div>
                </div>
                {ids.id !== ":id" ? (
                  <>
                    <div class="input-container-registers">
                      <div
                        class="input-container"
                        style={{ marginLeft: "-52px" }}
                      >
                        <label class="input-label">
                          Roll No
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
                        <input
                          style={{
                            width: "245px",
                            border: `1px solid ${formik.touched.rollNo && formik.errors.rollNo
                              ? "red"
                              : "#cdcbcb"
                              }`,
                          }}
                          className={`effect-3 size ${formik.touched.rollNo && formik.errors.rollNo
                            ? "is-invalid"
                            : ""
                            }`}
                          type="text"
                          name="rollNo"
                          disabled
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          value={formik.values.rollNo}
                        />
                        {formik.touched.rollNo && formik.errors.rollNo ? (
                          <div
                            className="text-danger"
                            style={{
                              color: "red",
                              fontSize: "12px",
                              marginBottom: "-10px",
                              marginTop: "1px",
                            }}
                          >
                            {formik.errors.rollNo}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                  </>
                )}
              </div>
              <div style={{ display: "grid" }}>
                <a
                  style={{
                    padding: "5px",
                    fontSize: "16px",
                    fontWeight: "400",
                  }}
                >
                  Contact Info{" "}
                </a>
                <span
                  class="horizontal-line"
                  style={{ background: "#F0F1F3" }}
                ></span>
              </div>
              <div style={{ display: "flex", marginTop: "10px" }}>
                <div>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      fontWeight: "400",
                      fontSize: "15px",
                    }}
                  >
                    <input
                      type="radio"
                      name="contactType"
                      value="parent"
                      checked={values.contactType === "parent"}
                      onChange={handleRadioChange}
                    />
                    <span style={{ fontWeight: "600" }}>Parent</span>
                  </label>
                </div>
                <div style={{ marginLeft: "25px" }}>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      fontWeight: "400",
                      fontSize: "15px",
                    }}
                  >
                    <input
                      type="radio"
                      name="contactType"
                      value="guardians"
                      checked={values.contactType === "guardians"}
                      onChange={handleRadioChange}
                    />
                    <span style={{ fontWeight: "600" }}>Guardians</span>
                  </label>
                </div>
              </div>
              {values.contactType === "parent" && (
                <>
                  <div
                    class="input-group"
                    style={{ gap: "15px", marginTop: "15px" }}
                  >
                    <div class="input-container-registers">
                      <div class="input-container">
                        <label class="input-label">
                          Father Name
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
                        <input
                          style={{
                            border: `1px solid ${formik.touched.fatherName &&
                              !formik.values.fatherName
                              ? "red"
                              : "#cdcbcb"
                              }`,
                            width: "240px"
                          }}
                          className={`effect-3 size ${formik.touched.fatherName &&
                            formik.errors.fatherName
                            ? "is-invalid"
                            : ""
                            }`}
                          type="text"
                          name="fatherName"
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          value={formik.values.fatherName}
                        />
                        {formik.touched.fatherName &&
                          !formik.values.fatherName ? (
                          <div
                            className="text-danger"
                            style={{
                              color: "red",
                              fontSize: "12px",
                              marginBottom: "-10px",
                              marginTop: "1px",
                            }}
                          >
                            Please enter father name
                          </div>
                        ) : null}
                      </div>
                    </div>
                    <div class="input-container-registers">
                      <div class="input-container">
                        <label class="input-label">
                          Father Qualification
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
                        <input
                          style={{
                            border: `1px solid ${formik.touched.fatherQualification &&
                              !formik.values.fatherQualification
                              ? "red"
                              : "#cdcbcb"
                              }`,
                            width: "240px"
                          }}
                          className={`effect-3 size ${formik.touched.fatherQualification &&
                            formik.errors.fatherQualification
                            ? "is-invalid"
                            : ""
                            }`}
                          type="text"
                          name="fatherQualification"
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          value={formik.values.fatherQualification}
                        />
                        {formik.touched.fatherQualification &&
                          !formik.values.fatherQualification ? (
                          <div
                            className="text-danger"
                            style={{
                              color: "red",
                              fontSize: "12px",
                              marginBottom: "-10px",
                              marginTop: "1px",
                            }}
                          >
                            Please enter father qualification
                          </div>
                        ) : null}
                      </div>
                    </div>
                    <div class="input-container-registers">
                      <div class="input-container">
                        <label class="input-label">
                          Father Occupation
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
                        <input
                          style={{
                            border: `1px solid ${formik.touched.fatherOccupation &&
                              !formik.values.fatherOccupation
                              ? "red"
                              : "#cdcbcb"
                              }`,
                            width: "240px"
                          }}
                          className={`effect-3 size ${formik.touched.fatherOccupation &&
                            formik.errors.fatherOccupation
                            ? "is-invalid"
                            : ""
                            }`}
                          type="text"
                          name="fatherOccupation"
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          value={formik.values.fatherOccupation}
                        />
                        {formik.touched.fatherOccupation &&
                          !formik.values.fatherOccupation ? (
                          <div
                            className="text-danger"
                            style={{
                              color: "red",
                              fontSize: "12px",
                              marginBottom: "-10px",
                              marginTop: "1px",
                            }}
                          >
                            Please enter father occupation
                          </div>
                        ) : null}
                      </div>
                    </div>
                    <div class="input-container-registers">
                      <div class="input-container">
                        <label class="input-label">
                          Father Annual Income
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
                        <input
                          style={{
                            border: `1px solid ${formik.touched.fatherAnnualIncome &&
                              !formik.values.fatherAnnualIncome
                              ? "red"
                              : "#cdcbcb"
                              }`,
                            width: "240px"
                          }}
                          className={`effect-3 size ${formik.touched.fatherAnnualIncome &&
                            formik.errors.fatherAnnualIncome
                            ? "is-invalid"
                            : ""
                            }`}
                          type="text"
                          name="fatherAnnualIncome"
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          value={formik.values.fatherAnnualIncome}
                          onKeyPress={handleKeyPress}
                        />
                        {formik.touched.fatherAnnualIncome &&
                          !formik.values.fatherAnnualIncome ? (
                          <div
                            className="text-danger"
                            style={{
                              color: "red",
                              fontSize: "12px",
                              marginBottom: "-10px",
                              marginTop: "1px",
                            }}
                          >
                            Please enter father annual income
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                  <div
                    class="input-group"
                    style={{
                      gap: "15px",
                      marginTop: "-10px",
                      display: "flex",
                      justifyContent: "start",
                    }}
                  >
                    <div class="input-container-registers">
                      <div class="input-container">
                        <label class="input-label">
                          Father Mobile No
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
                        <input
                          style={{
                            border: `1px solid ${formik.touched.fatherMobileNo &&
                              !formik.values.fatherMobileNo
                              ? "red"
                              : "#cdcbcb"
                              }`,
                            width: "240px"
                          }}
                          className={`effect-3 size ${formik.touched.fatherMobileNo &&
                            formik.errors.fatherMobileNo
                            ? "is-invalid"
                            : ""
                            }`}
                          type="text"
                          name="fatherMobileNo"
                          maxLength={10}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          value={formatMobile(formik.values.fatherMobileNo)}
                        />
                        {formik.touched.fatherMobileNo &&
                          !formik.values.fatherMobileNo &&
                          formik.touched.fatherMobileNo &&
                          formik.values.fatherMobileNo.length < 10 ? (
                          <div
                            className="text-danger"
                            style={{
                              color: "red",
                              fontSize: "12px",
                              marginBottom: "-10px",
                              marginTop: "1px",
                            }}
                          >
                            Please enter valid father mobile No
                          </div>
                        ) : null}
                      </div>
                    </div>
                    <div
                      class="input-container-registers"
                      style={{ marginLeft: "-51px" }}
                    >
                      <div class="input-container">
                        <label class="input-label">
                          Father Email-Id
                          <span
                            style={{
                              color: "red",
                              fontWeight: "400",
                              paddingLeft: "5px",
                              width: "210px"
                            }}
                          >
                            *
                          </span>
                        </label>
                        <input
                          style={{
                            border: `1px solid ${formik.touched.fatherEmailId &&
                              !formik.values.fatherEmailId
                              ? "red"
                              : "#cdcbcb"
                              }`,
                            width: "240px"
                          }}
                          className={`effect-3 size ${formik.touched.fatherEmailId &&
                            formik.errors.fatherEmailId
                            ? "is-invalid"
                            : ""
                            }`}
                          type="email"
                          name="fatherEmailId"
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          value={formik.values.fatherEmailId}
                        />
                        {formik.touched.fatherEmailId &&
                          !formik.values.fatherEmailId &&
                          formik.touched.fatherEmailId &&
                          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                            formik.values.fatherEmailId
                          ) ? (
                          <div
                            className="text-danger"
                            style={{
                              color: "red",
                              fontSize: "12px",
                              marginBottom: "-10px",
                              marginTop: "1px",
                            }}
                          >
                            Please enter valid father e-mail
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                  <div
                    class="input-group"
                    style={{ gap: "15px", marginTop: "15px" }}
                  >
                    <div class="input-container-registers">
                      <div class="input-container">
                        <label class="input-label">
                          Mother Name
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
                        <input
                          style={{
                            border: `1px solid ${formik.touched.motherName &&
                              !formik.values.motherName
                              ? "red"
                              : "#cdcbcb"
                              }`,
                            width: "240px"
                          }}
                          className={`effect-3 size ${formik.touched.motherName &&
                            formik.errors.motherName
                            ? "is-invalid"
                            : ""
                            }`}
                          type="text"
                          name="motherName"
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          value={formik.values.motherName}
                        />
                        {formik.touched.motherName &&
                          !formik.values.motherName ? (
                          <div
                            className="text-danger"
                            style={{
                              color: "red",
                              fontSize: "12px",
                              marginBottom: "-10px",
                              marginTop: "1px",
                            }}
                          >
                            Please enter mother name
                          </div>
                        ) : null}
                      </div>
                    </div>
                    <div class="input-container-registers">
                      <div class="input-container">
                        <label class="input-label">
                          Mother Qualification
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
                        <input
                          style={{
                            border: `1px solid ${formik.touched.motherQualification &&
                              !formik.values.motherQualification
                              ? "red"
                              : "#cdcbcb"
                              }`,
                            width: "240px"
                          }}
                          className={`effect-3 size ${formik.touched.motherQualification &&
                            formik.errors.motherQualification
                            ? "is-invalid"
                            : ""
                            }`}
                          type="text"
                          name="motherQualification"
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          value={formik.values.motherQualification}
                        />
                        {formik.touched.motherQualification &&
                          !formik.values.motherQualification ? (
                          <div
                            className="text-danger"
                            style={{
                              color: "red",
                              fontSize: "12px",
                              marginBottom: "-10px",
                              marginTop: "1px",
                            }}
                          >
                            Please enter mother qualification
                          </div>
                        ) : null}
                      </div>
                    </div>
                    <div class="input-container-registers">
                      <div class="input-container">
                        <label class="input-label">
                          Mother Occupation
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
                        <input
                          style={{
                            border: `1px solid ${formik.touched.motherOccupation &&
                              !formik.values.motherOccupation
                              ? "red"
                              : "#cdcbcb"
                              }`,
                            width: "240px"
                          }}
                          className={`effect-3 size ${formik.touched.motherOccupation &&
                            formik.errors.motherOccupation
                            ? "is-invalid"
                            : ""
                            }`}
                          type="text"
                          name="motherOccupation"
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          value={formik.values.motherOccupation}
                        />
                        {formik.touched.motherOccupation &&
                          !formik.values.motherOccupation ? (
                          <div
                            className="text-danger"
                            style={{
                              color: "red",
                              fontSize: "12px",
                              marginBottom: "-10px",
                              marginTop: "1px",
                            }}
                          >
                            Please enter mother occupation
                          </div>
                        ) : null}
                      </div>
                    </div>
                    <div class="input-container-registers">
                      <div class="input-container">
                        <label class="input-label">
                          Mother Annual Income
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
                        <input
                          style={{
                            border: `1px solid ${formik.touched.motherAnnualIncome &&
                              !formik.values.motherAnnualIncome
                              ? "red"
                              : "#cdcbcb"
                              }`,
                            width: "240px"
                          }}
                          className={`effect-3 size ${formik.touched.motherAnnualIncome &&
                            formik.errors.motherAnnualIncome
                            ? "is-invalid"
                            : ""
                            }`}
                          type="text"
                          name="motherAnnualIncome"
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          value={formik.values.motherAnnualIncome}
                          onKeyPress={handleKeyPress}
                        />
                        {formik.touched.motherAnnualIncome &&
                          !formik.values.motherAnnualIncome ? (
                          <div
                            className="text-danger"
                            style={{
                              color: "red",
                              fontSize: "12px",
                              marginBottom: "-10px",
                              marginTop: "1px",
                            }}
                          >
                            Please enter mother annual income
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                  <div
                    class="input-group"
                    style={{
                      gap: "15px",
                      marginTop: "-10px",
                      display: "flex",
                      justifyContent: "start",
                    }}
                  >
                    <div class="input-container-registers">
                      <div class="input-container">
                        <label class="input-label">
                          Mother Mobile No
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
                        <input
                          style={{
                            border: `1px solid ${formik.touched.motherMobileNo &&
                              !formik.values.motherMobileNo
                              ? "red"
                              : "#cdcbcb"
                              }`,
                            width: "240px"
                          }}
                          className={`effect-3 size ${formik.touched.motherMobileNo &&
                            formik.errors.motherMobileNo
                            ? "is-invalid"
                            : ""
                            }`}
                          type="text"
                          name="motherMobileNo"
                          maxLength={10}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          value={formatMobile(formik.values.motherMobileNo)}
                        />
                        {formik.touched.motherMobileNo &&
                          !formik.values.motherMobileNo &&
                          formik.values.motherMobileNo.length < 10 ? (
                          <div
                            className="text-danger"
                            style={{
                              color: "red",
                              fontSize: "12px",
                              marginBottom: "-10px",
                              marginTop: "1px",
                            }}
                          >
                            Please enter valid mother Mobile No
                          </div>
                        ) : null}
                      </div>
                    </div>
                    <div
                      class="input-container-registers"
                      style={{ marginLeft: "-51px" }}
                    >
                      <div class="input-container">
                        <label class="input-label">
                          Mother Email-Id
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
                        <input
                          style={{
                            border: `1px solid ${formik.touched.motherEmailId &&
                              !formik.values.motherEmailId
                              ? "red"
                              : "#cdcbcb"
                              }`,
                            width: "240px"
                          }}
                          className={`effect-3 size ${formik.touched.motherEmailId &&
                            formik.errors.motherEmailId
                            ? "is-invalid"
                            : ""
                            }`}
                          type="email"
                          name="motherEmailId"
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          value={formik.values.motherEmailId}
                        />
                        {formik.touched.motherEmailId &&
                          !formik.values.motherEmailId &&
                          formik.touched.motherEmailId &&
                          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                            formik.values.motherEmailId
                          ) ? (
                          <div
                            className="text-danger"
                            style={{
                              color: "red",
                              fontSize: "12px",
                              marginBottom: "-10px",
                              marginTop: "1px",
                            }}
                          >
                            Please enter valid mother e-mail
                          </div>
                        ) : null}
                      </div>
                    </div>
                    {/* <div
                    class="input-container-registers"
                    style={{ marginLeft: "-51px" }}
                  >
                    <div class="input-container">
                      <label class="input-label">Mother Email-Id  <span
                          style={{
                            color: "red",
                            fontWeight: "400",
                            paddingLeft: "5px",
                          }}
                        >
                          *
                        </span></label>
                      <input
                        style={{ width: "245px" }}
                        className={`effect-3 size ${
                          formik.touched.motherEmailId &&
                          formik.errors.motherEmailId
                            ? "is-invalid"
                            : ""
                        }`}
                        type="email"
                        name="motherEmailId"
                        pattern="[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.motherEmailId}
                      />
                      {formik.touched.motherEmailId &&
                      !formik.errors.motherEmailId ? (
                        <div
                          className="text-danger"
                          style={{
                            color: "red",
                            fontSize: "12px",
                            marginBottom: "-10px",
                            marginTop: "1px",
                          }}
                        >
                         Please enter mother e-mail
                        </div>
                      ) : null}{" "}
                    </div>
                  </div> */}
                  </div>
                </>
              )}
              {values.contactType === "guardians" && (
                <>
                  <div
                    class="input-group"
                    style={{ gap: "15px", marginTop: "14px" }}
                  >
                    <div class="input-container-registers">
                      <div class="input-container">
                        <label class="input-label">
                          Name
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
                        <input
                          style={{
                            border: `1px solid ${formik.touched.guardianName &&
                              !formik.values.guardianName
                              ? "red"
                              : "#cdcbcb"
                              }`,
                            width: "240px"
                          }}
                          className={`effect-3 size ${formik.touched.guardianName &&
                            formik.errors.guardianName
                            ? "is-invalid"
                            : ""
                            }`}
                          type="text"
                          name="guardianName"
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          value={formik.values.guardianName}
                        />
                        {formik.touched.guardianName &&
                          !formik.values.guardianName ? (
                          <div
                            className="text-danger"
                            style={{
                              color: "red",
                              fontSize: "12px",
                              marginBottom: "-10px",
                              marginTop: "1px",
                            }}
                          >
                            {formik.errors.guardianName}Please ender guardian
                            name
                          </div>
                        ) : null}
                      </div>
                    </div>
                    <div class="input-container-registers">
                      <div class="input-container">
                        <label class="input-label">
                          Qualification
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
                        <input
                          style={{
                            border: `1px solid ${formik.touched.guardianQualification &&
                              !formik.values.guardianQualification
                              ? "red"
                              : "#cdcbcb"
                              }`,
                            width: "240px"
                          }}
                          className={`effect-3 size ${formik.touched.guardianQualification &&
                            formik.errors.guardianQualification
                            ? "is-invalid"
                            : ""
                            }`}
                          type="text"
                          name="guardianQualification"
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          value={formik.values.guardianQualification}
                        />
                        {formik.touched.guardianQualification &&
                          !formik.values.guardianQualification ? (
                          <div
                            className="text-danger"
                            style={{
                              color: "red",
                              fontSize: "12px",
                              marginBottom: "-10px",
                              marginTop: "1px",
                            }}
                          >
                            Please enter guardian qualification
                          </div>
                        ) : null}
                      </div>
                    </div>
                    <div class="input-container-registers">
                      <div class="input-container">
                        <label class="input-label">
                          Occupation
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
                        <input
                          style={{
                            border: `1px solid ${formik.touched.guardianOccupation &&
                              !formik.values.guardianOccupation
                              ? "red"
                              : "#cdcbcb"
                              }`,
                            width: "240px"
                          }}
                          className={`effect-3 size ${formik.touched.guardianOccupation &&
                            formik.errors.guardianOccupation
                            ? "is-invalid"
                            : ""
                            }`}
                          type="text"
                          name="guardianOccupation"
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          value={formik.values.guardianOccupation}
                        />
                        {formik.touched.guardianOccupation &&
                          !formik.values.guardianOccupation ? (
                          <div
                            className="text-danger"
                            style={{
                              color: "red",
                              fontSize: "12px",
                              marginBottom: "-10px",
                              marginTop: "1px",
                            }}
                          >
                            Please enter guardian occupation
                          </div>
                        ) : null}
                      </div>
                    </div>
                    <div class="input-container-registers">
                      <div class="input-container">
                        <label class="input-label">
                          Annual Income
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
                        <input
                          style={{
                            border: `1px solid ${formik.touched.guardianAnnualincome &&
                              !formik.values.guardianAnnualincome
                              ? "red"
                              : "#cdcbcb"
                              }`,
                            width: "240px"
                          }}
                          className={`effect-3 size ${formik.touched.guardianAnnualincome &&
                            formik.errors.guardianAnnualincome
                            ? "is-invalid"
                            : ""
                            }`}
                          type="text"
                          name="guardianAnnualincome"
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          value={formik.values.guardianAnnualincome}
                          onKeyPress={handleKeyPress}
                        />
                        {formik.touched.guardianAnnualincome &&
                          !formik.values.guardianAnnualincome ? (
                          <div
                            className="text-danger"
                            style={{
                              color: "red",
                              fontSize: "12px",
                              marginBottom: "-10px",
                              marginTop: "1px",
                            }}
                          >
                            Please enter guardian annual income
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                  <div
                    class="input-group"
                    style={{
                      marginTop: "-9px",
                      display: "flex",
                      justifyContent: "start",
                    }}
                  >
                    <div class="input-container-registers">
                      <div class="input-container">
                        <label class="input-label">
                          Mobile no
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
                        <input
                          style={{
                            border: `1px solid ${formik.touched.guardianMobileNo &&
                              !formik.values.guardianMobileNo
                              ? "red"
                              : "#cdcbcb"
                              }`,
                            width: "248px"
                          }}
                          className={`effect-3 size ${formik.touched.guardianMobileNo &&
                            formik.errors.guardianMobileNo
                            ? "is-invalid"
                            : ""
                            }`}
                          type="text"
                          name="guardianMobileNo"
                          maxLength={10}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          value={formatMobile(formik.values.guardianMobileNo)}
                        />
                        {formik.touched.guardianMobileNo &&
                          !formik.values.guardianMobileNo &&
                          formik.touched.guardianMobileNo &&
                          formik.values.guardianMobileNo.length < 10 ? (
                          <div
                            className="text-danger"
                            style={{
                              color: "red",
                              fontSize: "12px",
                              marginBottom: "-10px",
                              marginTop: "1px",
                            }}
                          >
                            Please enter guardian mobile no
                          </div>
                        ) : null}
                      </div>
                    </div>
                    <div
                      class="input-container-registers"
                      style={{ marginLeft: "-37px" }}
                    >
                      <div class="input-container">
                        <label class="input-label">
                          Email-Id
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
                        <input
                          style={{
                            border: `1px solid ${formik.touched.guardianEmail &&
                              !formik.values.guardianEmail
                              ? "red"
                              : "#cdcbcb"
                              }`,
                            width: "248px"
                          }}
                          className={`effect-3 size ${formik.touched.guardianEmail &&
                            formik.errors.guardianEmail
                            ? "is-invalid"
                            : ""
                            }`}
                          type="email"
                          name="guardianEmail"
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          value={formik.values.guardianEmail}
                        />
                        {(formik.touched.guardianEmail &&
                          !formik.values.guardianEmail) ||
                          (formik.touched.guardianEmail &&
                            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                              formik.values.guardianEmail
                            )) ? (
                          <div
                            className="text-danger"
                            style={{
                              color: "red",
                              fontSize: "12px",
                              marginBottom: "-10px",
                              marginTop: "1px",
                            }}
                          >
                            Please enter guardian valid e-mail
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </>
              )}
              <span
                class="horizontal-line"
                style={{
                  background: "#F0F1F3",
                  marginTop: "7px",
                  marginBottom: "15px",
                }}
              ></span>
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  alignItems: "center",
                  marginBottom: "15px",
                }}
              >
                <p>
                  Are the siblings currently enrolled in this school :{" "}
                  <span
                    style={{
                      color: "red",
                      fontWeight: "400",
                      fontFamily: "sans-serif",
                    }}
                  >
                    *
                  </span>{" "}
                </p>
                <div style={{ display: "flex", gap: "3px" }}>
                  <input
                    type="radio"
                    id="yesSibling"
                    name="isSiblings"
                    value="yes"
                    checked={values.isSiblings === "yes"}
                    onChange={handleRadioChange}
                  />
                  <label htmlFor="yesSibling">Yes </label>
                </div>
                <div style={{ display: "flex", gap: "3px" }}>
                  <input
                    type="radio"
                    id="noSibling"
                    name="isSiblings"
                    value="no"
                    checked={values.isSiblings === "no"}
                    onChange={handleRadioChange}
                  />
                  <label htmlFor="noSibling">No</label>
                </div>
                {formik.touched.isSiblings && formik.errors.isSiblings ? (
                  <div
                    className="text-danger"
                    style={{
                      color: "red",
                      fontSize: "12px",
                      marginBottom: "-10px",
                      marginTop: "-10px",
                    }}
                  >
                    {formik.errors.isSiblings}
                  </div>
                ) : null}
                {values.isSiblings === "yes" && (
                  <>
                    <div style={{ display: "block" }}>
                      <input
                        style={{
                          border: `1px solid ${formik.touched.siblingsId1 &&
                            !formik.values.siblingsId1
                            ? "red"
                            : "#cdcbcb"
                            }`,
                          width: "150px"
                        }}
                        className={`effect-3 size ${formik.touched.siblingsId1 &&
                          formik.errors.siblingsId1
                          ? "is-invalid"
                          : ""
                          }`}
                        type="text"
                        name="siblingsId1"
                        placeholder="Admission no 1"
                        onChange={formik.handleChange}
                        onBlur={() => {
                          formik.handleBlur("siblingsId1");
                          viewData(1)
                        }}
                        value={formik.values.siblingsId1}
                      />
                      {formik.values.siblingsId1 && (
                        <i
                          className="bx  bx-show-alt"
                          style={{ marginLeft: "10px" }}
                          onClick={() => handleFile(1)}
                        ></i>
                      )}
                      {formik.values.siblingsId1 && studentData.sibling1.length == [] ? (
                        <div
                          className="text-danger"
                          style={{
                            color: "red",
                            fontSize: "11px",
                            marginBottom: "-12px",
                          }}
                        >
                          Sibling1 admission no. wrong
                        </div>
                      ) : (
                        formik.touched.siblingsId1 &&
                        !formik.values.siblingsId1 && (
                          <div
                            className="text-danger"
                            style={{
                              color: "red",
                              fontSize: "11px",
                              marginBottom: "-12px",
                            }}
                          >
                            Admission no. is required
                          </div>
                        )
                      )}
                      {/* {((formik.values.siblingsId1 === formik.values.siblingsId2 && formik.values.siblingsId2 === formik.values.siblingsId3) ||
                        (formik.values.siblingsId1 === formik.values.siblingsId2) ||
                        (formik.values.siblingsId2 === formik.values.siblingsId3) ||
                        (formik.values.siblingsId1 === formik.values.siblingsId3)) && (
                          <div
                            className="text-danger"
                            style={{
                              color: "red",
                              fontSize: "11px",
                              marginBottom: "-12px",
                            }}
                          >
                            Already SiblingsID is entered.
                          </div>
                        )} */}
                      {modalOpen && view && (
                        <div className="modal-overlay admission">
                          <div
                            className="modal-contents"
                            style={{ width: "550px" }}
                          >
                            <span className="modal-close " onClick={closeModal}>
                              <i
                                class="bx bxs-x-circle"
                                style={{ fontSize: "20px", color: "gray" }}
                              ></i>
                            </span>
                            {view == 1 ? <>{studentData.sibling1.length > 0 ? (
                              <div style={{ display: "flex" }}>
                                <div className="modals">
                                  {studentData.sibling1.map((student) => (
                                    <>
                                      <tr key={student.id}>
                                        <td>
                                          <h2
                                          >
                                            Admission no: {student.admissionNo}
                                          </h2>
                                        </td>
                                      </tr>
                                      <tr key={student.id}>
                                        <td
                                        >
                                          Student Name
                                        </td>
                                        <td
                                        >
                                          :
                                        </td>
                                        <td
                                          className="Names"

                                        >
                                          
                                          {student.studentName}
                                        </td>
                                      </tr>
                                      <tr>
                                        <td

                                        >
                                          Registration No
                                        </td>
                                        <td

                                        >
                                          :
                                        </td>
                                        <td
                                          className="Names"

                                        >
                                          {student.registrationNo}
                                        </td>
                                      </tr>
                                      <tr>
                                        <td

                                        >
                                          Class & Section
                                        </td>
                                        <td

                                        >
                                          :
                                        </td>
                                        <td

                                        >
                                          {student.class} - {student.section}
                                        </td>
                                      </tr>
                                      <tr>
                                        <td

                                        >
                                          Gender
                                        </td>
                                        <td

                                        >
                                          :
                                        </td>
                                        <td

                                        >
                                          {student.gender}
                                        </td>
                                      </tr>
                                      <tr>
                                        <td

                                        >
                                          Address
                                        </td>
                                        <td

                                        >
                                          :
                                        </td>
                                        <td


                                        >
                                          {student.address1}
                                        </td>
                                      </tr>
                                      <tr>
                                        <td

                                        >
                                          Pin Code
                                        </td>
                                        <td

                                        >
                                          :
                                        </td>
                                        <td

                                        >
                                          {student.pincode}
                                        </td>
                                      </tr>
                                      <tr>
                                        <td

                                        >
                                          Mobile
                                        </td>
                                        <td

                                        >
                                          :
                                        </td>
                                        <td

                                        >
                                          {student.mobile}
                                        </td>
                                      </tr>
                                      <tr>
                                        <td

                                        >
                                          Emis No
                                        </td>
                                        <td

                                        >
                                          :
                                        </td>
                                        <td

                                        >
                                          {student.emisNo}
                                        </td>
                                      </tr>
                                      <tr>
                                        <td

                                        >
                                          BloodGroup
                                        </td>
                                        <td

                                        >
                                          :
                                        </td>
                                        <td

                                        >
                                          {student.bloodgroup}
                                        </td>
                                      </tr>
                                      <tr>
                                        <td

                                        >
                                          Date of Birth
                                        </td>
                                        <td

                                        >
                                          :
                                        </td>
                                        <td

                                        >
                                          {student.dateOfBirth}
                                        </td>
                                      </tr>
                                    </>
                                  ))}
                                </div>
                                <div
                                  className="img-con"
                                  style={{
                                    float: "inline-start",
                                    display: "flex",
                                    alignItems: "center",
                                  }}
                                >
                                  {studentData.sibling1.map((student) => (
                                    <img
                                      style={{ borderRadius: "0" }}
                                      src={student.photoUrl}
                                      alt="student"
                                    />
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <div>
                                <p>No data found...</p>
                              </div>
                            )}</>
                              : view == 2 ? <>{studentData.sibling2.length > 0 ? (
                                <div style={{ display: "flex" }}>
                                  <div className="modals">
                                    {studentData.sibling2.map((student) => (
                                      <>
                                        <tr key={student.id}>
                                          <td

                                          >
                                            <h2

                                            >
                                              Admission no: {student.admissionNo}
                                            </h2>
                                          </td>
                                        </tr>
                                        <tr key={student.id}>
                                          <td

                                          >
                                            Student Name
                                          </td>
                                          <td

                                          >
                                            :
                                          </td>
                                          <td


                                          >
                                            
                                            {student.studentName}
                                          </td>
                                        </tr>
                                        <tr>
                                          <td

                                          >
                                            Registration No
                                          </td>
                                          <td

                                          >
                                            :
                                          </td>
                                          <td


                                          >
                                            {student.registrationNo}
                                          </td>
                                        </tr>
                                        <tr>
                                          <td

                                          >
                                            Class & Section
                                          </td>
                                          <td

                                          >
                                            :
                                          </td>
                                          <td

                                          >
                                            {student.class} - {student.section}
                                          </td>
                                        </tr>
                                        <tr>
                                          <td

                                          >
                                            Gender
                                          </td>
                                          <td

                                          >
                                            :
                                          </td>
                                          <td

                                          >
                                            {student.gender}
                                          </td>
                                        </tr>
                                        <tr>
                                          <td

                                          >
                                            Address
                                          </td>
                                          <td

                                          >
                                            :
                                          </td>
                                          <td

                                          >
                                            {student.address1}
                                          </td>
                                        </tr>
                                        <tr>
                                          <td

                                          >
                                            Pin Code
                                          </td>
                                          <td

                                          >
                                            :
                                          </td>
                                          <td

                                          >
                                            {student.pincode}
                                          </td>
                                        </tr>
                                        <tr>
                                          <td

                                          >
                                            Mobile
                                          </td>
                                          <td

                                          >
                                            :
                                          </td>
                                          <td

                                          >
                                            {student.mobile}
                                          </td>
                                        </tr>
                                        <tr>
                                          <td

                                          >
                                            Emis No
                                          </td>
                                          <td

                                          >
                                            :
                                          </td>
                                          <td

                                          >
                                            {student.emisNo}
                                          </td>
                                        </tr>
                                        <tr>
                                          <td

                                          >
                                            BloodGroup
                                          </td>
                                          <td

                                          >
                                            :
                                          </td>
                                          <td

                                          >
                                            {student.bloodgroup}
                                          </td>
                                        </tr>
                                        <tr>
                                          <td

                                          >
                                            Date of Birth
                                          </td>
                                          <td

                                          >
                                            :
                                          </td>
                                          <td

                                          >
                                            {student.dateOfBirth}
                                          </td>
                                        </tr>
                                      </>
                                    ))}
                                  </div>
                                  <div
                                    className="img-con"
                                    style={{
                                      float: "inline-start",
                                      display: "flex",
                                      alignItems: "center",
                                    }}
                                  >
                                    {studentData.sibling2.map((student) => (
                                      <img
                                        style={{ borderRadius: "0" }}
                                        src={student.photoUrl}
                                        alt="student"
                                      />
                                    ))}
                                  </div>
                                </div>
                              ) : (
                                <div>
                                  <p>No data found...</p>
                                </div>
                              )}</> : <>{studentData.sibling3.length > 0 ? (
                                <div style={{ display: "flex" }}>
                                  <div className="modals">
                                    {studentData.sibling3.map((student) => (
                                      <>
                                        <tr key={student.id}>
                                          <td

                                          >
                                            <h2

                                            >
                                              Admission no: {student.admissionNo}
                                            </h2>
                                          </td>
                                        </tr>
                                        <tr key={student.id}>
                                          <td

                                          >
                                            Student Name
                                          </td>
                                          <td

                                          >
                                            :
                                          </td>
                                          <td

                                          >
                                            
                                            {student.studentName}
                                          </td>
                                        </tr>
                                        <tr>
                                          <td

                                          >
                                            Registration No
                                          </td>
                                          <td

                                          >
                                            :
                                          </td>
                                          <td

                                          >
                                            {student.registrationNo}
                                          </td>
                                        </tr>
                                        <tr>
                                          <td

                                          >
                                            Class & Section
                                          </td>
                                          <td

                                          >
                                            :
                                          </td>
                                          <td

                                          >
                                            {student.class} - {student.section}
                                          </td>
                                        </tr>
                                        <tr>
                                          <td

                                          >
                                            Gender
                                          </td>
                                          <td

                                          >
                                            :
                                          </td>
                                          <td

                                          >
                                            {student.gender}
                                          </td>
                                        </tr>
                                        <tr>
                                          <td

                                          >
                                            Address
                                          </td>
                                          <td

                                          >
                                            :
                                          </td>
                                          <td

                                          >
                                            {student.address1}
                                          </td>
                                        </tr>
                                        <tr>
                                          <td

                                          >
                                            Pin Code
                                          </td>
                                          <td

                                          >
                                            :
                                          </td>
                                          <td

                                          >
                                            {student.pincode}
                                          </td>
                                        </tr>
                                        <tr>
                                          <td

                                          >
                                            Mobile
                                          </td>
                                          <td

                                          >
                                            :
                                          </td>
                                          <td

                                          >
                                            {student.mobile}
                                          </td>
                                        </tr>
                                        <tr>
                                          <td

                                          >
                                            Emis No
                                          </td>
                                          <td

                                          >
                                            :
                                          </td>
                                          <td

                                          >
                                            {student.emisNo}
                                          </td>
                                        </tr>
                                        <tr>
                                          <td

                                          >
                                            BloodGroup
                                          </td>
                                          <td

                                          >
                                            :
                                          </td>
                                          <td

                                          >
                                            {student.bloodgroup}
                                          </td>
                                        </tr>
                                        <tr>
                                          <td

                                          >
                                            Date of Birth
                                          </td>
                                          <td

                                          >
                                            :
                                          </td>
                                          <td

                                          >
                                            {student.dateOfBirth}
                                          </td>
                                        </tr>
                                      </>
                                    ))}
                                  </div>
                                  <div
                                    className="img-con"
                                    style={{
                                      float: "inline-start",
                                      display: "flex",
                                      alignItems: "center",
                                    }}
                                  >
                                    {studentData.sibling3.map((student) => (
                                      <img
                                        style={{ borderRadius: "0" }}
                                        src={student.photoUrl}
                                        alt="student"
                                      />
                                    ))}
                                  </div>
                                </div>
                              ) : (
                                <div>
                                  <p>No data found...</p>
                                </div>
                              )}</>}

                          </div>
                        </div>
                      )}
                    </div>
                    <div>
                      <div style={{ display: "flex" }}>
                        <input
                          className={`effect-3 size ${formik.touched.siblingsId2 &&
                            formik.errors.siblingsId2
                            ? "is-invalid"
                            : ""
                            }`}
                          type="text"
                          name="siblingsId2"
                          placeholder="Admission no 2"
                          onChange={formik.handleChange}
                          onBlur={() => {
                            formik.handleBlur("siblingsId2");
                            viewData(2)
                          }}
                          value={formik.values.siblingsId2}
                        />
                        {formik.values.siblingsId2 && (
                          <>
                            <div
                              onClick={() => handleFile(2)}
                              style={{ display: "flex", alignItems: "center" }}
                            >
                              
                              <i
                                className="bx  bx-show-alt"
                                style={{
                                  marginLeft: "10px",
                                }}
                              ></i>
                            </div>
                          </>
                        )}
                      </div>

                      {formik.values.siblingsId2 && studentData.sibling2.length === 0 &&
                        !formik.isSubmitting && (
                          <div
                            className="text-danger"
                            style={{
                              color: "red",
                              fontSize: "11px",
                              marginBottom: "-12px",
                            }}
                          >
                            Sibling2 admission no. wrong
                          </div>
                        )}
                    </div>
                    <div>
                      <div style={{ display: "flex" }}>
                        <input
                          className={`effect-3 size ${formik.touched.siblingsId3 &&
                            formik.errors.siblingsId3
                            ? "is-invalid"
                            : ""
                            }`}
                          type="text"
                          name="siblingsId3"
                          placeholder="Admission no 3"
                          onChange={formik.handleChange}
                          onBlur={() => {
                            formik.handleBlur("siblingsId3");
                            viewData(3)
                          }}
                          value={formik.values.siblingsId3}
                        />
                        {formik.values.siblingsId3 && (
                          <div
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            <i
                              className="bx  bx-show-alt"
                              style={{ marginLeft: " 10px" }}
                              onClick={() => handleFile(3)}
                            ></i>
                          </div>
                        )}
                      </div>
                      {formik.values.siblingsId3 &&
                        studentData.sibling3.length === 0 &&
                        !formik.isSubmitting && (
                          <div
                            className="text-danger"
                            style={{
                              color: "red",
                              fontSize: "11px",
                              marginBottom: "-12px",
                            }}
                          >
                            Sibling3 admission no. wrong
                          </div>
                        )}
                    </div>
                  </>
                )}
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  alignItems: "center",
                  marginBottom: "15px",
                  fontFamily: "sans-serif",
                }}
              >
                <p>
                  Do any of the parent work at this school :
                  <span
                    style={{
                      color: "red",
                      fontWeight: "400",
                      fontFamily: "sans-serif",
                    }}
                  >
                    *
                  </span>
                </p>
                <div style={{ display: "flex", gap: "3px" }}>
                  <input
                    type="radio"
                    id="yesParent"
                    name="isParent"
                    value="yes"
                    checked={values.isParent === "yes"}
                    onChange={handleRadioChange}
                  />
                  <label htmlFor="yesParent">Yes </label>
                </div>
                <div style={{ display: "flex", gap: "3px" }}>
                  <input
                    type="radio"
                    id="noParent"
                    name="isParent"
                    value="no"
                    checked={values.isParent === "no"}
                    onChange={handleRadioChange}
                  />
                  <label htmlFor="noParent">No</label>
                </div>
                {formik.touched.isParent && formik.errors.isParent ? (
                  <div
                    className="text-danger"
                    style={{
                      color: "red",
                      fontSize: "12px",
                      marginBottom: "-10px",
                      marginTop: "-10px",
                    }}
                  >
                    {formik.errors.isParent}
                  </div>
                ) : null}
                {values.isParent === "yes" && (
                  <>
                    <div style={{ display: "block" }}>
                      <input
                        style={{
                          border: `1px solid ${formik.touched.parentId1 &&
                            !formik.values.parentId1
                            ? "red"
                            : "#cdcbcb"
                            }`,
                          width: "240px"
                        }}
                        className={`effect-3 size ${formik.touched.parentId1 && formik.errors.parentId1
                          ? "is-invalid"
                          : ""
                          }`}
                        type="text"
                        name="parentId1"
                        placeholder="Staff Id 1"
                        onChange={formik.handleChange}
                        onBlur={() => {
                          formik.handleBlur("parentId1");
                          viewDataParent(1)
                        }}
                        value={formik.values.parentId1}
                      />
                      {formik.values.parentId1 && (
                        <i
                          className="bx  bx-show-alt"
                          style={{ marginLeft: "10px" }}
                          onClick={() => handleFileParent(1)}
                        ></i>
                      )}
                      {formik.touched.parentId1 && !formik.values.parentId1 && (
                        <div
                          className="text-danger"
                          style={{
                            color: "red",
                            fontSize: "11px",
                            marginBottom: "-12px",
                          }}
                        >
                          Staff id is required.
                        </div>
                      )}
                      {formik.values.parentId1 && staffData.parent1.length === 0 && (
                        <div
                          className="text-danger"
                          style={{
                            color: "red",
                            fontSize: "11px",
                            marginBottom: "-12px",
                          }}
                        >
                          staff id is  wrong.
                        </div>
                      )}
                      {modalOpen && viewStaff && (
                        <div className="modal-overlay admission">
                          <div
                            className=" modal-contents"
                            style={{ width: "550px" }}
                          >
                            <span className="modal-close " onClick={closeModal}>
                              <i
                                class="bx bxs-x-circle"
                                style={{ fontSize: "20px", color: "gray" }}
                              ></i>
                            </span>
                            {viewStaff == 1 ? <>{staffData.parent1.length > 0 ? (
                              <div style={{ display: "flex" }}>
                                <div className="modals">
                                  {staffData.parent1.map((student) => (
                                    <>
                                      <tr key={student.staffId ? student.staffId : student.adminUserId}>
                                        <td
                                         
                                        >
                                          <h2 
                                          >
                                            Staff Id: {student.staffId ? student.staffId : student.adminUserId}
                                          </h2>
                                        </td>
                                      </tr>
                                      <tr key={student.staffId}>
                                        <td
                                        
                                        >
                                          Staff Name
                                        </td>
                                        <td
                                         
                                        >
                                          :{" "}
                                        </td>
                                        <td
                                         
                                        >
                                          {" "}
                                          {student.staffName ? student.staffName : student.adminName}
                                        </td>
                                      </tr>
                                      <tr>
                                        <td
                                         
                                        >
                                          Qualification{" "}
                                        </td>
                                        <td
                                         
                                        >
                                          :{" "}
                                        </td>
                                        <td
                                         
                                        >
                                          {student.qualification}
                                        </td>
                                      </tr>
                                      <tr>
                                        <td
                                        
                                        >
                                          Department{" "}
                                        </td>
                                        <td
                                         
                                        >
                                          :{" "}
                                        </td>
                                        <td
                                         
                                        >
                                          {student.department}
                                        </td>
                                      </tr>
                                      <tr>
                                        <td
                                         
                                        >
                                          Gender
                                        </td>
                                        <td
                                         
                                        >
                                          :{" "}
                                        </td>
                                        <td
                                         
                                        >
                                          {student.gender}
                                        </td>
                                      </tr>
                                      <tr>
                                        <td
                                         
                                        >
                                          Address
                                        </td>
                                        <td
                                         
                                        >
                                          :{" "}
                                        </td>
                                        <td
                                         
                                        >
                                          {student.city}
                                        </td>
                                      </tr>
                                      <tr>
                                        <td
                                          
                                        >
                                          Pin Code
                                        </td>
                                        <td
                                         
                                        >
                                          :{" "}
                                        </td>
                                        <td
                                         
                                        >
                                          {student.pincode}
                                        </td>
                                      </tr>
                                      <tr>
                                        <td
                                         
                                        >
                                          Mobile{" "}
                                        </td>
                                        <td
                                         
                                        >
                                          :{" "}
                                        </td>
                                        <td
                                         
                                        >
                                          {student.contact_number ? student.contact_number : student.phoneNumber}
                                        </td>
                                      </tr>
                                      <tr>
                                        <td
                                         
                                        >
                                          Role Of Staff
                                        </td>
                                        <td
                                         
                                        >
                                          :{" "}
                                        </td>
                                        <td
                                         
                                        >
                                          {student.roleOfStaff ? student.roleOfStaff : "Admin"}
                                        </td>
                                      </tr>
                                      <tr>
                                        <td
                                         
                                        >
                                          BloodGroup
                                        </td>
                                        <td
                                         >
                                          :{" "}
                                        </td>
                                        <td
                                          
                                        >
                                          {student.bloodGroup}
                                        </td>
                                      </tr>
                                      <tr>
                                        <td
                                        >
                                          Date of Birth
                                        </td>
                                        <td
                                        
                                        >
                                          :{" "}
                                        </td>
                                        <td
                                        
                                        >
                                          {student.date_of_birth ? student.date_of_birth : student.dateOfBirth}
                                        </td>
                                      </tr>
                                    </>
                                  ))}
                                </div>
                                <div
                                  className="img-con"
                                  style={{
                                    float: "inline-start",
                                    display: "flex",
                                    alignItems: "center",
                                  }}
                                >
                                  {staffData.parent1.map((student) => (
                                    <img
                                      style={{ borderRadius: "0" }}
                                      src={student.image ? student.image : student.photoUrl}
                                      alt="student"
                                    />
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <div>
                                <p>No data found...</p>
                              </div>
                            )}</>
                              : <>{staffData.parent2.length > 0 ? (
                                <div style={{ display: "flex" }}>
                                  <div className="modals">
                                    {staffData.parent2.map((student) => (
                                      <>
                                        <tr key={student.staffId}>
                                          <td
                                           
                                          >
                                            <h2 
                                              
                                            >
                                              Staff Id: {student.staffId ? student.staffId : student.adminUserId}
                                            </h2>
                                          </td>
                                        </tr>
                                        <tr key={student.staffId}>
                                          <td
                                           
                                          >
                                            Staff Name
                                          </td>
                                          <td
                                            
                                          >
                                            :{" "}
                                          </td>
                                          <td
                                           
                                          >
                                            {" "}
                                            {student.staffName ? student.staffName : student.adminName}
                                          </td>
                                        </tr>
                                        <tr>
                                          <td
                                           
                                          >
                                            Qualification{" "}
                                          </td>
                                          <td
                                          
                                          >
                                            :{" "}
                                          </td>
                                          <td
                                         
                                          >
                                            {student.qualification}
                                          </td>
                                        </tr>
                                        <tr>
                                          <td
                                          
                                          >
                                            Department{" "}
                                          </td>
                                          <td
                                            
                                          >
                                            :{" "}
                                          </td>
                                          <td
                                           
                                          >
                                            {student.department}
                                          </td>
                                        </tr>
                                        <tr>
                                          <td
                                           
                                          >
                                            Gender
                                          </td>
                                          <td
                                           
                                          >
                                            :{" "}
                                          </td>
                                          <td
                                           
                                          >
                                            {student.gender}
                                          </td>
                                        </tr>
                                        <tr>
                                          <td
                                           
                                          >
                                            Address
                                          </td>
                                          <td
                                            
                                          >
                                            :{" "}
                                          </td>
                                          <td
                                           
                                          >
                                            {student.city}
                                          </td>
                                        </tr>
                                        <tr>
                                          <td
                                           
                                          >
                                            Pin Code
                                          </td>
                                          <td
                                            
                                          >
                                            :{" "}
                                          </td>
                                          <td
                                           
                                          >
                                            {student.pincode}
                                          </td>
                                        </tr>
                                        <tr>
                                          <td
                                            
                                          >
                                            Mobile{" "}
                                          </td>
                                          <td
                                            
                                          >
                                            :{" "}
                                          </td>
                                          <td
                                           
                                          >
                                            {student.contact_number ? student.contact_number : student.phoneNumber}
                                          </td>
                                        </tr>
                                        <tr>
                                          <td
                                           
                                          >
                                            Role Of Staff
                                          </td>
                                          <td
                                            
                                          >
                                            :{" "}
                                          </td>
                                          <td
                                            
                                          >
                                            {student.roleOfStaff ? student.roleOfStaff : "Admin"}
                                          </td>
                                        </tr>
                                        <tr>
                                          <td
                                          
                                          >
                                            BloodGroup
                                          </td>
                                          <td
                                            
                                          >
                                            :{" "}
                                          </td>
                                          <td
                                         
                                          >
                                            {student.bloodGroup}
                                          </td>
                                        </tr>
                                        <tr>
                                          <td
                                           
                                          >
                                            Date of Birth
                                          </td>
                                          <td
                                           
                                          >
                                            :{" "}
                                          </td>
                                          <td
                                           
                                          >
                                            {student.date_of_birth ? student.date_of_birth : student.dateOfBirth}
                                          </td>
                                        </tr>
                                      </>
                                    ))}
                                  </div>
                                  <div
                                    className="img-con"
                                    style={{
                                      float: "inline-start",
                                      display: "flex",
                                      alignItems: "center",
                                    }}
                                  >
                                    {staffData.parent2.map((student) => (
                                      <img
                                        style={{ borderRadius: "0" }}
                                        src={student.image ? student.image : student.photoUrl}
                                        alt="student"
                                      />
                                    ))}
                                  </div>
                                </div>
                              ) : (
                                <div>
                                  <p>No data found...</p>
                                </div>
                              )}</>}

                          </div>
                        </div>
                      )}

                    </div>
                    <div>
                      <input
                        className={`effect-3 size ${formik.touched.parentId2 && formik.errors.parentId2
                          ? "is-invalid"
                          : ""
                          }`}
                        type="text"
                        name="parentId2"
                        placeholder="Staff Id 2"
                        onChange={formik.handleChange}
                        onBlur={() => {
                          formik.handleBlur("parentId2");
                          viewDataParent(2)
                        }}
                        value={formik.values.parentId2}
                      />
                      {formik.values.parentId2 && (
                        <i
                          className="bx  bx-show-alt"
                          style={{ marginLeft: "10px" }}
                          onClick={() => handleFileParent(2)}
                        ></i>
                      )}

                      {/* {formik.values.parentId1 == formik.values.parentId2 && (
                        <div
                          className="text-danger"
                          style={{
                            color: "red",
                            fontSize: "11px",
                            marginBottom: "-12px",
                          }}
                        >
                          Already staffId is taken.
                        </div>
                      )} */}
                      {formik.values.parentId2 && staffData.parent2.length === 0 && (
                        <div
                          className="text-danger"
                          style={{
                            color: "red",
                            fontSize: "11px",
                            marginBottom: "-12px",
                          }}
                        >
                          staffId2 is wrong.
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  alignItems: "center",
                  marginBottom: "10px",
                }}
              >
                <p>
                  Previous school detalis if any ?{" "}
                  <span
                    style={{
                      color: "red",
                      fontWeight: "400",
                      fontFamily: "sans-serif",
                    }}
                  >
                    *
                  </span>{" "}
                </p>
                <div style={{ display: "flex", gap: "3px" }}>
                  <input
                    type="radio"
                    id="yesPreviousSchool"
                    name="isPreviousSchool"
                    value="yes"
                    checked={values.isPreviousSchool === "yes"}
                    onChange={handleRadioChange}
                  />
                  <label htmlFor="yesPreviousSchool">Yes </label>
                </div>
                <div style={{ display: "flex", gap: "3px" }}>
                  <input
                    type="radio"
                    id="noPreviousSchool"
                    name="isPreviousSchool"
                    value="no"
                    checked={values.isPreviousSchool === "no"}
                    onChange={handleRadioChange}
                  />
                  <label htmlFor="noPreviousSchool">No</label>
                </div>
                {formik.touched.isPreviousSchool &&
                  formik.errors.isPreviousSchool ? (
                  <div
                    className="text-danger"
                    style={{
                      color: "red",
                      fontSize: "12px",
                      marginBottom: "-10px",
                      marginTop: "-10px",
                    }}
                  >
                    {formik.errors.isPreviousSchool}
                  </div>
                ) : null}
                {values.isPreviousSchool === "yes" && (
                  <>
                    <div style={{ display: "block" }}>
                      <input
                        style={{
                          border: `1px solid ${formik.touched.schoolName &&
                            !formik.values.schoolName
                            ? "red"
                            : "#cdcbcb"
                            }`,
                          width: "300px"
                        }}
                        className={`effect-3 size ${formik.touched.schoolName && formik.errors.schoolName
                          ? "is-invalid"
                          : ""
                          }`}
                        type="text"
                        name="schoolName"
                        placeholder="School name"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.schoolName}
                      />
                      {formik.touched.schoolName &&
                        !formik.values.schoolName && (
                          <div
                            className="text-danger"
                            style={{
                              color: "red",
                              fontSize: "11px",
                              marginBottom: "-12px",
                            }}
                          >
                            School name is required.
                          </div>
                        )}
                    </div>

                    <input
                      style={{ width: "200px" }}
                      className={`effect-3 size ${formik.touched.reasonForReleaving &&
                        formik.errors.reasonForReleaving
                        ? "is-invalid"
                        : ""
                        }`}
                      type="text"
                      placeholder="Reason for relieving "
                      name="reasonForReleving"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      defaultValue={formik.values.reasonForReleaving}
                    />
                  </>
                )}
              </div>
              <div
                class="btn-style-registration"
                style={{ gap: "10px", marginBottom: "12px" }}
              >
                {ids.id !== ":id" ? (
                  <>
                    <button
                      type="button"
                      class="cancel-button"
                      onClick={handleBack}
                    >
                      Back
                    </button>
                    <button className="custom-button" type="submit">
                      Update & Next
                      <i
                        className="fas fa-chevron-right"
                        style={{ marginLeft: "5px" }}
                      ></i>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      class="cancel-button"
                      onClick={handleReset}
                    >
                      Cancel
                    </button>
                    <button className="custom-button" type="submit">
                      Save & Next
                      <i
                        className="fas fa-chevron-right"
                        style={{ marginLeft: "5px" }}
                      ></i>
                    </button>
                  </>
                )}
              </div>
            </div>
          </form>
        )}
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
