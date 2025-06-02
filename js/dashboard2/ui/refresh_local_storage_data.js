// file name: refresh_local_storage_data.js

const DEBUG = false;

import {
    fetchAndSaveBasicHomeData,
    fetchAndSaveAdminProfile,
    fetchAndSaveMemberProfile,
    fetchAndSaveAllUsers,
    fetchAndSaveDevices
} from '../../login/new/save_data_to_local_storage.js';

/**
 * 🟩 Starts a periodic data refresh to keep localStorage in sync with Firebase
 * @param {number} intervalMinutes - Interval in minutes for periodic refresh
 */
export function startPeriodicDataRefresh(intervalMinutes) {
    if (DEBUG) console.log(`🔁 Starting periodic data refresh every ${intervalMinutes} minutes...`);

    const intervalMs = intervalMinutes * 60 * 1000;

    const uid = localStorage.getItem("currentUser_uid");
    const email = localStorage.getItem("currentUser_email");
    const homeId = localStorage.getItem("currentUser_homeId");
    const role = localStorage.getItem("currentUser_role");

    if (!uid || !email || !homeId || !role) {
        console.warn("⚠️ Missing user data in localStorage. Cannot start periodic refresh.");
        return;
    }

    const refreshData = async () => {
        if (DEBUG) console.log("🔄 Periodic data refresh triggered...");

        try {
            // 1️⃣ Basic home data
            await fetchAndSaveBasicHomeData(uid, email);

            // 2️⃣ All users (admin + members)
            await fetchAndSaveAllUsers(homeId);

            // 3️⃣ Current user's own profile (admin or member)
            if (role === "admin") {
                await fetchAndSaveAdminProfile(homeId, uid);
            } else {
                await fetchAndSaveMemberProfile(homeId, uid);
            }

            // 4️⃣ All devices
            await fetchAndSaveDevices(homeId);

            if (DEBUG) console.log("✅ Periodic data refresh complete!");
        } catch (error) {
            console.error("❌ Error during periodic data refresh:", error);
        }
    };

    // Initial run
    refreshData().then(() => {
        if (DEBUG) console.log("✅ Initial periodic data refresh done!");
    });

    // Schedule subsequent refreshes
    setInterval(refreshData, intervalMs);
}