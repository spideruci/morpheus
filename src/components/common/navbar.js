import React from "react";
import "./navbar.scss";
import { Link } from "react-router-dom";
import Header from "./Header";

const Navbar = () => {
  return (
    <nav>
      <Link to="/">
        <Header title="Morpheus" />
      </Link>
      <ul>
        <li>
          <Link to="/about">About</Link>
        </li>
        <li>
          <Link to="/visualization">Visualization</Link>
        </li>
        <li>
          <Link to="/history">History</Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
