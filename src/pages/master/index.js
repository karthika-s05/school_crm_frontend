import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  getState,
  getCity,
  getClass,
  getSection,
  getClassSectionMap,
  getBloodGroup,
  getCommunity,
  getNationality,
  getReligion,
  getSubject,
  postState,
  postCity,
  postBloodGroup,
  postCommunity,
  postNationality,
  postReligion,
  postSubject,
  postClass,
  postSection,
  deleteState,
  deleteCity,
  deleteBloodGroup,
  deleteCommunity,
  deleteNationality,
  deleteReligion,
  deleteSubject,
  deleteClass,
  deleteSection,
  postClassSection,
  deleteClassSection,
  getClassTeacherMap,
  getSubjectTeacherMap,
  postClassTeacherMap,
  deleteClassTeacher,
  deleteSubjectTeacher,
  postSubjectTeacherMap,
  getStationery,
  postStationery,
  deleteStationery,
  updateStationery,
  getTimeTable,
  getPeriodSlot,
  postTimeSlot,
  deletePeriodSlot,
  getPeriodSlotbyID,
  deletetimetableApi,
  getTimeTableByID,
  postTimeTable,
  getTransport,
  postTransport,
  deleteTransportApi,
  createAssignment,
} from "../../services/api";
import { TOKEN_KEY } from "../../services/auth";
import "./master.css";
import "../../App.css";
import Table from "../../component/Table";
import Modal from "../../component/modals/Modal";
import {
  CityInputDetails,
  StateInputDetails,
  BloodInputDetails,
  CommunityInputDetails,
  NationalityInputDetails,
  ReligionInputDetails,
  SubjectInputDetails,
  classSection,
  classTeacher,
  subjectTeacher,
  stationary,
  periodSlot,
  classTimeTable,
  transport,
  assignment,
} from "../../assets/constant";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Master = () => {
  const location = useLocation();
  const propsData = location.state;
  const [data, setData] = useState([]);
  const [message, setMessage] = useState();
  const [isSuccessVisible, setIsSuccessVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [editData, setEditData] = useState();
  const [inputData, setInputData] = useState();
  const [load, setLoad] = useState(true);
  console.log("datsdsdsda", inputData);

  const openModal = (id) => {
    console.log("inputData", inputData);
    setEditData();
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };
  function showMessage(response, duration = 3000) {
    setMessage(response.message);
    setIsSuccessVisible(true);
    setTimeout(() => {
      setIsSuccessVisible(false);
      setMessage(response.message);
    }, duration);
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.id) {
      formData.id = 0;
    }
    const showModalError = (errorMessage) => {
      console.error(errorMessage);
    };
    switch (propsData) {
      case "State":
        const {
          nationId: NationalnationId,
          code: Nationalcode,
          name: Nationalname,
        } = formData;
        if (!NationalnationId || !Nationalcode || !Nationalname) {
          showModalError("Please fill in all required fields for State.");
          toast.error("Please fill in all required fields for State.");
          return;
        }
        const getData = async () => {
          try {
            console.log(formData);
            const response = await postState(formData, TOKEN_KEY);
            const responseValue = response.status.toString().toLowerCase();
            const responseMessage =
              responseValue === "error" &&
                response.data === "Name or code already exists."
                ? response.data
                : response.message;

            if (responseValue === "error") {
              toast.error(responseMessage);
            } else if (responseValue === "success") {
              toast.success(response.message);
            }
            showMessage(response);
            setLoad(false);
          } catch (err) {
            console.log(err);
          }
        };
        getData();
        break;
      case "City":
        const {
          stateId: CitystateId,
          code: Citycode,
          name: Cityname,
        } = formData;
        if (!CitystateId || !Citycode || !Cityname) {
          showModalError("Please fill in all required fields for City.");
          toast.error("Please fill in all required fields for City.");
          return;
        }
        console.log("form", formData);
        const postCitydetail = async () => {
          try {
            const response = await postCity(formData, TOKEN_KEY);
            console.log("City API response:", response.data);
            const responseValue = response.status.toString().toLowerCase();
            const responseMessage =
              responseValue === "error" &&
                response.data === "Name or code already exists for this state."
                ? response.data
                : response.message;

            if (responseValue === "error") {
              toast.error(responseMessage);
            } else if (responseValue === "success") {
              toast.success(response.message);
            }
            showMessage(response);
            setLoad(false);
          } catch (err) {
            console.log(err);
          }
        };
        postCitydetail();
        break;
      case "BloodGroup":
        const { name: Bloodname } = formData;
        if (!Bloodname) {
          showModalError("Please fill in all required fields for BloodGroup.");
          toast.error("Please fill in all required fields for BloodGroup.");
          return;
        }
        console.log("Calling BloodGroup function");
        const postBlood = async () => {
          try {
            const response = await postBloodGroup(formData, TOKEN_KEY);
            console.log(response.data);
            const responseValue = response.status.toString().toLowerCase();
            const responseMessage =
              responseValue === "error" &&
                response.data === "Blood group already exists."
                ? response.data
                : response.message;

            if (responseValue === "error") {
              toast.error(responseMessage);
            } else if (responseValue === "success") {
              toast.success(response.message);
            }
            setLoad(false);
          } catch (err) {
            console.log(err);
          }
        };
        postBlood();
        break;
      case "Community":
        const { code: Communitycode, name: Communityname } = formData;
        if (!Communitycode || !Communityname) {
          showModalError("Please fill in all required fields for Community.");
          toast.error("Please fill in all required fields for Community.");
          return;
        }
        console.log("Calling Community function");
        const postCommunityDetails = async () => {
          try {
            const response = await postCommunity(formData, TOKEN_KEY);
            console.log(response.data);
            const responseValue = response.status.toString().toLowerCase();
            const responseMessage =
              responseValue === "error" &&
                response.data === "Name or code already exists."
                ? response.data
                : response.message;

            if (responseValue === "error") {
              toast.error(responseMessage);
            } else if (responseValue === "success") {
              toast.success(response.message);
            }
            showMessage(response);
            setLoad(false);
          } catch (err) {
            console.log(err);
          }
        };
        postCommunityDetails();
        break;
      case "Nationality":
        const { code: Nationalitycode, name: Nationalityname } = formData;
        if (!Nationalitycode || !Nationalityname) {
          showModalError("Please fill in all required fields for Nationality.");
          toast.error("Please fill in all required fields for Nationality.");
          return;
        }
        const postNationalityDetails = async () => {
          try {
            const response = await postNationality(formData, TOKEN_KEY);
            const responseValue = response.status.toString().toLowerCase();
            const responseMessage =
              responseValue === "error" &&
                response.data === "Name or code already exists."
                ? response.data
                : response.message;

            if (responseValue === "error") {
              toast.error(responseMessage);
            } else if (responseValue === "success") {
              toast.success(response.message);
            }
            showMessage(response);
            setLoad(false);
          } catch (err) {
            console.log(err);
          }
        };
        postNationalityDetails();
        break;
      case "Religion":
        const { name: Religionname } = formData;
        if (!Religionname) {
          showModalError("Please fill in all required fields for Religion.");
          toast.error("Please fill in all required fields for Religion.");
          return;
        }
        console.log("Calling Community function");
        const postReligionDetails = async () => {
          try {
            const response = await postReligion(formData, TOKEN_KEY);
            console.log(response.data);
            const responseValue = response.status.toString().toLowerCase();
            const responseMessage =
              responseValue === "error" &&
                response.data === "Religion already exists."
                ? response.data
                : response.message;

            if (responseValue === "error") {
              toast.error(responseMessage);
            } else if (responseValue === "success") {
              toast.success(response.message);
            }
            showMessage(response);
            setLoad(false);
          } catch (err) {
            console.log(err);
          }
        };
        postReligionDetails();
        break;
      case "Subject":
        const { code: Subjectcode, name: Subjectname } = formData;
        if (!Subjectcode || !Subjectname) {
          showModalError("Please fill in all required fields for Subject.");
          toast.error("Please fill in all required fields for Subject.");
          return;
        }
        console.log("Calling Community function");
        const postSubjectDetails = async () => {
          try {
            console.log("first", formData);
            const response = await postSubject(formData, TOKEN_KEY);
            console.log(response.data);
            const responseValue = response.status.toString().toLowerCase();
            const responseMessage =
              responseValue === "error" &&
                response.data === "Name or code already exists."
                ? response.data
                : response.message;

            if (responseValue === "error") {
              toast.error(responseMessage);
            } else if (responseValue === "success") {
              toast.success(response.message);
            }
            showMessage(response);
            setLoad(false);
          } catch (err) {
            console.log(err);
          }
        };
        postSubjectDetails();
        break;
      case "Class":
        console.log("Calling Community function");
        const { name: Religionnames } = formData;
        if (!Religionnames) {
          showModalError("Please fill in all required fields for Religion.");
          toast.error("Please fill in all required fields for Religion.");
          return;
        }
        const postClassDetails = async () => {
          try {
            const response = await postClass(formData, TOKEN_KEY);
            console.log(response.data);
            const responseValue = response.status.toString().toLowerCase();
            const responseMessage =
              responseValue === "error" &&
                response.data === "Class already exists."
                ? response.data
                : response.message;

            if (responseValue === "error") {
              toast.error(responseMessage);
            } else if (responseValue === "success") {
              toast.success(response.message);
            }
            showMessage(response);
            setLoad(false);
          } catch (err) {
            console.log(err);
          }
        };
        postClassDetails();
        break;
      case "Section":
        const { name: Sectionname } = formData;
        if (!Sectionname) {
          showModalError("Please fill in all required fields for Section.");
          toast.error("Please fill in all required fields for Section.");
          return;
        }
        console.log("Calling Community function");
        const postSectionDetails = async () => {
          try {
            const response = await postSection(formData, TOKEN_KEY);
            console.log(response.data);
            const responseValue = response.status.toString().toLowerCase();
            const responseMessage =
              responseValue === "error" &&
                response.data === "Section already exists."
                ? response.data
                : response.message;

            if (responseValue === "error") {
              toast.error(responseMessage);
            } else if (responseValue === "success") {
              toast.success(response.message);
            }
            showMessage(response);
            setLoad(false);
          } catch (err) {
            console.log(err);
          }
        };
        postSectionDetails();
        break;
      case "Class & Section":
        const classSection = async () => {
          try {
            console.log(formData);
            const response = await postClassSection(formData, TOKEN_KEY);
            console.log(response.data);
            const responseValue = response.status.toString().toLowerCase();
            const responseMessage =
              responseValue === "error" &&
                response.data ===
                "Class or section already exists for this class-section combination."
                ? response.data
                : response.message;

            if (responseValue === "error") {
              toast.error(responseMessage);
            } else if (responseValue === "success") {
              toast.success(response.message);
            }
            showMessage(response);
            setLoad(false);
          } catch (err) {
            console.log(err);
          }
        };
        classSection();
        break;
      case "Class Teacher":
        const classTeachers = async () => {
          try {
            console.log(formData);
            const response = await postClassTeacherMap(formData, TOKEN_KEY);
            console.log(response.data);
            const responseValue = response.status.toString().toLowerCase();
            const responseMessage =
              responseValue === "error" &&
                response.data === "Name or code already exists."
                ? response.data
                : response.message;

            if (responseValue === "error") {
              toast.error(responseMessage);
            } else if (responseValue === "success") {
              toast.success(response.message);
            }
            showMessage(response);
            // setTimeout(() => {
            //   window.location.reload();
            // }, 2000);
          } catch (err) {
            console.log(err);
          }
        };
        classTeachers();
        break;
      case "Subject Teacher":
        const {
          name: STname,
          class: STclass,
          code: Stcode,
          section: Stsection,
        } = formData;
        if (!STname || !STclass || !Stcode || !Stsection) {
          showModalError(
            "Please fill in all required fields for Subject Teacher."
          );
          toast.error(
            "Please fill in all required fields for Subject Teacher."
          );
          return;
        }
        const subjectTeachers = async () => {
          try {
            console.log(formData);
            const response = await postSubjectTeacherMap(formData, TOKEN_KEY);
            console.log(response.data);
            const responseValue = response.status.toString().toLowerCase();
            const responseMessage =
              responseValue === "error" &&
                response.data === "Name or code already exists."
                ? response.data
                : response.message;

            if (responseValue === "error") {
              toast.error(responseMessage);
            } else if (responseValue === "success") {
              toast.success(response.message);
            }
            showMessage(response);
            // setTimeout(() => {
            //   window.location.reload();
            // }, 2000);
          } catch (err) {
            console.log(err);
          }
        };
        subjectTeachers();
        break;
      case "Products":
        const {
          name: Productsname,
          class: Productsclass,
          code: Productscode,
          section: Productssection,
        } = formData;
        if (
          !Productsname ||
          !Productsclass ||
          !Productscode ||
          !Productssection
        ) {
          showModalError("Please fill in all required fields for Products.");
          toast.error("Please fill in all required fields for Products.");
          return;
        }
        console.log(formData);
        const stationery = async () => {
          try {
            console.log("hello", formData);
            const response =
              formData.id == 0
                ? await postStationery(formData, TOKEN_KEY)
                : await updateStationery(formData, TOKEN_KEY);
            console.log(response.data);
            showMessage(response);
            if (response.status === "error" || response.status === "Error") {
              toast.error(response.message);
            } else if (
              response.status === "success" ||
              response.status === "Success"
            ) {
              toast.success(response.message);
            }
            showMessage(response);
            setLoad(false);
          } catch (err) {
            console.log(err);
          }
        };
        stationery();
        break;
      case "Period Slot":
        const {
          name: Periodname,
          class: Periodclass,
          code: Periodcode,
        } = formData;
        if (!Periodname || !Periodclass || !Periodcode) {
          showModalError("Please fill in all required fields for Period Slot.");
          toast.error("Please fill in all required fields for Period Slot.");
          return;
        }
        console.log(formData);
        const period = async () => {
          try {
            console.log("hello", formData);
            const response = await postTimeSlot(formData, TOKEN_KEY);
            console.log(response.data);
            showMessage(response);
            if (response.status === "error" || response.status === "Error") {
              toast.error(response.message);
            } else if (
              response.status === "success" ||
              response.status === "Success"
            ) {
              toast.success(response.message);
            }
            showMessage(response);
            setLoad(false);
          } catch (err) {
            console.log(err);
          }
        };
        period();
        break;
      case "Class Time Table":
        const {
          name: Timename,
          class: Timeclass,
          code: Timecode,
          section: Timesection,
          driver: Timedriver,
        } = formData;
        if (
          !Timename ||
          !Timeclass ||
          !Timecode ||
          !Timesection ||
          !Timedriver
        ) {
          showModalError(
            "Please fill in all required fields for Subject Transport."
          );
          toast.error(
            "Please fill in all required fields for Subject Transport."
          );
          return;
        }
        const timeTable = async () => {
          try {
            console.log("hello", formData);
            const response = await postTimeTable(formData, TOKEN_KEY);
            console.log(response.data);
            showMessage(response);
            if (response.status === "error" || response.status === "Error") {
              toast.error(response.message);
            } else if (
              response.status === "success" ||
              response.status === "Success"
            ) {
              toast.success(response.message);
            }
            showMessage(response);
            setLoad(false);
          } catch (err) {
            console.log(err);
          }
        };
        timeTable();
        break;
      case "Transport":
        const {
          name: Tname,
          class: Tclass,
          code: Tcode,
          section: Tsection,
          driver: Tdriver,
          root: Troot,
        } = formData;
        if (!Tname || !Tclass || !Tcode || !Tsection || !Tdriver || !Troot) {
          showModalError(
            "Please fill in all required fields for Subject Transport."
          );
          toast.error(
            "Please fill in all required fields for Subject Transport."
          );
          return;
        }
        const transport = async () => {
          try {
            console.log("hello", formData);
            const response = await postTransport(formData, TOKEN_KEY);
            console.log(response.data);
            showMessage(response);
            if (response.status === "error" || response.status === "Error") {
              toast.error(response.message);
            } else if (
              response.status === "success" ||
              response.status === "Success"
            ) {
              toast.success(response.message);
            }
            showMessage(response);
            setLoad(false);
          } catch (err) {
            console.log(err);
          }
        };
        transport();
        break;
      default:
        console.log("No matching data scenario");
    }
    closeModal();
    setFormData({});
  };
  const handleEdit = (id) => {
    console.log("id", id);
    formData.id = id;
    switch (propsData) {
      case "State":
        const getData = async () => {
          try {
            const response = await getState({ id, nationId: 0 }, TOKEN_KEY);
            setFormData({
              id: response[0].id,
              code: response[0].State_Code,
              nationId: response[0].nationalityId,
              name: response[0].State,
            });
            setEditData([
              { name: "code", data: response[0].State_Code },
              { name: "name", data: response[0].State },
              { name: "nationId", data: response[0].Nationality },
            ]);
            // showMessage(response)
          } catch (err) {
            console.log(err);
          }
        };
        getData();
        setInputData(StateInputDetails);
        break;
      case "City":
        const getCityDetails = async () => {
          try {
            const response = await getCity({ id, stateId: 0 }, TOKEN_KEY);
            console.log(response, 'vcity');
            // setData(response)
            setFormData({
              id: response[0].id,
              code: response[0].code,
              stateId: response[0].stateId,
              name: response[0].name,
            });
            setEditData([
              { name: "code", data: response[0].code },
              { name: "name", data: response[0].name },
              { name: "stateId", data: response[0].state },
            ]);
            // showMessage(response)
          } catch (err) {
            console.log(err);
          }
        };
        getCityDetails();
        setInputData(CityInputDetails);
        break;
      case "Class":
        const getClassDetails = async () => {
          try {
            const response = await getClass(id, TOKEN_KEY);
            setFormData({ id: response[0].id, name: response[0].name });
            setEditData([{ name: "name", data: response[0].name }]);
            // showMessage(response)
          } catch (err) {
            console.log(err);
          }
        };
        getClassDetails();
        setInputData(ReligionInputDetails);
        break;
      case "Section":
        const getSectionDetails = async () => {
          try {
            const response = await getSection(id, TOKEN_KEY);
            console.log(response);
            setFormData({ id: response[0].id, name: response[0].name });
            setEditData([{ name: "name", data: response[0].name }]);
            // showMessage(response)
          } catch (err) {
            console.log(err);
          }
        };
        getSectionDetails();
        setInputData(ReligionInputDetails);
        break;
      case "Class & Section":
        const getClassSectionDetails = async () => {
          try {
            const response = await getClassSectionMap(id, TOKEN_KEY);
            console.log("responseClassSection", response);
            setFormData({
              id: response[0].id,
              classId: response[0].classId,
              sectionId: response[0].sectionId,
              totalCount: response[0].totalCount,
            });
            setEditData([
              { name: "classId", data: response[0].className },
              { name: "sectionId", data: response[0].sectionName },
              { name: "totalCount", data: response[0].totalCount },
            ]);
            // showMessage(response)
          } catch (err) {
            console.log(err);
          }
        };
        getClassSectionDetails();
        setInputData(classSection);
        break;
      case "BloodGroup":
        const getBloodDetails = async () => {
          try {
            const response = await getBloodGroup(id, TOKEN_KEY);
            console.log("response.................", response);
            setFormData({ id: response[0].id, name: response[0].name });
            setEditData([{ name: "name", data: response[0].name }]);
            // showMessage(response)
          } catch (err) {
            console.log(err);
          }
        };
        getBloodDetails();
        setInputData(BloodInputDetails);
        break;
      case "Community":
        const getCommunityDetails = async () => {
          try {
            const response = await getCommunity(id, TOKEN_KEY);
            console.log(response);
            setFormData({
              id: response[0].id,
              code: response[0].code,
              nationId: 1,
              name: response[0].name,
            });
            setEditData([
              { name: "code", data: response[0].code },
              { name: "name", data: response[0].name },
            ]);
            // showMessage(response)
          } catch (err) {
            console.log(err);
          }
        };
        getCommunityDetails();
        setInputData(CommunityInputDetails);
        break;
      case "Nationality":
        const getNationalityDetails = async () => {
          try {
            const response = await getNationality(id, TOKEN_KEY);
            console.log("Nationality API response:", response);
            setFormData({
              id: response[0].id,
              code: response[0].code,
              nationId: 1,
              name: response[0].name,
            });
            setEditData([
              { name: "code", data: response[0].code },
              { name: "name", data: response[0].name },
            ]);
            // showMessage(response)
          } catch (err) {
            console.log(err);
          }
        };
        getNationalityDetails();
        setInputData(NationalityInputDetails);
        break;
      case "Religion":
        const getReligionDetails = async () => {
          try {
            const response = await getReligion(id, TOKEN_KEY);
            console.log("response.............", response);
            setFormData({ id: response[0].id, name: response[0].name });
            setEditData([{ name: "name", data: response[0].name }]);
            // showMessage(response)
          } catch (err) {
            console.log(err);
          }
        };
        getReligionDetails();
        setInputData(ReligionInputDetails);
        break;
      case "Subject":
        const getSubjectDetails = async () => {
          try {
            const response = await getSubject(id, TOKEN_KEY);
            console.log("subject", response);
            setFormData({
              id: response[0].id,
              code: response[0].code,
              name: response[0].name,
            });
            setEditData([
              { name: "name", data: response[0].name },
              { name: "code", data: response[0].code },
            ]);
          } catch (err) {
            console.log(err);
          }
        };
        getSubjectDetails();
        setInputData(SubjectInputDetails);
        break;
      case "Class Teacher":
        const getClassTeahcerDetails = async () => {
          try {
            console.log("idjda'hjg", id);
            const response = await getClassTeacherMap(
              { id, classId: "0", sectionId: "0", staffId: "0" },
              TOKEN_KEY
            );
            console.log("responseClassTeacher", response);
            setFormData({
              id: response[0].id,
              staffId: response[0].staffId,
              sectionId: response[0].sectionId,
              classId: response[0].classId,
            });
            setEditData([
              { name: "staffId", data: response[0].ClassTeacherName },
              { name: "classId", data: response[0].className },
              { name: "sectionId", data: response[0].sectionName },
            ]);
            // showMessage(response)
          } catch (err) {
            console.log(err);
          }
        };
        getClassTeahcerDetails();
        setInputData(classTeacher);
        break;
      case "Subject Teacher":
        const getSubjectTeachers = async () => {
          try {
            console.log("idjda'hjg", id);
            const response = await getSubjectTeacherMap(
              {
                id,
                classId: "0",
                sectionId: "0",
                staffId: "0",
                subjectId: "0",
              },
              TOKEN_KEY
            );
            console.log("subjectttt", response);
            setFormData({
              id: response[0].id,
              staffId: response[0].staffId,
              sectionId: response[0].sectionId,
              classId: response[0].classId,
              subjectId: response[0].subjectId,
            });
            setEditData([
              { name: "staffId", data: response[0].ClassTeacherName },
              { name: "classId", data: response[0].className },
              { name: "sectionId", data: response[0].sectionName },
              { name: "subjectId", data: response[0].subject },
            ]);
            // showMessage(response)
          } catch (err) {
            console.log(err);
          }
        };
        getSubjectTeachers();
        setInputData(subjectTeacher);
        break;
      case "Products":
        const getStationery1 = async () => {
          try {
            console.log("idjda'hjg", id);
            const response = await getStationery(
              {
                id,
                classId: 1,
                sectionId: 1,
              },
              TOKEN_KEY
            );
            console.log("subjectttt", response);
            setFormData({
              id: response.data[0].id,
              product: response.data[0].product,
              total: response.data[0].total,
              classId: parseInt(response.data[0].classId),
              sectionId: parseInt(response.data[0].sectionId),
            });
            setEditData([
              { name: "product", data: response.data[0].product },
              { name: "total", data: response.data[0].total },
              { name: "classId", data: response.data[0].class },
              { name: "sectionId", data: response.data[0].section },
            ]);
            // showMessage(response.data)
          } catch (err) {
            console.log(err);
          }
        };
        getStationery1();
        setInputData(stationary);
        break;
      case "Period Slot":
        const periodGet = async () => {
          try {
            const response = await getPeriodSlotbyID(id, TOKEN_KEY);
            console.log("subjectttt", response);
            setFormData({
              id: response[0].id,
              classId: response[0].classId,
              startTime: response[0].startTime,
              endTime: response[0].endTime,
            });
            setEditData([
              { name: "classId", data: response[0].className },
              { name: "startTime", data: response[0].startTime },
              { name: "endTime", data: response[0].endTime },
            ]);
            // showMessage(response.data)
          } catch (err) {
            console.log(err);
          }
        };
        periodGet();
        setInputData(periodSlot);
        break;
      case "Class Time Table":
        const timetableGet = async () => {
          try {
            const response = await getTimeTableByID(
              id,
              { dayId: 0, classId: 1, sectionId: 1 },
              TOKEN_KEY
            );
            console.log("subjectttt", response);
            setFormData({
              id: response[0].id,
              classId: response[0].classId,
              dayId: response[0].dayId,
              subjectId: response[0].subjectId,
              periodSlotId: response[0].slotId,
              sectionId: response[0].sectionId,
            });
            setEditData([
              { name: "periodSlotId", data: response[0].slotName },
              { name: "dayId", data: response[0].day },
              { name: "subjectId", data: response[0].subject },
              { name: "classId", data: response[0].class },
              { name: "sectionId", data: response[0].section },
            ]);
            // showMessage(response.data)
          } catch (err) {
            console.log(err);
          }
        };
        timetableGet();
        setInputData(classTimeTable);
        break;
      case "Transport":
        const transports = async () => {
          try {
            const response = await getTransport(formData, TOKEN_KEY);
            console.log("subjectttt", response);
            setFormData({
              id: response.data[0].id,
              busNo: response.data[0].busNo,
              busRegNo: response.data[0].busRegNo,
              busRoute: response.data[0].busRoute,
              busTiming: response.data[0].busTiming,
              driverName: response.data[0].driverName,
              driverPhoneNo: response.data[0].driverPhoneNo,
            });
            setEditData([
              { name: "driverName", data: response.data[0].driverName },
              { name: "busNo", data: response.data[0].busNo },
              { name: "busRegNo", data: response.data[0].busRegNo },
              { name: "driverPhoneNo", data: response.data[0].driverPhoneNo },
              { name: "busRoute", data: response.data[0].busRoute },
              { name: "busTiming", data: response.data[0].busTiming },
            ]);
            // showMessage(response.data)
          } catch (err) {
            console.log(err);
          }
        };
        transports();
        setInputData(transport);
        break;

      default:
        setData("");
        console.log("No matching data scenario");
    }
    openModal(id);
  };
  const handleDelete = (id) => {
    console.log(id);
    switch (propsData) {
      case "State":
        const deleteStatedetails = async () => {
          try {
            const response = await deleteState(id, TOKEN_KEY);
            showMessage(response);
            let value =
              response.status === "Error" ||
                response.data === "State already assigned!"
                ? toast.error(response.data)
                : response.status === "Error" &&
                  response.data !== "State already assigned!"
                  ? toast.error(response.message)
                  : response.status === "success"
                    ? (toast.success(response.massage),
                      toast.success(response.message))
                    : null;
            showMessage(response);
            setLoad(false);
          } catch (err) {
            console.log(err);
          }
        };
        deleteStatedetails();
        break;
      case "City":
        const deleteCitydetail = async () => {
          try {
            const response = await deleteCity(id, TOKEN_KEY);
            console.log(response.data);
            let value =
              response.status === "error" ||
                response.data === "City already assigned!"
                ? toast.error(response.data)
                : response.status === "error" &&
                  response.data !== "City already assigned!"
                  ? toast.error(response.message)
                  : response.status === "success"
                    ? (toast.success(response.massage),
                      toast.success(response.message))
                    : null;
            showMessage(response);
            setLoad(false);
          } catch (err) {
            console.log(err);
          }
        };
        deleteCitydetail();
        break;
      case "BloodGroup":
        const deleteBlood = async () => {
          try {
            const response = await deleteBloodGroup(id, TOKEN_KEY);
            console.log(response.data);
            let value =
              response.status === "error" ||
                response.data === "Blood group already assigned!"
                ? toast.error(response.data)
                : response.status === "error" &&
                  response.data !== "Blood group already assigned!"
                  ? toast.error(response.message)
                  : response.status === "success"
                    ? (toast.success(response.massage),
                      toast.success(response.message))
                    : null;
            showMessage(response);
            setLoad(false);
          } catch (err) {
            console.log(err);
          }
        };
        deleteBlood();
        break;
      case "Community":
        console.log("Calling Community function");
        const deleteCommunityDetails = async () => {
          try {
            const response = await deleteCommunity(id, TOKEN_KEY);
            console.log(response.data);
            let value =
              response.status === "error" ||
                response.data === "Community already assigned!"
                ? toast.error(response.data)
                : response.status === "error" &&
                  response.data !== "Community already assigned!"
                  ? toast.error(response.message)
                  : response.status === "success"
                    ? (toast.success(response.massage),
                      toast.success(response.message))
                    : null;
            showMessage(response);
            setLoad(false);
          } catch (err) {
            console.log(err);
          }
        };
        deleteCommunityDetails();
        break;
      case "Nationality":
        const deleteNationalityDetails = async () => {
          try {
            let response = await deleteNationality(id, TOKEN_KEY);
            let value =
              response.status === "error" ||
                response.data === "Nationality already assigned!"
                ? toast.error(response.data)
                : response.status === "error" &&
                  response.data !== "Nationality already assigned!"
                  ? toast.error(response.message)
                  : response.status === "success"
                    ? (toast.success(response.massage),
                      toast.success(response.message))
                    : null;
            showMessage(response);
            setLoad(false);
          } catch (err) {
            console.log(err);
          }
        };
        deleteNationalityDetails();
        break;
      case "Religion":
        const deleteReligionDetails = async () => {
          try {
            const response = await deleteReligion(id, TOKEN_KEY);
            console.log(response.data);
            let value =
              response.status === "error" ||
                response.data === "Religion already assigned!"
                ? toast.error(response.data)
                : response.status === "error" &&
                  response.data !== "Religion already assigned!"
                  ? toast.error(response.message)
                  : response.status === "success"
                    ? (toast.success(response.massage),
                      toast.success(response.message))
                    : null;
            showMessage(response);
            setLoad(false);
          } catch (err) {
            console.log(err);
          }
        };
        deleteReligionDetails();
        break;
      case "Subject":
        console.log("Calling Community function");
        const deleteSubjectDetails = async () => {
          try {
            const response = await deleteSubject(id, TOKEN_KEY);
            console.log(response.data);
            let value =
              response.status === "error" ||
                response.data === "Subject already assigned for this class!"
                ? toast.error(response.data)
                : response.status === "error" &&
                  response.data !== "Subject already assigned for this class!"
                  ? toast.error(response.message)
                  : response.status === "success"
                    ? (toast.success(response.massage),
                      toast.success(response.message))
                    : null;
            showMessage(response);
            setLoad(false);
          } catch (err) {
            console.log(err);
          }
        };
        deleteSubjectDetails();
        break;
      case "Class":
        const deleteClassDetails = async () => {
          try {
            const response = await deleteClass(id, TOKEN_KEY);
            console.log(response.data);
            let value =
              response.status === "error" ||
                response.data === "Class already assigned!"
                ? toast.error(response.data)
                : response.status === "error" &&
                  response.data !== "Class already assigned!"
                  ? toast.error(response.message)
                  : response.status === "success"
                    ? (toast.success(response.massage),
                      toast.success(response.message))
                    : null;
            showMessage(response);
            setLoad(false);
          } catch (err) {
            console.log(err);
          }
        };
        deleteClassDetails();
        break;
      case "Section":
        const deleteSectionDetails = async () => {
          try {
            const response = await deleteSection(id, TOKEN_KEY);
            console.log(response.data);
            let value =
              response.status === "error" ||
                response.data === "Section already assigned!"
                ? toast.error(response.data)
                : response.status === "error" &&
                  response.data !== "Section already assigned!"
                  ? toast.error(response.message)
                  : response.status === "success"
                    ? (toast.success(response.massage),
                      toast.success(response.message))
                    : null;
            showMessage(response);
            setLoad(false);
          } catch (err) {
            console.log(err);
          }
        };
        deleteSectionDetails();
        break;
      case "Class & Section":
        const deleteClassSectionDetails = async () => {
          try {
            const response = await deleteClassSection(id, TOKEN_KEY);
            console.log(response.data);
            showMessage(response);
            if (response.status === "error" || response.status === "Error") {
              toast.error(response.message);
            } else if (
              response.status === "success" ||
              response.status === "Success"
            ) {
              toast.success(response.message);
            }
            showMessage(response);
            setLoad(false);
          } catch (err) {
            console.log(err);
          }
        };
        deleteClassSectionDetails();
        break;
      case "Class Teacher":
        const deleteClassTeacherDetails = async () => {
          try {
            const response = await deleteClassTeacher(id, TOKEN_KEY);
            console.log(response.data);
            showMessage(response);
            if (response.status === "error" || response.status === "Error") {
              toast.error(response.message);
            } else if (
              response.status === "success" ||
              response.status === "Success"
            ) {
              toast.success(response.message);
            }
            showMessage(response);
            setLoad(false);
          } catch (err) {
            console.log(err);
          }
        };
        deleteClassTeacherDetails();
        break;
      case "Subject Teacher":
        const deleteSubjectTeachers = async () => {
          try {
            const response = await deleteSubjectTeacher(id, TOKEN_KEY);
            console.log(response.data);
            showMessage(response);
            if (response.status === "error" || response.status === "Error") {
              toast.error(response.message);
            } else if (
              response.status === "success" ||
              response.status === "Success"
            ) {
              toast.success(response.message);
            }
            showMessage(response);
            setLoad(false);
          } catch (err) {
            console.log(err);
          }
        };
        deleteSubjectTeachers();
        break;
      case "Products":
        const deleteProduct = async () => {
          try {
            const response = await deleteStationery(id, TOKEN_KEY);
            console.log(response.data);
            showMessage(response);
            if (response.status === "error" || response.status === "Error") {
              toast.error(response.message);
            } else if (
              response.status === "success" ||
              response.status === "Success"
            ) {
              toast.success(response.message);
            }
            showMessage(response);
            setLoad(false);
          } catch (err) {
            console.log(err);
          }
        };
        deleteProduct();
        break;
      case "Period Slot":
        const deletePeriod = async () => {
          try {
            const response = await deletePeriodSlot(id, TOKEN_KEY);
            console.log(response.data);
            showMessage(response);
            if (response.status === "error" || response.status === "Error") {
              toast.error(response.message);
            } else if (
              response.status === "success" ||
              response.status === "Success"
            ) {
              toast.success(response.message);
            }
            showMessage(response);
            setLoad(false);
          } catch (err) {
            console.log(err);
          }
        };
        deletePeriod();
        break;
      case "Class Time Table":
        const deletetimetable = async () => {
          try {
            const response = await deletetimetableApi(id, TOKEN_KEY);
            console.log(response.data);
            showMessage(response);
            if (response.status === "error" || response.status === "Error") {
              toast.error(response.message);
            } else if (
              response.status === "success" ||
              response.status === "Success"
            ) {
              toast.success(response.message);
            }
            showMessage(response);
            setLoad(false);
          } catch (err) {
            console.log(err);
          }
        };
        deletetimetable();
        break;
      case "Transport":
        const deletetransport = async () => {
          try {
            const response = await deleteTransportApi(id, TOKEN_KEY);
            console.log(response);
            showMessage(response);
            if (response.status === "error" || response.status === "Error") {
              toast.error(response.message);
            } else if (
              response.status === "success" ||
              response.status === "Success"
            ) {
              toast.success(response.message);
            }
            showMessage(response);
            setLoad(false);
          } catch (err) {
            console.log(err);
          }
        };
        deletetransport();
        break;
      default:
        console.log("No matching data scenario");
    }
  };
  useEffect(() => {
    console.log("load", load);
    setLoad(true);
    console.log(propsData);
    switch (propsData) {
      case "State":
        const getData = async () => {
          try {
            const response = await getState({ id: 0, nationId: 0 }, TOKEN_KEY);
            const resultData = response.map((item) => ({
              id: item.id,
              state: item.name,
              "State Code": item.State_Code,
              Nationality: item.Nationality,
            }));
            setData(resultData);
          } catch (err) {
            console.log(err);
          }
        };
        getData();
        setInputData(StateInputDetails);
        break;
      case "City":
        const getCityDetails = async () => {
          try {
            const response = await getCity({ id: 0, stateId: 0 }, TOKEN_KEY);
            console.log(response);
            const resultData = response.map((item) => ({
              id: item.id,
              name: item.name,
              code: item.code,
              state: item.state,
            }));
            setData(resultData);
          } catch (err) {
            console.log(err);
          }
        };
        getCityDetails();
        setInputData(CityInputDetails);
        break;
      case "Class":
        const getClassDetails = async () => {
          try {
            const response = await getClass(0, TOKEN_KEY);
            console.log(response);
            setData(response);
          } catch (err) {
            console.log(err);
          }
        };
        getClassDetails();
        setInputData(ReligionInputDetails);
        break;
      case "Section":
        const getSectionDetails = async () => {
          try {
            const response = await getSection(0, TOKEN_KEY);
            console.log(response);
            setData(response);
          } catch (err) {
            console.log(err);
          }
        };
        getSectionDetails();
        setInputData(ReligionInputDetails);
        break;
      case "Class & Section":
        const getClassSectionDetails = async () => {
          try {
            const response = await getClassSectionMap(0, TOKEN_KEY);
            console.log(response);
            const resultData = response.map((item) => ({
              id: item.id,
              "class Name": item.className,
              "section Name": item.sectionName,
              "total Count": item.totalCount
            }));
            setData(resultData);
          } catch (err) {
            console.log(err);
          }
        };
        getClassSectionDetails();
        setInputData(classSection);
        break;
      case "BloodGroup":
        const getBloodDetails = async () => {
          try {
            const response = await getBloodGroup(0, TOKEN_KEY);
            console.log(response);
            setData(response);
          } catch (err) {
            console.log(err);
          }
        };
        getBloodDetails();
        setInputData(BloodInputDetails);
        break;
      case "Community":
        const getCommunityDetails = async () => {
          try {
            const response = await getCommunity(0, TOKEN_KEY);
            const resultData = response.map((item) => ({
              id: item.id,
              Name: item.name,
              code: item.code,
            }));
            setData(resultData);
          } catch (err) {
            console.log(err);
          }
        };
        getCommunityDetails();
        setInputData(CommunityInputDetails);
        break;
      case "Nationality":
        const getNationalityDetails = async () => {
          try {
            const response = await getNationality(0, TOKEN_KEY);
            console.log(response, "ijyuy");
            const resultData = response.map((item) => ({
              id: item.id,
              Name: item.name,
              Code: item.code,
            }));
            console.log(resultData, "resultdata");
            setData(resultData);
          } catch (err) {
            console.log(err);
          }
        };
        getNationalityDetails();
        setInputData(NationalityInputDetails);
        break;
      case "Religion":
        const getReligionDetails = async () => {
          try {
            const response = await getReligion(0, TOKEN_KEY);
            console.log(response);
            setData(response);
          } catch (err) {
            console.log(err);
          }
        };
        getReligionDetails();
        setInputData(ReligionInputDetails);
        break;
      case "Subject":
        const getSubjectDetails = async () => {
          try {
            const response = await getSubject(0, TOKEN_KEY);
            console.log(response);
            const resultData = response.map((item) => ({
              id: item.id,
              Name: item.name,
              code: item.code,
            }));
            setData(resultData);
          } catch (err) {
            console.log(err);
          }
        };
        getSubjectDetails();
        setInputData(SubjectInputDetails);
        break;
      case "Class Teacher":
        const getclassTeacherDetails = async () => {
          try {
            const response = await getClassTeacherMap(
              { id: 0, classId: "0", sectionId: "0" },
              TOKEN_KEY
            );
            console.log(response);
            const resultData = response.map((item) => ({
              id: item.id,
              "class Name": item.className,
              "section Name": item.sectionName,
              "Teacher Name": item.ClassTeacherName,
            }));
            setData(resultData);
          } catch (err) {
            console.log(err);
          }
        };
        getclassTeacherDetails();
        setInputData(classTeacher);
        break;
      case "Subject Teacher":
        const getsubjectTeacherDetails = async () => {
          try {
            const response = await getSubjectTeacherMap(
              { id: 0, classId: "0", sectionId: "0", subjectId: "0" },
              TOKEN_KEY
            );
            console.log(response);
            const resultData = response.map((item) => ({
              id: item.id,
              "class Name": item.className,
              "section Name": item.sectionName,
              subject: item.subject,
              "Teacher Name": item.ClassTeacherName,
            }));
            setData(resultData);
          } catch (err) {
            console.log(err);
          }
        };
        getsubjectTeacherDetails();
        setInputData(subjectTeacher);
        break;
      case "Products":
        console.log("first");
        const getproductDetails = async () => {
          try {
            const response = await getStationery(
              {
                id: 0,
                classId: 1,
                sectionId: 1,
              },
              TOKEN_KEY
            );
            console.log(response);
            const resultData = response.data.map((item) => ({
              id: item.id,
              class: item.class,
              section: item.section,
              product: item.product,
              total: item.total,
            }));
            setData(resultData);
          } catch (err) {
            console.log(err);
          }
        };
        getproductDetails();
        setInputData(stationary);
        break;
      case "Period Slot":
        const getperiodSlot = async () => {
          try {
            const response = await getPeriodSlot(TOKEN_KEY);
            console.log(response);
            const resultData = response.map((item) => ({
              id: item.id,
              "class Name": item.className,
              "start Time": item.startTime,
              "end Time": item.endTime,
            }));
            setData(resultData);
          } catch (err) {
            console.log(err);
          }
        };
        getperiodSlot();
        setInputData(periodSlot);
        break;
      case "Class Time Table":
        const getperiodtimeTables = async () => {
          try {
            const response = await getTimeTable(
              { dayId: 0, classId: 1, sectionId: 1 },
              TOKEN_KEY
            );
            console.log("new", response);
            const resultData = response.map((item) => ({
              id: item.id,
              day: item.day,
              "class section": `${item.class}-${item.section}`,
              subject: item.subject,
              "start Time": item.startTime,
              "end Time": item.endTime,
              "staff Name": item.staffName,
            }));
            setData(resultData);
          } catch (err) {
            console.log(err);
          }
        };
        getperiodtimeTables();
        setInputData(classTimeTable);
        break;
      case "Transport":
        const getTransportDetails = async () => {
          try {
            const response = await getTransport({ id: 0 }, TOKEN_KEY);
            console.log("new", response);
            const resultData = response.data.map((item) => ({
              id: item.id,
              "bus No": item.busNo,
              "bus RegNo": item.busRegNo,
              "bus Route": item.busRoute,
              "bus Timing": item.busTiming,
              "driver Name": item.driverName,
              "driver contact": item.driverPhoneNo,
              // "photoUrl": item.photoUrl,
            }));
            setData(resultData);
          } catch (err) {
            console.log(err);
          }
        };
        getTransportDetails();
        setInputData(transport);
        break;
      default:
        setData("");
        console.log("No matching data scenario");
    }
    return () => {
      console.log("Component unmounted or effect is being cleaned up");
    };
  }, [propsData, message, load]);

  useEffect(() => {
    setIsModalOpen(false);
    setFormData({})
  }, [propsData])

  const [isTableOpen, setIsTableOpen] = useState(true);
  return (
  <div className="master-page">

    {/* Modal */}
    <div className="button-content">
      {isModalOpen && (
        <Modal
          onSubmit={handleSubmit}
          setFormData={setFormData}
          formData={formData}
          closeModal={closeModal}
          inputData={inputData}
          propsData={propsData}
          editData={editData}
          dropdown={data}
        />
      )}
    </div>

    {/* Table */}
    {isTableOpen && (
      <div className="table-container">
        {data?.length > 0 ? (
          <Table
            data={data}
            onEdit={handleEdit}
            onDelete={handleDelete}
            propsData={propsData}
            openModal={openModal}
          />
        ) : (
          <div className="no-data">No Records Found</div>
        )}
      </div>
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
    />
  </div>
);
};

export default Master;
