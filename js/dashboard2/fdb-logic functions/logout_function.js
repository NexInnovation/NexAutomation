import {
    auth,
    signOut
} from "../../firebase-module.js";

const logoutBtn = document.getElementById("log_out");

if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        signOut(auth)
            .then(() => {
                localStorage.clear();
                sessionStorage.clear();

                Swal.fire({
                    icon: 'success',
                    title: 'Logged out',
                    text: 'You have been successfully logged out',
                    timer: 1500,
                    showConfirmButton: false
                }).then(() => {
                    window.location.href = "index2.html";
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