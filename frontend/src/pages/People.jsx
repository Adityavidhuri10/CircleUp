import React, { useEffect, useState, useContext } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import UserCard from "../components/UserCard";
import { AuthContext } from "../context/AuthContext";

const People = () => {
  const { user } = useContext(AuthContext);
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPeople = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get("/user/all", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPeople(res.data.users || []);
      } catch (err) {
        console.error("Error fetching people:", err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPeople();
  }, []);

  return (
    <>
      <Navbar />
      <div className="max-w-5xl mx-auto mt-10 p-4">
        <h1 className="text-3xl font-bold text-blue-700 mb-6">
          👥 Connect with People
        </h1>

        {loading ? (
          <p className="text-center text-gray-500">Loading users...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {people.length > 0 ? (
              people
                .filter((p) => p._id !== user?._id)
                .map((person) => <UserCard key={person._id} person={person} />)
            ) : (
              <p className="text-gray-500 text-center col-span-full">
                No users found.
              </p>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default People;
