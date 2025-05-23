import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-app.js";
import {
    getAuth,
    createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-auth.js";
import {
    getDatabase,
    ref,
    set,
    push,
    get,
    update
} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-database.js";

// ✅ Firebase configuration for NexInnovation
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

// 📝 Handle Sign Up
document.getElementById("signup-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const firstName = document.getElementById("firstName").value.trim();
    const lastName = document.getElementById("lastName").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    console.log("🧾 Form Data Collected:");
    console.log("First Name:", firstName);
    console.log("Last Name:", lastName);
    console.log("Email:", email);

    try {
        // 🔐 Create user
        console.log("🔐 Creating user with email and password...");
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const uid = userCredential.user.uid;
        console.log("✅ User created with UID:", uid);

        // 🔢 Get and increment lastHomeNumber (start from 0000 if not exists)
        const numberRef = ref(db, "config/lastHomeNumber");
        const snapshot = await get(numberRef);

        let lastNumber = 0;

        if (snapshot.exists()) {
            lastNumber = parseInt(snapshot.val());
            console.log("✅ Last home number found:", lastNumber);
        } else {
            console.warn("⚠️ lastHomeNumber not found. Defaulting to 0000.");
        }

        const newNumber = lastNumber + 1;
        const numberStr = String(newNumber).padStart(4, "0");
        console.log("➡️ New 4-digit home number:", numberStr);

        // 🔐 Save updated number back to DB
        await update(ref(db, "config"), {
            lastHomeNumber: newNumber
        });
        console.log("📌 Updated config/lastHomeNumber to:", newNumber);

        // 🆔 Generate homeId with push key
        const pushKey = push(ref(db)).key;
        const homeId = `home${numberStr}-${pushKey}`;
        console.log("🏠 Final homeId generated:", homeId);

        // 🏡 Prepare user data
        const userData = {
            uid: uid,
            firstName: firstName,
            lastName: lastName,
            email: email,
            role: "admin",
            isAdmin: true,
            createdAt: new Date().toISOString()
        };

        // 📤 Save user inside home
        await set(ref(db, `homes/${homeId}/users/${uid}`), userData);
        console.log(`✅ Saved admin user to /homes/${homeId}/users/${uid}`);

        // 📤 Save user global reference
        await set(ref(db, `users/${uid}`), {
            homeId,
            role: "admin"
        });
        console.log(`✅ Saved global user reference at /users/${uid}`);

        // 💾 Save to localStorage
        localStorage.setItem("firstName", firstName);
        localStorage.setItem("homeId", homeId);
        console.log("💾 Saved firstName and homeId to localStorage.");

        // ✅ Redirect to dashboard
        console.log("➡️ Redirecting to dashboard.html...");
        window.location.href = "dashboard.html";

    } catch (error) {
        console.error("❌ Sign Up Failed:", error);
        alert("Sign Up Failed: " + error.message);
    }
});