import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useParams } from "react-router-dom";
import "./profile.css";
import { STAFF_KEY, TOKEN_KEY } from "../../services/auth";
import { getStafflist, getStudentlist } from "../../services/api";

const Profile = () => {
  const [data, setData] = useState();
  const [details, setDetails] = useState();
  const [image, setImage] = useState();
  const location = useLocation();
  const propsData = location.state;
  let { id } = useParams();
  const [studentData, setStudentData] = useState([]);
  const [staffData, setStaffData] = useState([]);
  let props =
    propsData === "Student List" ? "Student details" : "Staff details";

  // useEffect(() => {
  //   console.log(propsData);
  //   switch (propsData) {
  //     case "Student List":
  //       const getStudentList = async () => {
  //         try {
  //           const response = await getStudentlist({ userName: id }, TOKEN_KEY);
  //           console.log("responsedata list", response.data[0]);
  //           console.log("responsedata list", response.data[0].image);
  //           let detail = {
  //             mobile: response.data[0].mobile,
  //             admissionNo: response.data[0].admissionNo,
  //             initial: response.data[0].initial,
  //             studentName: response.data[0].studentName,
  //             class: response.data[0].class,
  //             section: response.data[0].section,
  //           };
  //           const dataArray = Object.entries(response.data[0]).map(
  //             ([key, value]) => ({ key, value })
  //           );
  //           setData(dataArray);
  //           setDetails(detail);
  //           setImage(response.data[0].image);
  //           // const resultData = response.data.map(item => ({
  //           //     id: item.id,
  //           //     admissionNo: item.admissionNo,
  //           //     "reg.No": item.registrationNo,
  //           //     studentName: item.studentName,
  //           //     address: `${item.address1 + "," + item.address2 + "," + item.city + "-" + item.pincode + "," + item.state + "," + item.nationality}.`,
  //           //     mobilenumber: item.mobile,
  //           //     emailId: item.emailId,
  //           //     dateOfBirth: item.dateOfBirth,
  //           //     dateOfJoining: item.dateOfJoining,
  //           // }));
  //           // setData(res)
  //         } catch (err) {
  //           console.log(err);
  //         }
  //       };
  //       getStudentList();
  //       break;
  //     case "Staff List":
  //       const getStaffList = async () => {
  //         try {
  //           console.log(id);
  //           const response = await getStafflist(id, TOKEN_KEY);
  //           console.log("responsedata list", response.data[0]);
  //           console.log("responsedata list", response.data[0].image);
  //           let detail = {
  //             staffId: response.data[0].staffId,
  //             staffName: response.data[0].staffName,
  //             mobilenumber: response.data[0].contact_number,
  //             department: response.data[0].department,
  //           };
  //           const dataArray = Object.entries(response.data[0]).map(
  //             ([key, value]) => ({ key, value })
  //           );
  //           setData(dataArray);
  //           setDetails(detail);
  //           setImage(response.data[0].image);
  //         } catch (err) {
  //           console.log(err);
  //         }
  //       };
  //       getStaffList();
  //       break;

  //     default:
  //       console.log("No matching data scenario");
  //   }
  //   return () => {
  //     console.log("Component unmounted or effect is being cleaned up");
  //   };
  // }, []);
  useEffect(() => {
    switch (propsData) {
      case "Student List":
        const fetchData = async () => {
          try {
            const response = await getStudentlist({ userName: id }, TOKEN_KEY);
            setStudentData(response.data);
          } catch (error) {
            console.error("Error fetching student data:", error);
          }
        };
        fetchData();
        break;
      case "Staff List":
        const fetchDatas = async () => {
          try {
            const response = await getStafflist(id, TOKEN_KEY);
            setStaffData(response.data);
          } catch (error) {
            console.error("Error fetching student data:", error);
          }
        };
        fetchDatas();
        break;
    }
  }, []);

  return (
    <div>
      <div>
          <ul
            class="breadcrumb"
            style={{ display: "flex", alignItems: "center" }}
          >
            <li>
              <Link to={"/list"} state={props=='Student details'?"Student List":"Staff List"}>
                <a style={{ color: "#051F3E" }}>
                  <h4>{props=='Student details'?"Student":"Staff"}</h4>
                </a>
              </Link>
            </li>
            <li>
              <a>{props=='Student details'?"Student Details":"Staff Details"}</a>
            </li>
          </ul>
          <span
            className="horizontal-line"
            style={{ background: "#F0F1F3", marginTop: "20px" }}
          ></span>
        </div>
      {studentData[0] || staffData[0] ? (
        <div>
          <div style={{ display: "flex", gap: "18px", marginTop: "5px" }}>
            <div
              style={{
                background: "white",
                width: "100%",
                padding: "6px 6px 9px",
                borderRadius: "7px",
                height: "534px",
              }}
            >
              <div>
                <h2
                  style={{
                    padding: "5px",
                    fontSize: "15px",
                    marginLeft: "10px",
                    fontWeight: "600",
                  }}
                >
                  {props}
                </h2>
                <span
                  class="horizontal-line"
                  style={{ background: "#F0F1F3", marginTop: "-15px" }}
                ></span>
              </div>
              <div style={{ display: "flex", padding: "20px", gap: "25px" }}>
                <div
                  style={{
                    padding: "10px",
                    // background: "#00BCD4",
                    height: "34vh",
                  }}
                >
                  <div className="img-con" style={{ float: "inline-start" }}>
                    <img
                      src={
                        studentData[0] ? studentData[0].photoUrl : staffData[0].image
                      }
                      alt="student"
                      style={{ width: "200px", height: "200px" }}
                    />
                  </div>
                </div>

                <div
                  className="table"
                  style={{ width: "75%", marginTop: "-10px" }}
                >
                  <tbody className="studentData">
                    {propsData === "Staff List" ? (
                      <>
                        {staffData.map((staff) => (
                          <>
                            <tr key={staff.id}>
                              <td
                                style={{
                                  border: "0",
                                  background: "white",
                                  color: "black",
                                  padding: "5px",
                                }}
                              >
                                <h2>{staff.admissionNo}</h2>
                              </td>
                            </tr>
                            <tr key={staff.id}>
                              <td style={{ border: "0", background: "white" }}>
                                Student Name
                              </td>
                              <td style={{ border: "0", background: "white" }}>
                                :{" "}
                              </td>
                              <td className="Names">{staff.staffName}</td>
                            </tr>
                            <tr>
                              <td style={{ border: "0", background: "white" }}>
                                Department
                              </td>
                              <td style={{ border: "0", background: "white" }}>
                                :{" "}
                              </td>
                              <td className="Names">{staff.department}</td>
                            </tr>
                            <tr>
                              <td style={{ border: "0", background: "white" }}>
                                Position
                              </td>
                              <td style={{ border: "0", background: "white" }}>
                                :{" "}
                              </td>
                              <td className="Names">{staff.position}</td>
                            </tr>
                            <tr>
                              <td style={{ border: "0", background: "white" }}>
                                Gender
                              </td>
                              <td style={{ border: "0", background: "white" }}>
                                :{" "}
                              </td>
                              <td className="Names">{staff.gender}</td>
                            </tr>
                            <tr>
                              <td style={{ border: "0", background: "white" }}>
                                Address
                              </td>
                              <td style={{ border: "0", background: "white" }}>
                                :{" "}
                              </td>
                              <td className="Names">{staff.address1}</td>
                            </tr>
                            <tr>
                              <td style={{ border: "0", background: "white" }}>
                                Pin Code
                              </td>
                              <td style={{ border: "0", background: "white" }}>
                                :{" "}
                              </td>
                              <td className="Names">{staff.pincode}</td>
                            </tr>
                            <tr>
                              <td style={{ border: "0", background: "white" }}>
                                Mobile{" "}
                              </td>
                              <td style={{ border: "0", background: "white" }}>
                                :{" "}
                              </td>
                              <td className="Names">{staff.contact_number}</td>
                            </tr>
                            <tr>
                              <td style={{ border: "0", background: "white" }}>
                                Emis No
                              </td>
                              <td style={{ border: "0", background: "white" }}>
                                :{" "}
                              </td>
                              <td className="Names">{staff.emisNo}</td>
                            </tr>
                            <tr>
                              <td style={{ border: "0", background: "white" }}>
                                BloodGroup
                              </td>
                              <td style={{ border: "0", background: "white" }}>
                                :{" "}
                              </td>
                              <td className="Names">{staff.bloodGroup}</td>
                            </tr>
                            <tr>
                              <td style={{ border: "0", background: "white" }}>
                                Date of Birth
                              </td>
                              <td style={{ border: "0", background: "white" }}>
                                :{" "}
                              </td>
                              <td className="Names">{staff.date_of_birth}</td>
                            </tr>
                          </>
                        ))}
                      </>
                    ) : (
                      <>
                        {studentData.map((student) => (
                          <>
                            <tr key={student.id}>
                              <td
                                style={{
                                  border: "0",
                                  background: "white",
                                  color: "black",
                                  padding: "5px",
                                }}
                              >
                                <h2>{student.admissionNo}</h2>
                              </td>
                            </tr>
                            <tr key={student.id}>
                              <td style={{ border: "0", background: "white" }}>
                                Student Name
                              </td>
                              <td style={{ border: "0", background: "white" }}>
                                :{" "}
                              </td>
                              <td className="Names">{student.studentName}</td>
                            </tr>
                            <tr>
                              <td style={{ border: "0", background: "white" }}>
                                Registration No{" "}
                              </td>
                              <td style={{ border: "0", background: "white" }}>
                                :{" "}
                              </td>
                              <td className="Names">
                                {student.registrationNo}
                              </td>
                            </tr>
                            <tr>
                              <td style={{ border: "0", background: "white" }}>
                                Class & Section{" "}
                              </td>
                              <td style={{ border: "0", background: "white" }}>
                                :{" "}
                              </td>
                              <td className="Names">
                                {student.class} - {student.section}
                              </td>
                            </tr>
                            <tr>
                              <td style={{ border: "0", background: "white" }}>
                                Gender
                              </td>
                              <td style={{ border: "0", background: "white" }}>
                                :{" "}
                              </td>
                              <td className="Names">{student.gender}</td>
                            </tr>
                            <tr>
                              <td style={{ border: "0", background: "white" }}>
                                Address
                              </td>
                              <td style={{ border: "0", background: "white" }}>
                                :{" "}
                              </td>
                              <td className="Names">{student.address1}</td>
                            </tr>
                            <tr>
                              <td style={{ border: "0", background: "white" }}>
                                Pin Code
                              </td>
                              <td style={{ border: "0", background: "white" }}>
                                :{" "}
                              </td>
                              <td className="Names">{student.pincode}</td>
                            </tr>
                            <tr>
                              <td style={{ border: "0", background: "white" }}>
                                Mobile{" "}
                              </td>
                              <td style={{ border: "0", background: "white" }}>
                                :{" "}
                              </td>
                              <td className="Names">{student.mobile}</td>
                            </tr>
                            <tr>
                              <td style={{ border: "0", background: "white" }}>
                                Emis No
                              </td>
                              <td style={{ border: "0", background: "white" }}>
                                :{" "}
                              </td>
                              <td className="Names">{student.emisNo}</td>
                            </tr>
                            <tr>
                              <td style={{ border: "0", background: "white" }}>
                                BloodGroup
                              </td>
                              <td style={{ border: "0", background: "white" }}>
                                :{" "}
                              </td>
                              <td className="Names">{student.bloodgroup}</td>
                            </tr>
                            <tr>
                              <td style={{ border: "0", background: "white" }}>
                                Date of Birth
                              </td>
                              <td style={{ border: "0", background: "white" }}>
                                :{" "}
                              </td>
                              <td className="Names">{student.dateOfBirth}</td>
                            </tr>
                          </>
                        ))}
                      </>
                    )}
                  </tbody>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <div>
                    <div className="download-icon">
                      <i
                        class="fa fa-print"
                        style={{ color: "rgb(100,100,100)" }}
                      ></i>
                    </div>
                  </div>
                  <div>
                    <div className="download-icon">
                      <i
                        class="fa fa-download"
                        style={{ color: "rgb(100,100,100)" }}
                      ></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <p>No data Found...</p>
        </div>
      )}
      {/* <div className='table-container'>
        <div className='container'>
          <div className="item-img left">
            <img src="data:image/jpeg;base64,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" alt="student" />
          </div>
          <div className='right'>
            
            <table style={{border:"none"}}>
              <tbody>
                {data?.map((item, index) => (
                  <tr key={index}>
                    <td>{item.key.toUpperCase()}:</td>
                    <td style={{ color: "black" }}>{item.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div> */}

      {/* <div className="Profile">
        <div className="container">
          <div className="left">
            {propsData === "Staff List" ? (
              <>
                <p>
                  {" "}
                  <span>
                    <i class="fa-regular fa-id-badge"></i>
                  </span>{" "}
                  {details?.staffId}
                </p>
                <p>
                  <span>
                    <i class="fa-solid fa-user"></i>
                  </span>{" "}
                  {details?.staffName}
                </p>

                <p>
                  {" "}
                  <span>
                    <i class="fa-brands fa-firstdraft"></i>
                  </span>{" "}
                  {details?.department}
                </p>

                <p>
                  {" "}
                  <span>
                    <i class="fa-solid fa-phone"></i>
                  </span>{" "}
                  {details?.mobilenumber}
                </p>
              </>
            ) : (
              <>
                <p>
                  {" "}
                  <span>
                    <i class="fa-regular fa-id-badge"></i>
                  </span>{" "}
                  {details?.admissionNo}
                </p>
                <p>
                  {" "}
                  <span>
                    <i class="fa-solid fa-user"></i>
                  </span>{" "}
                  {details?.initial}.{details?.studentName}
                </p>
                <p>
                  {" "}
                  <span>
                    <i class="fa-brands fa-firstdraft"></i>
                  </span>{" "}
                  {details?.class}-{details?.section}
                </p>
                <p>
                  {" "}
                  <span>
                    <i class="fa-solid fa-phone"></i>
                  </span>{" "}
                  {details?.mobile}
                </p>
              </>
            )}
          </div>
          <div className="item-img right">
            <div className="img-con">
              <img src={image} alt="student" />
            </div>
          </div>
        </div>

        <table className="table" style={{ border: "none" }}>
          <tbody>
            {data?.map((item, index) => (
              <tr key={index}>
                <td>{item.key.toUpperCase()}:</td>
                <td style={{ color: "black" }}>{item.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div> */}

      {/* <div style={{ display: "flex", gap: "15px" }}>
        <div
          style={{
            padding: "25px",
            background: "#74BF44",
            width: "25%",
            display: "flex",
          }}
        >
          <div style={{ width: "50%" }}>
            <i class="bx bxs-edit" style={{display:"flex",justifyContent:"center",color:'white',fontSize:'25px',marginBottom:'10px'}}></i>
            <span style={{ color: "white", fontWeight: "300",display:"flex",justifyContent:"center" }}>
              Upcoming Exam
            </span>
          </div>
        </div>
        <div style={{padding:"10px",background:'#FB4448',width:'25%'}}> </div>
      <div style={{padding:"10px",background:'#1E99E5',width:'25%'}}> </div>
      <div style={{padding:"10px",background:'#FEDA2D',width:'25%'}}> </div>
      </div>

      <div style={{ display: "flex", gap: "18px" }}>
        <div style={{ background: "white", width: "75%" }}>
          <div>
            <h2
              style={{ padding: "5px", fontSize: "15px", marginLeft: "10px" }}
            >
              My Information
            </h2>
            <span
              class="horizontal-line"
              style={{ background: "#F0F1F3", marginTop: "-15px" }}
            ></span>
          </div>
          <div style={{ display: "flex", padding: "15px", gap: "25px" }}>
            <div
              style={{ padding: "10px", background: "#FFA602", height: "25vh" }}
            >
              <div className="img-con" style={{ float: "inline-start" }}>
                <img src={image} alt="student" />
              </div>
            </div>
            <div className="table" style={{ width: "50%" }}>
              {data?.map((item, index) => (
                <tr key={index}>
                  <td
                    style={{
                      border: "0",
                      background: "white",
                      color: "#A7A7A7",
                      fontWeight: "400",
                    }}
                  >
                    {item.key.toUpperCase()}:
                  </td>
                  <td
                    style={{ border: "0", background: "white", color: "black" }}
                  >
                    {item.value}
                  </td>
                </tr>
              ))}
            </div>
          </div>
        </div>
        <div style={{ background: "white", width: "50%" }}>
          <div>
            <h2 style={{ padding: "5px", fontSize: "15px" }}>My Information</h2>
            <span
              class="horizontal-line"
              style={{ background: "#F0F1F3", marginTop: "-15px" }}
            ></span>
          </div>
          <div></div>
        </div>
      </div> */}
    </div>
  );
};

export default Profile;
