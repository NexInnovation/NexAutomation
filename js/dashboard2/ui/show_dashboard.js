export function showRoomOnDashboard(deviceId, roomName) {
    console.log(`🚀 [showRoomOnDashboard] Load room data for: ${roomName} (Device ID: ${deviceId})`);

    // ✅ Insert room name and device ID
    const roomDataDisplay = document.getElementById("room-data-display");
    roomDataDisplay.innerHTML = `
        <div class="room-display-box">
            <h2 class="room-name">${roomName}</h2>
            <p class="device-id">Device ID: ${deviceId}</p>
        </div>
    `;

    // ✅ Close the Sidebar 3
    if (window._3_Select_room_main_sidebar && window._3_Select_room_main_sidebar.classList.contains("show")) {
        window._3_Select_room_main_sidebar.classList.remove("show");
        console.log("✅ Sidebar 3 closed after loading room data.");
    }
}