import {
    signOut,
    ref,
    set
} from '../firebase-module.js';
import {
    auth,
    db
} from './dashboard.js';
import {
    DB_PATHS
} from '../db-paths.js';
import {
    fillWiFiFieldsFromSession
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