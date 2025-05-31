import {
    auth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    db,
    ref,
    get,
    update
} from "../../firebase-module.js";

import DB_PATHS from "../../db-paths.js";

import {
    fillMemberListSidebar
} from '../ui/fill_function_to_all_panel.js';

document.getElementById("add-member-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    console.log("🟡 Add Member form submitted!");

    console.log("🟡 Add Member form submitted!");

    // ✅ NEW: Check if current user is admin
    const currentUserRole = localStorage.getItem("currentUser_role");
    if (currentUserRole !== "admin") {
        console.warn("❌ Only admin can add members!");
        return Swal.fire({
            icon: 'error',
            title: 'Access Denied',
            text: 'Only admin can add members.'
        });
    }

    // ✅ Get input values
    const firstName = document.getElementById("mfname").value.trim();
    const email = document.getElementById("memail").value.trim();
    const password = document.getElementById("mpassword").value.trim();
    const adminPassword = document.getElementById("Apassword").value.trim();

    console.log("🔎 Collected inputs:", {
        firstName,
        email,
        password: password ? "✔️ Provided" : "❌ Empty",
        adminPassword: adminPassword ? "✔️ Provided" : "❌ Empty"
    });

    if (!firstName || !email || !password || !adminPassword) {
        console.warn("⚠️ Missing required fields!");
        return Swal.fire({
            icon: 'warning',
            title: 'Incomplete Data',
            text: 'Please fill all required fields.'
        });
    }

    try {
        console.log("⏳ Showing Adding Member Swal...");
        Swal.fire({
            title: 'Adding Member...',
            text: 'Please wait while we create the new member.',
            allowOutsideClick: false,
            allowEscapeKey: false,
            didOpen: () => {
                console.log("✅ Swal loading indicator shown.");
                Swal.showLoading();
            },
        });

        console.log("⏳ Setting suppressOnAuthChange flag...");
        sessionStorage.setItem("suppressOnAuthChange", "true");

        console.log("⏳ Creating new user account...");
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const memberUid = userCredential.user.uid;
        console.log(`✅ Member account created: ${memberUid}`);

        console.log("⏳ Re-logging in as admin...");
        const adminEmail = localStorage.getItem("currentUser_email");
        console.log("🔎 Admin email from localStorage:", adminEmail);

        if (!adminEmail || !adminPassword) throw new Error("❌ Admin credentials not found in form!");

        // sessionStorage.setItem("suppressOnAuthChange", "true");
        await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
        console.log("✅ Re-logged in as admin.");

        console.log("⏳ Fetching home ID from localStorage...");
        const homeId = localStorage.getItem("currentUser_homeId");
        console.log("🏠 homeId:", homeId);

        const now = new Date().toISOString();
        const profileData = {
            uid: memberUid,
            email: email,
            role: 'member',
            isAdmin: false,
            firstName,
            lastName: '',
            mobile: '',
            city: '',
            createdAt: now,
        };
        console.log("📦 Prepared member profile data:", profileData);

        console.log("⏳ Fetching current total members...");
        const homeDataRef = ref(db, DB_PATHS.homeData(homeId));
        const homeDataSnap = await get(homeDataRef);
        const homeData = homeDataSnap.exists() ? homeDataSnap.val() : {};
        const newTotalMembers = (homeData["total member"] || 0) + 1;
        console.log("🔢 Current total members:", homeData["total member"], "➡️ New total members:", newTotalMembers);

        const updates = {};
        updates[DB_PATHS.homeMemberUser(homeId, memberUid)] = profileData; // /automation/{homeId}/user/member/{uid}
        updates[DB_PATHS.totalMembers(homeId)] = newTotalMembers; // /automation/{homeId}/home-data/total member
        updates[DB_PATHS.userList(homeId) + `/${memberUid}`] = false; // /automation/{homeId}/user-list/{uid}
        updates[DB_PATHS.userProfileLink(memberUid)] = {
            homeId,
            role: 'member'
        }; // /users/{uid}
        console.log("🔄 Firebase updates prepared:", updates);

        console.log("⏳ Sending updates to Firebase...");
        await update(ref(db), updates);
        console.log("✅ Firebase updates successful!");

        console.log("⏳ Updating localStorage data...");

        localStorage.setItem("currentUser_uid", auth.currentUser.uid);
        localStorage.setItem("currentUser_email", adminEmail);
        localStorage.setItem("currentUser_homeId", homeId);
        localStorage.setItem("currentUser_role", "admin");

        console.log("⏳ Fetching full admin profile for localStorage...");
        const adminRef = ref(db, DB_PATHS.homeAdminUser(homeId, auth.currentUser.uid));
        const adminSnap = await get(adminRef);
        const fullProfile = adminSnap.exists() ? adminSnap.val() : {};
        localStorage.setItem("currentUser_fullProfile", JSON.stringify(fullProfile));

        console.log("⏳ Updating home metadata in localStorage...");
        localStorage.setItem("currentUser_totalMembers", newTotalMembers);
        const totalDevices = homeData["total device"] || 0;
        localStorage.setItem("currentUser_totalDevices", totalDevices);

        console.log("⏳ Fetching all users for localStorage...");
        // const memberListRef = ref(db, `automation/${homeId}/user/member`);
        const memberListRef = ref(db, DB_PATHS.homeMemberUser(homeId, '')); // Passing empty string to get root path

        const memberListSnap = await get(memberListRef);
        const allUsers = {
            admin: {
                [auth.currentUser.uid]: fullProfile
            },
            members: memberListSnap.exists() ? memberListSnap.val() : {}
        };
        localStorage.setItem("allUsers", JSON.stringify(allUsers));

        console.log("⏳ Fetching devices for localStorage...");
        let devices = {};
        if (totalDevices > 0) {
            const devicesRef = ref(db, DB_PATHS.deviceRoot(homeId));
            const devicesSnap = await get(devicesRef);
            if (devicesSnap.exists()) {
                devices = devicesSnap.val();
                console.log("💡 Devices loaded:", devices);
            } else {
                console.warn("⚠️ Devices path exists but is empty.");
            }
        } else {
            console.log("📦 No devices configured.");
        }
        localStorage.setItem("devices", JSON.stringify(devices));

        console.log("✅ LocalStorage fully updated with new data!");

        fillMemberListSidebar();

        console.log("⏳ Closing Swal and showing success...");
        Swal.fire({
            icon: 'success',
            title: 'Member Added',
            text: `Member ${firstName} added successfully.`,
            timer: 1500,
            showConfirmButton: false
        });

        console.log("🧹 Clearing Add Member form...");
        document.getElementById("add-member-form").reset();
        console.log("✅ Form cleared.");
        console.log("⏳ clearing suppressOnAuthChange flag...");
        sessionStorage.removeItem("suppressOnAuthChange");

    } catch (error) {
        console.error("❌ Error in add-member:", error);
        Swal.fire({
            icon: 'error',
            title: 'Add Member Failed',
            text: error.message || 'Something went wrong. Please try again.'
        });
    }
});