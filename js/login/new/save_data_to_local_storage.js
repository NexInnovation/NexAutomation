// save_data_to_local_storage.js

import {
    db,
    ref,
    get
} from '../../firebase-module.js';
import DB_PATHS from '../../db-paths.js';

/**
 * 🟩 Fetch basic home data: homeId, role, total members, total devices
 */
export async function fetchAndSaveBasicHomeData(uid, email) {
    console.log("🟡 Fetching basic home data...");

    const userRef = ref(db, DB_PATHS.userProfileLink(uid));
    const userSnap = await get(userRef);
    if (!userSnap.exists()) throw new Error("❌ User profile not found in DB!");

    const {
        homeId,
        role
    } = userSnap.val();
    console.log("✅ Basic profile:", {
        uid,
        email,
        homeId,
        role
    });

    localStorage.setItem("currentUser_uid", uid);
    localStorage.setItem("currentUser_email", email);
    localStorage.setItem("currentUser_homeId", homeId);
    localStorage.setItem("currentUser_role", role);

    const homeDataRef = ref(db, DB_PATHS.homeData(homeId));
    const homeDataSnap = await get(homeDataRef);
    const homeData = homeDataSnap.exists() ? homeDataSnap.val() : {};
    const totalMembers = homeData["total member"] || 0;
    const totalDevices = homeData["total device"] || 0;

    localStorage.setItem("currentUser_totalMembers", totalMembers);
    localStorage.setItem("currentUser_totalDevices", totalDevices);

    console.log("🏠 Home metadata:", {
        totalMembers,
        totalDevices
    });
}

/**
 * 🟩 Fetch and save admin profile
 */
export async function fetchAndSaveAdminProfile(homeId, currentUid) {
    console.log("🟡 Fetching admin profile...");

    // 🔍 Load user-list to find the admin UID (where value is true)
    const userListRef = ref(db, DB_PATHS.userList(homeId));
    const userListSnap = await get(userListRef);
    let adminUid = null;

    if (userListSnap.exists()) {
        const userList = userListSnap.val();
        for (const uid in userList) {
            if (userList[uid] === true) { // true means admin
                adminUid = uid;
                break;
            }
        }
    }

    if (!adminUid) {
        console.warn("⚠️ Admin UID not found in user-list.");
        return;
    }

    const adminRef = ref(db, DB_PATHS.homeAdminUser(homeId, adminUid));
    const adminSnap = await get(adminRef);

    if (adminSnap.exists()) {
        const adminProfile = adminSnap.val();
        // localStorage.setItem("currentUser_adminProfile", JSON.stringify(adminProfile));
        localStorage.setItem("currentUser_fullProfile", JSON.stringify(adminProfile));
        console.log("✅ Admin profile saved to localStorage:", adminProfile);
    } else {
        console.warn("⚠️ Admin profile not found in DB.");
    }
}

/**
 * 🟩 Fetch and save member profile
 */
export async function fetchAndSaveMemberProfile(homeId, uid) {
    console.log("🟡 Fetching member profile...");
    const memberRef = ref(db, DB_PATHS.homeMemberUser(homeId, uid));
    const memberSnap = await get(memberRef);
    if (memberSnap.exists()) {
        const memberProfile = memberSnap.val();
        localStorage.setItem("currentUser_fullProfile", JSON.stringify(memberProfile));
        console.log("✅ Member profile saved:", memberProfile);
    } else {
        console.warn("⚠️ Member profile not found.");
    }
}

/**
 * 🟩 Fetch and save all users list (admin + members)
 */
export async function fetchAndSaveAllUsers(homeId) {
    console.log("🟡 Fetching all users list...");

    const allUsers = {
        admin: {},
        members: {}
    };

    // Get admin UID from user-list
    const userListRef = ref(db, DB_PATHS.userList(homeId));
    const userListSnap = await get(userListRef);
    let adminUid = null;

    if (userListSnap.exists()) {
        const userList = userListSnap.val();
        for (const uid in userList) {
            if (userList[uid] === true) { // true means admin
                adminUid = uid;
                break;
            }
        }
    }

    if (adminUid) {
        const adminRef = ref(db, DB_PATHS.homeAdminUser(homeId, adminUid));
        const adminSnap = await get(adminRef);
        if (adminSnap.exists()) {
            allUsers.admin[adminUid] = adminSnap.val();
        } else {
            console.warn("⚠️ Admin profile not found in DB.");
        }
    } else {
        console.warn("⚠️ Admin UID not found in user-list.");
    }

    // Load all members
    const memberListRef = ref(db, DB_PATHS.homeMemberUser(homeId, '')); // '' returns all members
    const memberListSnap = await get(memberListRef);
    if (memberListSnap.exists()) {
        allUsers.members = memberListSnap.val();
        console.log("👥 Member profiles:", allUsers.members);
    } else {
        console.warn("⚠️ Member list path exists but is empty.");
    }

    localStorage.setItem("allUsers", JSON.stringify(allUsers));
    console.log("✅ All users (including admin) saved to localStorage!");
}


/**
 * 🟩 Fetch and save all devices
 */
export async function fetchAndSaveDevices(homeId) {
    console.log("🟡 Fetching devices...");
    const totalDevices = parseInt(localStorage.getItem("currentUser_totalDevices")) || 0;

    let devices = {};
    if (totalDevices > 0) {
        const devicesRef = ref(db, DB_PATHS.deviceRoot(homeId));
        const devicesSnap = await get(devicesRef);
        if (devicesSnap.exists()) {
            devices = devicesSnap.val();
            console.log("💡 Device data loaded:", devices);
        } else {
            console.warn("⚠️ Devices path exists but is empty.");
        }
    } else {
        console.log("📦 No devices configured.");
    }

    localStorage.setItem("devices", JSON.stringify(devices));
}

/**
 * 🟩 Master function to populate all data to localStorage
 */
export async function populateAllDataToLocalStorage(uid, email) {
    console.log("🟡 Starting to populate all data to localStorage...");

    // 1️⃣ Fetch basic home data (homeId, role, etc.)
    await fetchAndSaveBasicHomeData(uid, email);
    const homeId = localStorage.getItem("currentUser_homeId");

    // 2️⃣ Fetch all users (admin + members) to localStorage
    await fetchAndSaveAllUsers(homeId);

    // 3️⃣ Fetch current user's own profile and save as "currentUser_fullProfile"
    const role = localStorage.getItem("currentUser_role");
    if (role === "admin") {
        await fetchAndSaveAdminProfile(homeId, uid);
    } else {
        await fetchAndSaveMemberProfile(homeId, uid);
    }

    // 4️⃣ Fetch all devices and save
    await fetchAndSaveDevices(homeId);

    console.log("✅ All data successfully saved to localStorage!");
}