import React from "react";
import "./Navbar.module.scss";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav>
      <Link to="/">
        <div className='header'>
          <h1>Morpheus</h1>
        </div>
      </Link>
      <ul>
        <li>
          <Link to="/about">About</Link>
        </li>
        <li>
          <Link to="/morpheus">Visualization</Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
