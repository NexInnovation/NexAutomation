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

// ✅ Global Wi-Fi config cache
let savedWiFiConfig = {
    ssid: "",
    password: ""
};

document.addEventListener("DOMContentLoaded", function () {
    console.log("DOM fully loaded and script initialized");

    // 🔒 Redirect if not logged in
    onAuthStateChanged(auth, async (user) => {
        if (!user) {
            window.location.href = "index.html";
            return;
        }

        // ✅ Fetch saved Wi-Fi config and cache it
        try {
            const wifiRef = ref(db, "config/wifi");
            const snapshot = await get(wifiRef);
            if (snapshot.exists()) {
                savedWiFiConfig = snapshot.val();
                console.log("✅ Wi-Fi config cached:", savedWiFiConfig);
            } else {
                console.warn("⚠️ No Wi-Fi config found in DB.");
            }
        } catch (err) {
            console.error("❌ Error fetching Wi-Fi config:", err);
        }

        // ✅ Fetch user name from DB if not already set
        const nameDisplay = document.getElementById("sidebar-username");
        const localName = localStorage.getItem("firstName");

        if (localName && nameDisplay) {
            nameDisplay.innerText = localName;
        }

        if (!localName && nameDisplay) {
            const nameRef = ref(db, `users/${user.uid}/firstName`);
            try {
                const snapshot = await get(nameRef);
                if (snapshot.exists()) {
                    const name = snapshot.val();
                    localStorage.setItem("firstName", name);
                    nameDisplay.innerText = name;
                } else {
                    nameDisplay.innerText = "Name not found";
                }
            } catch (err) {
                console.error("Error fetching name from DB:", err);
                nameDisplay.innerText = "Error loading name";
            }
        }
    });

    // ✅ Logout handler
    const logoutBtn = document.getElementById("log_out");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            console.log("Logging out...");
            localStorage.removeItem("firstName");

            signOut(auth)
                .then(() => {
                    window.location.href = "index.html";
                })
                .catch((err) => {
                    alert("Logout failed: " + err.message);
                });
        });
    }

    // ✅ Sidebar logic
    let sidebar = document.querySelector(".sidebar");
    let sidebar2 = document.querySelector(".sidebar2");
    let sidebar3 = document.querySelector(".sidebar3");
    let closeBtn = document.querySelector("#btn");
    let settingsBtn = document.querySelector("#settings-btn");
    let profileBtn = document.querySelector("#profile-btn");

    console.log("sidebar:", sidebar);
    console.log("sidebar2:", sidebar2);
    console.log("closeBtn (#btn):", closeBtn);
    console.log("settingsBtn (#settings-btn):", settingsBtn);

    if (sidebar && sidebar2 && closeBtn && settingsBtn) {
        closeBtn.addEventListener("click", () => {
            sidebar.classList.toggle("open");
            adjustSidebar2();
            menuBtnChange();
        });

        // ✅ Show saved Wi-Fi instantly from cache when Settings opens
        settingsBtn.addEventListener("click", () => {
            sidebar2.classList.toggle("show");
            settingsBtn.classList.toggle("submenu-open");
            adjustSidebar2();

            if (sidebar2.classList.contains("show")) {
                document.getElementById("ssid").value = savedWiFiConfig.ssid || "";
                document.getElementById("password").value = savedWiFiConfig.password || "";
            }
        });

        function menuBtnChange() {
            if (sidebar.classList.contains("open")) {
                closeBtn.classList.replace("bx-menu", "bx-menu-alt-right");
            } else {
                closeBtn.classList.replace("bx-menu-alt-right", "bx-menu");
            }
        }

        function adjustSidebar2() {
            if (!sidebar2.classList.contains("show")) return;

            sidebar2.style.left = sidebar.classList.contains("open") ? "255px" : "83px";
            const settingTop = settingsBtn.getBoundingClientRect().top + window.scrollY;
            sidebar2.style.top = `${settingTop}px`;
            const remainingHeight = window.innerHeight - settingTop - 10;
            sidebar2.style.height = `${remainingHeight}px`;
        }

        function hasUnsavedChanges() {
            const ssid = document.getElementById("ssid")?.value.trim();
            const password = document.getElementById("password")?.value.trim();

            return ssid !== (savedWiFiConfig.ssid || "") || password !== (savedWiFiConfig.password || "");
        }


        document.addEventListener("click", function (event) {
            const isClickInsideSidebar2 = sidebar2.contains(event.target);
            const isClickOnSettingsBtn = settingsBtn.contains(event.target);

            if (!isClickInsideSidebar2 && !isClickOnSettingsBtn) {
                if (sidebar2.classList.contains("show") && hasUnsavedChanges()) {
                    const confirmClose = confirm("You have unsaved changes. Do you want to discard them?");
                    if (!confirmClose) return;
                }

                sidebar2.classList.remove("show");
                settingsBtn.classList.remove("submenu-open");
            }
        });

        document.addEventListener("keydown", function (event) {
            if (event.key === "Escape" && sidebar2.classList.contains("show")) {
                if (hasUnsavedChanges()) {
                    const confirmClose = confirm("You have unsaved changes. Do you want to discard them?");
                    if (!confirmClose) return;
                }

                sidebar2.classList.remove("show");
                settingsBtn.classList.remove("submenu-open");
            }
        });
    }
    if (sidebar3 && profileBtn) {
        profileBtn.addEventListener("click", () => {
            sidebar3.classList.toggle("show");
            profileBtn.classList.toggle("submenu-open");
            adjustSidebar3();
        });

        function adjustSidebar3() {
            if (!sidebar3.classList.contains("show")) return;

            sidebar3.style.left = sidebar.classList.contains("open") ? "255px" : "83px";
            const profileTop = profileBtn.getBoundingClientRect().top + window.scrollY;
            sidebar3.style.top = `${profileTop}px`;
            const remainingHeight = window.innerHeight - profileTop - 10;
            sidebar3.style.height = `${remainingHeight}px`;
        }

        // Optional: close sidebar3 on outside click
        document.addEventListener("click", function (event) {
            const isClickInsideSidebar3 = sidebar3.contains(event.target);
            const isClickOnProfileBtn = profileBtn.contains(event.target);

            if (!isClickInsideSidebar3 && !isClickOnProfileBtn) {
                sidebar3.classList.remove("show");
                profileBtn.classList.remove("submenu-open");
            }
        });

        // Optional: close on Escape key
        document.addEventListener("keydown", function (event) {
            if (event.key === "Escape" && sidebar3.classList.contains("show")) {
                sidebar3.classList.remove("show");
                profileBtn.classList.remove("submenu-open");
            }
        });
    } else {
        console.warn("One or more required elements not found. Script not fully initialized.");
    }


});



const form = document.getElementById("wifi-form");

form.addEventListener("submit", async (e) => {
    e.preventDefault(); // Prevent page reload

    const ssid = document.getElementById("ssid").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!ssid || !password) {
        alert("Please fill in both SSID and Password.");
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

        alert("✅ Wi-Fi settings saved successfully.");

        document.querySelector(".sidebar2").classList.remove("show");
        document.querySelector("#settings-btn").classList.remove("submenu-open");

    } catch (err) {
        console.error("❌ Failed to save Wi-Fi config:", err);
        alert("Error saving to Firebase: " + err.message);
    }
});