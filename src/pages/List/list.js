import React, { useEffect, useState } from "react";
import Modal from "../../component/modals/Modal";
import Table from "../../component/Table";
import Stafflist from "./Stafflist";
import StudentDummyList from "./StudentDummyList";
import { Navigate, useLocation } from "react-router-dom";
import { getToken } from "../../services/auth";
import {
  deleteSection,
  getStafflist,
  getStudentlist,
  getSubject,
  postSection,
} from "../../services/api";

const List = () => {
  const location = useLocation();
  const propsData = location.state;
  const [data, setData] = useState([]);
  const [message, setMessage] = useState();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [inputData, setInputData] = useState();

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { ...formData, id: formData.id || 0 };
    const token = getToken();

    if (propsData === "Section") {
      postSection(payload, token)
        .then((response) => setMessage(response))
        .catch((err) => console.log(err));
    }
    closeModal();
    setFormData({});
  };

  const handleEdit = (id) => {
    const token = getToken();
    if (propsData === "Subject") {
      getSubject(id, token)
        .then((response) => setData(response))
        .catch((err) => console.log(err));
      setInputData();
    } else {
      setData([]);
    }
    openModal(id);
  };

  const handleDelete = (id) => {
    const token = getToken();
    if (propsData === "Section") {
      deleteSection(id, token)
        .then((response) => setMessage(response))
        .catch((err) => console.log(err));
    }
  };

  useEffect(() => {
    const token = getToken();

    if (propsData === "Student List") {
      getStudentlist({ userName: 0 }, token)
        .then((response) => {
          const resultData = response.data.map((item) => ({
            id: item.id,
            "reg.No": item.registrationNo,
            "student Name": item.studentName,
            "class Name": `${item["class"] ?? item.className ?? ""}-${item.section ?? ""}`,
            "mobile number": item.mobile,
            "email Id": item.emailId,
            "date Of Birth": item.dateOfBirth,
            "date Of Joining": item.dateOfJoining,
          }));
          setData(resultData);
        })
        .catch((err) => console.log(err));
      setInputData("");
      return;
    }

    if (propsData === "Staff List") {
      getStafflist("0", token)
        .then((response) => {
          const resultData = response.data.map((item) => ({
            id: item.staffId,
            "staff Id": item.staffId,
            "staff Name": item.staffName,
            "email Id": item.emailID,
            department: item.department,
            "role Of Staff": item.roleOfStaff,
            address: "palavanthangal",
            "mobile number": item.contact_number,
            "date Of Birth": item.date_of_birth,
            "date Of Joining": item.date_of_joining,
          }));
          setData(resultData);
        })
        .catch((err) => console.log(err));
      setInputData("");
    }
  }, [propsData, message]);

  if (propsData === "Staff List") {
    return <Stafflist />;
  }

  if (propsData === "Student List") {
    return <StudentDummyList />;
  }

  if (!propsData) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div>
      <div className="table-container" style={{ marginTop: "10px" }}>
        <Table
          data={data}
          onEdit={handleEdit}
          onDelete={handleDelete}
          propsData={propsData}
          openModal={openModal}
        />
      </div>
      {isModalOpen && (
        <Modal
          onSubmit={handleSubmit}
          setFormData={setFormData}
          closeModal={closeModal}
          inputData={inputData}
          propsData={propsData}
        />
      )}
    </div>
  );
};

export default List;
