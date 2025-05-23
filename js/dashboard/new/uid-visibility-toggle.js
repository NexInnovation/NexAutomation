// document.getElementById("toggle-uid-visibility").addEventListener("click", () => {
//     const uidField = document.getElementById("profile-uid-not-editable");
//     const toggleIcon = document.getElementById("toggle-uid-visibility");
//     const isPassword = uidField.type === "password";
//     uidField.type = isPassword ? "text" : "password";
//     toggleIcon.classList.replace(isPassword ? "bx-show" : "bx-hide", isPassword ? "bx-hide" : "bx-show");
// });

// 👁️ Toggle UID visibility
document.getElementById("toggle-uid-visibility").addEventListener("click", () => {
    const uidField = document.getElementById("profile-uid-not-editable");
    const toggleIcon = document.getElementById("toggle-uid-visibility");

    if (uidField.type === "password") {
        uidField.type = "text";
        toggleIcon.classList.replace("bx-show", "bx-hide");
    } else {
        uidField.type = "password";
        toggleIcon.classList.replace("bx-hide", "bx-show");
    }
});