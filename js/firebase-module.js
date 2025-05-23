// 🌐 Import required Firebase modules
import {
    initializeApp
}
from "https://www.gstatic.com/firebasejs/11.7.3/firebase-app.js";

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

export {
    initializeApp,
    getAuth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    setPersistence,
    browserLocalPersistence,
    browserSessionPersistence,
    onAuthStateChanged,
    signOut,
    getDatabase,
    ref,
    get,
    set,
    update,
    push
};