import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav style={{ padding: "10px", backgroundColor: "#f5f5f5" }}>
      <Link to="/" style={{ marginRight: "15px" }}>Home</Link>
      <Link to="/chat" style={{ marginRight: "15px" }}>Chat</Link>
      <Link to="/community" style={{ marginRight: "15px" }}>Community</Link>
      <Link to="/login" style={{ marginRight: "15px" }}>Login</Link>
      <Link to="/signup">Signup</Link>
    </nav>
  );
};

export default Navbar;
