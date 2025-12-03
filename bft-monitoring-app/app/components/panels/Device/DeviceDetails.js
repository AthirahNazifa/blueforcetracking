"use client";

import { MdArrowBackIos } from "react-icons/md";
import styles from "./Device.module.css";

export default function DeviceDetails({ device, address, onBack }) {
  if (!device) return null;

  return (
    <div className={styles.details}>
      <div className={styles.detailsHeader}>
        <button className={styles.backButton} onClick={onBack}>
          <MdArrowBackIos size={20} />
        </button>
        <h3>{device.name || device.device_id || device.id}</h3>
      </div>

      <div className={styles.imageSection}>
        <img
          src="/icons/device-placeholder.png"
          alt="device"
          className={styles.deviceImage}
        />
      </div>

      <div className={styles.infoSection}>
        <div className={styles.infoRow}>
          <span className={styles.label}>Address</span>
          <span className={styles.value}>{address || "Resolving..."}</span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.label}>Latitude</span>
          <span className={styles.value}>{device.latitude}</span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.label}>Longitude</span>
          <span className={styles.value}>{device.longitude}</span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.label}>Device ID</span>
          <span className={styles.value}>{device.device_id || device.id}</span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.label}>Last Updated</span>
          <span className={styles.value}>
            {new Date(device.timestamp).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}
