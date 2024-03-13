import React from "react";
import { Link } from "react-router-dom";

const Event = () => {
  return (
    <div>
      <div>
        <h3>Events</h3>
        <ul class="breadcrumb">
          <li>
            <Link to={"/dashboard"}>
              <a style={{ color: "#646464" }}>Dashboard</a>
            </Link>
          </li>
          <li>
            <a>Events</a>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Event;
