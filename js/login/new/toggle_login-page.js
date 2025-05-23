// 🔄 Show/hide login/signup forms
document.getElementById("toggle-to-login").addEventListener("click", () => {
    document.getElementById("login-form").style.display = "block";
    document.getElementById("signup-form").style.display = "none";
});

document.getElementById("toggle-to-signup").addEventListener("click", () => {
    document.getElementById("login-form").style.display = "none";
    document.getElementById("signup-form").style.display = "block";
});