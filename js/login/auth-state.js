import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-auth.js";
import {
    auth
} from "./firebase-init.js";


let isManualLoginOrSignup = false;

export function setManualFlag(val) {
    isManualLoginOrSignup = val;
}

export function getManualFlag() {
    return isManualLoginOrSignup;
}

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        Swal.close();
        return;
    }

    if (getManualFlag()) return;

    Swal.fire({
        title: "Auto logging in...",
        text: "Please wait",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
    });

    await new Promise(resolve => setTimeout(resolve, 200));
    window.location.replace("dashboard.html");
});