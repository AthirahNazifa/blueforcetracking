"use client";
import { useState, useEffect, useRef } from "react";
import { FaUser, FaCog, FaBell, FaSignOutAlt, FaMoon, FaSun } from "react-icons/fa";
import styles from "./ProfileDropdown.module.css";

export default function ProfileDropdown() {
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showProfileIcon, setShowProfileIcon] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };

    if (isProfileDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProfileDropdownOpen]);

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    // You can add theme switching logic here if needed
  };

  const profileMenuItems = [
    { name: "View Profile", icon: <FaUser size={16} />, href: "#" },
    { name: "Account Settings", icon: <FaCog size={16} />, href: "#" },
    { name: "Notifications", icon: <FaBell size={16} />, href: "#" },
    { name: isDarkMode ? "Light Mode" : "Dark Mode", icon: isDarkMode ? <FaSun size={16} /> : <FaMoon size={16} />, href: "#", action: toggleTheme },
    { name: "Sign out", icon: <FaSignOutAlt size={16} />, href: "#" },
  ];

  return (
    <div className={styles.profileContainer} ref={dropdownRef}>
      <button
        className={`${styles.profileButton} ${isProfileDropdownOpen ? styles.active : ""}`}
        onClick={toggleProfileDropdown}
      >
        {!showProfileIcon ? (
          <img
            src="/icons/profile-icon.jpg"
            alt="Profile"
            className={styles.profileImage}
            onError={() => setShowProfileIcon(true)}
          />
        ) : (
          <div className={styles.profileIconFallback}>
            <FaUser size={18} />
          </div>
        )}
      </button>
      <span className={styles.tooltip}>Profile</span>

      {/* Dropdown Menu */}
      {isProfileDropdownOpen && (
        <div className={styles.dropdown}>
          {profileMenuItems.map((item, index) => (
            <a
              key={index}
              href={item.href}
              className={styles.dropdownItem}
              onClick={(e) => {
                e.preventDefault();
                if (item.action) {
                  item.action();
                }
                if (item.name === "Sign out") {
                  // Add sign out logic here
                  console.log("Sign out clicked");
                }
                setIsProfileDropdownOpen(false);
              }}
            >
              <span className={styles.dropdownIcon}>{item.icon}</span>
              <span className={styles.dropdownText}>{item.name}</span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

