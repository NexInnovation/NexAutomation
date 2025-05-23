import {
    getDatabase,
    ref,
    get
} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-database.js";

// 🧠 Get data from localStorage
export function getFromStorage(key) {
    try {
        return JSON.parse(localStorage.getItem(key));
    } catch {
        return null;
    }
}

// 🔁 Fetch from Firebase and cache locally
export async function fetchAndCache(refPath, localKey, db) {
    try {
        const snapshot = await get(ref(db, refPath));
        if (snapshot.exists()) {
            const data = snapshot.val();
            localStorage.setItem(localKey, JSON.stringify(data));
            return data;
        } else {
            console.warn(`⚠️ No data found at ${refPath}`);
            return null;
        }
    } catch (err) {
        console.error(`❌ Error fetching ${refPath}:`, err);
        return null;
    }
}

// 🧹 Clear cached user and Wi-Fi config
export function clearLocalStorageCache() {
    localStorage.removeItem("userProfile");
    localStorage.removeItem("wifiConfig");
    console.warn("🧹 Cleared localStorage cache for userProfile and wifiConfig.");
}

// ⚠️ Check if form data has changed
export function confirmDiscardIfChanged(current, original) {
    return Object.keys(original).some(key => current[key] !== original[key]);
}

// ✅ Dynamically adjust sidebar2 position
export function adjustSidebar2() {
    const sidebar = document.querySelector(".sidebar");
    const sidebar2 = document.querySelector(".sidebar2");
    const settingsBtn = document.getElementById("settings-btn");

    if (!sidebar2.classList.contains("show")) return;
    sidebar2.style.left = sidebar.classList.contains("open") ? "255px" : "83px";
    const top = settingsBtn.getBoundingClientRect().top + window.scrollY;
    sidebar2.style.top = `${top}px`;
    sidebar2.style.height = `${window.innerHeight - top - 10}px`;
}

// ✅ Dynamically adjust sidebar3 position
export function adjustSidebar3() {
    const sidebar = document.querySelector(".sidebar");
    const sidebar3 = document.querySelector(".sidebar3");
    const profileBtn = document.getElementById("profile-btn");

    if (!sidebar3.classList.contains("show")) return;
    sidebar3.style.left = sidebar.classList.contains("open") ? "255px" : "83px";
    const top = profileBtn.getBoundingClientRect().top + window.scrollY;
    sidebar3.style.top = `${top}px`;
    sidebar3.style.height = `${window.innerHeight - top - 10}px`;
}

// ✅ Fill Wi-Fi input fields from cache
export function fillWiFiFieldsFromSaved() {
    const wifi = JSON.parse(localStorage.getItem("wifiConfig")) || {};
    document.getElementById("ssid").value = wifi.ssid || "";
    document.getElementById("password").value = wifi.password || "";
}


// ✅ Fill Profile input fields from cache
export function fillProfileFieldsFromSaved() {
    const profile = JSON.parse(localStorage.getItem("userProfile")) || {};
    document.getElementById("profile-firstname").value = profile.firstName || "";
    document.getElementById("profile-lasttname").value = profile.lastName || ""; // note: ID has a typo "lasttname"
    document.getElementById("profile-mobile").value = profile.mobile || "";
    document.getElementById("profile-email").value = profile.email || "";
    document.getElementById("profile-city").value = profile.city || "";
}