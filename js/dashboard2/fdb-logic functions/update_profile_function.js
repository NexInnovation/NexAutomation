import {
    db,
    ref,
    update
} from "../../firebase-module.js";
import DB_PATHS from "../../db-paths.js";

document.getElementById("submit-profile")?.addEventListener("click", async (e) => {
    e.preventDefault(); // 🔒 Prevent form from reloading the page

    // ✅ Get values from form inputs
    const firstName = document.getElementById("profile-firstname").value.trim();
    const lastName = document.getElementById("profile-lasttname").value.trim();
    const mobile = document.getElementById("profile-mobile").value.trim();
    const city = document.getElementById("profile-city").value.trim();

    // Read-only fields
    const email = document.getElementById("profile-email").value;
    const role = document.getElementById("profile-Role").value;
    const uid = document.getElementById("profile-uid-not-editable").value;
    const homeId = document.getElementById("profile-homeid-not-editable").value;

    // 🔒 Simple validation
    if (!firstName) {
        return Swal.fire({
            icon: 'warning',
            title: 'First Name Missing',
            text: 'Please enter your first name.'
        });
    }

    Swal.fire({
        title: 'Updating profile...',
        text: 'Please wait while we save your changes.',
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => Swal.showLoading(),
    });

    try {
        const updatedProfile = {
            firstName,
            lastName,
            mobile,
            city
        };

        // 👥 Determine correct DB path based on user role
        let updatePath = "";
        if (role === "admin") {
            updatePath = DB_PATHS.homeAdminUser(homeId, uid);
        } else {
            updatePath = `automation/${homeId}/user/member/${uid}`;
        }

        // 📝 Perform the update in Realtime Database
        await update(ref(db, updatePath), updatedProfile);
        console.log("✅ Firebase DB updated successfully.");

        // 🔁 Update sessionStorage with new profile data
        const oldProfile = JSON.parse(sessionStorage.getItem("currentUser_fullProfile") || "{}");
        const updatedFullProfile = {
            ...oldProfile,
            ...updatedProfile
        };

        sessionStorage.setItem("currentUser_fullProfile", JSON.stringify(updatedFullProfile));
        console.log("🟢 SessionStorage updated with new profile:");
        console.log(updatedFullProfile);

        Swal.fire({
            icon: 'success',
            title: 'Profile Updated',
            text: 'Your changes have been saved successfully.',
            timer: 1500,
            showConfirmButton: false
        });

    } catch (err) {
        console.error("❌ Failed to update profile:", err);
        Swal.fire({
            icon: 'error',
            title: 'Update Failed',
            text: err.message || 'Something went wrong. Please try again.'
        });
    }
});