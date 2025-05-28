import {
    auth,
    onAuthStateChanged,
    setPersistence,
    browserLocalPersistence,
    browserSessionPersistence
} from '../../firebase-module.js';

import {
    login
} from './login_function.js';


let manualLoginInProgress = false;


document.addEventListener("DOMContentLoaded", () => {

    // 🔁 Check if already logged in
    onAuthStateChanged(auth, (user) => {
        if (user && !manualLoginInProgress) {
            console.log("✅ Already logged in:", user.email);

            // 1. Show loading Swal
            Swal.fire({
                title: 'Auto Logging In...',
                text: 'Redirecting to your dashboard.',
                allowOutsideClick: false,
                allowEscapeKey: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            // setTimeout(() => {
            //     window.location.href = "dashboard2.html";
            // }, 1000); // optional small delay so user sees the alert

            // 2. Wait, then show success
            setTimeout(() => {
                Swal.fire({
                    icon: 'success',
                    title: 'Welcome!',
                    text: `Logged in as ${user.email}`,
                    timer: 1500,
                    showConfirmButton: false
                }).then(() => {
                    // 3. Redirect
                    window.location.href = "dashboard2.html";
                });
            }, 500); // You can adjust the delay
        }
    });


    const loginBtn = document.getElementById("login-btn");
    const rememberCheckbox = document.getElementById("remember-me");

    loginBtn?.addEventListener("click", async () => {
        const email = document.getElementById("login-email").value.trim();
        const password = document.getElementById("login-password").value.trim();

        if (!email || !password) {
            Swal.fire({
                icon: 'warning',
                title: 'Missing Fields',
                text: 'Please enter both email and password.',
            });
            return;
        }

        try {
            manualLoginInProgress = true;

            // ✅ Set Firebase persistence based on checkbox
            await setPersistence(
                auth,
                rememberCheckbox.checked ? browserLocalPersistence : browserSessionPersistence
            );

            // 🔒 Login function that returns user
            const user = await login(email, password);

            Swal.fire({
                icon: 'success',
                title: 'Welcome!',
                text: `Logged in as ${user.email}`,
                timer: 1500,
                showConfirmButton: false,
            }).then(() => {
                window.location.href = "dashboard2.html";
            });

        } catch (err) {
            let message = 'Login failed. Please try again.';
            if (err.code === 'auth/user-not-found') {
                message = 'No account found with this email.';
            } else if (err.code === 'auth/wrong-password') {
                message = 'Incorrect password. Please try again.';
            } else if (err.code === 'auth/invalid-email') {
                message = 'Invalid email format.';
            } else if (err.code === 'auth/too-many-requests') {
                message = 'Too many attempts. Try again later.';
            }

            Swal.fire({
                icon: 'error',
                title: 'Login Failed',
                text: message,
            });
        }
    });
    document.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            const isSignupVisible = document.querySelector("#flip-container").classList.contains("flipped");

            if (isSignupVisible) {
                document.getElementById("signup-btn")?.click();
            } else {
                document.getElementById("login-btn")?.click();
            }
        }
    });
});