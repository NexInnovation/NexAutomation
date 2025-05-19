import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-app.js";

import {
    getAuth,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-auth.js";

import {
    getDatabase,
    ref,
    set
} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-database.js";

// Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyD3GvlENwkMR6Khab1g-qT6WukrCVUwGSs",
    authDomain: "nexinnovation-login.firebaseapp.com",
    databaseURL: "https://nexinnovation-login-default-rtdb.firebaseio.com",
    projectId: "nexinnovation-login",
    storageBucket: "nexinnovation-login.appspot.com",
    messagingSenderId: "558802849966",
    appId: "1:558802849966:web:4339bb803ed781a5ecdd3f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// Wait for auth state
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.replace("index.html");
    } else {
        document.getElementById("profile-form").addEventListener("submit", async (e) => {
            e.preventDefault();

            const fname = document.getElementById("fname").value.trim();
            const lname = document.getElementById("lname").value.trim();
            const mobile = document.getElementById("mobile").value.trim();
            const city = document.getElementById("city").value.trim();

            try {
                await set(ref(db, "users/" + user.uid), {
                    firstName: fname,
                    lastName: lname,
                    mobile: mobile,
                    city: city,
                    email: user.email
                });

                document.getElementById("status").innerText = "✅ Profile saved!";
                setTimeout(() => {
                    window.location.href = "dashboard.html";
                }, 1500);
            } catch (error) {
                document.getElementById("status").innerText = "❌ Error: " + error.message;
            }
        });
    }
});