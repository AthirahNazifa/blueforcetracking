"use client";
import Link from "next/link";
import { FaMap } from "react-icons/fa";
import { usePathname } from "next/navigation";
import ProfileDropdown from "@components/Profile";
import styles from "./Topbar.module.css";

export default function Topbar() {
  const pathname = usePathname();

  const menuItems = [
    { name: "Map View", icon: <FaMap size={20} />, href: "/map" },
  ];

  return (
    <div className={styles.topbar}>
      {/* Left icon */}
      <div className={styles.iconWrapper}>
        <img src="/icons/kemalak_white.png" alt="Kemalak Icon" />
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
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <div
              key={item.name}
              className={`${styles.menuItem} ${isActive ? styles.active : ""}`}
            >
              <Link href={item.href} className={styles.button}>
                {item.icon}
              </Link>
              <span className={styles.tooltip}>{item.name}</span>
            </div>
          );
        })}

        {/* Profile Dropdown */}
        <ProfileDropdown />
      </div>
    </div>
  );
}
