// firebase-config.js

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-app.js";
import {
    getAuth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    setPersistence,
    browserLocalPersistence,
    browserSessionPersistence,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-auth.js";

import {
    getDatabase,
    ref,
    get,
    set,
    update,
    push
} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-database.js";

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

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Initialize services
const auth = getAuth(app);
const db = getDatabase(app);
// ✅ Export everything
export {
    auth,
    db,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    setPersistence,
    browserLocalPersistence,
    browserSessionPersistence,
    onAuthStateChanged,
    signOut,
    ref,
    get,
    set,
    update,
    push
};