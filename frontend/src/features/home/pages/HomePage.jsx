import React, { useEffect } from "react";
import {
    FaUsers,
    FaUserShield,
    FaHeart,
    FaComments,
    FaSearch,
    FaRobot,
} from "react-icons/fa";
import {
    MdTravelExplore,
    MdSportsGymnastics,
    MdHomeWork,
} from "react-icons/md";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
    const navigate = useNavigate();
    // Animation controls
    const controls = useAnimation();
    const [ref, inView] = useInView({
        threshold: 0.1,
        triggerOnce: false,
    });

    useEffect(() => {
        if (inView) {
            controls.start("visible");
        } else {
            controls.start("hidden");
        }
    }, [controls, inView]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
            },
        },
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.5,
            },
        },
    };

    return (

        <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-purple-50">
            {/* Hero Section */}

            <section className="relative py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-l-full opacity-70 transform -translate-x-1/2 scale-150"></div>
                </div>
                <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                            Connect Anonymously{" "}
                            <span className="text-purple-600">With Shared Goals</span>
                        </h1>
                        <p className="mt-6 text-lg text-gray-600">
                            Circle Up matches you with like-minded people while keeping your
                            identity private until you're ready to connect. Perfect for
                            finding gym buddies, travel partners, or flatmates.
                        </p>
                        <div className="mt-8 flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={() => navigate("/login")}
                                className="px-8 py-3 bg-purple-600 text-white rounded-full font-medium hover:bg-purple-700 transition duration-300 shadow-lg hover:shadow-xl"
                            >
                                Get Started
                            </button>
                            <button className="px-8 py-3 bg-white text-purple-600 rounded-full font-medium hover:bg-gray-50 transition duration-300 shadow-lg hover:shadow-xl">
                                How It Works
                            </button>
                        </div>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="relative"
                    >
                        <div className="relative w-full h-96 bg-white rounded-3xl shadow-2xl overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-indigo-600 opacity-20"></div>
                            <div className="absolute top-8 left-8 w-64 h-80 bg-white rounded-2xl shadow-lg p-4">
                                <div className="flex justify-between items-center mb-4">
                                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                                        <FaUserShield className="text-purple-600" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-500">
                                        Anonymous
                                    </span>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 rounded-full bg-indigo-200"></div>
                                        <div className="bg-gray-100 rounded-lg p-3 w-3/4">
                                            <div className="h-2 bg-gray-300 rounded w-full"></div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3 justify-end">
                                        <div className="bg-purple-100 rounded-lg p-3 w-3/4">
                                            <div className="h-2 bg-purple-300 rounded w-full"></div>
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-purple-200"></div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 rounded-full bg-indigo-200"></div>
                                        <div className="bg-gray-100 rounded-lg p-3 w-2/3">
                                            <div className="h-2 bg-gray-300 rounded w-full"></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute bottom-4 left-0 right-0 px-4">
                                    <div className="flex items-center bg-gray-50 rounded-full p-2">
                                        <input
                                            type="text"
                                            placeholder="Type a message..."
                                            className="flex-1 bg-transparent outline-none text-sm px-2"
                                        />
                                        <button className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-4 w-4"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                                                />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute bottom-8 right-8 w-64 h-64 bg-white rounded-2xl shadow-lg p-4 flex flex-col">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-medium text-gray-800">New Matches</h3>
                                    <span className="text-xs text-purple-600">3 new</span>
                                </div>
                                <div className="grid grid-cols-3 gap-3 flex-1">
                                    {[1, 2, 3, 4, 5, 6].map((item) => (
                                        <div
                                            key={item}
                                            className="bg-gray-100 rounded-lg flex items-center justify-center"
                                        >
                                            <div className="w-10 h-10 rounded-full bg-purple-200"></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                        How <span className="text-purple-600">Circle Up</span> Works
                    </h2>
                    <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
                        A unique approach to social networking that prioritizes your privacy
                        while helping you make meaningful connections.
                    </p>
                </motion.div>

                <motion.div
                    ref={ref}
                    initial="hidden"
                    animate={controls}
                    variants={containerVariants}
                    className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                    <motion.div
                        variants={itemVariants}
                        className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition duration-300"
                    >
                        <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                            <FaUserShield className="text-purple-600 text-2xl" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">
                            Dual Profiles
                        </h3>
                        <p className="text-gray-600">
                            Create both anonymous and real identity profiles. Control when and
                            how you reveal yourself to others.
                        </p>
                    </motion.div>

                    <motion.div
                        variants={itemVariants}
                        className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition duration-300"
                    >
                        <div className="w-16 h-16 bg-indigo-100 rounded-xl flex items-center justify-center mb-6">
                            <FaUsers className="text-indigo-600 text-2xl" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">
                            Virtual Avatars
                        </h3>
                        <p className="text-gray-600">
                            Interact through virtual representations. Swipe to connect while
                            keeping your identity private initially.
                        </p>
                    </motion.div>

                    <motion.div
                        variants={itemVariants}
                        className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition duration-300"
                    >
                        <div className="w-16 h-16 bg-pink-100 rounded-xl flex items-center justify-center mb-6">
                            <FaHeart className="text-pink-600 text-2xl" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">
                            24-Hour Privacy
                        </h3>
                        <p className="text-gray-600">
                            Chat anonymously for 24 hours after matching. Then choose to
                            reveal identities or continue privately.
                        </p>
                    </motion.div>

                    <motion.div
                        variants={itemVariants}
                        className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition duration-300"
                    >
                        <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                            <FaComments className="text-blue-600 text-2xl" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">
                            Dual Chat System
                        </h3>
                        <p className="text-gray-600">
                            Separate sections for anonymous and revealed identity chats.
                            You're always in control.
                        </p>
                    </motion.div>

                    <motion.div
                        variants={itemVariants}
                        className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition duration-300"
                    >
                        <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                            <FaSearch className="text-green-600 text-2xl" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">
                            Smart Filtering
                        </h3>
                        <p className="text-gray-600">
                            Filter users based on interests, goals, or location. Find exactly
                            who you're looking for.
                        </p>
                    </motion.div>

                    <motion.div
                        variants={itemVariants}
                        className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition duration-300"
                    >
                        <div className="w-16 h-16 bg-yellow-100 rounded-xl flex items-center justify-center mb-6">
                            <FaRobot className="text-yellow-600 text-2xl" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">
                            AI Matching
                        </h3>
                        <p className="text-gray-600">
                            Our smart algorithm suggests the best matches based on shared
                            goals and behavior patterns.
                        </p>
                    </motion.div>
                </motion.div>
            </section>

            {/* Goals Section */}
            <section className="py-20 bg-gradient-to-r from-purple-50 to-indigo-50">
                <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                            Find Partners For Your{" "}
                            <span className="text-purple-600">Goals</span>
                        </h2>
                        <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
                            Whether you're looking for a workout buddy or a travel companion,
                            Circle Up helps you connect with the right people.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <motion.div
                            whileHover={{ y: -10 }}
                            className="bg-white p-8 rounded-2xl shadow-lg transition duration-300"
                        >
                            <div className="w-20 h-20 bg-purple-100 rounded-xl flex items-center justify-center mb-6 mx-auto">
                                <MdSportsGymnastics className="text-purple-600 text-3xl" />
                            </div>
                            <h3 className="text-xl font-bold text-center text-gray-900 mb-3">
                                Fitness Buddies
                            </h3>
                            <p className="text-gray-600 text-center">
                                Find gym partners, running mates, or yoga companions to keep you
                                motivated and accountable.
                            </p>
                        </motion.div>

                        <motion.div
                            whileHover={{ y: -10 }}
                            className="bg-white p-8 rounded-2xl shadow-lg transition duration-300"
                        >
                            <div className="w-20 h-20 bg-indigo-100 rounded-xl flex items-center justify-center mb-6 mx-auto">
                                <MdTravelExplore className="text-indigo-600 text-3xl" />
                            </div>
                            <h3 className="text-xl font-bold text-center text-gray-900 mb-3">
                                Travel Partners
                            </h3>
                            <p className="text-gray-600 text-center">
                                Connect with fellow travelers who share your destinations and
                                interests.
                            </p>
                        </motion.div>

                        <motion.div
                            whileHover={{ y: -10 }}
                            className="bg-white p-8 rounded-2xl shadow-lg transition duration-300"
                        >
                            <div className="w-20 h-20 bg-green-100 rounded-xl flex items-center justify-center mb-6 mx-auto">
                                <MdHomeWork className="text-green-600 text-3xl" />
                            </div>
                            <h3 className="text-xl font-bold text-center text-gray-900 mb-3">
                                Flatmates
                            </h3>
                            <p className="text-gray-600 text-center">
                                Find compatible roommates based on lifestyle preferences and
                                living habits.
                            </p>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Groups Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                        Discover <span className="text-purple-600">Interest Groups</span>
                    </h2>
                    <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
                        Swipe to join communities that match your passions and hobbies.
                    </p>
                </motion.div>

                <div className="relative">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[
                            "Yoga Clubs",
                            "College Societies",
                            "Hiking Groups",
                            "Book Clubs",
                            "Tech Enthusiasts",
                            "Art Communities",
                            "Music Lovers",
                            "Foodies",
                        ].map((group, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition duration-300 flex flex-col items-center"
                            >
                                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                                    <FaUsers className="text-purple-600 text-xl" />
                                </div>
                                <h3 className="font-medium text-gray-900 text-center">
                                    {group}
                                </h3>
                                <span className="mt-2 text-sm text-purple-600">
                                    {Math.floor(Math.random() * 100) + 50} members
                                </span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-r from-purple-600 to-indigo-600">
                <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                            Ready to Make Meaningful Connections?
                        </h2>
                        <p className="text-lg text-purple-100 max-w-3xl mx-auto mb-8">
                            Join Circle Up today and start connecting with like-minded people
                            while maintaining control over your privacy.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <button className="px-8 py-3 bg-white text-purple-600 rounded-full font-medium hover:bg-gray-100 transition duration-300 shadow-lg hover:shadow-xl">
                                Sign Up Free
                            </button>
                            <button className="px-8 py-3 bg-transparent border-2 border-white text-white rounded-full font-medium hover:bg-white hover:bg-opacity-10 transition duration-300 shadow-lg hover:shadow-xl">
                                Learn More
                            </button>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;
