import React from "react";
import "./Dashboard.css";
import Attendence from "../Charts/Attendence/Attendence";
import Assignment from "../Charts/Assignment/Assignment";

const Dashboard = () => {
  return (
    <div className="staff-dashboard">
      <div className="staff-board">
        <div className="staff-box zoom"> 
          <div className="box-icon" style={{fontSize:'45px'}}>
          <i class='bx bxs-calendar-edit' style={{color:'#051F3E'}}></i>
          </div>
          <div className="box-text">
            <span style={{color:'rgb(147 149 155)'}}>Attendance</span>
            <h1 style={{fontWeight:'700',color:'#051F3E'}}>80%</h1>
          </div>
        </div>
        <div className="staff-box zoom">
          <div className="box-icon" style={{fontSize:'35px'}}>
            <i class=" fas fa-paste" style={{color:'#051F3E'}}></i>
          </div>
          <div className="box-text">
            <span style={{color:'rgb(147 149 155)'}}>Total Leave</span>
            <h1 style={{fontWeight:'700',color:'#051F3E'}}>16</h1>
            <pre style={{fontSize:'13px'}}>2 Remains</pre>
          </div>
        </div>

        <div className="staff-box zoom">
          <div className="box-icon" style={{fontSize:'35px'}}>
            <i class="fas fa-users" style={{color:'#051F3E'}}></i>
          </div>
          <div className="box-text">
            <span style={{color:'rgb(147 149 155)'}}>Total Students</span>
            <h1 style={{fontWeight:'700',color:'#051F3E'}}>800</h1>
          </div>
        </div>
      </div>

      <div className="board-divission">
        <div className="board-divission-1"><Attendence/></div>
        <div className="board-divission-2"><Assignment/></div>
      </div>
    </div>
  );
};

export default Dashboard;
