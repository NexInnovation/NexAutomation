import {
    db
} from './firebase-init.js';
import {
    ref,
    set
} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-database.js";
import {
    userProfile
} from './dashboard-init.js';

document.getElementById("profile-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const firstName = document.getElementById("profile-firstname").value.trim();
    const lastName = document.getElementById("profile-lasttname").value.trim();
    const mobile = document.getElementById("profile-mobile").value.trim();
    const email = document.getElementById("profile-email").value.trim();
    const city = document.getElementById("profile-city").value.trim();
    const uid = userProfile.uid;

    if (!firstName || !lastName || !mobile || !email || !city) {
        Swal.fire({
            icon: "warning",
            title: "Incomplete Profile",
            text: "Please fill in all fields."
        });
        return;
    }

    try {
        Swal.fire({
            title: "Updating Profile...",
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });
        await set(ref(db, `users/${uid}`), {
            firstName,
            lastName,
            mobile,
            email,
            city
        });
        Object.assign(userProfile, {
            firstName,
            lastName,
            mobile,
            email,
            city
        });
        document.getElementById("sidebar-username").innerText = firstName;
        Swal.close();
        Swal.fire({
            icon: "success",
            title: "Profile Updated",
            text: "Your information has been saved."
        });
    } catch (err) {
        Swal.close();
        Swal.fire({
            icon: "error",
            title: "Profile Update Failed",
            text: err.message
        });
    }
});