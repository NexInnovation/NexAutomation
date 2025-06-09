import {
    auth,
    onAuthStateChanged
} from '../../firebase-module.js';

// import {
//     logAllLocalStorageData
// } from '../fdb-logic functions/temp/logAllLocalStorageData.js';

import {
    fillProfileDetails,
    fillRoomSelectSidebar,
    fillMemberListSidebar,
    fillUpdateDeviceRoomListSidebar
} from '../ui/fill_function_to_all_panel.js';


document.addEventListener("DOMContentLoaded", () => {
    Swal.fire({
        title: 'Checking login...',
        text: 'Please wait while we verify your session.',
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => Swal.showLoading(),
    });

    onAuthStateChanged(auth, (user) => {
        const isManualLogout = sessionStorage.getItem("manualLogout") === "true";
        const suppressOnAuthChange = sessionStorage.getItem("suppressOnAuthChange") === "true";

        if (suppressOnAuthChange) {
            console.log("⏳ Suppressing dashboard re-init during admin re-login.");
            // sessionStorage.removeItem("suppressOnAuthChange"); // clear for future normal operation
            return;
        }

        if (user) {
            console.log("✅ Logged in as:", user.email);
            Swal.close();
            // logAllLocalStorageData();
            fillProfileDetails();
            fillRoomSelectSidebar();
            fillMemberListSidebar();
            fillUpdateDeviceRoomListSidebar();
        } else if (!isManualLogout) {
            Swal.fire({
                icon: 'warning',
                title: 'You Are Not Logged In',
                text: 'Please Login...',
                confirmButtonText: 'Go to Login',
                allowOutsideClick: false,
            }).then(() => {
                // window.location.href = 'index.html';
            });
        }
    });
});