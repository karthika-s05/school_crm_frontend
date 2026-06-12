import React, { useEffect, useState } from "react";
import Modal from "../../component/modals/Modal";
import Table from "../../component/Table";
import { Link, useLocation } from "react-router-dom";
import { TOKEN_KEY, TOKEN_KEY1 } from "../../services/auth";
import { getStafflist, getStudentlist } from "../../services/api";

const List = () => {
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
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.id) {
      formData.id = 0;
    }
    switch (propsData) {
      case "Section":
        console.log("Calling Community function");
        const postSectionDetails = async () => {
          try {
            const response = await (formData, TOKEN_KEY);
            setMessage(response.data);
          } catch (err) {
            console.log(err);
          }
        };
        postSectionDetails();
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
      case "Subject":
        const getSubjectDetails = async () => {
          try {
            const response = await TOKEN_KEY;
            console.log(response);
            setData(response);
          } catch (err) {
            console.log(err);
          }
        };
        getSubjectDetails();
        setInputData();
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
      case "Section":
        const deleteSectionDetails = async () => {
          try {
            const response = await (id, TOKEN_KEY);
            console.log(response.data);
            setMessage(response.data);
          } catch (err) {
            console.log(err);
          }
        };
        deleteSectionDetails();
        break;
      default:
        console.log("No matching data scenario");
    }
  };
  useEffect(() => {
    console.log(propsData);
    switch (propsData) {
      case "Student List":
        const getStudentList = async () => {
          try {
            const response = await getStudentlist({userName:0}, TOKEN_KEY);
            console.log("responsedata list", response.data);
            const resultData = response.data.map((item) => ({
              id: item.id,
              "admission No": item.admissionNo,
              "reg.No": item.registrationNo,
              "student Name": item.studentName,
              // address: item.address1,
              "class Name":`${item.class}-${item.section}`,
              // address: `${item.address1 + "," + item.address2 + "," + item.city + "-" + item.pincode + "," + item.state + "," + item.nationality}.`,
              "mobile number": item.mobile,
              "email Id": item.emailId,
              "date Of Birth": item.dateOfBirth,
              "date Of Joining": item.dateOfJoining,
            }));
            setData(resultData);
          } catch (err) {
            console.log(err);
          }
        };
        getStudentList();
        setInputData("");
        break;
      case "Staff List":
        const getStaffList = async () => {
          try {
            const response = await getStafflist("0", TOKEN_KEY);
            console.log("response.........", response);
            const resultData = response.data.map((item) => ({
              id: item.staffId,
              "staff Id": item.staffId,
              "staff Name": item.staffName,
              "email Id": item.emailID,
              department: item.department,
              "role Of Staff": item.roleOfStaff,
              address: "palavanthangal",
              // address: `${item.address1 + "," + item.address2 + "," + item.city + "-" + item.pincode + "," + item.state + "," + item.nationality}.`,
              "mobile number": item.contact_number,
              "date Of Birth": item.date_of_birth,
              "date Of Joining": item.date_of_joining,
            }));
            setData(resultData);
          } catch (err) {
            console.log(err);
          }
        };
        getStaffList();
        setInputData("");
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
        <ul class="breadcrumb"  style={{display:'flex'}}>
          {/* <li>
            <Link to={"/dashboard"}>
              <a style={{ color: "#051F3E" }}><h4>Home</h4></a>
            </Link>
          </li>
          <li>
            <a>{propsData}</a>
          </li> */}
        </ul>
      </div>
      {/* {isSuccessVisible && <h1 className="success-message">{message}</h1>} */}
      {/* <div className='button-content'>
                {isModalOpen && <Modal onSubmit={handleSubmit} setFormData={setFormData} closeModal={closeModal} inputData={inputData} propsData={propsData} editData={editData} dropdown={data} />}
            </div> */}
      <div className="table-container" style={{marginTop:"10px"}}>
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
    </div>
  );
};

export default List;
