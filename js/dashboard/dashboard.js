import {
    initializeApp,
    getDatabase,
    getAuth,
    onAuthStateChanged
} from '../firebase-module.js'

import {
    performLogout
} from './logic-functions.js';


export {
    auth,
    db
}
// ✅ SweetAlert2 (ensure it's already included in your HTML via CDN)
// Example in HTML: <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>

// ✅ Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyD3GvlENwkMR6Khab1g-qT6WukrCVUwGSs",
    authDomain: "nexinnovation-login.firebaseapp.com",
    databaseURL: "https://nexinnovation-login-default-rtdb.firebaseio.com",
    projectId: "nexinnovation-login",
    storageBucket: "nexinnovation-login.appspot.com",
    messagingSenderId: "558802849966",
    appId: "1:558802849966:web:4339bb803ed781a5ecdd3f"
};

// ✅ Initialize Firebase App
const app = initializeApp(firebaseConfig);

// ✅ Initialize Auth and DB
const auth = getAuth(app);
const db = getDatabase(app); // Optional use in other scripts

import {
    fillMemberListSidebarFromSession,
    fillProfileFieldsFromSession,
    fillWiFiFieldsFromSession
}
from './data-fill-functions.js';

let is_manual_signout = false;
let signout_pressed = false;

// 🌐 dashboard.js — executed when dashboard page loads
document.addEventListener("DOMContentLoaded", async () => {
    Swal.fire({
        title: "Loading Dashboard...",
        text: "Fetching user data",
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    console.log("📦 dashboard.js loaded");

    // ✅ Session Validation on Page Load
    onAuthStateChanged(auth, async (user) => {
        if (!user && !is_manual_signout) {
            console.warn("❌ No user found. Redirecting...");
            Swal.fire({
                icon: "warning",
                title: "Not Logged In",
                text: "Please log in to access the dashboard.",
                timer: 500,
                // confirmButtonText: "OK"
                showConfirmButton: false,
                timerProgressBar: true
            }).then(() => {
                window.location.href = "index.html"; // Or your login page
            });
        }


        console.log("inside is_login_session_available");
        // ✅ Check if userProfile exists in sessionStorage
        const userProfileRaw = sessionStorage.getItem("userProfile");
        if (!userProfileRaw && !signout_pressed) {
            console.warn("❌ No userProfile found. Logging out...");
            await performLogout();
            return;
        }

        // ✅ Parse userProfile JSON
        const userProfile = JSON.parse(userProfileRaw);

        // ✅ Retrieve other session data
        const uid = sessionStorage.getItem("uid");
        const homeId = sessionStorage.getItem("homeId");
        const role = sessionStorage.getItem("role");

        // 🧾 Log for debug
        console.log("🧾 UID:", uid);
        console.log("🏠 Home ID:", homeId);
        console.log("👤 Role:", role);
        console.log("📧 Email:", userProfile?.email || "Not found");
        console.log("📱 Mobile:", userProfile?.mobile || "Not found");
        console.log("🌆 City:", userProfile?.city || "Not found");

        // ⏱️ Add 1 second delay before filling form
        // await new Promise(resolve => setTimeout(resolve, 500));

        if (!is_manual_signout) {
            fillProfileFieldsFromSession();
            fillWiFiFieldsFromSession();
            fillMemberListSidebarFromSession();
        }

        Swal.close();
        // setTimeout(() => {
        //     Swal.close();
        // }, 500);

    });


});

// ✅ Logout Handler
document.getElementById("log_out")?.addEventListener("click", async () => {
    is_manual_signout = true;
    signout_pressed = true;
    await performLogout();
});