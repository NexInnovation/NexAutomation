// file name: fill_function_to_all_panel.js

const DEBUG = false;

import DB_PATHS from "../../db-paths.js";

import {
    get,
    db,
    ref,
    update
} from "../../firebase-module.js";

import {
    deleteMemberByEmail
} from "../fdb-logic functions/delet_member.js";

import {
    showRoomOnDashboard
} from "./show_dashboard.js";

import {
    adjustSidebar
} from "./toggle_visibility_to_all_panel.js";


/**
 * Utility: Hide a sidebar
 */
function hideSidebar(sidebar) {
    if (sidebar && sidebar.classList.contains("show")) {
        sidebar.classList.remove("show");
    }
}

/**
 * Utility: Show a sidebar
 */
function showSidebar(sidebar) {
    if (sidebar && !sidebar.classList.contains("show")) {
        sidebar.classList.add("show");
    }
}

/**
 * 🟩 Fill Profile Details Sidebar
 */
export function fillProfileDetails() {
    if (DEBUG) console.log("🟡 fillProfileDetails() called...");

    const profileJSON = localStorage.getItem("currentUser_fullProfile");

    if (!profileJSON) {
        console.warn("⚠️ No profile data found in localStorage.");
        return;
    }

    const profile = JSON.parse(profileJSON);
    if (DEBUG) console.log("✅ Loaded profile data from localStorage:", profile);

    document.getElementById("profile-firstname").value = profile.firstName || '';
    document.getElementById("profile-lasttname").value = profile.lastName || '';
    document.getElementById("profile-mobile").value = profile.mobile || '';
    document.getElementById("profile-email").value = profile.email || '';
    document.getElementById("profile-city").value = profile.city || '';
    document.getElementById("profile-Role").value = profile.role || '';
    document.getElementById("profile-uid-not-editable").value = profile.uid || '';
    document.getElementById("profile-homeid-not-editable").value = localStorage.getItem("currentUser_homeId") || '';

    const sidebarUsername = document.getElementById("sidebar-username");
    if (sidebarUsername) {
        sidebarUsername.textContent = profile.firstName || 'User';
    }

    if (DEBUG) console.log("📋 Profile sidebar form filled successfully.");
}

/**
 * 🟩 Fill Room Select Sidebar
 */
export function fillRoomSelectSidebar() {
    if (DEBUG) console.log("🟡 Starting to fill Room Select Sidebar...");

    const roomListContainer = document.getElementById("room-list-container");
    const noRoomMsg = roomListContainer.querySelector(".no-room-msg");

    // Clear previous entries
    roomListContainer.querySelectorAll("li.room-item").forEach(li => li.remove());

    const devices = JSON.parse(localStorage.getItem("devices") || "{}");
    if (DEBUG) console.log("🗃️ Devices from localStorage:", devices);

    const roomEntries = Object.entries(devices)
        .filter(([_, device]) => device.deviceData?.roomName)
        .map(([deviceId, device]) => ({
            roomName: device.deviceData.roomName,
            deviceId
        }));

    if (DEBUG) console.log("🔍 Room entries found:", roomEntries);

    if (roomEntries.length === 0) {
        noRoomMsg.style.display = "block";
        console.warn("⚠️ No rooms found. Displaying no-room message.");
        return;
    }

    noRoomMsg.style.display = "none";
    if (DEBUG) console.log("✅ Hiding no-room message. Populating rooms...");

    roomEntries.forEach(({
        roomName,
        deviceId
    }) => {
        if (DEBUG) console.log(`🟩 Creating entry for: ${roomName} (${deviceId})`);
        const li = document.createElement("li");
        li.classList.add("room-item");

        const label = document.createElement("label");
        label.id = deviceId;
        label.classList.add("links_name");

        const iconSpan = document.createElement("span");
        iconSpan.classList.add("room-icon");
        iconSpan.textContent = "▶️";

        const nameSpan = document.createElement("span");
        nameSpan.textContent = roomName;

        label.appendChild(iconSpan);
        label.appendChild(nameSpan);

        label.addEventListener("click", () => {
            if (DEBUG) console.log(`✅ Room selected: ${roomName} (Device ID: ${deviceId})`);
            showRoomOnDashboard(deviceId, roomName);
        });

        li.appendChild(label);
        roomListContainer.appendChild(li);
        if (DEBUG) console.log(`✅ Added to sidebar: ${roomName} (Label ID: ${deviceId})`);
    });

    if (DEBUG) console.log("✅ Final: Room list successfully populated in Sidebar 3!");
}

/**
 * 🟩 Populate Update Device Form
 */
export function populateUpdateDeviceForm(deviceId) {
    if (DEBUG) console.log("🟡 Populating Update Device Form for deviceId:", deviceId);

    const devices = JSON.parse(localStorage.getItem("devices") || "{}");
    const device = devices[deviceId];

    if (!device) {
        console.error("❌ Device not found in localStorage!");
        return Swal.fire({
            icon: 'error',
            title: 'Device Not Found',
            text: 'The selected device does not exist in local data.'
        });
    }

    document.getElementById("update-device-device-id").value = deviceId;
    document.getElementById("update-device-room-name").value = device.deviceData.roomName || '';
    document.getElementById("update-device-channel-count").value = device.deviceData.chNumber || 1;
    document.getElementById("update-device-wifi-ssid").value = device["wifi-config"]?.ssid || '';
    document.getElementById("update-device-wifi-password").value = device["wifi-config"]?.password || '';

    const channelContainer = document.getElementById("update-channel-name-fields");
    channelContainer.innerHTML = "";

    const chCount = device.deviceData.chNumber || 1;
    for (let i = 1; i <= chCount; i++) {
        const relay = device[`R${i}`];
        const relayName = relay?.name || '';
        const relayType = relay?.type || 1;

        const li = document.createElement("li");
        li.innerHTML = `
        <label class="links_name">Relay ${i} Name</label>
        <input type="text" id="update-relay${i}-name" value="${relayName}" placeholder="Relay ${i} Name" />
        <label class="links_name">Relay ${i} Type</label>
        <select id="update-relay${i}-type">
          <option value="1" ${relayType == 1 ? 'selected' : ''}>On/Off (Light/Switch)</option>
          <option value="2" ${relayType == 2 ? 'selected' : ''}>Dimming (Fan)</option>
        </select>
      `;
        channelContainer.appendChild(li);
    }

    if (DEBUG) console.log("✅ Update Device Form populated with device data:", device);
}


export function fillUpdateDeviceRoomListSidebar() {
    if (DEBUG) console.log("🟡 Starting to fill Update Device Room List Sidebar...");

    const roomListContainer = document.querySelector("#sidebar8 ul.nav-list");
    const noRoomMsg = roomListContainer.querySelector(".no-room-msg");

    // Clear previous room list
    roomListContainer.querySelectorAll("li.room-item").forEach(li => li.remove());

    const devices = JSON.parse(localStorage.getItem("devices") || "{}");
    const roomEntries = [];

    for (const deviceId in devices) {
        const device = devices[deviceId];
        if (device.deviceData && device.deviceData.roomName) {
            roomEntries.push({
                roomName: device.deviceData.roomName,
                deviceId
            });
        }
    }

    if (roomEntries.length === 0) {
        noRoomMsg.style.display = "block";
        console.warn("⚠️ No rooms found. Displaying no-room message.");
        return;
    }

    noRoomMsg.style.display = "none";

    roomEntries.forEach(({
        roomName,
        deviceId
    }) => {
        const li = document.createElement("li");
        li.classList.add("room-item");

        const label = document.createElement("label");
        label.id = `updatemenu_${deviceId}`;
        label.classList.add("links_name");

        // ➡️ Triangle icon
        const iconSpan = document.createElement("span");
        iconSpan.classList.add("room-icon");
        iconSpan.textContent = "▶️";

        // ➡️ Room name span
        const nameSpan = document.createElement("span");
        nameSpan.textContent = roomName;

        // ➡️ Delete icon (🗑️)
        const deleteIcon = document.createElement("span");
        deleteIcon.textContent = "🗑️";
        deleteIcon.classList.add("delete-icon");
        deleteIcon.title = "Delete Room";
        deleteIcon.style.cursor = "pointer";
        deleteIcon.style.marginLeft = "10px";
        deleteIcon.style.color = "red";

        // 🟡 Sidebar 9 show logic on label click
        label.addEventListener("click", (event) => {
            event.stopPropagation(); // 🛑 Stop click from bubbling to document
            if (DEBUG) console.log(`✅ Room selected for Update: ${roomName} (Device ID: ${deviceId})`);

            // Hide Sidebar8 (room list) and show Sidebar9 (update device)
            if (window._8_select_room_sm_sidebar) {
                window._8_select_room_sm_sidebar.classList.remove("show");
            }
            if (window._9_update_device_sm_sidebar) {
                window._9_update_device_sm_sidebar.classList.add("show");
            }

            // Mark Sidebar9 as recently opened to also protect against accidental outside clicks
            window._9_update_device_sm_sidebar.dataset.recentlyOpened = "true";

            // Clear form and fill update data
            clearAddDeviceForm();
            populateUpdateDeviceForm(deviceId);

            // Adjust Sidebar9 position
            adjustSidebar(window._9_update_device_sm_sidebar, window._4_setting_menu_sidebar_show_btn);
        });

        // 🟥 Delete click handler with Swal
        deleteIcon.addEventListener("click", async (event) => {
            event.stopPropagation();
            const result = await Swal.fire({
                title: 'Delete Room?',
                text: `Are you sure you want to delete the room:\n\n${roomName}`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, delete it!',
                cancelButtonText: 'Cancel',
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6'
            });

            if (result.isConfirmed) {
                // 🔄 Show loading spinner
                Swal.fire({
                    title: 'Deleting...',
                    text: 'Please wait while the room is being deleted.',
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    didOpen: () => Swal.showLoading()
                });

                // 🔄 Perform the delete
                await deleteDevice(deviceId, roomName);

                // ✅ Show success
                await Swal.fire({
                    icon: 'success',
                    title: 'Deleted!',
                    text: `Room '${roomName}' deleted successfully.`,
                    timer: 1500,
                    showConfirmButton: false
                });
            }
        });

        // ➡️ Append label content
        label.appendChild(iconSpan);
        label.appendChild(nameSpan);

        // ➡️ Append label & delete icon to list item
        li.appendChild(label);
        li.appendChild(deleteIcon);

        roomListContainer.appendChild(li);
    });

    if (DEBUG) console.log("✅ Update Device Room list populated.");
}


async function deleteDevice(deviceId, roomName) {
    if (DEBUG) console.log(`🗑️ Deleting device: ${roomName} (${deviceId})...`);

    try {
        const homeId = localStorage.getItem("currentUser_homeId");
        if (!homeId) throw new Error("Home ID not found!");

        // 🔍 Get current total device count
        const totalDevicesRef = ref(db, DB_PATHS.totalDevices(homeId));
        const totalDevicesSnap = await get(totalDevicesRef);
        let totalDevices = totalDevicesSnap.exists() ? totalDevicesSnap.val() : 0;

        // Decrement total device count (avoid negative)
        totalDevices = Math.max(0, totalDevices - 1);

        // Prepare updates
        const updates = {};
        updates[DB_PATHS.deviceById(homeId, deviceId)] = null; // Delete device
        updates[DB_PATHS.totalDevices(homeId)] = totalDevices; // Update total devices

        if (DEBUG) console.log("🗑️ Firebase delete updates:", updates);
        await update(ref(db), updates);

        // Update localStorage
        const devices = JSON.parse(localStorage.getItem("devices") || "{}");
        delete devices[deviceId];
        localStorage.setItem("devices", JSON.stringify(devices));
        localStorage.setItem("currentUser_totalDevices", totalDevices); // Update localStorage

        // ✅ Show success
        await Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: `Room '${roomName}' deleted successfully.`,
            timer: 1500,
            showConfirmButton: false
        });

        // Refresh the sidebar
        fillUpdateDeviceRoomListSidebar();
        fillRoomSelectSidebar();

        location.reload();
    } catch (error) {
        console.error("❌ Error deleting device:", error.message);
        await Swal.fire({
            icon: 'error',
            title: 'Delete Failed!',
            text: `Failed to delete room: ${error.message}`
        });
    }
}


/**
 * 🟩 Fill Member List Sidebar (Sidebar 6)
 */
// export function fillMemberListSidebar() {
//     if (DEBUG) console.log("🟡 Starting to fill Member List Sidebar...");

//     // Get references to the admin and member lists
//     const adminListContainer = document.getElementById("admin-list");
//     const memberListContainer = document.getElementById("member-list");

//     // Clear existing entries
//     adminListContainer.innerHTML = "";
//     memberListContainer.innerHTML = "";

//     // 🔧 Load all users from localStorage
//     const allUsers = JSON.parse(localStorage.getItem("allUsers") || "{}");
//     if (DEBUG) console.log("🗃️ All users from localStorage:", allUsers);

//     // 🟩 Populate admin
//     const adminEntries = allUsers.admin || {};
//     for (const uid in adminEntries) {
//         const admin = adminEntries[uid];
//         const li = document.createElement("li");
//         const displayName = `${admin.firstName || '-'} : ${admin.email || '-'}`;
//         li.textContent = displayName;
//         adminListContainer.appendChild(li);
//         if (DEBUG) console.log(`✅ Added admin to list: ${displayName}`);
//     }

//     // 🟩 Populate members
//     const memberEntries = allUsers.members || {};
//     for (const uid in memberEntries) {
//         const member = memberEntries[uid];
//         const li = document.createElement("li");
//         const displayName = `${member.firstName || '-'} : ${member.email || '-'}`;
//         li.textContent = displayName;
//         memberListContainer.appendChild(li);
//         if (DEBUG) console.log(`✅ Added member to list: ${displayName}`);
//     }

//     if (DEBUG) console.log("✅ Final: Member list successfully populated in Sidebar 6!");
// }

export function fillMemberListSidebar() {
    if (DEBUG) console.log("🟡 Starting to fill Member List Sidebar...");

    // Get references to the admin and member lists
    const adminListContainer = document.getElementById("admin-list");
    const memberListContainer = document.getElementById("member-list");

    // Clear existing entries
    adminListContainer.innerHTML = "";
    memberListContainer.innerHTML = "";

    // 🔧 Load all users from localStorage
    const allUsers = JSON.parse(localStorage.getItem("allUsers") || "{}");
    if (DEBUG) console.log("🗃️ All users from localStorage:", allUsers);

    // 🟩 Populate admin
    const adminEntries = allUsers.admin || {};
    for (const uid in adminEntries) {
        const admin = adminEntries[uid];
        const li = document.createElement("li");
        const displayName = `${admin.firstName || '-'} : ${admin.email || '-'}`;
        li.textContent = displayName;
        adminListContainer.appendChild(li);
        if (DEBUG) console.log(`✅ Added admin to list: ${displayName}`);
    }

    // 🟩 Populate members
    const memberEntries = allUsers.members || {};
    for (const uid in memberEntries) {
        const member = memberEntries[uid];

        const li = document.createElement("li");

        // Create flex container to align text and delete icon
        const flexContainer = document.createElement("div");
        flexContainer.classList.add("member-list-entry");

        // Create span for member info
        const span = document.createElement("span");
        span.textContent = `${member.firstName || '-'} : ${member.email || '-'}`;

        // Create delete button
        const deleteBtn = document.createElement("button");
        deleteBtn.innerHTML = "🗑️";
        deleteBtn.classList.add("delete-member-btn");

        // Attach delete logic to button
        deleteBtn.addEventListener("click", () => {
            if (DEBUG) console.log(`🟡 Delete button clicked for member: ${member.email}`);
            deleteMemberByEmail(member.email, uid);
        });

        // Append span and delete button to the flex container
        flexContainer.appendChild(span);
        flexContainer.appendChild(deleteBtn);

        // Append flex container to li
        li.appendChild(flexContainer);

        // Append li to the member list container
        memberListContainer.appendChild(li);

        if (DEBUG) console.log(`✅ Added member to list: ${member.email}`);
    }

    if (DEBUG) console.log("✅ Final: Member list successfully populated in Sidebar 6!");
}



/**
 * 🟩 Utility: Clear Add Device Form
 */
export function clearAddDeviceForm() {
    if (DEBUG) console.log("🧹 Clearing Add Device form...");
    document.getElementById("device-room-name").value = "";
    document.getElementById("device-channel-count").value = "";
    document.getElementById("device-wifi-ssid").value = "";
    document.getElementById("device-wifi-password").value = "";
    document.getElementById("channel-name-fields").innerHTML = "";
    if (DEBUG) console.log("✅ Add Device form cleared!");
}

/**
 * 🟩 Utility: Clear Add Member Form
 */
export function clearAddMemberForm() {
    if (DEBUG) console.log("🧹 Clearing Add Member form...");
    document.getElementById("mfname").value = "";
    document.getElementById("memail").value = "";
    document.getElementById("mpassword").value = "";
    document.getElementById("Apassword").value = "";
    if (DEBUG) console.log("✅ Add Member form cleared!");
}