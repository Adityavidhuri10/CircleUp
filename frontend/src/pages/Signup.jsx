import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaArrowRight,
  FaCamera,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    anonymousName: "",
    picture: "",
    location: "", // Added location field
  });
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [error, setError] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("File size too large (max 5MB)");
      return;
    }

    // Check file type
    if (!file.type.match(/image.(jpeg|jpg|png|gif)$/)) {
      setError("Please upload a valid image file (JPEG, JPG, PNG, GIF)");
      return;
    }

    setImageLoading(true);
    setError(null);

    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewImage(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload to Cloudinary
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "hg73yvrn"); // Replace with your upload preset

    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/didyxuyd5/image/upload`, // Replace with your cloud name
        formData
      );

      setFormData((prev) => ({
        ...prev,
        picture: response.data.secure_url,
      }));
    } catch (err) {
      setError("Failed to upload image. Please try again.");
      console.error(err);
    } finally {
      setImageLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.picture) {
      setError("Please upload a profile picture");
      return;
    }

    if (!formData.location) {
      setError("Please enter your location");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/user/signup",
        formData
      );

      if (response.data.success) {
        navigate("/login", { state: { registrationSuccess: true } });
      } else {
        setError(response.data.message || "Registration failed");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "An error occurred during registration"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-8 text-center">
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-3xl font-bold text-white"
            >
              Join Circle Up
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="mt-2 text-purple-100"
            >
              Create your anonymous social profile
            </motion.p>
          </div>

          {/* Form */}
          <div className="p-8">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm"
              >
                {error}
              </motion.div>
            )}

            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              onSubmit={handleSubmit}
            >
              {/* Profile Picture Upload */}
              <div className="mb-6">
                <label
                  htmlFor="profilePicture"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Profile Picture
                </label>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    {previewImage ? (
                      <img
                        src={previewImage}
                        alt="Preview"
                        className="w-16 h-16 rounded-full object-cover border-2 border-purple-200"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center border-2 border-dashed border-gray-300">
                        <FaCamera className="text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <label
                      htmlFor="profilePicture"
                      className={`block w-full px-4 py-2 text-sm text-center rounded-lg border border-gray-300 cursor-pointer bg-white hover:bg-gray-50 transition duration-200 ${
                        imageLoading ? "opacity-70" : ""
                      }`}
                    >
                      {imageLoading ? "Uploading..." : "Choose Image"}
                      <input
                        type="file"
                        id="profilePicture"
                        name="profilePicture"
                        onChange={handleImageUpload}
                        className="hidden"
                        accept="image/*"
                        disabled={imageLoading}
                      />
                    </label>
                    <div className="mt-1 text-xs text-gray-500">
                      JPEG, PNG or GIF (max 5MB)
                    </div>
                  </div>
                </div>
              </div>

              {/* Name Field */}
              <div className="mb-6">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-purple-600 focus:border-transparent transition duration-200"
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>

              {/* Anonymous Name Field */}
              <div className="mb-6">
                <label
                  htmlFor="anonymousName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Anonymous Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="anonymousName"
                    name="anonymousName"
                    value={formData.anonymousName}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-purple-600 focus:border-transparent transition duration-200"
                    placeholder="Pumpkin"
                    required
                  />
                </div>
              </div>

              {/* Location Field */}
              <div className="mb-6">
                <label
                  htmlFor="location"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Location
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaMapMarkerAlt className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-purple-600 focus:border-transparent transition duration-200"
                    placeholder="New York, USA"
                    required
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="mb-6">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-purple-600 focus:border-transparent transition duration-200"
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="mb-8">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="text-gray-400" />
                  </div>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-purple-600 focus:border-transparent transition duration-200"
                    placeholder="••••••••"
                    required
                    minLength="8"
                  />
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  Use 8 or more characters with a mix of letters, numbers &
                  symbols
                </div>
              </div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center space-x-2 hover:shadow-lg transition duration-200 disabled:opacity-70"
                disabled={loading || imageLoading}
              >
                {loading ? (
                  <span>Creating Account...</span>
                ) : (
                  <>
                    <span>Create Account</span>
                    <FaArrowRight className="text-sm" />
                  </>
                )}
              </motion.button>
            </motion.form>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="mt-8 text-center text-sm text-gray-600"
            >
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-purple-600 font-medium hover:text-purple-800 transition duration-200"
              >
                Sign in
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Decorative Elements */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-8 text-center text-xs text-gray-500"
        >
          © {new Date().getFullYear()} Circle Up. All rights reserved.
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SignUp;
