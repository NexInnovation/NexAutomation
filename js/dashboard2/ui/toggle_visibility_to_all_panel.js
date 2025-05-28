window._1_main_horizontal_sidebar = document.getElementById("sidebar1");
window._2_profile_show_sidebar = document.getElementById("sidebar2");
window._3_Select_room_main_sidebar = document.getElementById("sidebar3");
window._4_setting_menu_sidebar = document.getElementById("sidebar4");
window._5_add_member_sm_sidebar = document.getElementById("sidebar5");
window._6_list_member_sm_sidebar = document.getElementById("sidebar6");
window._7_add_device_sm_sidebar = document.getElementById("sidebar7");
window._8_select_room_sm_sidebar = document.getElementById("sidebar8");
window._9_update_device_sm_sidebar = document.getElementById("sidebar9");

window._1_main_horizontal_sidebar_open_btn = document.getElementById("open_btn");
window._2_profile_show_sidebar_show_btn = document.getElementById("profile-btn");
window._3_Select_room_main_sidebar_show_btn = document.getElementById("room-btn");
window._4_setting_menu_sidebar_show_btn = document.getElementById("settings-btn");
window._5_add_member_sm_sidebar_show_btn = document.getElementById("add-member-btn");
window._6_list_member_sm_sidebar_show_btn = document.getElementById("list-member-btn");
window._7_add_device_sm_sidebar_show_btn = document.getElementById("add-device-btn");
window._8_select_room_update_device_sm_sidebar_show_btn = document.getElementById("update-device-btn");
window._9_update_device_sm_sidebar_show_btn = document.getElementById("update-device-form");

const toggle_UID_Visibility = document.getElementById('toggle-uid-visibility');
const toggle_HID_Visibility = document.getElementById('toggle-hid-visibility');

toggle_UID_Visibility.addEventListener('click', function () {
    const input = document.getElementById('profile-uid-not-editable');
    this.classList.toggle('bx-show');
    this.classList.toggle('bx-hide');
    input.type = input.type === 'password' ? 'text' : 'password';
});

toggle_HID_Visibility.addEventListener('click', function () {
    const input = document.getElementById('profile-homeid-not-editable');
    this.classList.toggle('bx-show');
    this.classList.toggle('bx-hide');
    input.type = input.type === 'password' ? 'text' : 'password';
});

function adjustSidebar(sidebarElement, triggerBtnElement) {
    if (!sidebarElement.classList.contains("show")) return;

    sidebarElement.style.left = _1_main_horizontal_sidebar.classList.contains("open") ? "255px" : "83px";
    const top = triggerBtnElement.getBoundingClientRect().top + window.scrollY;
    sidebarElement.style.top = `${top}px`;
    sidebarElement.style.height = `${window.innerHeight - top - 10}px`;
}

_1_main_horizontal_sidebar_open_btn.addEventListener("click", () => {
    if (_1_main_horizontal_sidebar.classList.contains("open")) {
        _1_main_horizontal_sidebar.classList.remove("open");
    } else {
        _1_main_horizontal_sidebar.classList.add("open");

    }
});

_2_profile_show_sidebar_show_btn.addEventListener("click", () => {
    if (_2_profile_show_sidebar.classList.contains("show")) {
        _2_profile_show_sidebar.classList.remove("show");
    } else {
        _2_profile_show_sidebar.classList.add("show");
        _3_Select_room_main_sidebar.classList.remove("show");
        _4_setting_menu_sidebar.classList.remove("show");
        adjustSidebar(_2_profile_show_sidebar, _2_profile_show_sidebar_show_btn);
    }
});

_3_Select_room_main_sidebar_show_btn.addEventListener("click", () => {
    if (_3_Select_room_main_sidebar.classList.contains("show")) {
        _3_Select_room_main_sidebar.classList.remove("show");
    } else {
        _3_Select_room_main_sidebar.classList.add("show");
        _2_profile_show_sidebar.classList.remove("show");
        _4_setting_menu_sidebar.classList.remove("show");
        adjustSidebar(_3_Select_room_main_sidebar, _3_Select_room_main_sidebar_show_btn);
    }
});

_4_setting_menu_sidebar_show_btn.addEventListener("click", () => {
    if (_4_setting_menu_sidebar.classList.contains("show")) {
        _4_setting_menu_sidebar.classList.remove("show");
    } else {
        _4_setting_menu_sidebar.classList.add("show");
        _2_profile_show_sidebar.classList.remove("show");
        _3_Select_room_main_sidebar.classList.remove("show");
        adjustSidebar(_4_setting_menu_sidebar, _4_setting_menu_sidebar_show_btn);
    }
});