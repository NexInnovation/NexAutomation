import {
    showRoomOnDashboard
} from "./show_dashboard.js";

import {
    adjustSidebar
} from "./toggle_visibility_to_all_panel.js";

export function fillProfileDetails() {
    console.log("🟡 fillProfileDetails() called...");

    // Fetch and parse full profile from localStorage
    const profileJSON = localStorage.getItem("currentUser_fullProfile");

    if (!profileJSON) {
        console.warn("⚠️ No profile data found in localStorage.");
        return;
    }

    const profile = JSON.parse(profileJSON);

    console.log("✅ Loaded profile data from localStorage:");
    console.log(profile);

    // Populate form fields
    const firstNameInput = document.getElementById("profile-firstname");
    const lastNameInput = document.getElementById("profile-lasttname");
    const mobileInput = document.getElementById("profile-mobile");
    const emailInput = document.getElementById("profile-email");
    const cityInput = document.getElementById("profile-city");
    const roleInput = document.getElementById("profile-Role");
    const uidInput = document.getElementById("profile-uid-not-editable");
    const homeIdInput = document.getElementById("profile-homeid-not-editable");

    // Fill values from profile
    firstNameInput.value = profile.firstName || '';
    lastNameInput.value = profile.lastName || '';
    mobileInput.value = profile.mobile || '';
    emailInput.value = profile.email || '';
    cityInput.value = profile.city || '';
    roleInput.value = profile.role || '';
    uidInput.value = profile.uid || '';
    homeIdInput.value = localStorage.getItem("currentUser_homeId") || '';

    console.log("📋 Profile sidebar form filled successfully.");
}

export function fillRoomSelectSidebar() {
    console.log("🟡 Starting to fill Room Select Sidebar...");

    const roomListContainer = document.getElementById("room-list-container");
    const noRoomMsg = roomListContainer.querySelector(".no-room-msg");

    console.log("🔧 Cleared previous room list (except label & no-room-msg).");
    // 🔄 Clear previous room list (except the label and no-room-msg)
    roomListContainer.querySelectorAll("li.room-item").forEach(li => li.remove());

    // 🔧 Load devices from localStorage
    const devices = JSON.parse(localStorage.getItem("devices") || "{}");
    console.log("🗃️ Devices from localStorage:", devices);

    const roomEntries = [];

    // 🏷️ Extract room names and device IDs
    for (const deviceId in devices) {
        const device = devices[deviceId];
        if (device.deviceData && device.deviceData.roomName) {
            roomEntries.push({
                roomName: device.deviceData.roomName,
                deviceId
            });
        }
    }

    console.log("🔍 Room entries found:", roomEntries);

    if (roomEntries.length === 0) {
        // 🛑 No rooms: Show no-room-msg
        noRoomMsg.style.display = "block";
        console.warn("⚠️ No rooms found. Displaying no-room message.");
        return;
    }

    // ✅ Rooms exist: Hide no-room-msg
    noRoomMsg.style.display = "none";
    console.log("✅ Hiding no-room message. Populating rooms...");

    // 🏠 Add each room as a <li> containing a <label> with id=deviceId
    roomEntries.forEach(({
        roomName,
        deviceId
    }) => {
        console.log(`🟩 Creating entry for: ${roomName} (${deviceId})`);

        const li = document.createElement("li");
        li.classList.add("room-item");

        // Create label with id=deviceId and links_name class
        const label = document.createElement("label");
        label.id = deviceId; // ✅ deviceId as HTML id
        label.classList.add("links_name");
        label.textContent = roomName;

        // 🔗 Click event on <label>
        label.addEventListener("click", () => {
            console.log(`✅ Room selected: ${roomName} (Device ID: ${deviceId})`);
            // 👉 Example callback: load room data
            showRoomOnDashboard(deviceId, roomName);
        });

        li.appendChild(label);
        roomListContainer.appendChild(li);

        console.log(`✅ Added to sidebar: ${roomName} (Label ID: ${deviceId})`);
    });

    console.log("✅ Final: Room list successfully populated in Sidebar 3!");
}

/**
 * 🟩 Fill Update Device Form with selected device data
 */
export function populateUpdateDeviceForm(deviceId) {
    console.log("🟡 Populating Update Device Form for deviceId:", deviceId);

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

    // Fill in the fields in sidebar9
    document.getElementById("update-device-device-id").value = deviceId;
    document.getElementById("update-device-room-name").value = device.deviceData.roomName || '';
    document.getElementById("update-device-channel-count").value = device.deviceData.chNumber || 1;
    document.getElementById("update-device-wifi-ssid").value = device["wifi-config"]?.ssid || '';
    document.getElementById("update-device-wifi-password").value = device["wifi-config"]?.password || '';

    // Generate relay fields dynamically
    const channelContainer = document.getElementById("update-channel-name-fields");
    channelContainer.innerHTML = ""; // Clear existing fields

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

    console.log("✅ Update Device Form populated with device data:", device);
}

export function fillUpdateDeviceRoomListSidebar() {
    console.log("🟡 Starting to fill Update Device Room List Sidebar...");

    const roomListContainer = document.querySelector("#sidebar8 ul.nav-list");
    const noRoomMsg = roomListContainer.querySelector(".no-room-msg");
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
        label.textContent = roomName;

        label.addEventListener("click", (event) => {
            console.log(`✅ Room selected for Update: ${roomName} (Device ID: ${deviceId})`);
            populateUpdateDeviceForm(deviceId);

            // Hide sidebar8 and show sidebar9
            window._8_select_room_sm_sidebar.classList.remove("show");
            window._9_update_device_sm_sidebar.classList.add("show");

            // Adjust sidebar if needed
            adjustSidebar(window._9_update_device_sm_sidebar, window._4_setting_menu_sidebar_show_btn);

            // 🚫 Prevent global click handler from immediately closing the sidebar
            event.stopPropagation();
        });

        li.appendChild(label);
        roomListContainer.appendChild(li);
    });

    console.log("✅ Update Device Room list populated.");
}



/**
 * 🟩 Fill Member List Sidebar (Sidebar 6)
 */
export function fillMemberListSidebar() {
    console.log("🟡 Starting to fill Member List Sidebar...");

    // Get references to the admin and member lists
    const adminListContainer = document.getElementById("admin-list");
    const memberListContainer = document.getElementById("member-list");

    // Clear existing entries
    adminListContainer.innerHTML = "";
    memberListContainer.innerHTML = "";

    // 🔧 Load all users from localStorage
    const allUsers = JSON.parse(localStorage.getItem("allUsers") || "{}");
    console.log("🗃️ All users from localStorage:", allUsers);

    // 🟩 Populate admin
    const adminEntries = allUsers.admin || {};
    for (const uid in adminEntries) {
        const admin = adminEntries[uid];
        const li = document.createElement("li");
        const displayName = `${admin.firstName || '-'} : ${admin.email || '-'}`;
        li.textContent = displayName;
        adminListContainer.appendChild(li);
        console.log(`✅ Added admin to list: ${displayName}`);
    }

    // 🟩 Populate members
    const memberEntries = allUsers.members || {};
    for (const uid in memberEntries) {
        const member = memberEntries[uid];
        const li = document.createElement("li");
        const displayName = `${member.firstName || '-'} : ${member.email || '-'}`;
        li.textContent = displayName;
        memberListContainer.appendChild(li);
        console.log(`✅ Added member to list: ${displayName}`);
    }

    console.log("✅ Final: Member list successfully populated in Sidebar 6!");
}


export function clearAddDeviceForm() {
    console.log("🧹 Clearing Add Device form...");

    // Clear main input fields
    document.getElementById("device-room-name").value = "";
    document.getElementById("device-channel-count").value = "";
    document.getElementById("device-wifi-ssid").value = "";
    document.getElementById("device-wifi-password").value = "";

    // Clear dynamically generated relay name/type fields
    document.getElementById("channel-name-fields").innerHTML = "";

    console.log("✅ Add Device form cleared!");
}