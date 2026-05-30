import React, { useState } from "react";
import {
  FaHome,
  FaUserFriends,
  FaComments,
  FaUserCircle,
  FaSignInAlt,
  FaSignOutAlt,
  FaGlobe,
  FaBell,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import { HiUserGroup } from "react-icons/hi";
import { Link, useNavigate } from "react-router-dom";
import { GrGroup } from "react-icons/gr";
import { AiFillWechat } from "react-icons/ai";
import useNotifications from "../features/notifications/hooks/useNotifications";
import { disconnectSocket } from "../api/socket";

/**
 * Bug 6 Fix: useNotifications calls getSocket() and makes API requests.
 * React hooks can't be called conditionally, so we extract the notification
 * badge into a separate component that's only rendered when logged in.
 */
const NotificationBadge = () => {
  const { unreadCount } = useNotifications();
  return (
    <Link
      to="/notifications"
      className="text-white hover:text-indigo-200 transition duration-300 flex items-center space-x-1 relative"
    >
      <FaBell className="text-lg" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </Link>
  );
};

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem("user") !== null;

  return (
    <header className="bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div>
          <div className="flex items-center justify-between">
            {/* Logo/App Name */}
            <div className="flex items-center space-x-2">
              <HiUserGroup className="text-white text-3xl" />
              <span className="text-white text-2xl font-bold font-sans">
                CircleUp
              </span>
            </div>

            {/* Hamburger button visible only on mobile/tablet */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white hover:text-indigo-200 focus:outline-none md:hidden p-2 rounded-lg transition duration-200"
              aria-label="Toggle navigation menu"
            >
              {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>

            {/* Navigation Links (Desktop) */}
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
                    to="/peoples"
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
                    <span>Create</span>
                  </Link>
                  <Link
                    to="/communities/explore"
                    className="text-white hover:text-indigo-200 transition duration-300 flex items-center space-x-1"
                  >
                    <FaGlobe className="text-lg" />
                    <span>Explore</span>
                  </Link>
                  <Link
                    to="/community"
                    className="text-white hover:text-indigo-200 transition duration-300 flex items-center space-x-1"
                  >
                    <AiFillWechat className="text-lg" />
                    <span>My Hub</span>
                  </Link>
                  <Link
                    to="/profile"
                    className="text-white hover:text-indigo-200 transition duration-300 flex items-center space-x-1"
                  >
                    <FaUserCircle className="text-lg" />
                    <span>Profile</span>
                  </Link>
                  {/* Bug 6 Fix: Only render notification hook when logged in */}
                  <NotificationBadge />
                  <button
                    onClick={() => {
                      // Bug 11 Fix: Disconnect socket before clearing auth data
                      disconnectSocket();
                      localStorage.removeItem("user");
                      localStorage.removeItem("token");
                      navigate("/");
                    }}
                    className="bg-white text-indigo-600 px-4 py-2 rounded-full hover:bg-indigo-100 transition duration-300 flex items-center space-x-1 cursor-pointer font-medium"
                  >
                    <FaSignOutAlt className="text-lg" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="bg-white text-indigo-600 px-4 py-2 rounded-full hover:bg-indigo-100 transition duration-300 flex items-center space-x-1 font-medium"
                >
                  <FaSignInAlt className="text-lg" />
                  <span>Login</span>
                </Link>
              )}
            </nav>
          </div>

          {/* Navigation Links (Mobile Overlay/Dropdown) */}
          {isOpen && (
            <div className="md:hidden mt-3 pb-3 border-t border-purple-500 pt-3 flex flex-col space-y-2">
              {isLoggedIn ? (
                <>
                  <Link
                    to="/"
                    onClick={() => setIsOpen(false)}
                    className="text-white hover:text-indigo-200 hover:bg-purple-700 bg-opacity-40 transition duration-200 flex items-center space-x-2 py-2.5 px-3 rounded-xl"
                  >
                    <FaHome className="text-lg" />
                    <span>Home</span>
                  </Link>
                  <Link
                    to="/peoples"
                    onClick={() => setIsOpen(false)}
                    className="text-white hover:text-indigo-200 hover:bg-purple-700 bg-opacity-40 transition duration-200 flex items-center space-x-2 py-2.5 px-3 rounded-xl"
                  >
                    <FaUserFriends className="text-lg" />
                    <span>Find People</span>
                  </Link>
                  <Link
                    to="/chat"
                    onClick={() => setIsOpen(false)}
                    className="text-white hover:text-indigo-200 hover:bg-purple-700 bg-opacity-40 transition duration-200 flex items-center space-x-2 py-2.5 px-3 rounded-xl"
                  >
                    <FaComments className="text-lg" />
                    <span>Chat</span>
                  </Link>
                  <Link
                    to="/create-community"
                    onClick={() => setIsOpen(false)}
                    className="text-white hover:text-indigo-200 hover:bg-purple-700 bg-opacity-40 transition duration-200 flex items-center space-x-2 py-2.5 px-3 rounded-xl"
                  >
                    <GrGroup className="text-lg" />
                    <span>Create Community</span>
                  </Link>
                  <Link
                    to="/communities/explore"
                    onClick={() => setIsOpen(false)}
                    className="text-white hover:text-indigo-200 hover:bg-purple-700 bg-opacity-40 transition duration-200 flex items-center space-x-2 py-2.5 px-3 rounded-xl"
                  >
                    <FaGlobe className="text-lg" />
                    <span>Explore</span>
                  </Link>
                  <Link
                    to="/community"
                    onClick={() => setIsOpen(false)}
                    className="text-white hover:text-indigo-200 hover:bg-purple-700 bg-opacity-40 transition duration-200 flex items-center space-x-2 py-2.5 px-3 rounded-xl"
                  >
                    <AiFillWechat className="text-lg" />
                    <span>My Hub</span>
                  </Link>
                  <Link
                    to="/profile"
                    onClick={() => setIsOpen(false)}
                    className="text-white hover:text-indigo-200 hover:bg-purple-700 bg-opacity-40 transition duration-200 flex items-center space-x-2 py-2.5 px-3 rounded-xl"
                  >
                    <FaUserCircle className="text-lg" />
                    <span>Profile</span>
                  </Link>
                  <div className="py-2.5 px-3 flex items-center border-t border-purple-500 mt-1 pt-3">
                    <span className="text-white text-sm font-medium mr-2">Notifications:</span>
                    <NotificationBadge />
                  </div>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      disconnectSocket();
                      localStorage.removeItem("user");
                      localStorage.removeItem("token");
                      navigate("/");
                    }}
                    className="w-full text-left bg-white text-indigo-600 px-4 py-2.5 rounded-full hover:bg-indigo-100 transition duration-200 flex items-center space-x-2 mt-2 font-semibold cursor-pointer"
                  >
                    <FaSignOutAlt className="text-lg" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="bg-white text-indigo-600 px-4 py-2.5 rounded-full hover:bg-indigo-100 transition duration-200 flex items-center justify-center space-x-2 mt-2 font-semibold"
                >
                  <FaSignInAlt className="text-lg" />
                  <span>Login</span>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
