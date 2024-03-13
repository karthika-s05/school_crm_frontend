import React from "react";
import { Link } from "react-router-dom";

const Product = () => {
  return (
    <div>
      <div className="">
        <h3>    Products</h3>
        <ul class="breadcrumb">
          <li>
            <Link to={"/dashboard"}>
              <a style={{ color: "#646464" }}>Dashboard</a>
            </Link>
          </li>
          <li>
            <a>Products</a>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Product;
