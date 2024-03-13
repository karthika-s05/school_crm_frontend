import React from 'react'
import { Link } from "react-router-dom";

export default function Report() {

  return (
    <div>
        <div>
          <h3>Report</h3>
          <ul class="breadcrumb">
            <li>
              <Link to={"/report"}>
                <a style={{ color: "#646464" }}>Assignment</a>
              </Link>
            </li>
            <li>
              <a>Student Report</a>
            </li>
          </ul>
        </div>
    </div>
  )
}

// import React, { useEffect, useState } from "react";
// import { Link, useLocation } from "react-router-dom";
// import "./table.css";
// import { getClass, getStudentlist } from "../../services/api";
// import { TOKEN_KEY } from "../../services/auth";

// const Table = (props) => {
//   const data = props.data;
//   const [currentPage, setCurrentPage] = useState(1);
//   const [search, setSearch] = useState();
//   const [dropDown, setDropDown] = useState({});
//   const [selectedClassId, setSelectedClassId] = useState(0);
//   const { pathname } = useLocation();
//   const isClassIdDropdownVisible = pathname === "/list";
//   const [pageSize] = useState(7);
//   const [totalPages, setTotalPages] = useState(1);
//   useEffect(() => {
//     const getDropdownData = async (funcName, id, name) => {
//       try {
//         const response = await funcName(id, TOKEN_KEY);
//         const data = response.map((value, index) => ({
//           id: value.id,
//           value: value.name,
//         }));
//         setDropDown((prevData) => ({
//           ...prevData,
//           [name]: data,
//         }));
//       } catch (err) {
//         console.log(err);
//       }
//     };
//     if (
//       isClassIdDropdownVisible &&
//       pathname === "/list" &&
//       props.propsData === "Student List"
//     ) {
//       getDropdownData(getClass, 0, "classId");
//     }
//   }, [isClassIdDropdownVisible, pathname, props.propsData]);
//   useEffect(() => {
//     setTotalPages(Math.ceil(data.length / pageSize));
//   }, [data, pageSize]);

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     if (name === "classId") {
//       setSelectedClassId(value);
//     }
//     fetchStudentList();
//   };
//   const fetchStudentList = async () => {
//     try {
//       const startIndex = (currentPage - 1) * pageSize;
//       const endIndex = startIndex + pageSize;
//       const response = await getStudentlist(
//         startIndex,
//         endIndex,
//         TOKEN_KEY,
//         selectedClassId
//       );
//       props.setData(response);
//     } catch (error) {
//       console.error("Error fetching student data:", error);
//     }
//   };

//   const handlePageClick = (pageNumber) => {
//     if (pageNumber === "prev" && currentPage > 1) {
//       setCurrentPage(currentPage - 1);
//     } else if (pageNumber === "next" && currentPage < totalPages) {
//       setCurrentPage(currentPage + 1);
//     } else if (
//       typeof pageNumber === "number" &&
//       pageNumber >= 1 &&
//       pageNumber <= totalPages
//     ) {
//       setCurrentPage(pageNumber);
//     }
//   };
//   let edit = <i class="bx bxs-pencil"></i>;
//   let view = <i class="bx bx-show-alt"></i>;
//   let trash = <i class="bx bxs-trash"></i>;

//   const newArray = data.map((obj) => {
//     return {
//       ...obj,
//       ...(props.propsData === "Student List" || props.propsData === "Staff List"
//         ? { View: view }
//         : { Edit: edit }),
//       Delete: trash,
//     };
//   });
//   console.log(props.propsData);
//   console.log(props);
//   const renderTableHeader = (data) => {
//     const headings = Object.keys(data[0] || {});
//     return (
//       <thead>
//         <tr>
//           {headings.map((heading, index) =>
//             index === 0 ? (
//               ""
//             ) : (
//               <th key={index} style={{ textAlign: "center" }}>
//                 {heading.toUpperCase()}
//               </th>
//             )
//           )}
//         </tr>
//       </thead>
//     );
//   };

//   const createTableRows = (data) => {
//     const startIndex = (currentPage - 1) * pageSize;
//     const endIndex = startIndex + pageSize;

//     const filteredData = data
//       .filter((item) =>
//         Object.values(item).some((value) =>
//           search
//             ? value.toString().toUpperCase().includes(search.toUpperCase())
//             : data
//         )
//       )
//       .slice(startIndex, endIndex);

//     const tableRows = [];

//     filteredData.forEach((item) => {
//       const columns = [];
//       for (const key in item) {
//         if (key === "image") {
//           columns.push(
//             <td key={key} style={{ textAlign: "center" }}>
//               <img className="image" alt="" src={item[key]} />
//             </td>
//           );
//         } else if (key === "Edit") {
//           columns.push(
//             <td key={key} style={{ textAlign: "center" }}>
//               <button
//                 className="edit-button"
//                 onClick={() => props.onEdit(item["id"])}
//               >
//                 {item[key]}
//               </button>
//             </td>
//           );
//         } else if (key === "Delete") {
//           columns.push(
//             <td key={key} style={{ textAlign: "center" }}>
//               <button
//                 className="delete-button"
//                 onClick={() => props.onDelete(item["id"])}
//               >
//                 {item[key]}
//               </button>
//             </td>
//           );
//         } else if (key === "View") {
//           columns.push(
//             <td key={key} style={{ textAlign: "center" }}>
//               {props.propsData === "Student List" ? (
//                 <Link
//                   to={`/profile/${item["admissionNo"]}`}
//                   state={props.propsData}
//                 >
//                   <button className="view-button">{item[key]}</button>
//                 </Link>
//               ) : (
//                 <Link
//                   to={`/profile/${item["staffId"]}`}
//                   state={props.propsData}
//                 >
//                   <button className="view-button">{item[key]}</button>
//                 </Link>
//               )}
//             </td>
//           );
//         } else {
//           columns.push(
//             <td key={key} style={{ textAlign: "center" }}>
//               {item[key]}
//             </td>
//           );
//         }
//       }
//       columns.shift();
//       tableRows.push(<tr key={item.id}>{columns}</tr>);
//     });

//     return tableRows;
//   };

//   return (
//     <>

//       <div className="table-main">
//         <h3>All {props.propsData} Details</h3>
//         <div class="form-group">
//           <div className="search-input">
//             <i
//               class="bx bx-search"
//               style={{ fontSize: "24px", padding: "10px", color: "gray" }}
//             ></i>
//             <input
//               type="text"
//               placeholder="Search..."
//               class="form-control"
//               onChange={(e) => setSearch(e.target.value)}
//             />
//           </div>
//           <button
//             type="submit"
//             class="fw-btn-fill btn-gradient-add"
//             onClick={props.openModal}
//           >
//             <i class="bx bx-plus"></i>ADD{" "}
//           </button>
//         </div>
//         <div>
//           {isClassIdDropdownVisible &&
//             pathname === "/list" &&
//             props.propsData === "Student List" && (
//               <div className="" style={{ marginTop: "-65px" }}>
//                 {Object.keys(dropDown).map(
//                   (key) =>
//                     key === "classId" && (
//                       <SelectField
//                         key={key}
//                         data={{
//                           label: key,
//                           name: key,
//                           value: "",
//                         }}
//                         dropDown={dropDown}
//                         handleInputChange={handleInputChange}
//                       />
//                     )
//                 )}
//               </div>
//             )}

//           <table className="table">
//             {renderTableHeader(newArray)}
//             {createTableRows(newArray)}
//           </table>
//           <div className="pagination">
//             <a onClick={() => handlePageClick("prev")}>&laquo;</a>
//             {Array.from({ length: totalPages }, (_, index) => index + 1).map(
//               (pageNumber) => (
//                 <button
//                   key={pageNumber}
//                   onClick={() => handlePageClick(pageNumber)}
//                   className={currentPage === pageNumber ? "active-page" : ""}
//                 >
//                   {pageNumber}
//                 </button>
//               )
//             )}
//             <a onClick={() => handlePageClick("next")}>&raquo;</a>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// const SelectField = ({ data, dropDown, handleInputChange }) => {
//   return (
//     <>
//       <div>
//         <label className="input-label"></label>
//         <select
//           className="effect-2"
//           name={data.name}
//           value={data.value}
//           onChange={handleInputChange}
//         >
//           {data.value ? (
//             <option value={data.value}>{data.value}</option>
//           ) : (
//             <option value="">Class</option>
//           )}
//           {dropDown[data.name] &&
//             dropDown[data.name].map((option, index) => (
//               <option key={index} value={option.id}>
//                 {option.value}
//               </option>
//             ))}
//         </select>
//       </div>
//     </>
//   );
// };

// export default Table;

