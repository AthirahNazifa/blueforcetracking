"use client";
import Link from "next/link";
import { FaUser, FaGlobe, FaMap } from "react-icons/fa"; // Added FaGlobe and FaMap
import styles from "./Topbar.module.css";

export default function Topbar() {
  return (
    <div className={styles.topbar}>
      <div className={styles.iconWrapper}>
        <img src="/icons/kemalak_icon.png" alt="Kemalak Icon" />
      </div>

      {/* Centered title + icon */}
      <div className={styles.center}>
        <div className={styles.header}>
          <img src="/icons/bft.svg" alt="BFT Logo" className={styles.logo} />
          <h1>BLUE FORCE TRACKING</h1>
        </div>

      </div>

      {/* Right nav */}
      <div className={styles.nav}>
        {/* NEW: Map Link with icon */}
        <Link href="/map" className={`${styles.navLink} ${styles.navLinkIcon}`}>
          <FaMap className={styles.icon} />
          <span>Map View</span> {/* Text label for the Map link */}
        </Link>

        {/* NEW: Profile Link with icon and text */}
        <Link href="/profile" className={`${styles.navLink} ${styles.navLinkIcon}`}>
          <FaUser className={styles.icon} />
          <span>Profile</span> {/* Text label for the Profile link */}
        </Link>
      </div>
    </div>
  );
}