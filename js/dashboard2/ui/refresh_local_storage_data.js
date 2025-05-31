document.addEventListener("DOMContentLoaded", () => {
    startPeriodicDataRefresh(10); // 5 minutes interval
});

import {
    fetchAndSaveBasicHomeData,
    fetchAndSaveAdminProfile,
    fetchAndSaveMemberProfile,
    fetchAndSaveAllUsers,
    fetchAndSaveDevices
} from '../../login/new/save_data_to_local_storage.js';


/**
 * 🟩 Starts a periodic data refresh to keep localStorage in sync with Firebase
 */
export function startPeriodicDataRefresh(intervalMinutes) {
    console.log(`🔁 Starting periodic data refresh every ${intervalMinutes} minutes...`);

    const intervalMs = intervalMinutes * 60 * 1000;

    const uid = localStorage.getItem("currentUser_uid");
    const email = localStorage.getItem("currentUser_email");
    const homeId = localStorage.getItem("currentUser_homeId");

    if (!uid || !email || !homeId) {
        console.warn("⚠️ Missing user data in localStorage. Cannot start periodic refresh.");
        return;
    }

    async function refreshData() {
        console.log("🔄 Periodic data refresh triggered...");

        try {
            await fetchAndSaveBasicHomeData(uid, email);
            await fetchAndSaveAdminProfile(homeId, uid);
            await fetchAndSaveMemberProfile(homeId, uid);
            await fetchAndSaveAllUsers(homeId);
            await fetchAndSaveDevices(homeId);
            console.log("✅ Periodic data refresh complete!");
        } catch (error) {
            console.error("❌ Error during periodic data refresh:", error.message);
        }
    }

    // Initial run
    refreshData();
    console.log("✅ Periodic data refresh started!");


    // Repeat every interval
    setInterval(refreshData, intervalMs);
}