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

// Firebase Config
const firebaseConfig = {
    apiKey: "AIzaSyD3GvlENwkMR6Khab1g-qT6WukrCVUwGSs",
    authDomain: "nexinnovation-login.firebaseapp.com",
    projectId: "nexinnovation-login",
    storageBucket: "nexinnovation-login.firebasestorage.app",
    messagingSenderId: "558802849966",
    appId: "1:558802849966:web:4339bb803ed781a5ecdd3f",
    measurementId: "G-5NVJF3R8D8"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// ✅ Auto-redirect if already logged in
onAuthStateChanged(auth, (user) => {
    if (user) {
        window.location.replace("dashboard.html");
    }
});

// ✅ Login form handler (existing)
document.querySelector('.login100-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const remember = document.getElementById('rememberMe').checked;

    const persistenceType = remember ? browserLocalPersistence : browserSessionPersistence;

    try {
        await setPersistence(auth, persistenceType);
        await signInWithEmailAndPassword(auth, email, password);
        window.location.href = "dashboard.html";
    } catch (error) {
        alert("Login failed: " + error.message);
    }
});