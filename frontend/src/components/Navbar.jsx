import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav>
      <Link to="/"> Home </Link>
      <Link to="/dashboard"> Dashboard </Link>
      <Link to="/tasks"> Tasks </Link>
      <Link to="/board"> Board </Link>
      <Link to="/profile"> Profile </Link>
    </nav>
  );
};

export default Navbar;
