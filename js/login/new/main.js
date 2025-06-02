import {
    auth,
    db,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    ref,
    set,
    get,
    update,
    push,
    setPersistence,
    browserLocalPersistence,
    browserSessionPersistence,
    onAuthStateChanged
} from '../../firebase-module.js';

import DB_PATHS from '../../db-paths.js';
import {
    populateAllDataToLocalStorage
} from './save_data_to_local_storage.js';

// ========== SIGNUP FUNCTION ==========
async function handleSignup() {
    console.log("🔵 handleSignup() called");
    const firstName = document.getElementById("signup-name").value.trim();
    const email = document.getElementById("signup-email").value.trim().toLowerCase();
    const password = document.getElementById("signup-password").value.trim();

    console.log("🔍 Signup form data:", {
        firstName,
        email,
        password: password ? '***' : '(empty)'
    });

    if (!firstName) {
        return Swal.fire({
            icon: 'warning',
            title: 'Missing Name',
            text: 'Please enter your first name.'
        });
    }
    if (!email) {
        return Swal.fire({
            icon: 'warning',
            title: 'Missing Email',
            text: 'Please enter your email address.'
        });
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
        return Swal.fire({
            icon: 'error',
            title: 'Invalid Email',
            text: 'Please enter a valid email address.'
        });
    }
    if (!password) {
        return Swal.fire({
            icon: 'warning',
            title: 'Missing Password',
            text: 'Please enter a password.'
        });
    }
    if (password.length < 6) {
        return Swal.fire({
            icon: 'error',
            title: 'Weak Password',
            text: 'Password must be at least 6 characters long.'
        });
    }

    sessionStorage.setItem("isManualSignUp", "true");

    try {
        console.log("⏳ Creating Firebase account...");
        Swal.fire({
            title: 'Creating account...',
            text: 'Please wait while we create your account.',
            allowOutsideClick: false,
            allowEscapeKey: false,
            didOpen: () => Swal.showLoading()
        });

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const uid = user.uid;
        console.log("✅ Firebase account created:", uid);

        const lastNumberRef = ref(db, DB_PATHS.lastHomeNumber);
        const lastNumberSnap = await get(lastNumberRef);
        let lastNumber = parseInt(lastNumberSnap.val() || "0", 10);
        lastNumber += 1;
        const formattedNumber = lastNumber.toString().padStart(4, '0');
        const pushKey = push(ref(db)).key;
        const homeId = `home${formattedNumber}-${pushKey}`;

        console.log("🟩 New homeId generated:", homeId);

        await set(lastNumberRef, formattedNumber);

        const now = new Date().toISOString();
        const profileData = {
            uid,
            email,
            role: 'admin',
            isAdmin: true,
            firstName,
            lastName: '',
            mobile: '',
            city: '',
            createdAt: now,
        };

        const updates = {};
        updates[DB_PATHS.userProfileLink(uid)] = {
            homeId,
            role: 'admin'
        }; // 🟩 FIXED
        updates[DB_PATHS.homeAdminUser(homeId, uid)] = profileData;
        updates[DB_PATHS.userList(homeId) + `/${uid}`] = true;
        updates[DB_PATHS.totalMembers(homeId)] = 0;
        updates[DB_PATHS.totalDevices(homeId)] = 0;

        console.log("🟡 Writing new user data to Firebase:", updates);
        await update(ref(db), updates);

        console.log("🟡 Populating localStorage...");
        await populateAllDataToLocalStorage(uid, email);

        console.log("✅ Signup flow complete! Ready for dashboard redirection.");
        sessionStorage.removeItem("isManualLogin");
        sessionStorage.removeItem("isManualSignUp");

        Swal.fire({
            icon: 'success',
            title: 'Signup Complete',
            text: `Welcome, ${firstName}`,
            timer: 1500,
            showConfirmButton: false
        }).then(() => {
            window.location.href = "dashboard2.html";
        });

    } catch (error) {
        console.error("❌ Signup failed:", error);
        Swal.fire({
            icon: 'error',
            title: 'Signup Failed',
            text: error.message || "An error occurred. Please try again."
        });
    }
}


// ========== LOGIN FUNCTION ==========
async function handleLogin() {
    console.log("🔵 handleLogin() called");
    const email = document.getElementById("login-email").value.trim().toLowerCase();
    const password = document.getElementById("login-password").value.trim();
    const rememberMe = document.getElementById("remember-me")?.checked;

    console.log("🔍 Login form data:", {
        email,
        password: password ? '***' : '(empty)',
        rememberMe
    });

    if (!email) {
        return Swal.fire({
            icon: 'warning',
            title: 'Missing Email',
            text: 'Please enter your email address.'
        });
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
        return Swal.fire({
            icon: 'error',
            title: 'Invalid Email',
            text: 'Please enter a valid email address.'
        });
    }
    if (!password) {
        return Swal.fire({
            icon: 'warning',
            title: 'Missing Password',
            text: 'Please enter a password.'
        });
    }
    if (password.length < 6) {
        return Swal.fire({
            icon: 'error',
            title: 'Weak Password',
            text: 'Password must be at least 6 characters long.'
        });
    }

    sessionStorage.setItem("isManualLogin", "true");

    try {
        console.log("⏳ Starting Firebase login...");
        Swal.fire({
            title: 'Logging in...',
            text: 'Please wait while we authenticate you.',
            allowOutsideClick: false,
            allowEscapeKey: false,
            didOpen: () => Swal.showLoading()
        });

        await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);

        if (rememberMe) {
            localStorage.setItem("rememberMe", "true");
        } else {
            localStorage.removeItem("rememberMe");
        }

        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const uid = user.uid;
        console.log("✅ Firebase login successful:", uid);

        // const userSnap = await get(ref(db, DB_PATHS.userProfile(uid)));
        const userSnap = await get(ref(db, DB_PATHS.userProfileLink(uid)));

        if (!userSnap.exists()) throw new Error("User profile not found in DB");

        const {
            homeId
        } = userSnap.val();
        const profileSnap = await get(ref(db, DB_PATHS.homeAdminUser(homeId, uid)));
        const profileData = profileSnap.val();
        const firstName = profileData?.firstName || "";

        console.log("🟡 Populating localStorage...");
        await populateAllDataToLocalStorage(uid, email);

        console.log("✅ Login flow complete! Ready for dashboard redirection.");
        sessionStorage.removeItem("isManualLogin");
        sessionStorage.removeItem("isManualSignUp");

        Swal.fire({
            icon: 'success',
            title: 'Welcome!',
            text: `${firstName || email}`,
            timer: 1500,
            showConfirmButton: false
        }).then(() => {
            window.location.href = "dashboard2.html";
        });

    } catch (error) {
        console.error("❌ Login failed:", error);
        const authErrorMessages = {
            "auth/user-not-found": "Account not found. Please sign up first.",
            "auth/invalid-credential": "Invalid credentials. Please check your input.",
            "auth/wrong-password": "Incorrect password. Please try again.",
            "auth/too-many-requests": "Too many failed attempts. Please wait and try again later.",
        };
        const message = authErrorMessages[error.code] || "Unable to login. Please try again.";
        Swal.fire({
            icon: 'error',
            title: 'Login Failed',
            text: message
        });
    }
}

// ========== BUTTON LISTENERS ==========
document.getElementById("signup-btn")?.addEventListener("click", handleSignup);
document.getElementById("login-btn")?.addEventListener("click", handleLogin);

// ========== ENTER KEY HANDLER ==========
document.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        console.log("🔵 Enter key pressed: trigger submit");

        const isSignupVisible = document.querySelector("#flip-container")?.classList.contains("flipped");
        if (isSignupVisible) {
            handleSignup();
        } else {
            handleLogin();
        }
    }
});

// ========== ALREADY LOGGED IN CHECK ==========
Swal.fire({
    title: 'Checking login status...',
    text: 'Please wait...',
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    didOpen: () => Swal.showLoading(),
});

onAuthStateChanged(auth, async (user) => {
    console.log("🟡 onAuthStateChanged fired!");
    const isManualLogin = sessionStorage.getItem("isManualLogin") === "true";
    const isManualSignUp = sessionStorage.getItem("isManualSignUp") === "true";
    const rememberMe = localStorage.getItem("rememberMe") === "true";

    console.log("🔍 Auto-login check:", {
        isManualLogin,
        isManualSignUp,
        rememberMe
    });

    if (!isManualLogin && !isManualSignUp) {
        if (user && rememberMe) {
            try {
                console.log("✅ Auto-login detected with Remember Me");
                const uid = user.uid;
                const email = user.email;

                await populateAllDataToLocalStorage(uid, email);

                console.log("✅ Auto-login flow complete! Ready for dashboard redirection.");
                sessionStorage.removeItem("isManualLogin");
                sessionStorage.removeItem("isManualSignUp");

                Swal.fire({
                    icon: 'success',
                    title: 'Welcome Back!',
                    text: 'Redirecting to your dashboard...',
                    timer: 1500,
                    showConfirmButton: false
                }).then(() => {
                    window.location.href = "dashboard2.html";
                });

            } catch (err) {
                console.error("❌ Auto-login restore failed:", err);
                Swal.fire({
                    icon: 'error',
                    title: 'Auto Login Failed',
                    text: 'Something went wrong while restoring your session. Please login again.'
                });
            }
        } else {
            console.log("ℹ️ No auto-login needed. Letting user interact with login form.");
            Swal.close();
        }
    }
});