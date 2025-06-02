// file name: escape_function_close_panel.js

const DEBUG = false;

import {
    clearAddDeviceForm,
    clearAddMemberForm
} from "./fill_function_to_all_panel.js";

/**
 * 🔧 Clears relevant forms based on which sidebar was closed
 */
function clearSidebarFormIfNeeded(sidebarId) {
    if (sidebarId === "sidebar7") {
        clearAddDeviceForm();
    } else if (sidebarId === "sidebar5") {
        clearAddMemberForm();
    }
}

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        const sidebars = [
            window._1_main_horizontal_sidebar,
            window._2_profile_show_sidebar,
            window._3_Select_room_main_sidebar,
            window._4_setting_menu_sidebar,
            window._5_add_member_sm_sidebar,
            window._6_list_member_sm_sidebar,
            window._7_add_device_sm_sidebar,
            window._8_select_room_sm_sidebar,
            window._9_update_device_sm_sidebar
        ];

        for (const sidebar of sidebars) {
            if (sidebar && sidebar.classList.contains("show")) {
                sidebar.classList.remove("show");
                if (DEBUG) console.log(`🚪 Closed via Escape key: ${sidebar.id}`);
                clearSidebarFormIfNeeded(sidebar.id);
                break; // Exit after closing one sidebar
            }
        }
    }
});