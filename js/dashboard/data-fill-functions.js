import {
    performLogout
} from './logic-functions.js';

// ✅ Fill Profile Fields from Session
export async function fillProfileFieldsFromSession() {
    const firstName = sessionStorage.getItem("firstName");
    const lastName = sessionStorage.getItem("lastName");
    const mobile = sessionStorage.getItem("mobile");
    const email = sessionStorage.getItem("email");
    const city = sessionStorage.getItem("city");
    const uid = sessionStorage.getItem("uid");
    const homeId = sessionStorage.getItem("homeId");

    // 🔍 Check for missing critical fields
    if (!email || !uid || !homeId) {
        console.warn("❌ Essential profile session data missing. Logging out...");
        await performLogout(); // 🔁 Force logout
        return;
    }

    try {
        // 🧠 Fill Profile Form Fields
        document.getElementById("profile-firstname").value = firstName || "";
        document.getElementById("sidebar-username").innerText = firstName || "User";
        document.getElementById("profile-lasttname").value = lastName || "";
        document.getElementById("profile-mobile").value = mobile || "";
        document.getElementById("profile-email").value = email || "";
        document.getElementById("profile-city").value = city || "";
        document.getElementById("profile-uid-not-editable").value = uid || "";
        document.getElementById("profile-homeid-not-editable").value = homeId || "";
    } catch (err) {
        console.error("❌ Error filling profile fields:", err);

        Swal.fire({
            icon: "error",
            title: "Display Error",
            text: "Something went wrong while filling profile data.",
            confirmButtonText: "Reload"
        }).then(() => {
            location.reload();
        });
    }
}

// ✅ Fill WiFi Fields from Session
export function fillWiFiFieldsFromSession() {
    const ssid = sessionStorage.getItem("ssid");
    const password = sessionStorage.getItem("password");

    document.getElementById("ssid").value = "";
    document.getElementById("password").value = "";

    // ❌ Check for missing or empty values
    if (!ssid || !password) {
        console.warn("⚠️ Missing or empty Wi-Fi values in sessionStorage.");

        Swal.fire({
            icon: "warning",
            title: "Missing Configuration",
            text: "Wi-Fi settings are not available. Please reconfigure.",
            showConfirmButton: false,
            timer: 500,
            timerProgressBar: true
        });

        return;
    }

    // ✅ Fill fields
    document.getElementById("ssid").value = ssid;
    document.getElementById("password").value = password;

}






export function getWiFiFormData() {
    return {
        ssid: document.getElementById("ssid").value.trim(),
        password: document.getElementById("password").value.trim()
    };
}

export function getProfileFormData() {
    return {
        firstName: document.getElementById("profile-firstname").value.trim(),
        lastName: document.getElementById("profile-lasttname").value.trim(),
        mobile: document.getElementById("profile-mobile").value.trim(),
        email: document.getElementById("profile-email").value.trim(),
        city: document.getElementById("profile-city").value.trim(),
        uid: document.getElementById("profile-uid-not-editable").value.trim()
    };
}

export function confirmDiscardIfChanged(current, original) {
    return Object.keys(original).some(key => current[key] !== original[key]);
}