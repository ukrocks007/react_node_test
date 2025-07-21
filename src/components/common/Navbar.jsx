import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { FaUserCircle, FaTasks, FaSignInAlt, FaUserPlus } from "react-icons/fa";
import TaskList from "../tasks/TaskList";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Authentication state
  const isAuthenticated = !!user || !!localStorage.getItem("token");
  const authRoutes = ["/login", "/signup", "/forgot-password", "/reset-password"];
  const isAuthRoute = authRoutes.includes(location.pathname);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [taskListOpen, setTaskListOpen] = useState(false);
  const dropdownRef = useRef(null);
  const taskListRef = useRef(null);
  const [profile, setProfile] = useState({ name: "User", profilePic: "", role: "user" });

  useEffect(() => {
    // Only load profile if authenticated
    if (isAuthenticated) {
      // Check if user is in admin or user portal
      const isAdminPortal = location.pathname.startsWith("/admin");
  
      // Load correct profile from localStorage
      const storedProfile = JSON.parse(localStorage.getItem(isAdminPortal ? "adminProfile" : "userProfile"));
      
      if (storedProfile) {
        setProfile({
          name: storedProfile.name || "User",
          profilePic: storedProfile.profilePic || "",
          role: storedProfile.role || (isAdminPortal ? "admin" : "user"), // Ensure role is set
        });
      }
    }
  }, [location.pathname, isAuthenticated]); // Re-run when path or auth state changes

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (taskListRef.current && !taskListRef.current.contains(event.target)) {
        setTaskListOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      const isAdminPortal = location.pathname.startsWith("/admin");

      // Remove the correct profile from storage
      localStorage.removeItem(isAdminPortal ? "adminProfile" : "userProfile");

      navigate("/");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const handleLogoClick = (e) => {
    e.preventDefault();

    // If not authenticated, go to the public dashboard
    if (!isAuthenticated) {
      navigate("/");
      return;
    }

    setTimeout(() => {
      const isAdminPortal = location.pathname.startsWith("/admin");

      if (isAdminPortal) {
        if (location.pathname === "/admin/dashboard") {
          window.location.reload(); // Refresh if already on admin dashboard
        } else {
          navigate("/admin/dashboard"); // Redirect to admin dashboard
        }
      } else {
        if (location.pathname === "/user/dashboard") {
          window.location.reload(); // Refresh if already on user dashboard
        } else {
          navigate("/user/dashboard"); // Redirect to user dashboard
        }
      }
    }, 500);
  };

  return (
    <nav className="bg-blue-600 text-white px-5 py-4 flex justify-between items-center shadow-lg">
      {/* Logo with Image & Text */}
      <Link
        to="/"
        onClick={handleLogoClick}
        className="flex items-center text-3xl font-bold tracking-wide hover:opacity-70 transition"
      >
        <img src="/app_icon.png" alt="TaskFlow Logo" className="w-12 h-12 rounded-full mr-2" />
        TaskFlow
      </Link>

      <div className="flex items-center gap-4">
        {/* Show different controls based on authentication state */}
        {isAuthenticated ? (
          // Authenticated User Controls
          <>
            {/* Task List Button */}
            <div className="relative" ref={taskListRef}>
              <button
                onClick={() => setTaskListOpen(!taskListOpen)}
                className="flex items-center bg-white text-blue-600 font-medium px-4 py-2 rounded-lg shadow-md 
                           hover:bg-blue-700 hover:text-white transition-all focus:outline-none mr-2"
              >
                <FaTasks className="text-xl mr-2" />
                <span>Tasks</span>
              </button>

              {/* Task List Dropdown */}
              {taskListOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-lg overflow-hidden z-10">
                  <TaskList />
                </div>
              )}
            </div>

            {/* Profile Button */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center bg-white text-blue-600 font-medium px-4 py-2 rounded-lg shadow-md 
                           hover:bg-blue-700 hover:text-white transition-all focus:outline-none"
              >
                {profile.profilePic ? (
                  <img
                    src={profile.profilePic}
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover mr-2"
                  />
                ) : (
                  <FaUserCircle className="text-2xl mr-2" />
                )}
                <span>{profile.name}</span>
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white shadow-lg rounded-lg overflow-hidden z-10">
                  <ul className="text-gray-700">
                    <li>
                      <Link
                        to={profile.role === "admin" ? "/admin/profile" : "/user/profile"}
                        className="block px-4 py-2 hover:bg-gray-200 transition"
                        onClick={() => setDropdownOpen(false)}
                      >
                        Profile
                      </Link>
                    </li>
                    <li>
                      <button
                        className="block w-full text-left px-4 py-2 hover:bg-red-100 text-red-600 transition"
                        onClick={handleLogout}
                      >
                        Logout
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </>
        ) : (
          // Non-Authenticated User Controls (don't show on auth pages)
          !isAuthRoute && (
            <div className="flex gap-3">
              <button
                onClick={() => navigate("/login")}
                className="flex items-center bg-white text-blue-600 font-medium px-4 py-2 rounded-lg shadow-md 
                         hover:bg-blue-700 hover:text-white transition-all focus:outline-none"
              >
                <FaSignInAlt className="mr-2" />
                Log In
              </button>
              <button
                onClick={() => navigate("/signup")}
                className="flex items-center bg-blue-500 text-white font-medium px-4 py-2 rounded-lg shadow-md 
                         border border-white hover:bg-blue-700 transition-all focus:outline-none"
              >
                <FaUserPlus className="mr-2" />
                Sign Up
              </button>
            </div>
          )
        )}
      </div>
    </nav>
  );
};

export default Navbar;
