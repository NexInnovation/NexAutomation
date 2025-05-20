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

// ✅ Sidebar setup
const sidebar = document.querySelector(".sidebar");
const sidebar2 = document.querySelector(".sidebar2");
const sidebar3 = document.querySelector(".sidebar3");
const closeBtn = document.getElementById("btn");
const settingsBtn = document.getElementById("settings-btn");
const profileBtn = document.getElementById("profile-btn");

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

// ✅ DOM Ready
document.addEventListener("DOMContentLoaded", function () {
    onAuthStateChanged(auth, async (user) => {
        if (!user) {
            window.location.href = "index.html";
            return;
        }

        userProfile.uid = user.uid;


        // ✅ Try loading user profile from localStorage
        const cachedProfile = localStorage.getItem("userProfile");
        if (cachedProfile) {
            try {
                const data = JSON.parse(cachedProfile);
                userProfile = {
                    ...userProfile,
                    ...data
                };
                fillProfileFieldsFromSaved();
                document.getElementById("sidebar-username").innerText = userProfile.firstName || "User";

                console.log("✅ Loaded profile from localStorage:");
                console.log("First Name:", userProfile.firstName);
                console.log("Last Name:", userProfile.lastName);
                console.log("Mobile:", userProfile.mobile);
                console.log("Email:", userProfile.email);
                console.log("City:", userProfile.city);
                console.log("UID:", userProfile.uid);
            } catch (err) {
                console.error("⚠️ Failed to parse cached profile:", err);
            }
        } else {
            // 🔁 Fallback to Firebase
            try {
                const snapshot = await get(ref(db, `users/${user.uid}`));
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    userProfile.firstName = data.firstName || "";
                    userProfile.lastName = data.lastName || "";
                    userProfile.mobile = data.mobile || "";
                    userProfile.email = data.email || "";
                    userProfile.city = data.city || "";
                    userProfile.uid = user.uid;

                    fillProfileFieldsFromSaved();
                    document.getElementById("sidebar-username").innerText = userProfile.firstName;
                    localStorage.setItem("userProfile", JSON.stringify(userProfile));

                    console.log("✅ Loaded profile from Firebase:");
                    console.log("First Name:", userProfile.firstName);
                    console.log("Last Name:", userProfile.lastName);
                    console.log("Mobile:", userProfile.mobile);
                    console.log("Email:", userProfile.email);
                    console.log("City:", userProfile.city);
                    console.log("UID:", userProfile.uid);
                } else {
                    console.warn("⚠️ No profile data found in DB.");
                }
            } catch (err) {
                console.error("❌ Error fetching profile from DB:", err);
            }
        }

        // ✅ Try loading Wi-Fi config from localStorage
        const cachedWiFi = localStorage.getItem("wifiConfig");
        if (cachedWiFi) {
            try {
                savedWiFiConfig = JSON.parse(cachedWiFi);
                fillWiFiFieldsFromSaved();

                console.log("✅ Loaded Wi-Fi config from localStorage:");
                console.log("SSID:", savedWiFiConfig.ssid);
                console.log("Password:", savedWiFiConfig.password);
            } catch (err) {
                console.error("⚠️ Failed to parse cached Wi-Fi config:", err);
            }
        } else {
            // 🔁 Fallback to Firebase
            try {
                const wifiSnapshot = await get(ref(db, "config/wifi"));
                if (wifiSnapshot.exists()) {
                    savedWiFiConfig = wifiSnapshot.val();
                    fillWiFiFieldsFromSaved();
                    localStorage.setItem("wifiConfig", JSON.stringify(savedWiFiConfig));

                    console.log("✅ Loaded Wi-Fi config from Firebase:");
                    console.log("SSID:", savedWiFiConfig.ssid);
                    console.log("Password:", savedWiFiConfig.password);
                } else {
                    console.warn("⚠️ No Wi-Fi config found in DB.");
                }
            } catch (err) {
                console.error("❌ Error fetching Wi-Fi config from DB:", err);
            }
        }
    });

    // 🔘 Logout button
    const logoutBtn = document.getElementById("log_out");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            signOut(auth).then(() => {
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

// 💾 Save Wi-Fi config
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
        await set(ref(db, "config/wifi"), {
            ssid,
            password
        });
        savedWiFiConfig = {
            ssid,
            password
        };

        Swal.fire({
            icon: "success",
            title: "Wi-Fi Saved",
            text: "Your SSID and Password have been updated."
        });

        document.querySelector(".sidebar2").classList.remove("show");
        document.getElementById("settings-btn").classList.remove("submenu-open");
    } catch (err) {
        console.error("❌ Error saving Wi-Fi:", err);
        alert("Error: " + err.message);
    }
});

// 💾 Save profile data
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
        await set(ref(db, `users/${uid}`), {
            firstName,
            lastName,
            mobile,
            email,
            city
        });

        // Update memory
        userProfile.firstName = firstName;
        userProfile.lastName = lastName;
        userProfile.mobile = mobile;
        userProfile.email = email;
        userProfile.city = city;

        // Update sidebar name
        document.getElementById("sidebar-username").innerText = firstName;

        Swal.fire({
            icon: "success",
            title: "Profile Updated",
            text: "Your profile information has been saved successfully."
        });

        document.querySelector(".sidebar3").classList.remove("show");
        document.getElementById("profile-btn").classList.remove("submenu-open");
    } catch (err) {
        console.error("❌ Error saving profile:", err);

        Swal.fire({
            icon: "error",
            title: "Update Failed",
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