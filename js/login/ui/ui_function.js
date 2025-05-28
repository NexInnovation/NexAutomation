// 🔘 Get references to Login and Signup buttons
const loginBtn = document.getElementById("show-login");
const signupBtn = document.getElementById("show-signup");

// 🔄 Show/hide login/signup forms
document.getElementById("toggle-to-login").addEventListener("click", () => {
    document.getElementById("login-form").style.display = "block";
    document.getElementById("signup-form").style.display = "none";

    // 🔄 Clear signup form inputs
    document.getElementById("signup-email").value = "";
    document.getElementById("signup-password").value = "";
});

document.getElementById("toggle-to-signup").addEventListener("click", () => {
    document.getElementById("login-form").style.display = "none";
    document.getElementById("signup-form").style.display = "block";

    // 🔄 Clear login form inputs
    document.getElementById("login-email").value = "";
    document.getElementById("login-password").value = "";
    document.getElementById("rememberMe").checked = false;
});

// ✅ Handle ENTER key press on keyboard
document.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
        const loginFormVisible = document.getElementById("login-form").style.display !== "none";
        const signupFormVisible = document.getElementById("signup-form").style.display !== "none";
        if (loginFormVisible) {
            setTimeout(() => loginBtn.click(), 50); // ✅ Let DOM update before click
        } else if (signupFormVisible) {
            setTimeout(() => signupBtn.click(), 50);
        }
    }
});

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