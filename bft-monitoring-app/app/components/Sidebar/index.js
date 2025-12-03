//app/components/Sidebar.js
"use client";
import { FaDesktop, FaPlusCircle, FaSearch, FaVideo } from "react-icons/fa";
import styles from "./Sidebar.module.css";

export default function Sidebar({ setActivePanel }) {
  const menuItems = [
    { name: "Search", icon: <FaSearch size={22} /> },
    { name: "Devices", icon: <FaDesktop size={22} /> },
    { name: "Record Playback", icon: <FaVideo size={22} /> },
    //{ name: "Add Device", icon: <FaPlusCircle size={22} /> },
  ];

  return (
    <div className={styles.sidebar}>
      {menuItems.map((item) => (
        <div key={item.name} className={styles.menuItem}>
          <button
            className={styles.button}
            onClick={() =>
              setActivePanel((prev) => (prev === item.name ? null : item.name))
            }
          >
            {item.icon}
          </button>
          <span className={styles.tooltip}>{item.name}</span>
        </div>
      ))}
    </div>
  );
}
