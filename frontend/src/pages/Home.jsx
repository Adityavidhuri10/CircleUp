import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import Navbar from "../components/Navbar";

const Home = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="p-6 text-center">
        <h1 className="text-3xl font-bold text-blue-600 mb-4">
          Welcome to CircleUP 👋
        </h1>
        <p className="text-gray-600 text-lg">
          {user ? `Logged in as ${user.name}` : "Please login to continue"}
        </p>
      </div>
    </div>
  );
};

export default Home;
