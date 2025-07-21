import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaUserPlus, FaSignInAlt, FaTasks, FaCheckCircle, FaClock } from "react-icons/fa";

/**
 * PublicDashboard Component
 * 
 * A limited dashboard view for non-authenticated users.
 * Shows only basic features and encourages users to login/register.
 */
const PublicDashboard = () => {
  const navigate = useNavigate();

  const features = [
    { 
      icon: <FaTasks />, 
      title: "Task Management", 
      description: "Create and organize tasks efficiently" 
    },
    { 
      icon: <FaCheckCircle />, 
      title: "Task Completion Tracking", 
      description: "Track your team's progress" 
    },
    { 
      icon: <FaClock />, 
      title: "Deadline Management", 
      description: "Never miss important deadlines" 
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Welcome Banner */}
        <motion.div 
          className="bg-white p-8 rounded-xl shadow-lg mb-8 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Welcome to TaskFlow
          </h1>
          <p className="text-gray-600 text-lg mb-6">
            Boost your productivity with our comprehensive task management system.
          </p>
          
          {/* Login/Register Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <motion.button
              onClick={() => navigate("/login")}
              className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg shadow-md hover:bg-blue-700 transition"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaSignInAlt className="mr-2" />
              Log In
            </motion.button>
            
            <motion.button
              onClick={() => navigate("/signup")}
              className="flex items-center justify-center px-6 py-3 bg-green-600 text-white font-medium rounded-lg shadow-md hover:bg-green-700 transition"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaUserPlus className="mr-2" />
              Sign Up
            </motion.button>
          </div>
        </motion.div>

        {/* Features Preview */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Features Preview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div 
                key={index} 
                className="bg-white p-6 rounded-lg shadow-md"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <div className="text-3xl text-blue-500 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Login Prompt */}
        <motion.div 
          className="bg-blue-50 border border-blue-200 p-6 rounded-lg text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <h2 className="text-xl font-semibold text-blue-800 mb-3">
            Get Full Access to TaskFlow
          </h2>
          <p className="text-blue-700 mb-4">
            Login or create an account to access all features including task creation, 
            filters, team collaboration, and more.
          </p>
          <div className="flex justify-center">
            <button 
              onClick={() => navigate("/login")}
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg shadow-sm hover:bg-blue-700 transition"
            >
              Log In Now
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PublicDashboard;
