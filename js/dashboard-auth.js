import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-app.js";
import {
    getAuth,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-auth.js";

// Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyD3GvlENwkMR6Khab1g-qT6WukrCVUwGSs",
    authDomain: "nexinnovation-login.firebaseapp.com",
    projectId: "nexinnovation-login",
    storageBucket: "nexinnovation-login.firebasestorage.app",
    messagingSenderId: "558802849966",
    appId: "1:558802849966:web:4339bb803ed781a5ecdd3f",
    measurementId: "G-5NVJF3R8D8"
};

// Init Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Protect the dashboard
onAuthStateChanged(auth, (user) => {
    if (!user) {
        // Not logged in → redirect to login page
        window.location.replace("index.html");
    } else {
        // Show user email
        document.getElementById("user-email").innerText = `Logged in as: ${user.email}`;
    }
});

// Logout function
window.logoutUser = async function () {
    await signOut(auth);
    window.location.replace("index.html");
};