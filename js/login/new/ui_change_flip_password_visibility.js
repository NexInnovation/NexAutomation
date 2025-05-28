document.addEventListener("DOMContentLoaded", () => {
    // Flip to signup
    document.getElementById("to-signup").addEventListener("click", () => {
        document.getElementById("flip-container").classList.add("flipped");
    });

    // Flip to login
    document.getElementById("to-login").addEventListener("click", () => {
        document.getElementById("flip-container").classList.remove("flipped");
    });

    // Toggle password visibility
    const toggleButtons = document.querySelectorAll(".toggle-password");

    toggleButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            const inputSelector = btn.getAttribute("toggle");
            const passwordInput = document.querySelector(inputSelector);

            if (!passwordInput) return;

            const isPassword = passwordInput.type === "password";
            passwordInput.type = isPassword ? "text" : "password";
            btn.classList.toggle("bx-show");
            btn.classList.toggle("bx-hide");
        });
    });
});