const sidebar = document.querySelector(".sidebar");
const sidebar2 = document.querySelector(".sidebar2");
const sidebar3 = document.querySelector(".sidebar3");
const sidebarBtn = document.getElementById("btn");
const settingsBtn = document.getElementById("settings-btn");
const profileBtn = document.getElementById("profile-btn");

import {
    getWiFiFormData,
    getProfileFormData,
    fillProfileFieldsFromSession,
    fillWiFiFieldsFromSession,
    confirmDiscardIfChanged
} from './data-fill-functions.js';

//open side bar 
sidebarBtn.addEventListener("click", () => {
    sidebar.classList.toggle("open");
    adjustSidebar2();
    adjustSidebar3();
    sidebarBtn.classList.toggle("bx-menu-alt-right");
});

// press escape to close sidebar
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" &&
        sidebar.classList.contains("open") &&
        !sidebar2.classList.contains("show") &&
        !sidebar3.classList.contains("show")) {
        sidebar.classList.remove("open");
        sidebarBtn.classList.remove("bx-menu-alt-right");
    }
});

// open sidebar2 setting sidebar and close sidebar3
settingsBtn.addEventListener("click", () => {
    const wasOpen = sidebar2.classList.contains("show");

    // 🔁 Toggle sidebar visibility
    sidebar2.classList.toggle("show");
    settingsBtn.classList.toggle("submenu-open");

    // ❌ Close the other (profile) sidebar
    sidebar3.classList.remove("show");
    profileBtn.classList.remove("submenu-open");

    // ✅ Adjust position of settings panel
    adjustSidebar2();

    // 🧹 If we just closed it, check for discard
    if (wasOpen) {
        const current = getWiFiFormData();
        const ssid = sessionStorage.getItem("ssid") || "";
        const password = sessionStorage.getItem("password") || "";
        const original = {
            ssid,
            password
        };

        console.log("🔍 Sidebar2 closed. Checking for unsaved Wi-Fi changes.");
        console.log("📦 Saved (from session):", original);
        console.log("📝 Current (from form):", current);

        if (confirmDiscardIfChanged(current, original)) {
            Swal.fire({
                icon: "info",
                title: "Changes Discarded",
                text: "Your unsaved Wi-Fi changes were not saved."
            });
            fillWiFiFieldsFromSession();
        }
    }
});


// // click outside of sidebar2 to close sidebar
// document.addEventListener("click", (e) => {
//     if (!sidebar2.contains(e.target) &&
//         !settingsBtn.contains(e.target)) {
//         sidebar2.classList.remove("show");
//         settingsBtn.classList.remove("submenu-open");
//     }
// });

// // press escape to close sidebar2
// document.addEventListener("keydown", (e) => {
//     if (e.key === "Escape" &&
//         sidebar2.classList.contains("show")) {
//         sidebar2.classList.remove("show");
//         settingsBtn.classList.remove("submenu-open");
//     }
// });

// open sidebar3 profile sidebar and close sidebar2
profileBtn.addEventListener("click", () => {
    const wasOpen = sidebar3.classList.contains("show");

    // 🔁 Toggle profile sidebar
    sidebar3.classList.toggle("show");
    profileBtn.classList.toggle("submenu-open");

    // ❌ Close settings sidebar if open
    sidebar2.classList.remove("show");
    settingsBtn.classList.remove("submenu-open");

    // ✅ Adjust profile sidebar position
    adjustSidebar3();

    // 🧹 If we just closed it, check for unsaved changes
    if (wasOpen) {
        const current = getProfileFormData();

        // 🔄 Read session values individually
        const original = {
            firstName: sessionStorage.getItem("firstName") || "",
            lastName: sessionStorage.getItem("lastName") || "",
            mobile: sessionStorage.getItem("mobile") || "",
            email: sessionStorage.getItem("email") || "",
            city: sessionStorage.getItem("city") || "",
            uid: sessionStorage.getItem("uid") || ""
        };

        console.log("🔍 Sidebar3 closed. Checking for unsaved profile changes.");
        console.log("📦 Saved (from session):", original);
        console.log("📝 Current (from form):", current);

        if (confirmDiscardIfChanged(current, original)) {
            Swal.fire({
                icon: "info",
                title: "Changes Discarded",
                text: "Your unsaved profile changes were not saved."
            });
            fillProfileFieldsFromSession();
        }
    }
});


document.addEventListener("click", (e) => {
    if (sidebar2.classList.contains("show") && !sidebar2.contains(e.target) && !settingsBtn.contains(e.target)) {
        // 🧠 Get session data
        const ssid = sessionStorage.getItem("ssid") || "";
        const password = sessionStorage.getItem("password") || "";
        const current = getWiFiFormData();

        // 🔍 Construct stored config manually
        const session_wifiData = {
            ssid,
            password
        };

        console.log("📦 Wi-Fi session data from sessionStorage:", session_wifiData);
        console.log("📝 Current Wi-Fi form data from UI:", current);

        // 🛑 Compare current form data with stored values
        if (confirmDiscardIfChanged(current, session_wifiData)) {
            Swal.fire({
                icon: "info",
                title: "Changes Discarded",
                text: "Your unsaved Wifi changes were not saved."
            });

            fillWiFiFieldsFromSession(); // Refill fields from individual session values
        }

        // 🧼 Hide the sidebar
        sidebar2.classList.remove("show");
        settingsBtn.classList.remove("submenu-open");
    }


    if (sidebar3.classList.contains("show") && !sidebar3.contains(e.target) && !profileBtn.contains(e.target)) {

        const current = getProfileFormData();

        const sessionProfile = {
            firstName: sessionStorage.getItem("firstName") || "",
            lastName: sessionStorage.getItem("lastName") || "",
            mobile: sessionStorage.getItem("mobile") || "",
            email: sessionStorage.getItem("email") || "",
            city: sessionStorage.getItem("city") || "",
            uid: sessionStorage.getItem("uid") || ""
        };

        console.log("📦 Profile from sessionStorage:", sessionProfile);
        console.log("📝 Current Profile form data from UI:", current);

        if (confirmDiscardIfChanged(current, sessionProfile)) {
            Swal.fire({
                icon: "info",
                title: "Changes Discarded",
                text: "Your unsaved profile changes were not saved."
            });
            fillProfileFieldsFromSession();
        }
        sidebar3.classList.remove("show");
        profileBtn.classList.remove("submenu-open");
    }
});

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        if (sidebar2.classList.contains("show")) {
            // 🧠 Get session data
            const ssid = sessionStorage.getItem("ssid") || "";
            const password = sessionStorage.getItem("password") || "";
            const current = getWiFiFormData();

            // 🔍 Construct stored config manually
            const session_wifiData = {
                ssid,
                password
            };

            console.log("📦 Wi-Fi session data from sessionStorage:", session_wifiData);
            console.log("📝 Current Wi-Fi form data from UI:", current);

            // 🛑 Compare current form data with stored values
            if (confirmDiscardIfChanged(current, session_wifiData)) {
                Swal.fire({
                    icon: "info",
                    title: "Changes Discarded",
                    text: "Your unsaved Wifi changes were not saved."
                });

                fillWiFiFieldsFromSession(); // Refill fields from individual session values
            }

            // 🧼 Hide the sidebar
            sidebar2.classList.remove("show");
            settingsBtn.classList.remove("submenu-open");
        }

        if (sidebar3.classList.contains("show")) {
            const current = getProfileFormData();

            const sessionProfile = {
                firstName: sessionStorage.getItem("firstName") || "",
                lastName: sessionStorage.getItem("lastName") || "",
                mobile: sessionStorage.getItem("mobile") || "",
                email: sessionStorage.getItem("email") || "",
                city: sessionStorage.getItem("city") || "",
                uid: sessionStorage.getItem("uid") || ""
            };

            console.log("📦 Profile from sessionStorage:", sessionProfile);
            console.log("📝 Current Profile form data from UI:", current);

            if (confirmDiscardIfChanged(current, sessionProfile)) {
                Swal.fire({
                    icon: "info",
                    title: "Changes Discarded",
                    text: "Your unsaved profile changes were not saved."
                });
                fillProfileFieldsFromSession();
            }
            sidebar3.classList.remove("show");
            profileBtn.classList.remove("submenu-open");
        }
    }
});

//adjust sidebar2 - profile slidebar when sidebar is oepn
export function adjustSidebar2() {
    if (!sidebar2.classList.contains("show")) return;
    sidebar2.style.left = sidebar.classList.contains("open") ? "255px" : "83px";
    const top = settingsBtn.getBoundingClientRect().top + window.scrollY;
    sidebar2.style.top = `${top}px`;
    sidebar2.style.height = `${window.innerHeight - top - 10}px`;
}

//adjust sidebar3 - setting slidebar when sidebar is oepn
export function adjustSidebar3() {
    if (!sidebar3.classList.contains("show")) return;
    sidebar3.style.left = sidebar.classList.contains("open") ? "255px" : "83px";
    const top = profileBtn.getBoundingClientRect().top + window.scrollY;
    sidebar3.style.top = `${top}px`;
    sidebar3.style.height = `${window.innerHeight - top - 10}px`;
}

// hide slidebar on escape function
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        if (sidebar2.classList.contains("show")) {
            const current = getWiFiFormData();
            if (confirmDiscardIfChanged(current, savedWiFiConfig)) {
                Swal.fire({
                    icon: "info",
                    title: "Changes Discarded",
                    text: "Your unsaved Wifi changes were not saved."
                });
                fillWiFiFieldsFromSaved();
            }
            sidebar2.classList.remove("show");
            settingsBtn.classList.remove("submenu-open");
        }

        if (sidebar3.classList.contains("show")) {
            const current = getProfileFormData();
            if (confirmDiscardIfChanged(current, userProfile)) {
                Swal.fire({
                    icon: "info",
                    title: "Changes Discarded",
                    text: "Your unsaved profile changes were not saved."
                });
                fillProfileFieldsFromSaved();
            }
            sidebar3.classList.remove("show");
            profileBtn.classList.remove("submenu-open");
        }
    }
});

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

document.getElementById("toggle-hid-visibility").addEventListener("click", () => {
    const uidField = document.getElementById("profile-homeid-not-editable");
    const toggleIcon = document.getElementById("toggle-hid-visibility");

    if (uidField.type === "password") {
        uidField.type = "text";
        toggleIcon.classList.replace("bx-show", "bx-hide");
    } else {
        uidField.type = "password";
        toggleIcon.classList.replace("bx-hide", "bx-show");
    }
});