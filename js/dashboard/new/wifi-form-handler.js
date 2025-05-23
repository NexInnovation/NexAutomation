import {
    db
} from './firebase-init.js';
import {
    ref,
    set
} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-database.js";
import {
    savedWiFiConfig
} from './dashboard-init.js';

document.getElementById("wifi-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const ssid = document.getElementById("ssid").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!ssid || !password) {
        Swal.fire({
            icon: "warning",
            title: "Missing Info",
            text: "Please enter both SSID and Password."
        });
        return;
    }

    try {
        Swal.fire({
            title: "Saving Wi-Fi credentials...",
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });
        await set(ref(db, "config/wifi"), {
            ssid,
            password
        });
        savedWiFiConfig.ssid = ssid;
        savedWiFiConfig.password = password;
        Swal.close();
        Swal.fire({
            icon: "success",
            title: "Wi-Fi Saved",
            text: "Credentials updated."
        });
    } catch (err) {
        Swal.close();
        Swal.fire({
            icon: "error",
            title: "Wi-Fi Save Failed",
            text: err.message
        });
    }
});