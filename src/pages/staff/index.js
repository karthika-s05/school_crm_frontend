import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  getHomework,
  createAssignment,
  deleteClass,
  deleteSection,
  deleteSubject,
  deletetAssignment,
  getAssignment,
  getClass,
  getSection,
  getSubject,
  postClass,
  postSection,
  postSubject,
  studentReport,
  createHomework,
  getExam,
  createExam,
  deletetExam,
  getexamPortion,
  createExamportion,
  deletetExamportion,
  getbyidHomework,
  deleteHomework,
  getbyidExamportion,
  getbyidExam,
  getEvent,
  createEvent,
  deletetEvents,
  getbyidEvents,
  createEventImage,
  getExamreport,
  getOverallgeade,
  createOverallgrade,
  deletetOvergrade,
  getbyidAllgrade,
  getSubjectgrade,
  createSubjectgrade,
  deletetSubjectgrade,
  getbyidSubjectgrade,
  createExamreport,
  getbyidExamreport,
  createExamReport,
  getExamResultlist,
} from "../../services/api";
import { getToken } from "../../services/auth";
// import './Staff.css';
import "../../App.css";
import Table from "../../component/Table";
import Modal from "../../component/modals/Modal";
import {
  ReligionInputDetails,
  SubjectInputDetails,
  allgrade,
  assignment,
  events,
  exam,
  examportion,
  examreport,
  homework,
  subjectgrade,
} from "../../assets/constant";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Staff = () => {
  const location = useLocation();
  const propsData = location.state;
  const [data, setData] = useState([]);
  const [message, setMessage] = useState();
  const [isSuccessVisible, setIsSuccessVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [editData, setEditData] = useState();
  const [inputData, setInputData] = useState();

  const openModal = (id) => {
    console.log("inputData", inputData);     
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditData()
    setIsModalOpen(false);
  };
  function showMessage(response, duration = 3000) {
    setMessage(response.message);
    if (response.status === "Error" || response.status === "error") {
      toast.error(response.message);
    } else if (response.status === "Success" || response.status === "success") {
      toast.success(response.message);
    }
    setIsSuccessVisible(true);
    setTimeout(() => {
      setIsSuccessVisible(false);
      setMessage(response.message);
    }, duration);
  }

  const handleSubmit = (e) => {
    const showModalError = (errorMessage) => {
      console.error(errorMessage);
    };
    e.preventDefault();
    if (!formData.id) {
      formData.id = 0;
    }
    switch (propsData) {
      case "Subject":
        console.log("Calling Community function");
        if (formData.subjectName && formData.subjectCode) {
          const postSubjectDetails = async () => {
            try {
              const response = await postSubject(formData, getToken());
              console.log(response.data);
              showMessage(response);
            } catch (err) {
              console.log(err);
            }
          };
          postSubjectDetails();
        } else {
          console.log("Missing required data for Subject");
          // Handle the case where required data is missing
        }
        break;
      case "Class":
        console.log("Calling Community function");
        const postClassDetails = async () => {
          try {
            const response = await postClass(formData, getToken());
            console.log(response.data);
            showMessage(response);
          } catch (err) {
            console.log(err);
          }
        };
        postClassDetails();
        break;
      case "Section":
        console.log("Calling Community function");
        const postSectionDetails = async () => {
          try {
            const response = await postSection(formData, getToken());
            console.log(response.data);
            showMessage(response);
          } catch (err) {
            console.log(err);
          }
        };
        postSectionDetails();
        break;
      case "Assignment":
        const {
          classId: assignmentClassId,
          sectionId: assignmentSectionId,
          subjectId: assignmentsubjectId,
          title: assignmenttitle,
          startDate: assignmentstartDate,
          endDate: assignmentendDate,
          description: assignmentdescription,
        } = formData;
        if (
          !assignmentClassId ||
          !assignmentSectionId ||
          !assignmentsubjectId ||
          assignmenttitle === "" ||
          assignmentstartDate === "" ||
          assignmentendDate === "" ||
          assignmentdescription === ""
        ) {
          showModalError("Please fill in all required fields for Assignment.");
          toast.error("Please fill in all required fields for Assignment.");
          return;
        }
        const assignment = async () => {
          try {
            console.log("hello", formData);
            const response = await createAssignment(formData, getToken());
            console.log(response.data);
            if (response.status === "Error") {
              toast.error(response.message);
            } else if (response.status === "Success") {
              toast.success(response.message);
            }
            showMessage(response);
          } catch (err) {
            console.log(err);
          }
        };
        assignment();
        break;
      case "Homework":
        const {
          classId: homeworkClassId,
          sectionId: homeworkSectionId,
          subjectId: homeworksubject,
          date: homeworkdate,
          description: homeworkdescription,
        } = formData;
        if (
          !homeworkClassId ||
          !homeworkSectionId ||
          !homeworksubject ||
          homeworkdate === "" ||
          homeworkdescription === ""
        ) {
          showModalError("Please fill in all required fields for Homework.");
          toast.error("Please fill in all required fields for Homework.");
          return;
        }
        const homework = async () => {
          try {
            console.log("hello", formData);
            const response = await createHomework(formData, getToken());
            console.log(response.data);
            showMessage(response);
          } catch (err) {
            console.log(err);
          }
        };
        homework();
        break;
      case "Exam Type":
        const {
          classId: examClassId,
          sectionId: examSectionId,
          exam: examExam,
          totalMark: examTotalMark,
          passMark: examPassMark,
        } = formData;
        if (
          !examClassId ||
          !examSectionId ||
          !examExam ||
          examTotalMark === "" ||
          examPassMark === ""
        ) {
          showModalError("Please fill in all required fields for Exam Type.");
          toast.error("Please fill in all required fields for Exam Type.");
          return;
        }
        const exams = async () => {
          try {
            console.log("hello", formData);
            const response = await createExam(formData, getToken());
            console.log(response.data);
            showMessage(response);
          } catch (err) {
            console.log(err);
          }
        };
        exams();
        break;
      case "Exam Portion":
        const {
          classId: PortionClassId,
          sectionId: PortionSectionId,
          subjectId: portionsubject,
          examId: examName,
          examDate: PortionexamDate,
          totalMarks: PortionTotalMark,
          passMark: PortionPassMark,
          portionDescription: portionDescription,
          portionTitle: portionTitle,
          examFromTime: examFromTime,
          examToTime: examToTime,
        } = formData;
        if (
          !PortionClassId ||
          !PortionSectionId ||
          !portionsubject ||
          !examName ||
          !examFromTime ||
          !examToTime ||
          !PortionexamDate ||
          PortionTotalMark === "" ||
          portionDescription === "" ||
          PortionPassMark === "" ||
          portionTitle === ""
        ) {
          showModalError(
            "Please fill in all required fields for Exam portion."
          );
          toast.error("Please fill in all required fields for Exam portion.");
          return;
        }
        const examportion = async () => {
          try {
            console.log("hello", formData);
            const response = await createExamportion(formData, getToken());
            console.log(response.data);
            showMessage(response);
          } catch (err) {
            console.log(err);
          }
        };
        examportion();
        break;
      case "Events":
        const {
          classId: eventClassId,
          event: eventName,
          content: eventcontent,
          fromDate: eventfromDate,
          toDate: eventtoDate,
          startTime: eventstartTime,
          endTime: eventendTime,
          date: eventDate,
          image: eventimage,
        } = formData;
        if (
          (!eventClassId ||
            !eventName ||
            !eventcontent ||
            !eventfromDate ||
            !eventtoDate ||
            !eventstartTime ||
            !eventendTime ||
            eventDate === "",
          eventimage === "")
        ) {
          showModalError("Please fill in all required fields for Events.");
          toast.error("Please fill in all required fields for Events.");
          return;
        }
        if (formData.photoUrl) {
          const eventPhoto = async () => {
            try {
              console.log("hello", formData);
              console.log("hello", formData.photoUrl);
              const response = await createEventImage(
                { id: formData.id, photoUrl: formData.photoUrl },
                getToken()
              );
              console.log("123", response.data);
             
              // showMessage(response);
            } catch (err) {
              console.log(err);
            }
          };
          eventPhoto();
        }
        const events = async () => {
          try {
            console.log("hello", formData);
            const response = await createEvent(formData, getToken());
            console.log(response.data);
            if (response.status === "error") {
              toast.error(response.message);
            } else if (response.status === "success") {
              toast.success(response.message);
            }
            showMessage(response);
          } catch (err) {
            console.log(err);
          }
        };

        events();
        break;
      case "Overall grade":
        const {
          mark: grademark,
          remark: graderemark,
          gradeName: gradeName,
          "grade Description": gradeDescription,
        } = formData;
        if (
          !grademark ||
          !graderemark ||
          !gradeName ||
          gradeDescription === ""
        ) {
          showModalError(
            "Please fill in all required fields for Over All grade."
          );
          toast.error("Please fill in all required fields for Over All grade.");
          return;
        }
        const AllGrade = async () => {
          try {
            console.log("hello", formData);
            const response = await createOverallgrade(formData, getToken());
            console.log(response);
            if (response.status === "error") {
              toast.error(response.message);
            } else if (response.status === "success") {
              toast.success(response.message);
            }
            showMessage(response);
          } catch (err) {
            console.log(err);
          }
        };
        AllGrade();
        break;
      case "Subject grade":
        const {
          mark: Subjectmark,
          remark: Subjectremark,
          gradeName: SubjectgradeName,
          "grade Description": SubjectgradeDescription,
        } = formData;
        if (
          !Subjectmark ||
          !Subjectremark ||
          !SubjectgradeName ||
          SubjectgradeDescription === ""
        ) {
          showModalError(
            "Please fill in all required fields for Subject grade."
          );
          toast.error("Please fill in all required fields for Subject grade.");
          return;
        }
        const CreateSubjectgrade = async () => {
          try {
            console.log("hello", formData);
            const response = await createSubjectgrade(formData, getToken());
            console.log(response);
            if (response.status === "error") {
              toast.error(response.message);
            } else if (response.status === "success") {
              toast.success(response.message);
            }
            showMessage(response);
          } catch (err) {
            console.log(err);
          }
        };
        CreateSubjectgrade();
        break;
      case "Exam Report List":
        const {
          classId: ReportclassId,
          sectionId: ReportsectionId,
          subjectId: ReportsubjectId,
          examId: ReportexamId,
          studentId: ReportstudentId,
          mark: Reportmark,
          remark: Reportremark,
        } = formData;
        if (
          !ReportclassId ||
          !ReportsectionId ||
          !ReportsubjectId ||
          ReportexamId === "" ||
          ReportstudentId === "" ||
          Reportmark === "" ||
          Reportremark === ""
        ) {
          showModalError(
            "Please fill in all required fields for Exam Reportlist."
          );
          toast.error(
            "Please fill in all required fields for Exam Reportlist."
          );
          return;
        }
        const CreateExamreport = async () => {
          try {
            const sendData = {
              classId: parseInt(formData.classId),
              examId: parseInt(formData.examId),
              mark: formData.mark,
              sectionId: parseInt(formData.sectionId),
              studentId: formData.studentId,
              remarks: formData.remarks,
              subjectId: parseInt(formData.subjectId),
            };
            console.log("hello", formData);
            const response = await createExamReport(sendData, getToken());
            console.log(response);
            showMessage(response);
          } catch (err) {
            console.log(err);
          }
        };
        CreateExamreport();
        break;
      default:
        console.log("No matching data scenario");
    }
    closeModal();
    setFormData({});
    window.location.reload();
  };

  const handleEdit = async (id) => {
    console.log("id", id);
    formData.id = id;
    switch (propsData) {
      case "Class":
        const getClassDetails = async () => {
          try {
            const response = await getClass(id, getToken());
            setFormData({ id: response[0].id, name: response[0].name });
            setEditData([{ name: "name", data: response[0].name }]);
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
            const response = await getSection(id, getToken());
            console.log(response);
            setFormData({ id: response[0].id, name: response[0].name });
            setEditData([{ name: "name", data: response[0].name }]);
          } catch (err) {
            console.log(err);
          }
        };
        getSectionDetails();
        setInputData(ReligionInputDetails);
        break;
      case "Subject":
        const getSubjectDetails = async () => {
          try {
            const response = await getSubject(id, getToken());
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
      case "Assignment":
        try {
          const response = await getAssignment(
            {
              id,
              classId: 1,
              sectionId: 1,
              subjectId: 1,
              pageNo: 1,
            },
            getToken()
          );
          console.log("subjectttt", response.data[0].subjectIt);
          setFormData({
            id: response.data[0].id,
            title: response.data[0].title,
            classId: response.data[0].classId,
            sectionId: response.data[0].sectionId,
            subjectId: response.data[0].subjectIt,
            startDate: response.data[0].startDate,
            endDate: response.data[0].endDate,
            description: response.data[0].description,
          });
          setEditData([
            { name: "classId", data: response.data[0].className },
            { name: "startDate", data: response.data[0].startDate },
            { name: "endDate", data: response.data[0].endDate },
            { name: "title", data: response.data[0].title },
            { name: "sectionId", data: response.data[0].section },
            { name: "subjectId", data: response.data[0].subject },
            { name: "description", data: response.data[0].description },
          ]);
        } catch (err) {
          console.log(err);
        }
        break;
      case "Homework":
        try {
          const response = await getbyidHomework(
            {
              id,
              classId: 1,
              sectionId: 1,
            },
            getToken()
          );
          console.log("subjectttt", response.data[0].subjectId);
          setFormData({
            id: response.data[0].id,
            classId: response.data[0].classId,
            sectionId: response.data[0].sectionId,
            subjectId: response.data[0].subjectId,
            date: response.data[0].date,
            description: response.data[0].description,
          });
          setEditData([
            { name: "classId", data: response.data[0].class },
            { name: "date", data: response.data[0].date },
            { name: "sectionId", data: response.data[0].section },
            { name: "subjectId", data: response.data[0].subject },
            { name: "description", data: response.data[0].description },
          ]);
        } catch (err) {
          console.log(err);
        }
        break;
      case "Exam Type":
        const getexam = async () => {
          try {
            console.log("idjda'hjg", id);
            const response = await getbyidExam(
              {
                id,
              },
              getToken()
            );
            setFormData({
              id: response.data[0].id,
              passMark: response.data[0].passMark,
              sectionId: response.data[0].sectionId,
              classId: response.data[0].classId,
              totalMark: response.data[0].totalMark,
              exam: response.data[0].id,
            });
            setEditData([
              { name: "passMark", data: response.data[0].passMark },
              { name: "classId", data: response.data[0].className },
              { name: "sectionId", data: response.data[0].sectionName },
              { name: "totalMark", data: response.data[0].totalMark },
              { name: "exam", data: response.data[0].exam },
            ]);
          } catch (err) {
            console.log(err);
          }
        };
        getexam();
        setInputData(exam);
        break;
      case "Exam Portion":
        const getExamportion = async () => {
          try {
            const response = await getbyidExamportion(
              {
                id,
                classId: 1,
                sectionId: 1,
              },
              getToken()
            );

            const formatTime = (timeString) => {
              const [time, period] = timeString.split(" ");
              const [hours, minutes] = time.split(":");
              let hours24 = parseInt(hours, 10);
              if (period === "PM" && hours24 < 12) hours24 += 12;
              return `${hours24.toString().padStart(2, "0")}:${minutes}`;
            };
            const currentDate = new Date();
            const dateString = currentDate.toISOString().split("T")[0];

            setFormData({
              id: response.data[0].id,
              examFromTime: formatTime(response.data[0].examFromTime),
              examToTime: formatTime(response.data[0].examToTime),
              // staffId: response.data[0].staffName,
              classId: response.data[0].classId,
              sectionId: response.data[0].sectionId,
              subjectId: response.data[0].subjectId,
              totalMarks: response.data[0].totalMarks,
              examId: response.data[0].id,
              examDate: dateString,
              portionTitle: response.data[0].portionTitle,
              portionDescription: response.data[0].portionDescription,
            });
            setEditData([
              { name: "classId", data: response.data[0].class },
              // { name: "staffId", data: response.data[0].staffName },
              { name: "sectionId", data: response.data[0].section },
              { name: "subjectId", data: response.data[0].subject },
              { name: "totalMarks", data: response.data[0].totalMarks },
              { name: "examId", data: response.data[0].examName },
              { name: "examDate", data: dateString },
              {
                name: "examFromTime",
                data: formatTime(response.data[0].examFromTime),
              },
              {
                name: "examToTime",
                data: formatTime(response.data[0].examToTime),
              },
              { name: "portionTitle", data: response.data[0].portionTitle },
              {
                name: "portionDescription",
                data: response.data[0].portionDescription,
              },
            ]);
          } catch (err) {
            console.log(err);
          }
        };

        getExamportion();
        setInputData(examportion);
        break;
      case "Events":
        const getEvents = async () => {
          try {
            const response = await getbyidEvents({ id }, getToken());

            const formatTime = (timeString) => {
              const [hours, minutes, seconds] = timeString.split(":");
              let hours24 = parseInt(hours, 10);
              return `${hours24
                .toString()
                .padStart(2, "0")}:${minutes}:${seconds}`;
            };
            const currentDate = new Date();
            const dateString = currentDate.toISOString().split("T")[0];

            setFormData({
              id: response.data[0].id,
              startTime: formatTime(response.data[0].startTime),
              endTime: formatTime(response.data[0].endTime),
              eventName: response.data[0].eventName,
              classId: response.data[0].classId,
              content: response.data[0].content,
              fromDate: dateString,
              toDate: dateString,
              date: dateString,
              image: response.data[0].image,
            });
            setEditData([
              { name: "classId", data: response.data[0].class },
              { name: "eventName", data: response.data[0].eventName },
              { name: "content", data: response.data[0].content },
              { name: "image", data: response.data[0].image },
              { name: "date", data: dateString },
              { name: "fromDate", data: dateString },
              { name: "toDate", data: dateString },
              {
                name: "startTime",
                data: formatTime(response.data[0].startTime),
              },
              { name: "endTime", data: formatTime(response.data[0].endTime) },
            ]);
          } catch (err) {
            console.log(err);
          }
        };

        getEvents();
        setInputData(events);
        break;
      case "Overall grade":
        const GetOverallgeade = async () => {
          try {
            console.log("i  djda'hjg", id);
            const response = await getOverallgeade({ id }, getToken());
            setFormData({
              id: response.data[0].id,
              mark: response.data[0].mark,
              remark: response.data[0].remark,
              gradeName: response.data[0].gradeName,
              gradeDescription: response.data[0].gradeDescription,
            });
            setEditData([
              { name: "mark", data: response.data[0].mark },
              { name: "remark", data: response.data[0].remark },
              { name: "gradeName", data: response.data[0].gradeName },
              {
                name: "gradeDescription",
                data: response.data[0].gradeDescription,
              },
            ]);
          } catch (err) {
            console.log(err);
          }
        };
        GetOverallgeade();
        setInputData(allgrade);
        break;
      case "Subject grade":
        const getsubjectgeade = async () => {
          try {
            console.log("i  djda'hjg", id);
            const response = await getSubjectgrade({ id }, getToken());
            setFormData({
              id: response.data[0].id,
              mark: response.data[0].mark,
              remark: response.data[0].remark,
              gradeName: response.data[0].gradeName,
              gradeDescription: response.data[0].gradeDescription,
            });
            setEditData([
              { name: "mark", data: response.data[0].mark },
              { name: "remark", data: response.data[0].remark },
              { name: "gradeName", data: response.data[0].gradeName },
              {
                name: "gradeDescription",
                data: response.data[0].gradeDescription,
              },
            ]);
          } catch (err) {
            console.log(err);
          }
        };
        getsubjectgeade();
        setInputData(subjectgrade);
        break;
      case "Exam Report List":
        const getsubjectReport = async () => {
          try {
            console.log("i  djda'hjg", id);
            const response = await getbyidExamreport(
              {
                id,
                examId: 1,
                studentId: "KST100002",
                classId: 1,
                sectionId: 1,
              },
              getToken()
            );
            setFormData({
              id: response.data[0].id,
              mark: response.data[0].mark,
              remarks: response.data[0].remarks,
              studentId: response.data[0].studentId,
              sectionId: response.data[0].sectionId,
              classId: response.data[0].classId,
              subjectId: response.data[0].subjectId,
              examId: response.data[0].examId,
            });
            setEditData([
              { name: "mark", data: response.data[0].mark },
              { name: "remarks", data: response.data[0].remarks },
              { name: "studentId", data: response.data[0].studentName },
              { name: "sectionId", data: response.data[0].sectionName },
              { name: "classId", data: response.data[0].className },
              { name: "subjectId", data: response.data[0].subjectName },
              { name: "examId", data: response.data[0].examName },
            ]);
          } catch (err) {
            console.log(err);
          }
        };
        getsubjectReport();
        setInputData(examreport);
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
      case "Subject":
        console.log("Calling Community function");
        const deleteSubjectDetails = async () => {
          try {
            const response = await deleteSubject(id, getToken());
            console.log(response.data);
            showMessage(response);
          } catch (err) {
            console.log(err);
          }
        };
        deleteSubjectDetails();
        break;
      case "Class":
        const deleteClassDetails = async () => {
          try {
            const response = await deleteClass(id, getToken());
            console.log(response.data);
            showMessage(response);
          } catch (err) {
            console.log(err);
          }
        };
        deleteClassDetails();
        break;
      case "Section":
        const deleteSectionDetails = async () => {
          try {
            const response = await deleteSection(id, getToken());
            console.log(response.data);
            showMessage(response);
          } catch (err) {
            console.log(err);
          }
        };
        deleteSectionDetails();
        break;
      case "Assignment":
        const DeletetAssignment = async () => {
          try {
            const response = await deletetAssignment(id, getToken());
            console.log(response.data);
            showMessage(response);
          } catch (err) {
            console.log(err);
          }
        };
        DeletetAssignment();
        break;
      case "Homework":
        const Deletethomework = async () => {
          try {
            const response = await deleteHomework(id, getToken());
            console.log(response.data);
            showMessage(response);
          } catch (err) {
            console.log(err);
          }
        };
        Deletethomework();
        break;
      case "Exam":
        const DeletetExam = async () => {
          try {
            const response = await deletetExam(id, getToken());
            console.log(response.data);
            showMessage(response);
          } catch (err) {
            console.log(err);
          }
        };
        DeletetExam();
        break;
      case "Exam Portion":
        const DeletetExamportion = async () => {
          try {
            const response = await deletetExamportion(id, getToken());
            console.log(response.data);
            showMessage(response);
          } catch (err) {
            console.log(err);
          }
        };
        DeletetExamportion();
        break;
      case "Events":
        const DeletetEvents = async () => {
          try {
            const response = await deletetEvents(id, getToken());
            console.log(response.data);
            showMessage(response);
          } catch (err) {
            console.log(err);
          }
        };
        DeletetEvents();
        break;
      case "Overall grade":
        const Deleteovergrade = async () => {
          try {
            const response = await deletetOvergrade(id, getToken());
            console.log(response.data);
            showMessage(response);
          } catch (err) {
            console.log(err);
          }
        };
        Deleteovergrade();
        break;
      case "Subject grade":
        const DeleteSubjectgrade = async () => {
          try {
            const response = await deletetSubjectgrade(id, getToken());
            console.log(response.data);
            showMessage(response);
          } catch (err) {
            console.log(err);
          }
        };
        DeleteSubjectgrade();
        break;
      default:
        console.log("No matching data scenario");
    }
    window.location.reload();
  };

  useEffect(() => {
    console.log(propsData);
    switch (propsData) {
      case "Subject":
        const getSubjectDetails = async () => {
          try {
            const response = await getSubject(0, getToken());
            console.log(response);
            setData(response);
          } catch (err) {
            console.log(err);
          }
        };
        getSubjectDetails();
        setInputData(SubjectInputDetails);
        break;
      case "Class":
        const getClassDetails = async () => {
          try {
            const response = await getClass(0, getToken());
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
            const response = await getSection(0, getToken());
            console.log(response);
            setData(response);
          } catch (err) {
            console.log(err);
          }
        };
        getSectionDetails();
        setInputData(ReligionInputDetails);
        break;
      case "Assignment":
        const assignmentDetails = async () => {
          try {
            const response = await getAssignment(
              {
                id: 0,
                classId: 1,
                sectionId: 1,
                pageNo: 1,
              },
              getToken()
            );
            console.log("new", response.data);
            const resultData = response.data.map((item) => ({
              id: item.id,
              class: item.className,
              section: item.section,

              subject: item.subject,
              title: item.title,
              "start Date": item.startDate,
              "end Date": item.endDate,
              description: item.description,
            }));
            console.log("new", response);
            setData(resultData);
            let ggg = resultData[0].className;
            console.log("jjjjjjjjjjj", typeof ggg);
          } catch (err) {
            console.log(err);
          }
        };
        assignmentDetails();
        setInputData(assignment);
        break;
      case "Homework":
        const homeWork = async () => {
          try {
            const response = await getHomework(
              {
                title: "Title 1",
                description: "Description1",
                classId: 1,
                sectionId: 1,
                subjectId: 1,
              },
              getToken()
            );
            const resultData = response.data.map((item) => ({
              id: item.id,
              class: item.class,
              section: item.section,
              subject: item.subject,
              date: item.date,
              description: item.description,
            }));
            setData(resultData);
          } catch (err) {
            console.log(err);
          }
        };
        homeWork();
        setInputData(homework);
        break;
      case "Exam Type":
        const Getexam = async () => {
          try {
            const response = await getExam({}, getToken());
            const resultData = response.data.map((item) => ({
              id: item.id,
              class: item.className,
              // section: item.sectionName,
              exam: item.exam,
              totalMark: item.totalMark,
              passMark: item.passMark,
            }));
            setData(resultData);
          } catch (err) {
            console.log(err);
          }
        };
        Getexam();
        setInputData(exam);
        break;
      case "Exam Portion":
        const GetexamPortion = async () => {
          try {
            const response = await getexamPortion(
              {
                id: 0,
                sectionId: 1,
                classId: 1,
              },
              getToken()
            );
            const resultData = response.data.map((item) => ({
              id: item.id,
              class: item.class,
              section: item.section,
              subject: item.subject,
              exam: item.examName,
              "Exam Date": item.examDate,
              "Start Time": item.examFromTime,
              "End Time": item.examToTime,
              "total Mark": item.totalMarks,
              "portion Title": item.portionTitle,
              "portion Description": item.portionDescription,
            }));
            setData(resultData);
          } catch (err) {
            console.log(err);
          }
        };
        GetexamPortion();
        setInputData(examportion);
        break;
      case "Events":
        const Getevent = async () => {
          try {
            const response = await getEvent({ id: 0 }, getToken());
            const resultData = response.data.map((item) => ({
              id: item.id,
              class: item.class,
              event: item.eventName,
              content: item.content,
              "from Date": item.fromDate,
              "to Date": item.toDate,
              "start Time": item.startTime,
              "end Time": item.endTime,
            }));
            setData(resultData);
          } catch (err) {
            console.log(err);
          }
        };
        Getevent();
        setInputData(events);
        break;
      case "Overall grade":
        const getOverall = async () => {
          try {
            const response = await getOverallgeade({ id: 0 }, getToken());
            const resultData = response.data.map((item) => ({
              id: item.id,
              mark: item.mark,
              grade: item.gradeName,
              remark: item.remark,
              "grade Description": item.gradeDescription,
            }));
            setData(resultData);
          } catch (err) {
            console.log(err);
          }
        };
        getOverall();
        setInputData(allgrade);
        break;
      case "Subject grade":
        const GetSubjectgrade = async () => {
          try {
            const response = await getSubjectgrade({ id: 0 }, getToken());
            const resultData = response.data.map((item) => ({
              id: item.id,
              grade: item.gradeName,
              mark: item.mark,
              remark: item.remark,
              "grade Description": item.gradeDescription,
            }));
            setData(resultData);
          } catch (err) {
            console.log(err);
          }
        };
        GetSubjectgrade();
        setInputData(subjectgrade);
        break;
      case "Exam Report List":
        const GetExamreport = async () => {
          try {
            const response = await getExamreport(
              { examId: 1, studentId: "All", classId: 1, sectionId: 1 },
              getToken()
            );
            const resultData = response.data[0].map((item) => ({
              id: item.id,
              student: item.studentName,
              exam: item.examName,
              class: item.className,
              section: item.sectionName,
              subject: item.subjectName,
              mark: item.mark,
              total: item.total,
              result: item.result,
              remarks: item.remarks,
            }));
            setData(resultData);
          } catch (err) {
            console.log(err);
          }
        };
        GetExamreport();
        setInputData();
        break;
      case "Exam Results":
        const GetExamresults = async () => {
          try {
            const response = await getExamResultlist(
              { examId: 1, studentId: "All", classId: 1, sectionId: 1 },
              getToken()
            );
            const resultData = response.data.map((item) => ({
              id: item.id,
              student: item.studentName,
              exam: item.examName,
              class: item.className,
              section: item.sectionName,
              grade: item.grade,
              mark: item.obtainedMark,
              total: item.totalMark,
              rank: item.rank,
              remarks: item.remarks,
            }));
            setData(resultData);
          } catch (err) {
            console.log(err);
          }
        };
        GetExamresults();
        setInputData();
        break;
      default:
        setData("");
        console.log("No matching data scenario");
    }
    return () => {
      console.log("Component unmounted or effect is being cleaned up");
    };
  }, [propsData, message]);

  return (
    <div>
      <div>
        {/* <h3>{propsData}</h3> */}
        <ul class="breadcrumb" style={{display:'flex'}}>
          <li>
            <Link to={"/dashboard"}>
              <a style={{ color: "#051F3E" }}><h4>Home</h4></a>
            </Link>
          </li>
          <li>
            <a>{propsData}</a>
          </li>
        </ul>
      </div>
      {/* {isSuccessVisible && <h1 className="success-message">{message}</h1>} */}
      <div className="button-content ">
        {isModalOpen && (
          <Modal
            onSubmit={handleSubmit}
            setFormData={setFormData}
            closeModal={closeModal}
            inputData={inputData}
            propsData={propsData}
            editData={editData}
            dropdown={data}
          />
        )}
      </div>
      <div className="table-container">
        {data ? (
          <Table
            data={data}
            onEdit={handleEdit}
            onDelete={handleDelete}
            propsData={propsData}
            openModal={openModal}
          />
        ) : (
          <div>NO DATA FOUND...</div>
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
};

export default Staff;
