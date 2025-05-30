import {
    auth,
    signOut
} from "../../firebase-module.js";

const logoutBtn = document.getElementById("log_out");

if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        sessionStorage.setItem("manualLogout", "true");

        signOut(auth)
            .then(() => {
                // Don't clear sessionStorage yet — dashboard-init.js will check this
                Swal.fire({
                    icon: 'success',
                    title: 'Logged out',
                    text: 'You have been successfully logged out',
                    timer: 1500,
                    showConfirmButton: false
                }).then(() => {
                    sessionStorage.clear(); // ✅ clear after redirect
                    localStorage.clear(); // ✅ clear localStorage too
                    window.location.href = "index.html";
                });
            })
            .catch((error) => {
                console.error("❌ Logout failed:", error);
                Swal.fire({
                    icon: 'error',
                    title: 'Logout Failed',
                    text: 'Something went wrong. Please try again.',
                });
            });
    });
}

// ========== 🔒 Auto Logout on Tab Close (if not remembered) ==========
// window.addEventListener("beforeunload", (event) => {
//     const rememberMe = localStorage.getItem("rememberMe") === "true";
//     const manualLogout = sessionStorage.getItem("manualLogout") === "true";

//     if (!rememberMe && !manualLogout) {
//         console.log("🟡 Auto-logout triggered by tab close.");

//         // Send logout signal (optional for server logging)
//         navigator.sendBeacon("/auto-logout", JSON.stringify({
//             uid: sessionStorage.getItem("currentUser_uid")
//         }));

//         // Firebase signOut
//         signOut(auth).then(() => {
//             console.log("🔒 Signed out on tab close.");
//             sessionStorage.clear(); // ✅ clear after redirect
//             localStorage.clear(); // ✅ clear localStorage too
//         }).catch((err) => {
//             console.warn("⚠️ Auto-logout failed:", err);
//         });
//     }
// });