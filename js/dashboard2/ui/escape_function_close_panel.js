import {
    clearAddDeviceForm
} from "./fill_function_to_all_panel.js";

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

        sidebars.forEach((sidebar) => {
            if (sidebar && sidebar.classList.contains("show")) {
                sidebar.classList.remove("show");
                console.log(`🚪 Closed via Escape key: ${sidebar.id}`);
            }
            // ✅ Check if it was the Add Device sidebar
            if (sidebar.id === "sidebar7") {
                // 🔧 Clear Add Device form
                clearAddDeviceForm();
            }
        });


    }
});