// import React, { useEffect, useState } from "react";
// import { Link } from "react-router-dom";
// import { getNationality, postNationality } from "../../../services/api";
// import { STAFF_KEY, TOKEN_KEY } from "../../../services/auth";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// export default function Nationality() {
//   const [data, setData] = useState([]);
//   const [dropDown, setDropDown] = useState({});
//   const [editingItem, setEditingItem] = useState(null);
//   const [deleteConfirmation, setDeleteConfirmation] = useState(false);
//   const [deletingItemId, setDeletingItemId] = useState(null);
//   const [successConfirmation, setSuccessConfirmation] = useState(false);
//   const [successItemId, setSuccessItemId] = useState(null);
//   const [formData, setFormData] = useState({ name: "", code: "" });
//   const [errors, setErrors] = useState({});
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [editingItemId, setEditingItemId] = useState(null);
//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({ ...formData, [name]: value });
//   };
//   const handleEdit = async (id) => {
    
//     setIsModalOpen(true);
//     setEditingItemId(id);
//     try {
//       const nationalityData = await getNationality(id,TOKEN_KEY);
//       console.log(nationalityData,"gg")
//       setFormData({ name: nationalityData[0].name, code: nationalityData[0].code });
//     } catch (error) {
//       console.error('Error fetching nationality data:', error);
//     }
//   };
//   const handleAdd = () => {
//     setEditingItem(null);
//     setIsModalOpen(true);
//   };
//   const closeModal = () => {
//     setIsModalOpen(false);
//     setFormData({ name: "", code: "" });
//     setErrors({});
//   };
//   const handleSubmit = async () => {
//     const { name, code } = formData;
//     const newErrors = {};
//     if (!name.trim()) {
//       newErrors.name = "Name is required";
//     }
//     if (!code.trim()) {
//       newErrors.code = "Code is required";
//     }
//     if (Object.keys(newErrors).length > 0) {
//       setErrors(newErrors);
//       return;
//     }
//     try {
//       formData.id = 0;
//       const response = await postNationality(formData, TOKEN_KEY);
//       console.log(response.data);
//     } catch (error) {}
//   };

//   useEffect(() => {
//     const Getnationality = async () => {
//       try {
//         const response = await getNationality(0, TOKEN_KEY);
//         const resultData = response.map((item) => ({
//           id: item.id,
//           code: item.code,
//           name: item.name,
//         }));
//         setData(resultData);
//       } catch (err) {
//         console.log(err);
//       }
//     };

//     Getnationality();
//   }, []);

//   return (
//     <div>
//       <div className="table-containers">
//         <ul className="breadcrumb" style={{ display: "flex" }}>
//           <li>
//             <Link to={"/exam"}>
//               <a style={{ color: "#051F3E" }}>
//                 <h4>Master</h4>
//               </a>
//             </Link>
//           </li>
//           <li>
//             <a>Nationality</a>
//           </li>
//         </ul>
//       </div>
//       <div className="table-container">
//         <div className="table-main">
//           <h3 style={{ color: "#051F3E" }}>Nationality </h3>
//           <div className="form-group">
//             <div className="search-input">
//               <i
//                 className="bx bx-search"
//                 style={{ padding: "10px", color: "gray", marginLeft: "-30px" }}
//               ></i>
//               <input
//                 type="text"
//                 placeholder="Search..."
//                 className="form-control"
//                 // onChange={(e) => setSearchTerm(e.target.value)}
//               />
//             </div>
//             <button
//               type="submit"
//               className="fw-btn-fill btn-gradient-add"
//               onClick={handleAdd}
//             >
//               <i className="bx bx-plus"></i>ADD{" "}
//             </button>
//           </div>
//           <table className="table">
//             <thead>
//               <tr>
//                 <th style={{ textAlign: "center" }}>CODE</th>
//                 <th style={{ textAlign: "center" }}>NAME</th>
//                 <th style={{ textAlign: "center" }}>ACTION</th>
//               </tr>
//             </thead>
//             <tbody>
//               {data
//                 // .filter((item) =>
//                 //   Object.values(item)
//                 //     .join(" ")
//                 //     .toLowerCase()
//                 //     .includes(searchTerm.toLowerCase())
//                 // )
//                 // .slice((currentPage - 1) * pageSize, currentPage * pageSize)
//                 .map((item) => (
//                   <tr key={item.id}>
//                     <td style={{ textAlign: "center" }}>{item.code}</td>
//                     <td style={{ textAlign: "center" }}>{item.name}</td>
//                     <td style={{ textAlign: "center" }}>
//                       <button
//                         class="edit-button"
//                         onClick={() => handleEdit(item.id)}
//                       >
//                         <i class="bx bxs-edit"></i>
//                       </button>
//                       <button
//                         class="delete-button"
//                         onClick={() => {
//                           setDeletingItemId(item.id);
//                           setDeleteConfirmation(true);
//                         }}
//                       >
//                         <i class="bx bxs-trash"></i>
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//             </tbody>
//           </table>
//           {isModalOpen && (
//             <div className="modal-overlay">
//               <div className="modal-content">
//                 <span className="modal-close">
//                   <i
//                     className="bx bxs-x-circle"
//                     style={{ fontSize: "25px", color: "gray" }}
//                     onClick={closeModal}
//                   ></i>
//                 </span>
//                 <div className="app-container" style={{ marginRight: "-7px" }}>
//                   <h1
//                     className="header-model"
//                     style={{ color: "rgb(5, 31, 62)", fontWeight: "600" }}
//                   >
//                    {editingItemId ? 'Edit Nationality' : 'Create Nationality'}
//                   </h1>
//                   <div className="input-container">
//                     <label className="input-label">Name</label>
//                     <input
//                       style={{
//                         border: "1px solid rgb(200, 200, 200)",
//                         background: "rgb(240, 241, 243)",
//                       }}
//                       className="effect-1"
//                       type="text"
//                       name="name"
//                       value={formData.name}
//                       onChange={handleChange}
//                     />
//                     {errors.name && (
//                       <span className="error-messages">{errors.name}</span>
//                     )}
//                   </div>
//                   <div className="input-container">
//                     <label className="input-label">Code</label>
//                     <input
//                       style={{
//                         background: "rgb(240, 241, 243)",
//                         border: "1px solid rgb(200, 200, 200)",
//                       }}
//                       className="effect-1"
//                       type="text"
//                       name="code"
//                       value={formData.code}
//                       onChange={handleChange}
//                     />
//                     {errors.code && (
//                       <span className="error-messages">{errors.code}</span>
//                     )}
//                   </div>
//                   <div className="btn-style">
//                     <button className="cancel-button" onClick={closeModal}>
//                       Cancel
//                     </button>
//                     &nbsp;&nbsp;
//                     <button
//                       className="custom-button main_bg_color"
//                       onClick={handleSubmit}
//                     >
//                       {editingItemId ? 'Update' : 'Submit'}
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}

//           {deleteConfirmation && (
//             <div className="modal-overlay">
//               <div className="modal-content" style={{ width: "280px" }}>
//                 <div className="app-container" style={{ marginRight: "-7px" }}>
//                   <p
//                     style={{
//                       textAlign: "center",
//                       color: "rgb(5, 31, 62)",
//                       fontWeight: "500",
//                       fontSize: "14px",
//                       display: "flex",
//                       justifyContent: "center",
//                       gap: "5px",
//                       alignItems: "center",
//                     }}
//                   >
//                     <i
//                       class="fa fa-exclamation-circle"
//                       style={{ fontSize: "25px", color: "red" }}
//                     >
//                       {" "}
//                     </i>
//                     Are you sure you want to delete?
//                   </p>
//                   <div
//                     className="btn-style"
//                     style={{ marginTop: "20px", gap: "3px" }}
//                   >
//                     <button
//                       className="cancel-button"
//                       style={{
//                         width: "50px",
//                         height: "30px",
//                         display: "flex",
//                         alignItems: "center",
//                         justifyContent: "center",
//                       }}
//                       onClick={() => setDeleteConfirmation(false)}
//                     >
//                       No
//                     </button>
//                     &nbsp;&nbsp;
//                     <button
//                       className="custom-button"
//                       style={{
//                         width: "60px",
//                         height: "30px",
//                         display: "flex",
//                         alignItems: "center",
//                         justifyContent: "center",
//                       }}
//                     >
//                       Yes
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//       <ToastContainer position="bottom-right" autoClose={2500} style={{ zIndex: 99999, fontSize: 14 }} />
//     </div>
//   );
// }
