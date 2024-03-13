import React from "react";
import { Link } from "react-router-dom";

const Homework = () => {
  return (
    <div>
      <div>
        <h3>Homework</h3>
        <ul class="breadcrumb">
          <li>
            <Link to={"/dashboard"}>
              <a style={{ color: "#646464" }}>Dashboard</a>
            </Link>
          </li>
          <li>
            <a>Homework</a>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Homework;
