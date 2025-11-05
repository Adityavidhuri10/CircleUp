import React, { useEffect, useState, useContext } from "react";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API from "../api/axios";
import {
  FiEdit,
  FiTrash2,
  FiPlus,
  FiCheck,
  FiLoader,
  FiCamera,
  FiUserX,
  FiMapPin,
  FiX,
} from "react-icons/fi";

const Profile = () => {
  const { user, setUser } = useContext(AuthContext);
  const id = user?.id || user?._id; // ✅ handles both `id` and `_id` cases

  const [userData, setUserData] = useState(null);
  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState("");
  const [loading, setLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editingLocation, setEditingLocation] = useState(false);
  const [newLocation, setNewLocation] = useState("");
  const [locationLoading, setLocationLoading] = useState(false);

  const navigate = useNavigate();

  // ✅ Use your environment variables
  const API_BASE = import.meta.env.VITE_API_URL;
  const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD;
  const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_PRESET;

  // ✅ Fetch user details
  const getSingleUser = async () => {
    if (!id) return console.warn("No user ID found, cannot fetch profile.");

    try {
      setLoading(true);
      console.log("Fetching user with ID:", id);
      const { data } = await API.post("/user/singleUser", { id });
      setUserData(data);
      setGoals(data.goals || []);
      setNewLocation(data.location || "");
    } catch (error) {
      console.error("Error fetching user:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Add new goal
  const addGoal = async () => {
    if (!newGoal.trim()) return;
    try {
      await API.post("/user/goal/add", { userId: id, goal: newGoal });
      setNewGoal("");
      getSingleUser();
    } catch (error) {
      console.error(error);
    }
  };

  // ✅ Delete a goal
  const deleteGoal = async (goal) => {
    try {
      await API.post("/user/goal/delete", { userId: id, goal });
      getSingleUser();
    } catch (error) {
      console.error(error);
    }
  };

  // ✅ Upload profile image to Cloudinary
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("File size too large (max 5MB)");
      return;
    }

    if (!file.type.match(/image.(jpeg|jpg|png|gif)$/)) {
      alert("Please upload a valid image file");
      return;
    }

    setImageLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);
    formData.append("cloud_name", CLOUD_NAME);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
      );
      const result = await response.json();

      await API.put("/user/update", {
        userId: id,
        profilePicture: result.secure_url,
      });

      setUser((prev) => ({ ...prev, picture: result.secure_url }));
      getSingleUser();
    } catch (err) {
      console.error("Image upload failed:", err);
      alert("Failed to upload image. Please try again.");
    } finally {
      setImageLoading(false);
    }
  };

  // ✅ Delete account
  const deleteAccount = async () => {
    setDeleting(true);
    try {
      await API.post("/user/delete-account", { userId: id });
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      navigate("/signup");
    } catch (error) {
      console.error(error);
      alert("Failed to delete account.");
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  // ✅ Update location
  const updateLocation = async () => {
    if (!newLocation.trim()) return;
    try {
      setLocationLoading(true);
      await API.post("/user/changeLocation", { id, location: newLocation });
      setEditingLocation(false);
      getSingleUser();
    } catch (error) {
      console.error(error);
      alert("Failed to update location.");
    } finally {
      setLocationLoading(false);
    }
  };

  // ✅ Get current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setLocationLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const response = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
            );
            const data = await response.json();
            const locationName =
              data.locality || data.city || data.principalSubdivision || data.countryName;
            setNewLocation(locationName);
          } catch {
            alert("Couldn't determine your location.");
          } finally {
            setLocationLoading(false);
          }
        },
        () => {
          alert("Please enable location services.");
          setLocationLoading(false);
        }
      );
    } else {
      alert("Geolocation not supported by your browser.");
    }
  };

  // ✅ Load user data on mount
  useEffect(() => {
    if (id) getSingleUser();
  }, [id]);

  if (!id) {
    return (
      <div className="flex justify-center items-center h-screen">
        <FiLoader className="animate-spin text-indigo-600 text-4xl" />
        <p className="ml-3 text-gray-600">Loading user session...</p>
      </div>
    );
  }

  if (loading || !userData) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-100">
        <FiLoader className="animate-spin text-indigo-600 text-4xl mt-4" />
        <p className="mt-2 text-gray-600">Fetching profile...</p>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* --- Profile Card --- */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
            <div className="md:flex">
              <div className="md:w-48 bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center relative">
                <div className="p-8 text-white text-center">
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-full bg-gray-200 overflow-hidden mx-auto mb-4 flex items-center justify-center">
                      {userData.picture ? (
                        <img
                          src={userData.picture}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-4xl font-bold text-white">
                          {userData.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <label className="cursor-pointer absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-md text-indigo-600 hover:bg-gray-100 transition">
                      <FiCamera />
                      <input
                        type="file"
                        className="hidden"
                        onChange={handleImageUpload}
                        accept="image/*"
                        disabled={imageLoading}
                      />
                    </label>
                    {imageLoading && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <FiLoader className="animate-spin text-white text-2xl" />
                      </div>
                    )}
                  </div>
                  <div className="uppercase tracking-wide text-sm font-semibold">Member Since</div>
                  <div className="mt-1 text-sm">
                    {new Date(userData.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="p-8 w-full">
                <h1 className="text-2xl font-bold text-gray-800">{userData.name}</h1>
                <p className="text-gray-600">{userData.email}</p>

                {/* Location Section */}
                <div className="flex items-center mt-2">
                  <FiMapPin className="text-gray-400 mr-2" />
                  {editingLocation ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={newLocation}
                        onChange={(e) => setNewLocation(e.target.value)}
                        className="border-b border-gray-300 focus:outline-none focus:border-indigo-500"
                        placeholder="Enter your location"
                      />
                      <button
                        onClick={getCurrentLocation}
                        className="p-1 text-indigo-600"
                        disabled={locationLoading}
                      >
                        {locationLoading ? <FiLoader className="animate-spin" /> : "Detect"}
                      </button>
                      <button onClick={updateLocation} className="p-1 text-green-600">
                        <FiCheck />
                      </button>
                      <button
                        onClick={() => {
                          setEditingLocation(false);
                          setNewLocation(userData.location || "");
                        }}
                        className="p-1 text-red-600"
                      >
                        <FiX />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <span className="text-gray-600">
                        {userData.location || "No location set"}
                      </span>
                      <button
                        onClick={() => setEditingLocation(true)}
                        className="ml-2 text-indigo-600 hover:text-indigo-800"
                      >
                        <FiEdit size={14} />
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex space-x-6">
                  <div className="text-center">
                    <p className="text-gray-500">Friends</p>
                    <p className="text-2xl font-semibold text-indigo-600">
                      {userData.friends?.length || 0}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-500">Goals</p>
                    <p className="text-2xl font-semibold text-indigo-600">{goals.length}</p>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="flex items-center text-red-600 hover:text-red-800"
                  >
                    <FiUserX className="mr-2" /> Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Goals Section */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Your Goals</h2>
              <div className="flex">
                <input
                  type="text"
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  placeholder="Add a new goal..."
                  className="px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  onKeyPress={(e) => e.key === "Enter" && addGoal()}
                />
                <button
                  onClick={addGoal}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-r-lg hover:bg-indigo-700 flex items-center"
                >
                  <FiPlus className="mr-1" /> Add
                </button>
              </div>
            </div>

            {goals.length === 0 ? (
              <p className="text-gray-500 text-center py-6">No goals yet. Add one to get started!</p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {goals.map((goal, index) => (
                  <li key={index} className="py-3 flex justify-between items-center">
                    <span className="text-gray-800">{goal}</span>
                    <button
                      onClick={() => deleteGoal(goal)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FiTrash2 />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Delete Account</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete your account? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={deleteAccount}
                disabled={deleting}
                className={`px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center ${
                  deleting ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {deleting ? <FiLoader className="animate-spin mr-2" /> : null}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Profile;
