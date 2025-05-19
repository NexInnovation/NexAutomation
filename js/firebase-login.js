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

// ✅ Auto-redirect if already logged in
onAuthStateChanged(auth, (user) => {
    if (user) {
        window.location.replace("dashboard.html");
    }
});

// ✅ Login form handler (updated)
document.querySelector('.login100-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const remember = document.getElementById('rememberMe').checked;

    const persistenceType = remember ? browserLocalPersistence : browserSessionPersistence;

    try {
        await setPersistence(auth, persistenceType);
        const credential = await signInWithEmailAndPassword(auth, email, password);

        // ✅ Fetch first name from DB
        const user = credential.user;
        const nameRef = ref(db, `users/${user.uid}/firstName`);
        const snapshot = await get(nameRef);

        if (snapshot.exists()) {
            localStorage.setItem("firstName", snapshot.val());
        }

        window.location.href = "dashboard.html";
    } catch (error) {
        alert("Login failed: " + error.message);
    }
});