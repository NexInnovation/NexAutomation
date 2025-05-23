// 👁️ Toggle login password visibility
document.getElementById("toggle-login-password")?.addEventListener("click", () => {
    const pwd = document.getElementById("login-password");
    const icon = document.getElementById("toggle-login-password");
    pwd.type = pwd.type === "password" ? "text" : "password";
    icon.classList.toggle("bx-show");
    icon.classList.toggle("bx-hide");
});

// 👁️ Toggle signup password visibility
document.getElementById("toggle-signup-password")?.addEventListener("click", () => {
    const pwd = document.getElementById("signup-password");
    const icon = document.getElementById("toggle-signup-password");
    pwd.type = pwd.type === "password" ? "text" : "password";
    icon.classList.toggle("bx-show");
    icon.classList.toggle("bx-hide");
});

// 🔄 Toggle login/signup forms
document.getElementById("toggle-to-login")?.addEventListener("click", () => {
    document.getElementById("login-form").style.display = "block";
    document.getElementById("signup-form").style.display = "none";
});

document.getElementById("toggle-to-signup")?.addEventListener("click", () => {
    document.getElementById("login-form").style.display = "none";
    document.getElementById("signup-form").style.display = "block";
});

// ⏎ Enter-to-submit
document.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
        const loginVisible = document.getElementById("login-form").style.display !== "none";
        const signupVisible = document.getElementById("signup-form").style.display !== "none";
        if (loginVisible) document.getElementById("show-login")?.click();
        else if (signupVisible) document.getElementById("show-signup")?.click();
    }
});

// 🔐 Forgot password
import {
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-auth.js";
import {
    auth
} from "./firebase-init.js";

document.getElementById("forgot-password-link")?.addEventListener("click", async () => {
    const {
        value: email
    } = await Swal.fire({
        title: "Forgot Password",
        input: "email",
        inputLabel: "Enter your registered email",
        inputPlaceholder: "you@example.com",
        confirmButtonText: "Send Reset Link",
        showCancelButton: true
    });

    if (email) {
        try {
            await sendPasswordResetEmail(auth, email);
            Swal.fire({
                icon: "success",
                title: "Reset Email Sent",
                text: `Sent to: ${email}`
            });
        } catch (error) {
            console.error("❌ Password reset error:", error);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: error.message
            });
        }
    }
});