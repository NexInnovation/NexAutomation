import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-app.js";

import {
    getAuth,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-auth.js";

import {
    getDatabase,
    ref,
    get,
    set
} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-database.js";

// import Swal from "https://cdn.jsdelivr.net/npm/sweetalert2@11";

// ✅ Firebase Config
const firebaseConfig = {
    apiKey: "AIzaSyD3GvlENwkMR6Khab1g-qT6WukrCVUwGSs",
    authDomain: "nexinnovation-login.firebaseapp.com",
    databaseURL: "https://nexinnovation-login-default-rtdb.firebaseio.com",
    projectId: "nexinnovation-login",
    storageBucket: "nexinnovation-login.appspot.com",
    messagingSenderId: "558802849966",
    appId: "1:558802849966:web:4339bb803ed781a5ecdd3f"
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// ✅ Global data holders
let savedWiFiConfig = {
    ssid: "",
    password: ""
};
let userProfile = {
    firstName: "",
    lastName: "",
    mobile: "",
    email: "",
    city: "",
    uid: ""
};

// ✅ Global DOM references
const sidebar = document.querySelector(".sidebar");
const sidebar2 = document.querySelector(".sidebar2");
const sidebar3 = document.querySelector(".sidebar3");
const closeBtn = document.getElementById("btn");
const settingsBtn = document.getElementById("settings-btn");
const profileBtn = document.getElementById("profile-btn");

// ✅ Utility functions
function fillWiFiFieldsFromSaved() {
    document.getElementById("ssid").value = savedWiFiConfig.ssid || "";
    document.getElementById("password").value = savedWiFiConfig.password || "";
}

function fillProfileFieldsFromSaved() {
    document.getElementById("profile-firstname").value = userProfile.firstName || "";
    document.getElementById("profile-lasttname").value = userProfile.lastName || "";
    document.getElementById("profile-mobile").value = userProfile.mobile || "";
    document.getElementById("profile-email").value = userProfile.email || "";
    document.getElementById("profile-city").value = userProfile.city || "";
    document.getElementById("profile-uid-not-editable").value = userProfile.uid || "";
}

function adjustSidebar2() {
    if (!sidebar2.classList.contains("show")) return;
    sidebar2.style.left = sidebar.classList.contains("open") ? "255px" : "83px";
    const top = settingsBtn.getBoundingClientRect().top + window.scrollY;
    sidebar2.style.top = `${top}px`;
    sidebar2.style.height = `${window.innerHeight - top - 10}px`;
}

function adjustSidebar3() {
    if (!sidebar3.classList.contains("show")) return;
    sidebar3.style.left = sidebar.classList.contains("open") ? "255px" : "83px";
    const top = profileBtn.getBoundingClientRect().top + window.scrollY;
    sidebar3.style.top = `${top}px`;
    sidebar3.style.height = `${window.innerHeight - top - 10}px`;
}

function getFromStorage(key) {
    try {
        return JSON.parse(localStorage.getItem(key));
    } catch {
        return null;
    }
}

async function fetchAndCache(refPath, localKey) {
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

// ✅ Clear cache utility (for debug or admin use)
function clearLocalStorageCache() {
    localStorage.removeItem("userProfile");
    localStorage.removeItem("wifiConfig");
    console.warn("🧹 Cleared localStorage cache for userProfile and wifiConfig.");
}

function confirmDiscardIfChanged(current, original) {
    return Object.keys(original).some(key => current[key] !== original[key]);
}

function getWiFiFormData() {
    return {
        ssid: document.getElementById("ssid").value.trim(),
        password: document.getElementById("password").value.trim()
    };
}

function getProfileFormData() {
    return {
        firstName: document.getElementById("profile-firstname").value.trim(),
        lastName: document.getElementById("profile-lasttname").value.trim(),
        mobile: document.getElementById("profile-mobile").value.trim(),
        email: document.getElementById("profile-email").value.trim(),
        city: document.getElementById("profile-city").value.trim(),
        uid: document.getElementById("profile-uid-not-editable").value.trim()
    };
}

// ✅ DOM Ready
document.addEventListener("DOMContentLoaded", function () {
    Swal.fire({
        title: "Loading Dashboard...",
        text: "Fetching user data",
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    onAuthStateChanged(auth, async (user) => {
        if (!user) {
            window.location.href = "index.html";
            return;
        }

        Swal.close();

        userProfile.uid = user.uid;

        const cachedProfile = getFromStorage("userProfile");
        if (cachedProfile) {
            userProfile = {
                ...userProfile,
                ...cachedProfile
            };
            fillProfileFieldsFromSaved();
            document.getElementById("sidebar-username").innerText = userProfile.firstName || "User";
            console.log("✅ Loaded profile from localStorage:", userProfile);
        } else {
            const data = await fetchAndCache(`users/${user.uid}`, "userProfile");
            if (data) {
                userProfile = {
                    ...userProfile,
                    ...data
                };
                fillProfileFieldsFromSaved();
                document.getElementById("sidebar-username").innerText = userProfile.firstName;
                console.log("✅ Loaded profile from Firebase:", userProfile);
            }
        }

        const cachedWiFi = getFromStorage("wifiConfig");
        if (cachedWiFi) {
            savedWiFiConfig = cachedWiFi;
            fillWiFiFieldsFromSaved();
            console.log("✅ Loaded Wi-Fi config from localStorage:", savedWiFiConfig);
        } else {
            const wifi = await fetchAndCache("config/wifi", "wifiConfig");
            if (wifi) {
                savedWiFiConfig = wifi;
                fillWiFiFieldsFromSaved();
                console.log("✅ Loaded Wi-Fi config from Firebase:", savedWiFiConfig);
            }
        }
    });

    // 🔘 Logout button
    const logoutBtn = document.getElementById("log_out");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            signOut(auth).then(() => {
                clearLocalStorageCache();
                window.location.href = "index.html";
            }).catch((err) => {
                alert("Logout failed: " + err.message);
            });
        });
    }



    if (closeBtn) {
        closeBtn.addEventListener("click", () => {
            sidebar.classList.toggle("open");
            adjustSidebar2();
            adjustSidebar3();
            closeBtn.classList.toggle("bx-menu-alt-right");
        });
    }

    if (settingsBtn) {



        settingsBtn.addEventListener("click", () => {
            sidebar2.classList.toggle("show");
            settingsBtn.classList.toggle("submenu-open");
            adjustSidebar2();
        });



        if (sidebar2.classList.contains("show")) {
            fillWiFiFieldsFromSaved();
        }

        document.addEventListener("click", (e) => {
            if (!sidebar2.contains(e.target) && !settingsBtn.contains(e.target)) {
                sidebar2.classList.remove("show");
                settingsBtn.classList.remove("submenu-open");
            }
        });

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && sidebar2.classList.contains("show")) {
                sidebar2.classList.remove("show");
                settingsBtn.classList.remove("submenu-open");
            }
        });
    }

    if (profileBtn) {
        profileBtn.addEventListener("click", () => {
            sidebar3.classList.toggle("show");
            profileBtn.classList.toggle("submenu-open");
            adjustSidebar3();

            if (sidebar3.classList.contains("show")) {
                fillProfileFieldsFromSaved(); // ✅ Refresh fields on open
            }
        });




        document.addEventListener("click", (e) => {
            if (!sidebar3.contains(e.target) && !profileBtn.contains(e.target)) {
                sidebar3.classList.remove("show");
                profileBtn.classList.remove("submenu-open");
            }
        });

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && sidebar3.classList.contains("show")) {
                sidebar3.classList.remove("show");
                profileBtn.classList.remove("submenu-open");
            }
        });
    }
});

document.addEventListener("click", (e) => {
    if (sidebar2.classList.contains("show") && !sidebar2.contains(e.target) && !settingsBtn.contains(e.target)) {
        const current = getWiFiFormData();
        if (confirmDiscardIfChanged(current, savedWiFiConfig)) {
            Swal.fire({
                icon: "info",
                title: "Changes Discarded",
                text: "Your unsaved Wifi changes were not saved."
            });
            fillWiFiFieldsFromSaved();
        }
        sidebar2.classList.remove("show");
        settingsBtn.classList.remove("submenu-open");
    }

    if (sidebar3.classList.contains("show") && !sidebar3.contains(e.target) && !profileBtn.contains(e.target)) {
        const current = getProfileFormData();
        if (confirmDiscardIfChanged(current, userProfile)) {
            Swal.fire({
                icon: "info",
                title: "Changes Discarded",
                text: "Your unsaved profile changes were not saved."
            });
            fillProfileFieldsFromSaved();
        }
        sidebar3.classList.remove("show");
        profileBtn.classList.remove("submenu-open");
    }
});

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        if (sidebar2.classList.contains("show")) {
            const current = getWiFiFormData();
            if (confirmDiscardIfChanged(current, savedWiFiConfig)) {
                Swal.fire({
                    icon: "info",
                    title: "Changes Discarded",
                    text: "Your unsaved Wifi changes were not saved."
                });
                fillWiFiFieldsFromSaved();
            }
            sidebar2.classList.remove("show");
            settingsBtn.classList.remove("submenu-open");
        }

        if (sidebar3.classList.contains("show")) {
            const current = getProfileFormData();
            if (confirmDiscardIfChanged(current, userProfile)) {
                Swal.fire({
                    icon: "info",
                    title: "Changes Discarded",
                    text: "Your unsaved profile changes were not saved."
                });
                fillProfileFieldsFromSaved();
            }
            sidebar3.classList.remove("show");
            profileBtn.classList.remove("submenu-open");
        }
    }
});

document.getElementById("wifi-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const ssid = document.getElementById("ssid").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!ssid || !password) {
        Swal.fire({
            icon: "warning",
            title: "Missing Info",
            text: "Please enter both SSID and Password.",
            confirmButtonText: "OK"
        });
        fillWiFiFieldsFromSaved();
        return;
    }

    try {
        Swal.fire({
            title: "Saving Wi-Fi credentials...",
            text: "Please wait",
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        await set(ref(db, "config/wifi"), {
            ssid,
            password
        });

        savedWiFiConfig = {
            ssid,
            password
        };

        Swal.close(); // Close loader

        Swal.fire({
            icon: "success",
            title: "Wi-Fi credentials Saved",
            text: "Your SSID and Password have been updated."
        });

        document.querySelector(".sidebar2").classList.remove("show");
        document.getElementById("settings-btn").classList.remove("submenu-open");
    } catch (err) {
        Swal.close(); // Close loader on error
        console.error("❌ Error saving Wi-Fi:", err);
        Swal.fire({
            icon: "error",
            title: "Wi-Fi Save Failed",
            text: err.message
        });
    }
});


document.getElementById("profile-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const firstName = document.getElementById("profile-firstname").value.trim();
    const lastName = document.getElementById("profile-lasttname").value.trim();
    const mobile = document.getElementById("profile-mobile").value.trim();
    const email = document.getElementById("profile-email").value.trim();
    const city = document.getElementById("profile-city").value.trim();
    const uid = userProfile.uid;

    if (!firstName || !lastName || !mobile || !email || !city) {
        Swal.fire({
            icon: "warning",
            title: "Incomplete Profile",
            text: "Please fill in all profile fields."
        });
        fillProfileFieldsFromSaved();
        return;
    }

    try {
        Swal.fire({
            title: "Updating Profile...",
            text: "Please wait",
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        await set(ref(db, `users/${uid}`), {
            firstName,
            lastName,
            mobile,
            email,
            city
        });

        Object.assign(userProfile, {
            firstName,
            lastName,
            mobile,
            email,
            city
        });
        document.getElementById("sidebar-username").innerText = firstName;

        Swal.close();

        Swal.fire({
            icon: "success",
            title: "Profile Updated",
            text: "Your profile information has been saved successfully."
        });

        document.querySelector(".sidebar3").classList.remove("show");
        document.getElementById("profile-btn").classList.remove("submenu-open");
    } catch (err) {
        Swal.close();
        console.error("❌ Error saving profile:", err);
        Swal.fire({
            icon: "error",
            title: "Profile Update Failed",
            text: "Something went wrong.",
            footer: err.message
        });
    }
});


// 👁️ Toggle UID visibility
document.getElementById("toggle-uid-visibility").addEventListener("click", () => {
    const uidField = document.getElementById("profile-uid-not-editable");
    const toggleIcon = document.getElementById("toggle-uid-visibility");

    if (uidField.type === "password") {
        uidField.type = "text";
        toggleIcon.classList.replace("bx-show", "bx-hide");
    } else {
        uidField.type = "password";
        toggleIcon.classList.replace("bx-hide", "bx-show");
    }
});