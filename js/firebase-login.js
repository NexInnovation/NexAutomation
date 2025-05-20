import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-app.js";

import {
    getAuth,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    setPersistence,
    browserLocalPersistence,
    browserSessionPersistence
} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-auth.js";

import {
    getDatabase,
    ref,
    get
} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-database.js";

// Firebase Config
const firebaseConfig = {
    apiKey: "AIzaSyD3GvlENwkMR6Khab1g-qT6WukrCVUwGSs",
    authDomain: "nexinnovation-login.firebaseapp.com",
    databaseURL: "https://nexinnovation-login-default-rtdb.firebaseio.com",
    projectId: "nexinnovation-login",
    storageBucket: "nexinnovation-login.appspot.com",
    messagingSenderId: "558802849966",
    appId: "1:558802849966:web:4339bb803ed781a5ecdd3f"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

Swal.fire({
    title: "Checking Login...",
    text: "Please wait",
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading()
});

// ✅ Auto-redirect if already logged in
onAuthStateChanged(auth, async (user) => {
    if (user) {
        Swal.fire({
            title: "Auto logging in...",
            text: "Please wait",
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });

        await new Promise(resolve => setTimeout(resolve, 200));
        window.location.replace("dashboard.html");
    } else {
        Swal.close();
    }
});

// ✅ Login form handler (updated)
document.querySelector('.login100-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const remember = document.getElementById('rememberMe').checked;

    // ✅ Input validation
    if (!email || !email.includes("@") || !email.includes(".")) {
        Swal.fire({
            icon: "warning",
            title: "Invalid Email",
            text: "Please enter a valid email address.",
            confirmButtonText: "OK"
        });
        return;
    }

    if (!password) {
        Swal.fire({
            icon: "warning",
            title: "Missing Password",
            text: "Please enter your password.",
            confirmButtonText: "OK"
        });
        return;
    }

    const persistenceType = remember ? browserLocalPersistence : browserSessionPersistence;

    try {
        Swal.fire({
            title: "Logging in...",
            text: "Please wait",
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        await setPersistence(auth, persistenceType);
        const credential = await signInWithEmailAndPassword(auth, email, password);
        const user = credential.user;

        // ✅ Fetch full profile
        const profileRef = ref(db, `users/${user.uid}`);
        const profileSnapshot = await get(profileRef);

        if (profileSnapshot.exists()) {
            const profile = profileSnapshot.val();
            const fullProfile = {
                firstName: profile.firstName || "",
                lastName: profile.lastName || "",
                mobile: profile.mobile || "",
                email: profile.email || "",
                city: profile.city || "",
                uid: user.uid
            };
            localStorage.setItem("userProfile", JSON.stringify(fullProfile));
        }

        // ✅ Fetch Wi-Fi config
        const wifiRef = ref(db, "config/wifi");
        const wifiSnapshot = await get(wifiRef);
        if (wifiSnapshot.exists()) {
            const wifi = wifiSnapshot.val();
            const wifiConfig = {
                ssid: wifi.ssid || "",
                password: wifi.password || ""
            };
            localStorage.setItem("wifiConfig", JSON.stringify(wifiConfig));
        }

        Swal.close(); // ✅ Close loading spinner
        window.location.href = "dashboard.html";

    } catch (error) {
        Swal.close(); // ✅ Close spinner on error

        console.error("❌ Login failed:", error);

        let message = "Login failed. Please try again.";
        if (error.code === "auth/invalid-credential") {
            message = "Invalid email or password.";
        } else if (error.code === "auth/network-request-failed") {
            message = "Network error. Please check your internet connection.";
        }

        Swal.fire({
            icon: "error",
            title: "Login Failed",
            text: message,
            confirmButtonText: "OK"
        });
    }
});


// 👁️ Toggle password visibility
document.getElementById("toggle-login-password").addEventListener("click", () => {
    const pwdField = document.getElementById("password");
    const toggleIcon = document.getElementById("toggle-login-password");

    if (pwdField.type === "password") {
        pwdField.type = "text";
        toggleIcon.classList.replace("bx-show", "bx-hide");
    } else {
        pwdField.type = "password";
        toggleIcon.classList.replace("bx-hide", "bx-show");
    }
});