import {
    db,
    ref,
    get,
    update
} from "../../firebase-module.js";
import DB_PATHS from "../../db-paths.js";

import {
    fillRoomSelectSidebar,
    fillUpdateDeviceRoomListSidebar
} from '../ui/fill_function_to_all_panel.js';

document.getElementById("add-device-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();

    console.log("🟡 Add Device form submitted!");

    // ✅ Get basic inputs
    const roomName = document.getElementById("device-room-name").value.trim();
    const chCount = parseInt(document.getElementById("device-channel-count").value);
    const wifiSSID = document.getElementById("device-wifi-ssid").value.trim();
    const wifiPass = document.getElementById("device-wifi-password").value.trim();

    console.log("🔎 Form Data Collected:", {
        roomName,
        chCount,
        wifiSSID,
        wifiPass
    });

    // 🔒 Validate inputs
    if (!roomName) {
        console.warn("⚠️ Room name missing!");
        return Swal.fire({
            icon: 'warning',
            title: 'Missing Room Name',
            text: 'Please enter the room name.'
        });
    }
    if (isNaN(chCount) || chCount <= 0) {
        console.warn("⚠️ Invalid channel count!");
        return Swal.fire({
            icon: 'warning',
            title: 'Invalid Channel Count',
            text: 'Please enter a valid channel count.'
        });
    }
    if (!wifiSSID || !wifiPass) {
        console.warn("⚠️ Wi-Fi credentials missing!");
        return Swal.fire({
            icon: 'warning',
            title: 'Missing Wi-Fi Details',
            text: 'Please enter both SSID and password.'
        });
    }

    // 🔧 Validate relay details
    for (let i = 1; i <= chCount; i++) {
        const relayName = document.getElementById(`relay${i}-name`).value.trim();
        const relayType = document.getElementById(`relay${i}-type`).value.trim();

        if (!relayName) {
            console.warn(`⚠️ Relay ${i} name missing!`);
            return Swal.fire({
                icon: 'warning',
                title: `Relay ${i} Name Missing`,
                text: `Please enter a name for Relay ${i}.`
            });
        }
        if (!relayType) {
            console.warn(`⚠️ Relay ${i} type missing!`);
            return Swal.fire({
                icon: 'warning',
                title: `Relay ${i} Type Missing`,
                text: `Please select a type for Relay ${i}.`
            });
        }
    }

    // ✅ Prepare relay data
    const relays = {};
    for (let i = 1; i <= chCount; i++) {
        const relayName = document.getElementById(`relay${i}-name`).value.trim();
        const relayType = parseInt(document.getElementById(`relay${i}-type`).value) || 1;
        relays[`R${i}`] = {
            name: relayName,
            type: relayType,
            state: 0
        };
    }
    console.log("✅ Relay data prepared:", relays);

    // 🔧 Get homeId from localStorage
    const homeId = localStorage.getItem("currentUser_homeId");
    if (!homeId) {
        console.error("❌ Home ID not found in localStorage!");
        return Swal.fire({
            icon: 'error',
            title: 'Home ID Missing',
            text: 'Could not find home ID in session. Please login again.'
        });
    }

    try {
        Swal.fire({
            title: 'Adding Device...',
            text: 'Please wait while we save your device.',
            allowOutsideClick: false,
            allowEscapeKey: false,
            didOpen: () => Swal.showLoading(),
        });

        // 🔄 Fetch current total device count
        const homeDataRef = ref(db, DB_PATHS.homeData(homeId));
        const homeDataSnap = await get(homeDataRef);
        const homeData = homeDataSnap.exists() ? homeDataSnap.val() : {};
        const newTotalDevices = (homeData["total device"] || 0) + 1;

        const deviceId = `device${newTotalDevices}`;
        console.log("🆕 New Device ID:", deviceId);

        // 🔧 Device data structure
        const newDeviceData = {
            "wifi-config": {
                ssid: wifiSSID,
                password: wifiPass
            },
            "deviceData": {
                roomName,
                chNumber: chCount
            },
            ...relays
        };

        console.log("📦 Final device data to save:", newDeviceData);

        // 🔧 Prepare updates
        const updates = {};
        updates[`automation/${homeId}/home-data/total device`] = newTotalDevices;
        updates[`automation/${homeId}/automation/${deviceId}`] = newDeviceData;

        console.log("🔄 Firebase updates:", updates);

        // 🔧 Update Firebase
        await update(ref(db), updates);
        console.log("✅ Device successfully added to Firebase!");

        // ✅ Update localStorage for 'devices' & 'currentUser_totalDevices'
        let devices = JSON.parse(localStorage.getItem("devices") || "{}");
        devices[deviceId] = newDeviceData;
        localStorage.setItem("devices", JSON.stringify(devices));
        localStorage.setItem("currentUser_totalDevices", newTotalDevices);

        console.log("💾 Updated localStorage devices:", devices);

        fillRoomSelectSidebar();
        fillUpdateDeviceRoomListSidebar();

        // ✅ Success
        Swal.fire({
            icon: 'success',
            title: 'Device Added',
            text: `Device added as ${deviceId}`,
            timer: 1500,
            showConfirmButton: false
        });

        // ✅ Clear form
        document.getElementById("add-device-form").reset();
        document.getElementById("channel-name-fields").innerHTML = "";

    } catch (error) {
        console.error("❌ Failed to add device:", error);
        Swal.fire({
            icon: 'error',
            title: 'Failed to Add Device',
            text: error.message || 'An error occurred. Please try again.'
        });
    }
});

// 🔧 Generate relay fields when channel count changes
document.getElementById("device-channel-count")?.addEventListener("change", (e) => {
    const count = parseInt(e.target.value);
    const container = document.getElementById("channel-name-fields");
    container.innerHTML = "";

    for (let i = 1; i <= count; i++) {
        const li = document.createElement("li");
        li.innerHTML = `
            <label class="links_name">Relay ${i} Name</label>
            <input type="text" id="relay${i}-name" placeholder="Relay ${i} Name" />

            <label class="links_name">Relay ${i} Type</label>
            <select id="relay${i}-type">
                <option value="1">On/Off (Light/Switch)</option>
                <option value="2">Dimming (Fan)</option>
            </select>
        `;
        container.appendChild(li);
    }
    console.log("✅ Relay input fields generated for count:", count);
});