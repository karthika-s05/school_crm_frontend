// import React, { useState } from 'react';

// const Timetable = () => {
//     const [data, setData] = useState( [
//       {
//           "id": 1,
//           "startTime": "09:00 AM",
//           "endTime": "09:45 AM",
//           "day": "Monday",
//           "subject": "TAMIL",
//           "class": "LKG",
//           "section": "A",
//           "administrationId": 1,
//           "staffName": "Gokul Kannan R"
//       },
//       {
//           "id": 2,
//           "startTime": "09:45 AM",
//           "endTime": "10:30 AM",
//           "day": "Monday",
//           "subject": "ENGLISH",
//           "class": "LKG",
//           "section": "A",
//           "administrationId": 1,
//           "staffName": "Amuthavel N"
//       },
//       {
//           "id": 3,
//           "startTime": "10:30 AM",
//           "endTime": "10:40 AM",
//           "day": "Monday",
//           "subject": "BREAK",
//           "class": "LKG",
//           "section": "A",
//           "administrationId": 1,
//           "staffName": ""
//       },
//       {
//           "id": 4,
//           "startTime": "10:40 AM",
//           "endTime": "11:20 AM",
//           "day": "Monday",
//           "subject": "MATHS",
//           "class": "LKG",
//           "section": "A",
//           "administrationId": 1,
//           "staffName": "Vijay AV"
//       },
//       {
//           "id": 5,
//           "startTime": "11:20 AM",
//           "endTime": "12:00 PM",
//           "day": "Monday",
//           "subject": "SCIENCE",
//           "class": "LKG",
//           "section": "A",
//           "administrationId": 1,
//           "staffName": "Harish N"
//       },
//       {
//           "id": 6,
//           "startTime": "12:00 PM",
//           "endTime": "12:40 PM",
//           "day": "Monday",
//           "subject": "BREAK",
//           "class": "LKG",
//           "section": "A",
//           "administrationId": 1,
//           "staffName": ""
//       },
//       {
//           "id": 7,
//           "startTime": "12:40 PM",
//           "endTime": "01:20 AM",
//           "day": "Monday",
//           "subject": "SOCIAL",
//           "class": "LKG",
//           "section": "A",
//           "administrationId": 1,
//           "staffName": "Mani Maran AV"
//       },
//       {
//           "id": 8,
//           "startTime": "01:20 AM",
//           "endTime": "02:00 AM",
//           "day": "Monday",
//           "subject": "ENGLISH",
//           "class": "LKG",
//           "section": "A",
//           "administrationId": 1,
//           "staffName": "Amuthavel N"
//       },
//       {
//           "id": 9,
//           "startTime": "02:00 AM",
//           "endTime": "02:10 AM",
//           "day": "Monday",
//           "subject": "BREAK",
//           "class": "LKG",
//           "section": "A",
//           "administrationId": 1,
//           "staffName": ""
//       },
//       {
//           "id": 10,
//           "startTime": "02:10 AM",
//           "endTime": "02:50 AM",
//           "day": "Monday",
//           "subject": "SOCIAL",
//           "class": "LKG",
//           "section": "A",
//           "administrationId": 1,
//           "staffName": "Mani Maran AV"
//       },
//       {
//           "id": 11,
//           "startTime": "02:50 AM",
//           "endTime": "03:30 AM",
//           "day": "Monday",
//           "subject": "PET",
//           "class": "LKG",
//           "section": "A",
//           "administrationId": 1,
//           "staffName": "Lakshmi G"
//       },
//       {
//           "id": 12,
//           "startTime": "09:00 AM",
//           "endTime": "09:45 AM",
//           "day": "Tuesday",
//           "subject": "TAMIL",
//           "class": "LKG",
//           "section": "A",
//           "administrationId": 1,
//           "staffName": "Gokul Kannan R"
//       },
//       {
//           "id": 13,
//           "startTime": "09:45 AM",
//           "endTime": "10:30 AM",
//           "day": "Tuesday",
//           "subject": "ENGLISH",
//           "class": "LKG",
//           "section": "A",
//           "administrationId": 1,
//           "staffName": "Amuthavel N"
//       },
//       {
//           "id": 14,
//           "startTime": "10:30 AM",
//           "endTime": "10:40 AM",
//           "day": "Tuesday",
//           "subject": "BREAK",
//           "class": "LKG",
//           "section": "A",
//           "administrationId": 1,
//           "staffName": ""
//       },
//       {
//           "id": 15,
//           "startTime": "10:40 AM",
//           "endTime": "11:20 AM",
//           "day": "Tuesday",
//           "subject": "SCIENCE",
//           "class": "LKG",
//           "section": "A",
//           "administrationId": 1,
//           "staffName": "Harish N"
//       },
//       {
//           "id": 16,
//           "startTime": "11:20 AM",
//           "endTime": "12:00 PM",
//           "day": "Tuesday",
//           "subject": "SOCIAL",
//           "class": "LKG",
//           "section": "A",
//           "administrationId": 1,
//           "staffName": "Mani Maran AV"
//       },
//       {
//           "id": 17,
//           "startTime": "12:00 PM",
//           "endTime": "12:40 PM",
//           "day": "Tuesday",
//           "subject": "BREAK",
//           "class": "LKG",
//           "section": "A",
//           "administrationId": 1,
//           "staffName": ""
//       },
//       {
//           "id": 18,
//           "startTime": "12:40 PM",
//           "endTime": "01:20 AM",
//           "day": "Tuesday",
//           "subject": "PET",
//           "class": "LKG",
//           "section": "A",
//           "administrationId": 1,
//           "staffName": "Lakshmi G"
//       },
//       {
//           "id": 19,
//           "startTime": "01:20 AM",
//           "endTime": "02:00 AM",
//           "day": "Tuesday",
//           "subject": "SCIENCE",
//           "class": "LKG",
//           "section": "A",
//           "administrationId": 1,
//           "staffName": "Harish N"
//       },
//       {
//           "id": 20,
//           "startTime": "02:00 AM",
//           "endTime": "02:10 AM",
//           "day": "Tuesday",
//           "subject": "BREAK",
//           "class": "LKG",
//           "section": "A",
//           "administrationId": 1,
//           "staffName": ""
//       },
//       {
//           "id": 21,
//           "startTime": "02:10 AM",
//           "endTime": "02:50 AM",
//           "day": "Tuesday",
//           "subject": "SOCIAL",
//           "class": "LKG",
//           "section": "A",
//           "administrationId": 1,
//           "staffName": "Mani Maran AV"
//       },
//       {
//           "id": 22,
//           "startTime": "02:50 AM",
//           "endTime": "03:30 AM",
//           "day": "Tuesday",
//           "subject": "SCIENCE",
//           "class": "LKG",
//           "section": "A",
//           "administrationId": 1,
//           "staffName": "Harish N"
//       },
//       {
//           "id": 23,
//           "startTime": "09:00 AM",
//           "endTime": "09:45 AM",
//           "day": "Wednesday",
//           "subject": "TAMIL",
//           "class": "LKG",
//           "section": "A",
//           "administrationId": 1,
//           "staffName": "Gokul Kannan R"
//       },
//       {
//           "id": 24,
//           "startTime": "09:45 AM",
//           "endTime": "10:30 AM",
//           "day": "Wednesday",
//           "subject": "ENGLISH",
//           "class": "LKG",
//           "section": "A",
//           "administrationId": 1,
//           "staffName": "Amuthavel N"
//       },
//       {
//           "id": 25,
//           "startTime": "10:30 AM",
//           "endTime": "10:40 AM",
//           "day": "Wednesday",
//           "subject": "BREAK",
//           "class": "LKG",
//           "section": "A",
//           "administrationId": 1,
//           "staffName": ""
//       },
//       {
//           "id": 26,
//           "startTime": "10:40 AM",
//           "endTime": "11:20 AM",
//           "day": "Wednesday",
//           "subject": "SOCIAL",
//           "class": "LKG",
//           "section": "A",
//           "administrationId": 1,
//           "staffName": "Mani Maran AV"
//       },
//       {
//           "id": 27,
//           "startTime": "11:20 AM",
//           "endTime": "12:00 PM",
//           "day": "Wednesday",
//           "subject": "SCIENCE",
//           "class": "LKG",
//           "section": "A",
//           "administrationId": 1,
//           "staffName": "Harish N"
//       },
//       {
//           "id": 28,
//           "startTime": "12:00 PM",
//           "endTime": "12:40 PM",
//           "day": "Wednesday",
//           "subject": "BREAK",
//           "class": "LKG",
//           "section": "A",
//           "administrationId": 1,
//           "staffName": ""
//       },
//       {
//           "id": 29,
//           "startTime": "12:40 PM",
//           "endTime": "01:20 AM",
//           "day": "Wednesday",
//           "subject": "TAMIL",
//           "class": "LKG",
//           "section": "A",
//           "administrationId": 1,
//           "staffName": "Gokul Kannan R"
//       },
//       {
//           "id": 30,
//           "startTime": "01:20 AM",
//           "endTime": "02:00 AM",
//           "day": "Wednesday",
//           "subject": "ENGLISH",
//           "class": "LKG",
//           "section": "A",
//           "administrationId": 1,
//           "staffName": "Amuthavel N"
//       },
//       {
//           "id": 31,
//           "startTime": "02:00 AM",
//           "endTime": "02:10 AM",
//           "day": "Wednesday",
//           "subject": "BREAK",
//           "class": "LKG",
//           "section": "A",
//           "administrationId": 1,
//           "staffName": ""
//       },
//       {
//           "id": 32,
//           "startTime": "02:10 AM",
//           "endTime": "02:50 AM",
//           "day": "Wednesday",
//           "subject": "SCIENCE",
//           "class": "LKG",
//           "section": "A",
//           "administrationId": 1,
//           "staffName": "Harish N"
//       },
//       {
//           "id": 33,
//           "startTime": "02:50 AM",
//           "endTime": "03:30 AM",
//           "day": "Wednesday",
//           "subject": "SOCIAL",
//           "class": "LKG",
//           "section": "A",
//           "administrationId": 1,
//           "staffName": "Mani Maran AV"
//       },
//       {
//           "id": 34,
//           "startTime": "09:00 AM",
//           "endTime": "09:45 AM",
//           "day": "Thursday",
//           "subject": "TAMIL",
//           "class": "LKG",
//           "section": "A",
//           "administrationId": 1,
//           "staffName": "Gokul Kannan R"
//       },
//       {
//           "id": 35,
//           "startTime": "09:45 AM",
//           "endTime": "10:30 AM",
//           "day": "Thursday",
//           "subject": "ENGLISH",
//           "class": "LKG",
//           "section": "A",
//           "administrationId": 1,
//           "staffName": "Amuthavel N"
//       },
//       {
//           "id": 36,
//           "startTime": "10:30 AM",
//           "endTime": "10:40 AM",
//           "day": "Thursday",
//           "subject": "BREAK",
//           "class": "LKG",
//           "section": "A",
//           "administrationId": 1,
//           "staffName": ""
//       },
//       {
//           "id": 37,
//           "startTime": "10:40 AM",
//           "endTime": "11:20 AM",
//           "day": "Thursday",
//           "subject": "MATHS",
//           "class": "LKG",
//           "section": "A",
//           "administrationId": 1,
//           "staffName": "Vijay AV"
//       },
//       {
//           "id": 38,
//           "startTime": "11:20 AM",
//           "endTime": "12:00 PM",
//           "day": "Thursday",
//           "subject": "SCIENCE",
//           "class": "LKG",
//           "section": "A",
//           "administrationId": 1,
//           "staffName": "Harish N"
//       },
//       {
//           "id": 39,
//           "startTime": "12:00 PM",
//           "endTime": "12:40 PM",
//           "day": "Thursday",
//           "subject": "BREAK",
//           "class": "LKG",
//           "section": "A",
//           "administrationId": 1,
//           "staffName": ""
//       },
//       {
//           "id": 40,
//           "startTime": "12:40 PM",
//           "endTime": "01:20 AM",
//           "day": "Thursday",
//           "subject": "ENGLISH",
//           "class": "LKG",
//           "section": "A",
//           "administrationId": 1,
//           "staffName": "Amuthavel N"
//       },
//       {
//           "id": 41,
//           "startTime": "01:20 AM",
//           "endTime": "02:00 AM",
//           "day": "Thursday",
//           "subject": "SCIENCE",
//           "class": "LKG",
//           "section": "A",
//           "administrationId": 1,
//           "staffName": "Harish N"
//       },
//       {
//           "id": 42,
//           "startTime": "02:00 AM",
//           "endTime": "02:10 AM",
//           "day": "Thursday",
//           "subject": "BREAK",
//           "class": "LKG",
//           "section": "A",
//           "administrationId": 1,
//           "staffName": ""
//       },
//       {
//           "id": 43,
//           "startTime": "02:10 AM",
//           "endTime": "02:50 AM",
//           "day": "Thursday",
//           "subject": "SOCIAL",
//           "class": "LKG",
//           "section": "A",
//           "administrationId": 1,
//           "staffName": "Mani Maran AV"
//       },
//       {
//           "id": 44,
//           "startTime": "02:50 AM",
//           "endTime": "03:30 AM",
//           "day": "Thursday",
//           "subject": "PET",
//           "class": "LKG",
//           "section": "A",
//           "administrationId": 1,
//           "staffName": "Lakshmi G"
//       },
//       {
//           "id": 45,
//           "startTime": "09:00 AM",
//           "endTime": "09:45 AM",
//           "day": "Friday",
//           "subject": "TAMIL",
//           "class": "LKG",
//           "section": "A",
//           "administrationId": 1,
//           "staffName": "Gokul Kannan R"
//       },
//       {
//           "id": 46,
//           "startTime": "09:45 AM",
//           "endTime": "10:30 AM",
//           "day": "Friday",
//           "subject": "ENGLISH",
//           "class": "LKG",
//           "section": "A",
//           "administrationId": 1,
//           "staffName": "Amuthavel N"
//       },
//       {
//           "id": 47,
//           "startTime": "10:30 AM",
//           "endTime": "10:40 AM",
//           "day": "Friday",
//           "subject": "BREAK",
//           "class": "LKG",
//           "section": "A",
//           "administrationId": 1,
//           "staffName": ""
//       },
//       {
//           "id": 48,
//           "startTime": "10:40 AM",
//           "endTime": "11:20 AM",
//           "day": "Friday",
//           "subject": "MATHS",
//           "class": "LKG",
//           "section": "A",
//           "administrationId": 1,
//           "staffName": "Vijay AV"
//       },
//       {
//           "id": 49,
//           "startTime": "11:20 AM",
//           "endTime": "12:00 PM",
//           "day": "Friday",
//           "subject": "SCIENCE",
//           "class": "LKG",
//           "section": "A",
//           "administrationId": 1,
//           "staffName": "Harish N"
//       },
//       {
//           "id": 50,
//           "startTime": "12:00 PM",
//           "endTime": "12:40 PM",
//           "day": "Friday",
//           "subject": "BREAK",
//           "class": "LKG",
//           "section": "A",
//           "administrationId": 1,
//           "staffName": ""
//       },
//       {
//           "id": 51,
//           "startTime": "12:40 PM",
//           "endTime": "01:20 AM",
//           "day": "Friday",
//           "subject": "SOCIAL",
//           "class": "LKG",
//           "section": "A",
//           "administrationId": 1,
//           "staffName": "Mani Maran AV"
//       },
//       {
//           "id": 52,
//           "startTime": "01:20 AM",
//           "endTime": "02:00 AM",
//           "day": "Friday",
//           "subject": "PET",
//           "class": "LKG",
//           "section": "A",
//           "administrationId": 1,
//           "staffName": "Lakshmi G"
//       },
//       {
//           "id": 53,
//           "startTime": "02:00 AM",
//           "endTime": "02:10 AM",
//           "day": "Friday",
//           "subject": "BREAK",
//           "class": "LKG",
//           "section": "A",
//           "administrationId": 1,
//           "staffName": ""
//       },
//       {
//           "id": 54,
//           "startTime": "02:10 AM",
//           "endTime": "02:50 AM",
//           "day": "Friday",
//           "subject": "TAMIL",
//           "class": "LKG",
//           "section": "A",
//           "administrationId": 1,
//           "staffName": "Gokul Kannan R"
//       },
//       {
//           "id": 55,
//           "startTime": "02:50 AM",
//           "endTime": "03:30 AM",
//           "day": "Friday",
//           "subject": "PET",
//           "class": "LKG",
//           "section": "A",
//           "administrationId": 1,
//           "staffName": "Lakshmi G"
//       }
//   ]);
//   const [editableRow, setEditableRow] = useState(null);

//   const handleEditClick = (index) => {
//     setEditableRow(index);
//   };

//   const handleSaveClick = () => {
//     setEditableRow(null);
//   };

//   return (
//     <div className="timetable-container">
//       <table className="timetable">
//         <thead>
//           <tr>
//             <th>Time</th>
//             <th>Day</th>
//             <th>Subject</th>
//             <th>Class</th>
//             <th>Section</th>
//             <th>Staff Name</th>
//             <th>Actions</th>
//           </tr>
//         </thead>
//         <tbody>
//           {data.map((item, index) => (
//             <tr key={item.id}>
//               <td>{editableRow === index ? (
//                 <input type="text" defaultValue={item.startTime} />
//               ) : (
//                 `${item.startTime} - ${item.endTime}`
//               )}</td>
//               <td>{editableRow === index ? (
//                 <input type="text" defaultValue={item.day} />
//               ) : (
//                 item.day
//               )}</td>
//               <td>{editableRow === index ? (
//                 <input type="text" defaultValue={item.subject} />
//               ) : (
//                 item.subject
//               )}</td>
//               <td>{editableRow === index ? (
//                 <input type="text" defaultValue={item.class} />
//               ) : (
//                 item.class
//               )}</td>
//               <td>{editableRow === index ? (
//                 <input type="text" defaultValue={item.section} />
//               ) : (
//                 item.section
//               )}</td>
//               <td>{editableRow === index ? (
//                 <input type="text" defaultValue={item.staffName} />
//               ) : (
//                 item.staffName
//               )}</td>
//               <td>
//                 {editableRow === index ? (
//                   <button onClick={handleSaveClick}>Save</button>
//                 ) : (
//                   <button onClick={() => handleEditClick(index)}>Edit</button>
//                 )}
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }
// export default Timetable
// src/Timetable.js

import React, { useState } from 'react';
import { utils, read } from 'xlsx';
import FileSaver from 'file-saver';

function Timetable() {
  const [file, setFile] = useState(null);
  const [data, setData] = useState([]);
  const [length, setLength] = useState();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  };

  const readExcel = () => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target.result;
        const workbook = read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        console.log(sheetName)
        const worksheet = workbook.Sheets[sheetName];
        const excelData = utils.sheet_to_json(worksheet, { header: 1 });
        setData(excelData);
        setLength(excelData[0].length)
      };
      reader.readAsBinaryString(file);
    }
  };
  console.log(length)

  return (
    <div>
      <h1>Excel Reader</h1>
      <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} />
      <button onClick={readExcel}>Read Excel</button>
      <table>
        <thead>
        <th colSpan={length}>Time Table</th>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Timetable;





