import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-app.js";

import {
    getAuth,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    setPersistence,
    browserLocalPersistence,
    browserSessionPersistence,
    sendPasswordResetEmail,
    createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-auth.js";

import {
    getDatabase,
    ref,
    get,
    set,
    push,
    update
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

let isManualLoginOrSignup = false;


Swal.fire({
    title: "Checking Login...",
    text: "Please wait",
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading()
});

// ✅ Auto-redirect if already logged in
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        Swal.close(); // Only close if there's no user at all
        return;
    }

    if (isManualLoginOrSignup) {
        // Let manual process (login/signup) handle the spinner
        return;
    }
    Swal.fire({
        title: "Auto logging in...",
        text: "Please wait",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
    });

    await new Promise(resolve => setTimeout(resolve, 200));
    window.location.replace("dashboard.html");
});





// 👁️ Toggle login password visibility
document.getElementById("toggle-login-password").addEventListener("click", () => {
    const pwdFieldlogin = document.getElementById("login-password");
    const toggleIcon = document.getElementById("toggle-login-password");

    if (pwdFieldlogin.type === "password") {
        pwdFieldlogin.type = "text";
        toggleIcon.classList.replace("bx-show", "bx-hide");
    } else {
        pwdFieldlogin.type = "password";
        toggleIcon.classList.replace("bx-hide", "bx-show");
    }



});


// 👁️ Toggle signup password visibility
document.getElementById("toggle-signup-password").addEventListener("click", () => {
    const pwdFieldsignup = document.getElementById("signup-password");
    const toggleIcon = document.getElementById("toggle-signup-password");


    if (pwdFieldsignup.type === "password") {
        pwdFieldsignup.type = "text";
        toggleIcon.classList.replace("bx-show", "bx-hide");
    } else {
        pwdFieldsignup.type = "password";
        toggleIcon.classList.replace("bx-hide", "bx-show");
    }


});



// 🔐 Forgot Password Feature
document.getElementById("forgot-password-link").addEventListener("click", async () => {
    const {
        value: email
    } = await Swal.fire({
        title: "Forgot Password",
        input: "email",
        inputLabel: "Enter your registered email",
        inputPlaceholder: "you@example.com",
        confirmButtonText: "Send Reset Link",
        showCancelButton: true
    });

    if (email) {
        try {
            await sendPasswordResetEmail(auth, email);
            Swal.fire({
                icon: "success",
                title: "Reset Email Sent",
                text: `A password reset link was sent to: ${email}`
            });
        } catch (error) {
            console.error("❌ Password reset error:", error);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: error.message
            });
        }
    }
});

document.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
        // Determine which form is visible
        const loginVisible = document.getElementById("login-form").style.display !== "none";
        const signupVisible = document.getElementById("signup-form").style.display !== "none";

        if (loginVisible) {
            document.getElementById("show-login")?.click();
        } else if (signupVisible) {
            document.getElementById("show-signup")?.click();
        }
    }
});


// ✅ Login form handler (updated)
document.getElementById('show-login').addEventListener('click', async function (e) {
    e.preventDefault();


    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value.trim();
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
        isManualLoginOrSignup = true;

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

document.getElementById('show-signup')?.addEventListener('click', async function (e) {
    e.preventDefault();


    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value.trim();

    console.log("📨 Signup triggered with email:", email);

    if (!email || !email.includes("@") || !email.includes(".")) {
        console.warn("❌ Invalid email format");
        Swal.fire({
            icon: "warning",
            title: "Invalid Email"
        });
        return;
    }

    if (!password || password.length < 6) {
        console.warn("❌ Password too short");
        Swal.fire({
            icon: "warning",
            title: "Weak Password"
        });
        return;
    }

    try {
        isManualLoginOrSignup = true;

        Swal.fire({
            title: "Creating account...",
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const uid = userCredential.user.uid;
        console.log("✅ User created with UID:", uid);

        // 🔢 Get last home number
        const numberRef = ref(db, "NexInnovation-config/lastNumber");
        const snapshot = await get(numberRef);
        let lastNumber = 0;

        if (snapshot.exists()) {
            lastNumber = parseInt(snapshot.val());
            console.log("🔢 Last number found:", lastNumber);
        } else {
            console.warn("⚠️ No lastNumber found, starting from 0000");
        }

        const newNumber = lastNumber + 1;
        const numberStr = String(newNumber).padStart(4, "0");
        const pushKey = push(ref(db)).key;
        const homeId = `home${numberStr}-${pushKey}`;
        console.log("🏠 Generated homeId:", homeId);

        // 📌 Save updated last number
        await update(ref(db, "NexInnovation-config"), {
            lastNumber: newNumber
        });
        console.log("✅ Updated NexInnovation-config/lastNumber:", newNumber);

        const userData = {
            uid,
            email,
            role: "admin",
            isAdmin: true,
            homeId,
            createdAt: new Date().toISOString()
        };

        // ✅ Store inside automation path
        await set(ref(db, `automation/${homeId}/user/${uid}`), userData);
        console.log("✅ User stored in automation path:", `automation/${homeId}/user/${uid}`);

        // ✅ Store global user reference
        await set(ref(db, `users/${uid}`), {
            homeId,
            role: "admin"
        });
        console.log("✅ User reference stored in users path:", `users/${uid}`);

        Swal.close();

        // ❗ Temporarily commenting out redirect
        window.location.href = "dashboard.html";
        console.log("✅ Signup completed — redirect is disabled for debugging");

    } catch (error) {
        console.error("❌ Signup failed:", error);
        Swal.fire({
            icon: "error",
            title: "Signup Failed",
            text: error.message
        });
    }
});