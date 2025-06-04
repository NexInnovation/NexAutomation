import {
    auth,
    db,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
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

    const roomName = document.getElementById("device-room-name").value.trim();
    const chCount = parseInt(document.getElementById("device-channel-count").value);
    const wifiSSID = document.getElementById("device-wifi-ssid").value.trim();
    const wifiPass = document.getElementById("device-wifi-password").value.trim();
    const adminPassword = document.getElementById("admin-password").value.trim();

    console.log("🔎 Collected Form Data:", {
        roomName,
        chCount,
        wifiSSID,
        wifiPass,
        adminPassword
    });

    // 🔒 Validation
    if (!roomName || !wifiSSID || !wifiPass || !adminPassword) {
        return Swal.fire({
            icon: 'warning',
            title: 'Missing Fields',
            text: 'Please fill in all fields.'
        });
    }
    if (isNaN(chCount) || chCount <= 0) {
        return Swal.fire({
            icon: 'warning',
            title: 'Invalid Channel Count',
            text: 'Please enter a valid channel count.'
        });
    }

    for (let i = 1; i <= chCount; i++) {
        const relayName = document.getElementById(`relay${i}-name`).value.trim();
        const relayType = document.getElementById(`relay${i}-type`).value.trim();
        if (!relayName || !relayType) {
            return Swal.fire({
                icon: 'warning',
                title: `Relay ${i} Details Missing`,
                text: `Please complete all fields for Relay ${i}.`
            });
        }
    }

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
    console.log("✅ Relay data:", relays);

    const homeId = localStorage.getItem("currentUser_homeId");
    if (!homeId) {
        return Swal.fire({
            icon: 'error',
            title: 'Home ID Missing',
            text: 'Please login again.'
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

        // 🔄 Fetch total devices
        const homeDataRef = ref(db, DB_PATHS.homeData(homeId));
        const homeDataSnap = await get(homeDataRef);
        const homeData = homeDataSnap.exists() ? homeDataSnap.val() : {};
        const newTotalDevices = (homeData["total device"] || 0) + 1;

        const deviceId = `device${newTotalDevices}`;
        const deviceEmail = `${homeId}-${deviceId}@gmail.com`.toLowerCase();
        const devicePassword = "Nex.Device@6112";

        console.log("🆕 Creating device Auth user:", deviceEmail);
        await createUserWithEmailAndPassword(auth, deviceEmail, devicePassword);
        console.log("✅ Device user created!");

        // 🟡 Re-login as admin
        const adminEmail = localStorage.getItem("currentUser_email");
        if (!adminEmail) {
            return Swal.fire({
                icon: "error",
                title: "Admin Email Missing",
                text: "Please re-login manually."
            });
        }
        console.log("🟡 Re-logging in as admin...");
        await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
        console.log("✅ Admin re-logged in.");

        // 🔧 Prepare device data
        const newDeviceData = {
            "wifi-config": {
                ssid: wifiSSID,
                password: wifiPass
            },
            "deviceData": {
                roomName,
                chNumber: chCount
            },
            "email": deviceEmail,
            ...relays
        };
        console.log("📦 Final device data:", newDeviceData);

        // 🔧 Firebase updates
        const updates = {};
        updates[`automation/${homeId}/home-data/total device`] = newTotalDevices;
        updates[`automation/${homeId}/automation/${deviceId}`] = newDeviceData;

        await update(ref(db), updates);
        console.log("✅ Device data saved to Firebase!");

        // 🔄 Update localStorage
        let devices = JSON.parse(localStorage.getItem("devices") || "{}");
        devices[deviceId] = newDeviceData;
        localStorage.setItem("devices", JSON.stringify(devices));
        localStorage.setItem("currentUser_totalDevices", newTotalDevices);

        fillRoomSelectSidebar();
        fillUpdateDeviceRoomListSidebar();

        Swal.fire({
            icon: 'success',
            title: 'Device Added',
            text: `Device added as ${deviceId} with email: ${deviceEmail}`,
            timer: 2000,
            showConfirmButton: false
        });

        document.getElementById("add-device-form").reset();
        document.getElementById("channel-name-fields").innerHTML = "";

    } catch (error) {
        console.error("❌ Error adding device:", error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'An error occurred. Please try again.'
        });
    }
});

// 🔧 Generate relay fields
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