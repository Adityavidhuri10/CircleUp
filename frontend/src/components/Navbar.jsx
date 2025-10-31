import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { FaUserCircle } from "react-icons/fa";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="flex items-center justify-between bg-blue-600 text-white px-6 py-3 shadow-md">
      <Link to="/" className="text-xl font-bold tracking-wide">
        CircleUP
      </Link>
      <div className="flex items-center gap-6 text-sm">
  <Link to="/" className="hover:underline">Home</Link>
  <Link to="/people" className="hover:underline">People</Link>
  <Link to="/profile" className="hover:underline">Profile</Link>
</div>


      <div className="flex items-center gap-4">
        {user ? (
          <>
            <div className="flex items-center gap-2">
              <FaUserCircle className="text-2xl" />
              <span className="font-medium">{user.name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="bg-white text-blue-600 font-semibold px-3 py-1 rounded-lg hover:bg-gray-100 transition"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="hover:underline font-semibold transition text-white"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="hover:underline font-semibold transition text-white"
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;