import {
    db,
    ref,
    get
} from '../../firebase-module.js';

import DB_PATHS from '../../db-paths.js';

// 🔧 Main function to fetch and store all data into sessionStorage
export async function saveDataToSession(uid, email, password) {
    try {
        console.log("🟡 Step 1: Starting session data setup...");

        // ========== STEP 1: Get current user's profile (homeId & role) ==========
        const userRef = ref(db, DB_PATHS.userProfile(uid));
        const userSnap = await get(userRef);
        if (!userSnap.exists()) throw new Error("❌ User profile not found in DB!");

        const {
            homeId,
            role
        } = userSnap.val();
        console.log("✅ Step 1: Basic user profile retrieved:");
        console.log({
            uid,
            email,
            homeId,
            role
        });

        // Temporarily store basic identifiers
        sessionStorage.setItem("currentUser_uid", uid);
        sessionStorage.setItem("currentUser_email", email);
        sessionStorage.setItem("currentUser_homeId", homeId);
        sessionStorage.setItem("currentUser_role", role);

        // ========== STEP 2: Get full profile (admin/member) ==========
        let fullProfile = {};

        if (role === "admin") {
            const adminRef = ref(db, DB_PATHS.homeAdminUser(homeId, uid));
            const adminSnap = await get(adminRef);
            if (adminSnap.exists()) {
                fullProfile = adminSnap.val();
                console.log("👤 Step 2: Admin profile loaded:");
            } else {
                console.warn("⚠️ Admin profile not found.");
            }
        } else if (role === "member") {
            const memberRef = ref(db, `automation/${homeId}/user/member/${uid}`);
            const memberSnap = await get(memberRef);
            if (memberSnap.exists()) {
                fullProfile = memberSnap.val();
                console.log("👤 Step 2: Member profile loaded:");
            } else {
                console.warn("⚠️ Member profile not found.");
            }
        }

        console.log("✅ Full Profile:");
        console.log(fullProfile);

        // Save full profile
        sessionStorage.setItem("currentUser_fullProfile", JSON.stringify(fullProfile));

        // ========== STEP 3: Store email/password (only for admin) ==========
        if (role === 'admin') {
            sessionStorage.setItem("currentUser_password", password);
            console.log("🔐 Step 3: Admin password saved securely.");
        }

        // ========== STEP 4: Fetch home metadata ==========
        const homeDataRef = ref(db, DB_PATHS.homeData(homeId));
        const homeDataSnap = await get(homeDataRef);
        const homeData = homeDataSnap.exists() ? homeDataSnap.val() : {};

        const totalMembers = homeData["total member"] || 0;
        const totalDevices = homeData["total device"] || 0;

        sessionStorage.setItem("currentUser_totalMembers", totalMembers);
        sessionStorage.setItem("currentUser_totalDevices", totalDevices);

        console.log("🏡 Step 4: Home metadata:");
        console.log({
            totalMembers,
            totalDevices
        });

        // ========== STEP 5: Fetch all users (admin + members) ==========
        const allUsers = {
            admin: {},
            members: {}
        };

        // Add admin to allUsers
        if (role === "admin") {
            allUsers.admin[uid] = fullProfile;
        }

        // Only fetch members if count > 0
        if (totalMembers > 0) {
            const memberListRef = ref(db, `automation/${homeId}/user/member`);
            const memberListSnap = await get(memberListRef);
            if (memberListSnap.exists()) {
                allUsers.members = memberListSnap.val();
                console.log("👥 Step 5: Member profiles:");
                console.log(allUsers.members);
            } else {
                console.warn("⚠️ Member list path exists but is empty.");
            }
        }

        // Save all users list
        sessionStorage.setItem("allUsers", JSON.stringify(allUsers));

        // ========== STEP 6: Fetch all device data ==========
        let devices = {};

        if (totalDevices > 0) {
            const devicesRef = ref(db, DB_PATHS.deviceRoot(homeId));
            const devicesSnap = await get(devicesRef);
            if (devicesSnap.exists()) {
                devices = devicesSnap.val();
                console.log("💡 Step 6: Device data loaded:");
                console.log(devices);
            } else {
                console.warn("⚠️ Devices path exists but is empty.");
            }
        } else {
            console.log("📦 Step 6: No devices configured.");
        }

        // Save all devices
        sessionStorage.setItem("devices", JSON.stringify(devices));

        console.log("✅ Final Step: All data successfully saved to sessionStorage!");

    } catch (error) {
        console.error("❌ Error in saveDataToSession:", error.message);
    }
}