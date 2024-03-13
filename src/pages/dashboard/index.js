import React from "react";
import "./dashboard.css";
import Box from "../../component/Box/Box";
import { Link } from "react-router-dom";
import { getUserData } from "../../services/auth";
import { getStafflist, getStudentlist } from "../../services/api";
import Dashbord from "../../component/StaffDashboard/Dashboard";

const Dashboard = () => {
  const role = getUserData("role");
  return (
    <>
      <div>
        {/* <h3 style={{color:'#051F3E'}}>{role} Dashboard</h3> */}
        <ul class="breadcrumb" style={{display:'flex'}}>
          <li>
            <Link to={"/dashboard"}>
              <a style={{ color: "#051F3E" }}><h4>{role} </h4></a>
            </Link>
          </li>
          <li>
            <a>{role} Dashboard</a>
          </li>
        </ul>
      </div>

      <>
        {role === "Admin" ? (
          <>
            <div className="data-show">
              <div className="zooms"><Box amount={250} name={"Students"}></Box></div>
              <div className="zooms"><Box amount={250} name={"Parents"}></Box></div>
              <div className="zooms"><Box amount={1250} name={"Teaching Staff"}></Box></div>
              <div className="zooms"><Box amount={1000} name={"Non-Teaching Staff"}></Box></div>
              
            
            
            </div>
          </>
        ) : (
          <>
            <div className="data-show">
                <Dashbord/>
            </div>
          </>
        )}
      </>
    </>
  );
};

export default Dashboard;
