// buttons.js
import {
    fillWiFiFieldsFromSaved,
    fillProfileFieldsFromSaved,
    adjustSidebar2,
    adjustSidebar3
} from './utils.js';

export function initSidebarButtons() {
    const sidebar = document.querySelector(".sidebar");
    const sidebar2 = document.querySelector(".sidebar2");
    const sidebar3 = document.querySelector(".sidebar3");
    const closeBtn = document.getElementById("btn");
    const settingsBtn = document.getElementById("settings-btn");
    const profileBtn = document.getElementById("profile-btn");

    if (closeBtn) {
        closeBtn.addEventListener("click", () => {
            sidebar.classList.toggle("open");
            adjustSidebar2();
            adjustSidebar3();
            closeBtn.classList.toggle("bx-menu-alt-right");
        });
    }


    if (settingsBtn) {
        settingsBtn.addEventListener("click", () => {
            sidebar2.classList.toggle("show");
            settingsBtn.classList.toggle("submenu-open");
            adjustSidebar2();
            if (sidebar2.classList.contains("show")) fillWiFiFieldsFromSaved();
        });

        document.addEventListener("click", (e) => {
            if (!sidebar2.contains(e.target) && !settingsBtn.contains(e.target)) {
                sidebar2.classList.remove("show");
                settingsBtn.classList.remove("submenu-open");
            }
        });

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && sidebar2.classList.contains("show")) {
                sidebar2.classList.remove("show");
                settingsBtn.classList.remove("submenu-open");
            }
        });
    }

    if (profileBtn) {
        profileBtn.addEventListener("click", () => {
            sidebar3.classList.toggle("show");
            profileBtn.classList.toggle("submenu-open");
            adjustSidebar3();
            if (sidebar3.classList.contains("show")) fillProfileFieldsFromSaved();
        });

        document.addEventListener("click", (e) => {
            if (!sidebar3.contains(e.target) && !profileBtn.contains(e.target)) {
                sidebar3.classList.remove("show");
                profileBtn.classList.remove("submenu-open");
            }
        });

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && sidebar3.classList.contains("show")) {
                sidebar3.classList.remove("show");
                profileBtn.classList.remove("submenu-open");
            }
        });
    }
}