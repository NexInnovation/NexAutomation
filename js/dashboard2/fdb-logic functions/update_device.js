import {
    db,
    ref,
    update
} from "../../firebase-module.js";

import DB_PATHS from "../../db-paths.js";

import {
    fillRoomSelectSidebar,
    fillUpdateDeviceRoomListSidebar
} from '../ui/fill_function_to_all_panel.js';

document.getElementById("update-device-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();

    console.log("🟡 Update Device form submitted!");

    // ✅ Get inputs
    const deviceId = document.getElementById("update-device-device-id").value.trim();
    const roomName = document.getElementById("update-device-room-name").value.trim();
    const chCount = parseInt(document.getElementById("update-device-channel-count").value);
    const wifiSSID = document.getElementById("update-device-wifi-ssid").value.trim();
    const wifiPass = document.getElementById("update-device-wifi-password").value.trim();

    console.log("🔎 Form Data Collected:", {
        deviceId,
        roomName,
        chCount,
        wifiSSID,
        wifiPass
    });

    if (!deviceId || !roomName || isNaN(chCount) || chCount <= 0 || !wifiSSID || !wifiPass) {
        console.warn("⚠️ Missing required fields!");
        return Swal.fire({
            icon: 'warning',
            title: 'Incomplete Data',
            text: 'Please fill all required fields correctly.'
        });
    }

    // 🔧 Validate relay data
    const relays = {};
    for (let i = 1; i <= chCount; i++) {
        const relayName = document.getElementById(`update-relay${i}-name`).value.trim();
        const relayType = parseInt(document.getElementById(`update-relay${i}-type`).value) || 1;

        if (!relayName) {
            console.warn(`⚠️ Relay ${i} name missing!`);
            return Swal.fire({
                icon: 'warning',
                title: `Relay ${i} Name Missing`,
                text: `Please enter a name for Relay ${i}.`
            });
        }
        relays[`R${i}`] = {
            name: relayName,
            type: relayType,
            state: 0
        };
    }
    console.log("✅ Relay data prepared:", relays);

    // 🔧 Prepare new device data
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

    const homeId = localStorage.getItem("currentUser_homeId");
    if (!homeId) {
        console.error("❌ Home ID not found!");
        return Swal.fire({
            icon: 'error',
            title: 'Home ID Missing',
            text: 'Could not find home ID in localStorage.'
        });
    }

    try {
        Swal.fire({
            title: 'Updating Device...',
            text: 'Please wait while we update your device.',
            allowOutsideClick: false,
            allowEscapeKey: false,
            didOpen: () => Swal.showLoading(),
        });

        // 🔄 Update device data in Firebase
        const updates = {};
        updates[`automation/${homeId}/automation/${deviceId}`] = newDeviceData;

        console.log("🔄 Firebase updates:", updates);
        await update(ref(db), updates);
        console.log("✅ Device data updated in Firebase!");

        // 🔄 Update localStorage
        let devices = JSON.parse(localStorage.getItem("devices") || "{}");
        devices[deviceId] = newDeviceData;
        localStorage.setItem("devices", JSON.stringify(devices));

        console.log("💾 LocalStorage updated for device:", deviceId);

        fillRoomSelectSidebar();
        fillUpdateDeviceRoomListSidebar();

        Swal.fire({
            icon: 'success',
            title: 'Device Updated',
            text: `Device ${deviceId} updated successfully.`,
            timer: 1500,
            showConfirmButton: false
        });

        // ✅ Hide Update Device sidebar
        window._9_update_device_sm_sidebar.classList.remove("show");

    } catch (error) {
        console.error("❌ Failed to update device:", error);
        Swal.fire({
            icon: 'error',
            title: 'Update Failed',
            text: error.message || 'An error occurred. Please try again.'
        });
    }
});

// 🔧 Generate relay fields when update channel count changes
document.getElementById("update-device-channel-count")?.addEventListener("change", (e) => {
    const count = parseInt(e.target.value);
    const container = document.getElementById("update-channel-name-fields");

    // 1️⃣ Store current relay data before clearing
    const existingRelays = {};
    const existingInputs = container.querySelectorAll("li");
    existingInputs.forEach((li, index) => {
        const relayIndex = index + 1;
        const relayName = li.querySelector(`#update-relay${relayIndex}-name`)?.value.trim() || '';
        const relayType = parseInt(li.querySelector(`#update-relay${relayIndex}-type`)?.value) || 1;
        existingRelays[`R${relayIndex}`] = {
            name: relayName,
            type: relayType
        };
    });

    // 2️⃣ Clear the container
    container.innerHTML = "";

    // 3️⃣ Re-create relay fields, using existing data if available
    for (let i = 1; i <= count; i++) {
        const existing = existingRelays[`R${i}`] || {
            name: '',
            type: 1
        };

        const li = document.createElement("li");
        li.innerHTML = `
            <label class="links_name">Relay ${i} Name</label>
            <input type="text" id="update-relay${i}-name" placeholder="Relay ${i} Name" value="${existing.name}" />

            <label class="links_name">Relay ${i} Type</label>
            <select id="update-relay${i}-type">
                <option value="1" ${existing.type == 1 ? 'selected' : ''}>On/Off (Light/Switch)</option>
                <option value="2" ${existing.type == 2 ? 'selected' : ''}>Dimming (Fan)</option>
            </select>
        `;
        container.appendChild(li);
    }

    console.log("✅ Update relay input fields generated for count:", count);
});