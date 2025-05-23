import {
    initializeApp,
    getAuth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    setPersistence,
    browserLocalPersistence,
    browserSessionPersistence,
    getDatabase,
    ref,
    get,
    set,
    update,
    push
} from '../firebase-module.js';
import {
    validateInputs
} from './function.js';
import {
    DB_PATHS
} from '../db-paths.js';

// 🔧 Your Firebase project configuration
const firebaseConfig = {
    apiKey: "AIzaSyD3GvlENwkMR6Khab1g-qT6WukrCVUwGSs",
    authDomain: "nexinnovation-login.firebaseapp.com",
    databaseURL: "https://nexinnovation-login-default-rtdb.firebaseio.com",
    projectId: "nexinnovation-login",
    storageBucket: "nexinnovation-login.appspot.com",
    messagingSenderId: "558802849966",
    appId: "1:558802849966:web:4339bb803ed781a5ecdd3f"
};

// ✅ Initialize Firebase services
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// 🔘 Get references to Login and Signup buttons
const loginBtn = document.getElementById("show-login");
const signupBtn = document.getElementById("show-signup");

let isManualLoginOrSignup = false;

// ✅ On login Button Click
loginBtn.addEventListener("click", async () => {
    // 🔍 Get login form data
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value.trim();
    const remember = document.getElementById('rememberMe').checked;

    console.log("📥 Login email:", email);
    console.log("🔐 Password entered:", password ? "(hidden for security)" : "(empty)");
    console.log("🧠 Remember me checked:", remember);

    // ❌ Validate inputs
    if (!validateInputs(email, password)) {
        console.warn("❌ Input validation failed. Aborting login.");
        return;
    }

    // 🔁 Choose persistence method: session vs local
    const persistenceType = remember ? browserLocalPersistence : browserSessionPersistence;
    console.log("💾 Persistence type set to:", remember ? "Local (Remember Me)" : "Session");

    try {
        // ⏳ Show loading spinner
        Swal.fire({
            title: "Logging in...",
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });

        isManualLoginOrSignup = true;

        // 🔐 Set session or persistent login
        await setPersistence(auth, persistenceType);
        console.log("✅ Firebase persistence set.");

        // ✅ Attempt to log in
        const userCred = await signInWithEmailAndPassword(auth, email, password);
        const uid = userCred.user.uid;
        console.log("✅ Logged in with UID:", uid);

        //*************************************************************************************************
        // 🔍 Step 1: Fetch user's homeId and role from /users/uid
        // const userRef = ref(db, `users/${uid}`);
        // console.log("📡 Fetching user mapping from:", `users/${uid}`);
        // const userSnap = await get(userRef);
        const userRef = ref(db, DB_PATHS.userMapping(uid));
        console.log("📡 Fetching user mapping from:", DB_PATHS.userMapping(uid));
        const userSnap = await get(userRef);

        if (!userSnap.exists()) {
            throw new Error("User mapping not found in 'users' path.");
        }

        const {
            homeId,
            role
        } = userSnap.val();
        console.log("🏠 Home ID:", homeId, "🎖️ Role:", role);

        //*************************************************************************************************
        // 🔍 Step 2: Fetch full profile from automation/homeId/user/uid
        // const profileRef = ref(db, `automation/${homeId}/user/${uid}`);
        // console.log("📡 Fetching full profile from:", `automation/${homeId}/user/${uid}`);
        // const profileSnap = await get(profileRef);
        const profileRef = ref(db, DB_PATHS.userProfile(homeId, uid));
        console.log("📡 Fetching full profile from:", DB_PATHS.userProfile(homeId, uid));
        const profileSnap = await get(profileRef);

        if (!profileSnap.exists()) {
            throw new Error("Full profile not found in 'automation' path.");
        }

        const fullProfile = profileSnap.val();
        console.log("📦 Full profile loaded:", fullProfile);

        sessionStorage.setItem("firstName", fullProfile.firstName || "");
        sessionStorage.setItem("lastName", fullProfile.lastName || "");
        sessionStorage.setItem("mobile", fullProfile.mobile || "");
        sessionStorage.setItem("city", fullProfile.city || "");
        sessionStorage.setItem("email", fullProfile.email || "");
        sessionStorage.setItem("uid", uid || "");
        sessionStorage.setItem("homeId", homeId || "");
        sessionStorage.setItem("role", role || "");
        sessionStorage.setItem("userProfile", JSON.stringify(fullProfile));

        console.log("🗂️ User session data saved:");
        console.log("👤 First Name:", sessionStorage.getItem("firstName"));
        console.log("👤 Last Name:", sessionStorage.getItem("lastName"));
        console.log("📱 Mobile:", sessionStorage.getItem("mobile"));
        console.log("🌆 City:", sessionStorage.getItem("city"));
        console.log("📧 Email:", sessionStorage.getItem("email"));
        console.log("🧾 UID:", sessionStorage.getItem("uid"));
        console.log("🏠 Home ID:", sessionStorage.getItem("homeId"));
        console.log("🎖️ Role:", sessionStorage.getItem("role"));

        //*************************************************************************************************
        // 🔍 Step 3: Fetch Wi-Fi Config
        // const wifiRef = ref(db, `automation/${homeId}/home-config/wifi-config`);
        // console.log("📡 Fetching Wi-Fi config from:", `automation/${homeId}/home-config/wifi-config`);
        const wifiRef = ref(db, DB_PATHS.wifiConfig(homeId));
        console.log("📡 Fetching Wi-Fi config from:", DB_PATHS.wifiConfig(homeId));

        try {
            const wifiSnap = await get(wifiRef);
            let wifiConfig = {};

            if (wifiSnap.exists()) {
                wifiConfig = wifiSnap.val();
                console.log("📶 Wi-Fi config loaded:", wifiConfig);
            } else {
                console.warn("⚠️ No Wi-Fi config found. Saving empty config.");
            }

            // 💾 Save full object
            sessionStorage.setItem("wifiConfig", JSON.stringify(wifiConfig));

            // 💾 Save individual values
            sessionStorage.setItem("ssid", wifiConfig.ssid || "");
            sessionStorage.setItem("password", wifiConfig.password || "");
        } catch (err) {
            console.error("❌ Failed to fetch Wi-Fi config:", err);

            // Save empty fallback
            sessionStorage.setItem("wifiConfig", JSON.stringify({}));
            sessionStorage.setItem("ssid", "");
            sessionStorage.setItem("password", "");
        }



        Swal.close();
        window.location.href = "dashboard.html";
    } catch (error) {
        Swal.close();
        console.error("❌ Login failed with error:", error);

        let message = "Login failed. Please try again.";

        if (error.code === "auth/invalid-credential") {
            message = "Invalid email or password.";
        } else if (error.code === "auth/user-not-found") {
            message = "User not found. Please sign up first.";
        } else if (error.code === "auth/wrong-password") {
            message = "Incorrect password.";
        }

        Swal.fire({
            icon: "error",
            title: "Login Failed",
            text: message
        });
    }
});


// ✅ On Signup Button Click
// signupBtn.addEventListener("click", async () => {
//     const email = document.getElementById("signup-email").value.trim();
//     const password = document.getElementById("signup-password").value.trim();

//     console.log("📧 Email entered:", email);
//     console.log("🔑 Password entered:", password ? "(hidden for security)" : "(empty)");

//     // ✅ Validate inputs
//     if (!validateInputs(email, password)) {
//         console.warn("⚠️ Validation failed for email or password.");
//         return;
//     }

//     try {
//         Swal.fire({
//             title: "Creating account...",
//             allowOutsideClick: false,
//             didOpen: () => Swal.showLoading()
//         });

//         console.log("🚀 Creating Firebase Auth account...");

//         // ✅ Create user in Firebase Auth
//         const userCredential = await createUserWithEmailAndPassword(auth, email, password);
//         const uid = userCredential.user.uid;
//         console.log("✅ Firebase user created with UID:", uid);

//         // ✅ Get last used home number
//         console.log("📡 Fetching last used home number...");
//         const lastNumberSnap = await get(ref(db, "NexInnovation-config/lastNumber"));
//         let lastNumber = 0;

//         if (lastNumberSnap.exists()) {
//             lastNumber = parseInt(lastNumberSnap.val());
//             console.log("📥 Last home number from DB:", lastNumber);
//         } else {
//             console.warn("⚠️ No lastNumber found in DB. Using default 0000.");
//         }

//         const newNumber = lastNumber + 1;
//         const numberStr = String(newNumber).padStart(4, "0");

//         const pushKey = push(ref(db)).key;
//         console.log("🔑 Firebase Push Key generated:", pushKey);

//         const homeId = `home${numberStr}-${pushKey}`;
//         console.log("🏠 Final Home ID:", homeId);

//         // ✅ Update last number in DB
//         // await update(ref(db, "NexInnovation-config"), {
//         //     lastNumber: newNumber
//         // });
//         // console.log("✅ Updated NexInnovation-config/lastNumber to:", newNumber);
//         await update(ref(db, DB_PATHS.lastDeviceNumber.split('/')[0]), {
//             lastNumber: newNumber
//         });
//         console.log("✅ Updated NexInnovation-config/lastNumber to:", newNumber);

//         // ✅ Store user details under automation
//         const userData = {
//             uid,
//             email,
//             role: "admin",
//             isAdmin: true,
//             homeId,
//             createdAt: new Date().toISOString()
//         };
//         console.log("📤 Saving user data to automation path:", userData);

//         await set(ref(db, DB_PATHS.userProfile(homeId, uid)), userData);
//         console.log(`✅ Data saved to ${DB_PATHS.userProfile(homeId, uid)}`);

//         // ✅ Store home ID and role globally
//         const globalUserRef = {
//             homeId,
//             role: "admin"
//         };
//         await set(ref(db, DB_PATHS.userMapping(uid)), globalUserRef);
//         console.log("📤 Stored user global mapping at", DB_PATHS.userMapping(uid), ":", globalUserRef);

//         // ✅ Save to sessionStorage
//         sessionStorage.setItem("uid", uid);
//         sessionStorage.setItem("homeId", homeId);
//         sessionStorage.setItem("email", email);
//         sessionStorage.setItem("role", "admin");
//         console.log("🗂️ Saved sessionStorage:", {
//             uid,
//             homeId,
//             email,
//             role: "admin"
//         });

//         Swal.close();
//         console.log("🎯 Signup completed successfully. Ready to redirect to dashboard.");

//         // ✅ Redirect to dashboard
//         window.location.href = "dashboard.html";

//     } catch (error) {
//         console.error("❌ Signup failed with error:", error);

//         let message = "Signup failed. Please try again.";

//         if (error.code === "auth/email-already-in-use") {
//             message = "This email is already registered. Try logging in or use 'Forgot Password'.";
//         } else if (error.code === "auth/invalid-email") {
//             message = "The email address is badly formatted.";
//         } else if (error.code === "auth/weak-password") {
//             message = "Password should be at least 6 characters.";
//         }

//         Swal.fire({
//             icon: "warning",
//             title: "Signup Error",
//             text: message,
//             confirmButtonText: "OK"
//         });
//     }
// });

signupBtn.addEventListener("click", async () => {
    const email = document.getElementById("signup-email").value.trim();
    const password = document.getElementById("signup-password").value.trim();

    console.log("📧 Email entered:", email);
    console.log("🔑 Password entered:", password ? "(hidden for security)" : "(empty)");

    if (!validateInputs(email, password)) {
        console.warn("⚠️ Validation failed for email or password.");
        return;
    }

    try {
        Swal.fire({
            title: "Creating account...",
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const uid = userCredential.user.uid;
        console.log("✅ Firebase user created with UID:", uid);

        const lastNumberSnap = await get(ref(db, "NexInnovation-config/lastNumber"));
        let lastNumber = lastNumberSnap.exists() ? parseInt(lastNumberSnap.val()) : 0;
        const newNumber = lastNumber + 1;
        const numberStr = String(newNumber).padStart(4, "0");
        const pushKey = push(ref(db)).key;
        const homeId = `home${numberStr}-${pushKey}`;
        console.log("🏠 Generated Home ID:", homeId);

        await update(ref(db, "NexInnovation-config"), {
            lastNumber: newNumber
        });

        const userData = {
            uid,
            email,
            role: "admin",
            isAdmin: true,
            homeId,
            createdAt: new Date().toISOString(),
            firstName: "",
            lastName: "",
            mobile: "",
            city: ""
        };

        await set(ref(db, DB_PATHS.userProfile(homeId, uid)), userData);
        await set(ref(db, DB_PATHS.userMapping(uid)), {
            homeId,
            role: "admin"
        });

        // Optional: Initialize empty Wi-Fi config in DB
        await set(ref(db, DB_PATHS.wifiConfig(homeId)), {
            ssid: "",
            password: ""
        });

        // 💾 Save to sessionStorage
        sessionStorage.setItem("firstName", userData.firstName);
        sessionStorage.setItem("lastName", userData.lastName);
        sessionStorage.setItem("mobile", userData.mobile);
        sessionStorage.setItem("city", userData.city);
        sessionStorage.setItem("email", userData.email);
        sessionStorage.setItem("uid", uid);
        sessionStorage.setItem("homeId", homeId);
        sessionStorage.setItem("role", userData.role);
        sessionStorage.setItem("userProfile", JSON.stringify(userData));

        sessionStorage.setItem("ssid", "");
        sessionStorage.setItem("password", "");
        sessionStorage.setItem("wifiConfig", JSON.stringify({
            ssid: "",
            password: ""
        }));

        console.log("🗂️ SessionStorage saved after signup.");
        Swal.close();
        window.location.href = "dashboard.html";

    } catch (error) {
        Swal.close();
        console.error("❌ Signup failed:", error);

        let message = "Signup failed. Please try again.";
        if (error.code === "auth/email-already-in-use") {
            message = "This email is already registered. Try logging in or use 'Forgot Password'.";
        } else if (error.code === "auth/invalid-email") {
            message = "The email address is badly formatted.";
        } else if (error.code === "auth/weak-password") {
            message = "Password should be at least 6 characters.";
        }

        Swal.fire({
            icon: "warning",
            title: "Signup Error",
            text: message,
            confirmButtonText: "OK"
        });
    }
});