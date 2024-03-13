import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./timetable.css";

const Timetable = () => {
  const location = useLocation();
  const propsData = location.state;

  return (
    <div>
      <div>
        {/* <h3>{propsData}</h3> */}
        <ul class="breadcrumb">
          <li>
            <Link to={"/dashboard"}>
              <a style={{ color: "#646464" }}>Home</a>
            </Link>
          </li>
          <li>
            <a>Period Time Table</a>
          </li>
        </ul>
      </div>
      <div style={{display:"flex",justifyContent:"center"}}>
        <table className="table" border="1px" cellPadding="20px" style={{width:"100%"}}>
          <tr>
            <th colSpan="12" className="table-cap" style={{textAlign:'center'}}>
              Time Table
            </th>
          </tr>
          <tr>
            <th  className="weeks">Day</th>
            <td  className="weeks">1</td>
            <td  className="weeks">2</td>
            <th rowSpan="7" style={{textAlign:'center'}}>Break</th>
            <td  className="weeks">3</td>
            <td  className="weeks">4</td>
            <th rowSpan="7" style={{textAlign:'center'}}>Lunch</th>
            <td  className="weeks">5</td>
            <td  className="weeks">6</td>
            <th rowSpan="7" style={{textAlign:'center'}}>Break</th>
            <td  className="weeks">7</td>
            <td  className="weeks">8</td>
          </tr>
          <tr>
            <th className="weeks">Monday</th>
            <td  className="weeks">Tamil</td>
            <td  className="weeks">English</td>
            <td  className="weeks">CS</td>
            <td  className="weeks">Maths</td>
            <td  className="weeks">Chemistry</td>
            <td  className="weeks">History</td>
            <td  className="weeks">Physics</td>
            <td  className="weeks">History</td>
          </tr>
          <tr>
            <th  className="weeks">Tuesday</th>
            <td  className="weeks">Tamil</td>
            <td  className="weeks">English</td>
            <td  className="weeks">CS</td>
            <td  className="weeks">History</td>
            <td  className="weeks">Maths</td>
            <td  className="weeks">Chemistry</td>
            <td  className="weeks">History</td>
            <td  className="weeks">Physics</td>
          </tr>
          <tr>
            <th  className="weeks">Wednesday</th>
            <td  className="weeks">Tamil</td>
            <td  className="weeks">History</td>
            <td  className="weeks">English</td>
            <td  className="weeks">CS</td>
            <td  className="weeks">Maths</td>
            <td  className="weeks">Chemistry</td>
            <td  className="weeks">History</td>
            <td  className="weeks">Physics</td>
          </tr>
          <tr>
            <th  className="weeks">Thursday</th>
            <td  className="weeks">Tamil</td>
            <td  className="weeks">English</td>
            <td  className="weeks">History</td>
            <td  className="weeks">CS</td>
            <td  className="weeks">Maths</td>
            <td  className="weeks">Chemistry</td>
            <td  className="weeks">History</td>
            <td  className="weeks">Physics</td>
          </tr>
          <tr>
            <th  className="weeks">Friday</th>
            <td  className="weeks">Tamil</td>
            <td  className="weeks">English</td>
            <td  className="weeks">CS</td>
            <td  className="weeks">History</td>
            <td  className="weeks">Maths</td>
            <td  className="weeks">Chemistry</td>
            <td  className="weeks">History</td>
            <td  className="weeks">Physics</td>
          </tr>
          <tr>
            <th  className="weeks">Saturday</th>
            <td  className="weeks">Tamil</td>
            <td  className="weeks">History</td>
            <td  className="weeks">English</td>
            <td  className="weeks">CS</td>
            <td  className="weeks">Maths</td>
            <td  className="weeks">Chemistry</td>
            <td  className="weeks">History</td>
            <td  className="weeks">Physics</td>
          </tr>
        </table>
      </div>
    </div>
  );
};

export default Timetable;
