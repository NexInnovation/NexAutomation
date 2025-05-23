import {
    auth,
    db
} from './firebase-init.js';
import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-auth.js";
import {
    ref,
    get
} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-database.js";
import {
    fetchAndCache,
    getFromStorage,
    clearLocalStorageCache
} from './utils.js';
import {
    initSidebarButtons
} from './buttons.js';


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

document.addEventListener("DOMContentLoaded", function () {
    Swal.fire({
        title: "Loading Dashboard...",
        text: "Fetching user data",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
    });

    onAuthStateChanged(auth, async (user) => {
        if (!user) return window.location.href = "index.html";
        Swal.close();
        userProfile.uid = user.uid;

        const cachedProfile = getFromStorage("userProfile");
        if (cachedProfile) {
            Object.assign(userProfile, cachedProfile);
            document.getElementById("sidebar-username").innerText = userProfile.firstName || "User";
        } else {
            const data = await fetchAndCache(`users/${user.uid}`, "userProfile", db);
            if (data) {
                Object.assign(userProfile, data);
                document.getElementById("sidebar-username").innerText = userProfile.firstName;
            }
        }

        const cachedWiFi = getFromStorage("wifiConfig");
        if (cachedWiFi) {
            savedWiFiConfig = cachedWiFi;
        } else {
            const wifi = await fetchAndCache("config/wifi", "wifiConfig", db);
            if (wifi) savedWiFiConfig = wifi;
        }
    });

    document.getElementById("log_out").addEventListener("click", () => {
        signOut(auth).then(() => {
            clearLocalStorageCache();
            window.location.href = "index.html";
        }).catch((err) => alert("Logout failed: " + err.message));
    });

    // ✅ Call button toggles here
    initSidebarButtons();
});

export {
    savedWiFiConfig,
    userProfile
};