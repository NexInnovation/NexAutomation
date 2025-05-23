import {
    signInWithEmailAndPassword,
    setPersistence,
    browserLocalPersistence,
    browserSessionPersistence,
    createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-auth.js";

import {
    ref,
    get,
    set,
    push,
    update
} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-database.js";

import {
    auth,
    db
} from "./firebase-init.js";

import {
    setManualFlag
} from "./auth-state.js";

// ✅ Login
document.getElementById('show-login')?.addEventListener('click', async function (e) {
    e.preventDefault();

    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value.trim();
    const remember = document.getElementById('rememberMe').checked;

    if (!email || !email.includes("@") || !email.includes(".")) {
        return Swal.fire({
            icon: "warning",
            title: "Invalid Email"
        });
    }

    if (!password) {
        return Swal.fire({
            icon: "warning",
            title: "Missing Password"
        });
    }

    const persistenceType = remember ? browserLocalPersistence : browserSessionPersistence;

    try {
        Swal.fire({
            title: "Logging in...",
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });
        // isManualLoginOrSignup = true;
        setManualFlag(true);

        await setPersistence(auth, persistenceType);
        const credential = await signInWithEmailAndPassword(auth, email, password);
        const user = credential.user;

        // User Profile
        const profileSnapshot = await get(ref(db, `users/${user.uid}`));
        if (profileSnapshot.exists()) {
            const profile = profileSnapshot.val();
            localStorage.setItem("userProfile", JSON.stringify({
                ...profile,
                uid: user.uid
            }));
        }

        // Optional: Fetch Wi-Fi config
        const wifiSnapshot = await get(ref(db, "config/wifi"));
        if (wifiSnapshot.exists()) {
            localStorage.setItem("wifiConfig", JSON.stringify(wifiSnapshot.val()));
        }

        Swal.close();
        window.location.href = "dashboard.html";

    } catch (error) {
        Swal.close();
        console.error("❌ Login failed:", error);
        Swal.fire({
            icon: "error",
            title: "Login Failed",
            text: error.message,
            showCancelButton: true,
            confirmButtonText: "Retry",
            cancelButtonText: "Close"
        }).then((result) => {
            if (result.isConfirmed) {
                document.getElementById("show-login")?.click();
            }
        });
    }
});

// ✅ Signup
document.getElementById('show-signup')?.addEventListener('click', async function (e) {
    e.preventDefault();

    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value.trim();

    if (!email || !email.includes("@") || !email.includes(".")) {
        return Swal.fire({
            icon: "warning",
            title: "Invalid Email"
        });
    }

    if (!password || password.length < 6) {
        return Swal.fire({
            icon: "warning",
            title: "Weak Password"
        });
    }

    try {
        Swal.fire({
            title: "Creating account...",
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });
        // isManualLoginOrSignup = true;
        setManualFlag(true);

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const uid = userCredential.user.uid;

        // Home ID generation
        const snapshot = await get(ref(db, "NexInnovation-config/lastNumber"));
        let lastNumber = snapshot.exists() ? parseInt(snapshot.val()) : 0;
        const newNumber = lastNumber + 1;
        const numberStr = String(newNumber).padStart(4, "0");
        const pushKey = push(ref(db)).key;
        const homeId = `home${numberStr}-${pushKey}`;

        await update(ref(db, "NexInnovation-config"), {
            lastNumber: newNumber
        });

        // Save user under automation
        const userData = {
            uid,
            email,
            role: "admin",
            isAdmin: true,
            homeId,
            createdAt: new Date().toISOString()
        };
        await set(ref(db, `automation/${homeId}/user/${uid}`), userData);
        await set(ref(db, `users/${uid}`), {
            homeId,
            role: "admin"
        });

        Swal.close();
        window.location.href = "dashboard.html";

    } catch (error) {
        console.error("❌ Signup failed:", error);
        Swal.fire({
            icon: "error",
            title: "Signup Failed",
            text: error.message
        });
    }
});