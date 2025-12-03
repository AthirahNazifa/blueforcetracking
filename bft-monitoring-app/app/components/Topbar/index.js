"use client";
import Link from "next/link";
import { FaUser, FaMap } from "react-icons/fa";
import styles from "./Topbar.module.css";

export default function Topbar() {
  const menuItems = [
    { name: "Map View", icon: <FaMap size={20} />, href: "/map" },
    { name: "Profile", icon: <FaUser size={20} />, href: "/profile" },
  ];

  return (
    <div className={styles.topbar}>
      {/* Left icon */}
      <div className={styles.iconWrapper}>
        <img src="/icons/kemalak_icon.png" alt="Kemalak Icon" />
      </div>

      {/* Centered title + logo */}
      <div className={styles.center}>
        <div className={styles.header}>
          <img src="/icons/bft.svg" alt="BFT Logo" className={styles.logo} />
          <h1>BLUE FORCE TRACKING</h1>
        </div>
      </div>

      {/* Right nav */}
      <div className={styles.nav}>
        {menuItems.map((item) => (
          <div key={item.name} className={styles.menuItem}>
            <Link href={item.href} className={styles.button}>
              {item.icon}
            </Link>
            <span className={styles.tooltip}>{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
