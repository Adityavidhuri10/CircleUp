import React, { useContext } from "react";
import {
  FaHome,
  FaUserFriends,
  FaComments,
  FaUserCircle,
  FaSignInAlt,
  FaSignOutAlt,
} from "react-icons/fa";
import { HiUserGroup } from "react-icons/hi";
import { GrGroup } from "react-icons/gr";
import { AiFillWechat } from "react-icons/ai";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Header = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const isLoggedIn = !!user; // more reliable than checking localStorage directly

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo / App Name */}
          <div className="flex items-center space-x-2">
            <HiUserGroup className="text-white text-3xl" />
            <span className="text-white text-2xl font-bold font-sans">
              CircleUp
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-6">
            {isLoggedIn ? (
              <>
                <Link
                  to="/"
                  className="text-white hover:text-indigo-200 transition duration-300 flex items-center space-x-1"
                >
                  <FaHome className="text-lg" />
                  <span>Home</span>
                </Link>

                <Link
                  to="/people"
                  className="text-white hover:text-indigo-200 transition duration-300 flex items-center space-x-1"
                >
                  <FaUserFriends className="text-lg" />
                  <span>Find People</span>
                </Link>

                <Link
                  to="/chat"
                  className="text-white hover:text-indigo-200 transition duration-300 flex items-center space-x-1"
                >
                  <FaComments className="text-lg" />
                  <span>Chat</span>
                </Link>

                <Link
                  to="/create-community"
                  className="text-white hover:text-indigo-200 transition duration-300 flex items-center space-x-1"
                >
                  <GrGroup className="text-lg" />
                  <span>Create Community</span>
                </Link>

                <Link
                  to="/community"
                  className="text-white hover:text-indigo-200 transition duration-300 flex items-center space-x-1"
                >
                  <AiFillWechat className="text-lg" />
                  <span>Community</span>
                </Link>

                <Link
                  to="/profile"
                  className="text-white hover:text-indigo-200 transition duration-300 flex items-center space-x-1"
                >
                  <FaUserCircle className="text-lg" />
                  <span>Profile</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="bg-white text-indigo-600 px-4 py-2 rounded-full hover:bg-indigo-100 transition duration-300 flex items-center space-x-1"
                >
                  <FaSignOutAlt className="text-lg" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="bg-white text-indigo-600 px-4 py-2 rounded-full hover:bg-indigo-100 transition duration-300 flex items-center space-x-1"
              >
                <FaSignInAlt className="text-lg" />
                <span>Login</span>
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
