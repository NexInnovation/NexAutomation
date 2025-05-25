import {
    signOut,
    createUserWithEmailAndPassword,
    ref,
    get,
    set,
    signInWithEmailAndPassword
} from '../firebase-module.js';
import {
    auth,
    db
} from './dashboard.js';
import {
    DB_PATHS
} from '../db-paths.js';
import {
    fillWiFiFieldsFromSession,
    fillMemberListSidebarFromSession
} from './data-fill-functions.js';


// ✅ Reusable Logout Function
export async function performLogout() {
    Swal.fire({
        title: "Logging out...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
    });

    try {
        await signOut(auth);
        sessionStorage.clear();
        Swal.close();

        Swal.fire({
            icon: "success",
            title: "Logged Out",
            text: "You have been signed out successfully.",
            timer: 1000,
            showConfirmButton: false
        }).then(() => {
            window.location.href = "index.html";
        });
    } catch (err) {
        Swal.close();
        console.error("❌ Logout failed:", err);
        Swal.fire({
            icon: "error",
            title: "Logout Failed",
            text: err.message || "Something went wrong. Try again."
        });
    }
}

document.getElementById("submit-profile").addEventListener("click", async (e) => {
    e.preventDefault(); // Prevent default form submission

    const userData = {
        firstName: document.getElementById("profile-firstname").value.trim(),
        lastName: document.getElementById("profile-lasttname").value.trim(),
        mobile: document.getElementById("profile-mobile").value.trim(),
        email: document.getElementById("profile-email").value.trim(),
        city: document.getElementById("profile-city").value.trim(),
        uid: sessionStorage.getItem("uid"),
        homeId: sessionStorage.getItem("homeId"),
        role: sessionStorage.getItem("role")
    };

    const uid = sessionStorage.getItem("uid");
    const homeId = sessionStorage.getItem("homeId");

    try {
        await set(ref(db, DB_PATHS.userProfile(homeId, uid)), userData);

        console.log("✅ Profile updated in Firebase:", userData);

        Swal.fire({
            icon: "success",
            title: "Profile Updated",
            text: "Your profile has been successfully saved."
        });

        // Optional: update sessionStorage
        for (const key in userData) {
            if (userData[key] !== undefined) {
                sessionStorage.setItem(key, userData[key]);
            }
        }

        fillWiFiFieldsFromSession();

    } catch (err) {
        console.error("❌ Failed to update profile:", err);
        Swal.fire({
            icon: "error",
            title: "Update Failed",
            text: err.message || "Something went wrong. Try again."
        });
    }
});

document.getElementById("submit-wifi").addEventListener("click", async () => {
    const ssid = document.getElementById("ssid").value.trim();
    const password = document.getElementById("password").value.trim();

    // 🔍 Validate inputs
    if (!ssid || !password) {
        Swal.fire({
            icon: "warning",
            title: "Missing Fields",
            text: "Please enter both SSID and Password.",
        });
        return;
    }

    const uid = sessionStorage.getItem("uid");
    const homeId = sessionStorage.getItem("homeId");

    if (!uid || !homeId) {
        Swal.fire({
            icon: "error",
            title: "Missing Session",
            text: "User information is missing. Please log in again.",
        });
        return;
    }

    const wifiData = {
        ssid,
        password
    };

    try {
        Swal.fire({
            title: "Saving Wi-Fi Settings...",
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });

        await set(ref(db, DB_PATHS.wifiConfig(homeId)), wifiData);

        // ✅ Save in sessionStorage too
        sessionStorage.setItem("ssid", ssid);
        sessionStorage.setItem("password", password);
        sessionStorage.setItem("wifiConfig", JSON.stringify(wifiData));
        fillWiFiFieldsFromSession();

        Swal.close();
        Swal.fire({
            icon: "success",
            title: "Saved",
            text: "Wi-Fi credentials saved successfully!"
        });
    } catch (err) {
        Swal.close();
        console.error("❌ Error saving Wi-Fi config:", err);
        Swal.fire({
            icon: "error",
            title: "Save Failed",
            text: err.message || "Could not save Wi-Fi credentials. Try again."
        });
    }
});

document.getElementById("add-member-form").addEventListener("submit", async (e) => {
    e.preventDefault(); // ✅ Prevent page reload

    const member_email_id = document.getElementById("memail").value.trim();
    const member_password = document.getElementById("mpassword").value.trim();
    const member_fname = document.getElementById("mfname").value.trim();

    // Backup current admin credentials
    const adminEmail = sessionStorage.getItem("email");
    const adminPassword = sessionStorage.getItem("adminPassword"); // You must securely save this somewhere during login!

    console.log("📥 Email:", member_email_id);
    console.log("📥 Password:", member_password);
    console.log("📥 F Name:", member_fname);

    if (!member_email_id || !member_password || !member_fname) {
        console.warn("⚠️ Email or Password missing");
        Swal.fire({
            icon: "warning",
            title: "Missing Fields",
            text: "Please enter both Email and Password.",
        });
        return;
    }

    const homeId = sessionStorage.getItem("homeId");

    console.log("🏠 Home ID:", homeId);

    if (!homeId) {
        console.error("❌ No homeId found in sessionStorage");
        Swal.fire({
            icon: "error",
            title: "Missing Session",
            text: "User information is missing. Please log in again.",
        });
        return;
    }

    try {
        console.log("🚀 Starting account creation...");

        Swal.fire({
            title: "Creating account...",
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });

        const userCredential = await createUserWithEmailAndPassword(auth, member_email_id, member_password);
        const member_uid = userCredential.user.uid;

        await signInWithEmailAndPassword(auth, adminEmail, adminPassword);

        const homeId = sessionStorage.getItem("homeId");

        console.log("✅ Firebase Auth account created:", member_uid);

        const member_userData = {
            uid: member_uid,
            email: member_email_id,
            role: "member",
            isAdmin: false,
            homeId,
            createdAt: new Date().toISOString(),
            firstName: member_fname,
            lastName: "",
            mobile: "",
            city: ""
        };

        console.log("📝 Writing member user profile to DB:", member_userData);
        await set(ref(db, DB_PATHS.userProfile(homeId, member_uid)), member_userData);

        console.log("🗂️ Writing mapping to /users/", member_uid);
        await set(ref(db, DB_PATHS.userMapping(member_uid)), {
            homeId,
            role: "member"
        });

        Swal.close();
        Swal.fire({
            icon: "success",
            title: "Member Added",
            text: "The member account has been created successfully.",
            timer: 1500,
            showConfirmButton: false
        });

        const allUsersRef = ref(db, `automation/${homeId}/user`);
        const allUsersSnap = await get(allUsersRef);

        if (allUsersSnap.exists()) {
            const updatedUserList = allUsersSnap.val();
            sessionStorage.setItem("homeUsers", JSON.stringify(updatedUserList));
            console.log("👥 SessionStorage updated with new user list:", updatedUserList);
        } else {
            console.warn("⚠️ No users found after adding member.");
        }

        fillMemberListSidebarFromSession();

        // Clear input fields
        document.getElementById("memail").value = "";
        document.getElementById("mpassword").value = "";
        document.getElementById("mfname").value = "";

    } catch (error) {
        Swal.close();
        console.error("❌ Member adding failed:", error);

        let message = "Signup failed. Please try again.";
        if (error.code === "auth/email-already-in-use") {
            message = "This email is already registered. Try logging in or use 'Forgot Password'.";
        } else if (error.code === "auth/invalid-email") {
            message = "The email address is badly formatted.";
        } else if (error.code === "auth/weak-password") {
            message = "Password should be at least 6 characters.";
        }

        Swal.fire({
            icon: "warning",
            title: "Member adding failed",
            text: message,
            confirmButtonText: "OK"
        });
    }
});