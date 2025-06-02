// file name: show_dashboard.js

const DEBUG = false;

import {
    db,
    ref,
    get,
    update
} from "../../firebase-module.js";
import DB_PATHS from "../../db-paths.js";

export async function showRoomOnDashboard(deviceId, roomName) {
    if (DEBUG) console.log(`🚀 [showRoomOnDashboard] Load room data for: ${roomName} (Device ID: ${deviceId})`);

    const devices = JSON.parse(localStorage.getItem("devices") || "{}");
    if (DEBUG) console.log("📦 Loaded devices from localStorage:", devices);

    const device = devices[deviceId];
    if (DEBUG) console.log("📦 Selected device object:", device);

    const homeId = localStorage.getItem("currentUser_homeId");
    if (DEBUG) console.log("🏠 Current homeId:", homeId);

    const roomDataDisplay = document.getElementById("room-data-display");
    if (DEBUG) console.log("📌 Room data display element:", roomDataDisplay);

    if (!device) {
        console.warn("⚠️ No device data found. Showing fallback message.");
        roomDataDisplay.innerHTML = "<p>No data found for this room.</p>";
        return;
    }

    if (DEBUG) console.log("🟢 Showing loading dialog for room data fetch...");
    Swal.fire({
        title: 'Fetching room data...',
        text: 'Please wait while we load current states.',
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => Swal.showLoading(),
    });

    // Header
    const headerDiv = document.createElement("div");
    headerDiv.classList.add("room-header");
    const h2 = document.createElement("h2");
    h2.classList.add("room-name");
    h2.textContent = roomName;
    const p = document.createElement("p");
    p.classList.add("device-id");
    p.textContent = `Device ID: ${deviceId}`;
    headerDiv.appendChild(h2);
    headerDiv.appendChild(p);

    // Lights section
    const lightsSection = document.createElement("div");
    lightsSection.classList.add("room-section", "lights-section");
    const lightsHeader = document.createElement("h3");
    lightsHeader.textContent = "Lights";
    const lightsList = document.createElement("ul");
    lightsList.classList.add("device-list");

    // Fans section
    const fansSection = document.createElement("div");
    fansSection.classList.add("room-section", "fans-section");
    const fansHeader = document.createElement("h3");
    fansHeader.textContent = "Fans";
    const fansContainer = document.createElement("div");
    fansContainer.id = "fan-container";

    let fanIndex = 1;
    const relayFetches = [];

    const applyFanVisuals = (den, angle, dotRotation, opacity) => {
        den.style.setProperty("--rotation-angle", `${angle}deg`);
        den.style.setProperty("--dot-span-rotation", `${dotRotation}deg`);
        den.querySelector(".dot span").style.opacity = opacity;
    };

    for (const relayKey in device) {
        if (relayKey.startsWith("R")) {
            const relay = device[relayKey];
            if (DEBUG) console.log(`🔧 Relay object for ${relayKey}:`, relay);

            const relayStatePath = DB_PATHS.relayState(homeId, deviceId, relayKey);

            const relayFetch = get(ref(db, relayStatePath)).then((stateSnap) => {
                const state = stateSnap.exists() ? stateSnap.val() : 0;

                if (relay.type === 1) {
                    // Light
                    const li = document.createElement("li");
                    const nameSpan = document.createElement("span");
                    nameSpan.textContent = relay.name || relayKey;

                    const switchLabel = document.createElement("label");
                    switchLabel.classList.add("switch");

                    const checkbox = document.createElement("input");
                    checkbox.type = "checkbox";
                    checkbox.id = `${deviceId}-${relayKey}`;
                    checkbox.checked = state === 1;

                    const slider = document.createElement("span");
                    slider.classList.add("slider");

                    switchLabel.appendChild(checkbox);
                    switchLabel.appendChild(slider);

                    const containerLabel = document.createElement("label");
                    containerLabel.style.display = "flex";
                    containerLabel.style.flexDirection = "column";
                    containerLabel.style.alignItems = "center";
                    containerLabel.style.width = "100%";
                    containerLabel.style.gap = "5px";

                    containerLabel.appendChild(nameSpan);
                    containerLabel.appendChild(switchLabel);

                    li.appendChild(containerLabel);
                    lightsList.appendChild(li);

                    checkbox.addEventListener("change", async () => {
                        const newState = checkbox.checked ? 1 : 0;
                        if (DEBUG) console.log(`📝 Updating relay: ${relayKey}, State: ${newState}`);
                        try {
                            await update(ref(db), {
                                [relayStatePath]: newState
                            });
                            if (DEBUG) console.log(`✅ Updated relay: ${relayKey} = ${newState}`);
                        } catch (err) {
                            console.error(`❌ Failed to update relay: ${relayKey}`, err);
                        }
                    });
                } else if (relay.type === 2) {
                    // Fan
                    const fanBox = document.createElement("div");
                    fanBox.classList.add("fan");
                    fanBox.style.display = "flex";
                    fanBox.style.flexDirection = "column";
                    fanBox.style.alignItems = "center";
                    fanBox.style.gap = "5px";

                    const fanName = document.createElement("div");
                    fanName.style.textAlign = "center";
                    fanName.style.fontWeight = "500";
                    fanName.textContent = relay.name || relayKey;

                    const rotaryWrapper = document.createElement("div");
                    rotaryWrapper.classList.add("container");
                    rotaryWrapper.innerHTML = `
              <div class="de">
                <div class="den" style="--rotation-angle: -90deg; --dot-span-rotation: 90deg;">
                  <hr class="line" />
                  <hr class="line" />
                  <hr class="line" />
                  <div class="switch">
                    <label for="fan${fanIndex}-switch_off"><span>OFF</span></label>
                    <label for="fan${fanIndex}-switch_1"><span>1</span></label>
                    <label for="fan${fanIndex}-switch_2"><span>2</span></label>
                    <label for="fan${fanIndex}-switch_3"><span>3</span></label>
                    <label for="fan${fanIndex}-switch_4"><span>4</span></label>
                    <label for="fan${fanIndex}-switch_5"><span>5</span></label>
                    <input type="radio" name="fan${fanIndex}-switch" id="fan${fanIndex}-switch_off" ${state === 0 ? "checked" : ""} />
                    <input type="radio" name="fan${fanIndex}-switch" id="fan${fanIndex}-switch_1" ${state === 1 ? "checked" : ""} />
                    <input type="radio" name="fan${fanIndex}-switch" id="fan${fanIndex}-switch_2" ${state === 2 ? "checked" : ""} />
                    <input type="radio" name="fan${fanIndex}-switch" id="fan${fanIndex}-switch_3" ${state === 3 ? "checked" : ""} />
                    <input type="radio" name="fan${fanIndex}-switch" id="fan${fanIndex}-switch_4" ${state === 4 ? "checked" : ""} />
                    <input type="radio" name="fan${fanIndex}-switch" id="fan${fanIndex}-switch_5" ${state === 5 ? "checked" : ""} />
                    <div class="light"><span></span></div>
                    <div class="dot"><span></span></div>
                    <div class="dene">
                      <div class="denem">
                        <div class="deneme"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            `;

                    fanBox.appendChild(fanName);
                    fanBox.appendChild(rotaryWrapper);
                    fansContainer.appendChild(fanBox);

                    // Initial visuals
                    let angle, dotRotation, opacity;
                    switch (state) {
                        case 0:
                            angle = -90;
                            dotRotation = 90;
                            opacity = 1;
                            break;
                        case 1:
                            angle = -30;
                            dotRotation = 30;
                            opacity = 0.9;
                            break;
                        case 2:
                            angle = 30;
                            dotRotation = -30;
                            opacity = 0.5;
                            break;
                        case 3:
                            angle = 90;
                            dotRotation = -90;
                            opacity = 0.4;
                            break;
                        case 4:
                            angle = 150;
                            dotRotation = -150;
                            opacity = 0.5;
                            break;
                        case 5:
                            angle = 210;
                            dotRotation = -210;
                            opacity = 0.9;
                            break;
                    }
                    applyFanVisuals(fanBox.querySelector(".den"), angle, dotRotation, opacity);

                    // Radio change handler
                    const inputs = rotaryWrapper.querySelectorAll("input[type='radio']");
                    inputs.forEach((input) => {
                        input.addEventListener("change", async () => {
                            const selectedSpeed = input.id.split("_").pop();
                            const newSpeed = selectedSpeed === "off" ? 0 : parseInt(selectedSpeed);
                            if (DEBUG) console.log(`📝 Fan update: ${relayKey}, newSpeed: ${newSpeed}`);

                            switch (selectedSpeed) {
                                case "off":
                                    angle = -90;
                                    dotRotation = 90;
                                    opacity = 1;
                                    break;
                                case "1":
                                    angle = -30;
                                    dotRotation = 30;
                                    opacity = 0.9;
                                    break;
                                case "2":
                                    angle = 30;
                                    dotRotation = -30;
                                    opacity = 0.5;
                                    break;
                                case "3":
                                    angle = 90;
                                    dotRotation = -90;
                                    opacity = 0.4;
                                    break;
                                case "4":
                                    angle = 150;
                                    dotRotation = -150;
                                    opacity = 0.5;
                                    break;
                                case "5":
                                    angle = 210;
                                    dotRotation = -210;
                                    opacity = 0.9;
                                    break;
                            }

                            applyFanVisuals(fanBox.querySelector(".den"), angle, dotRotation, opacity);

                            try {
                                await update(ref(db), {
                                    [relayStatePath]: newSpeed
                                });
                                if (DEBUG) console.log(`✅ Fan relay updated: ${relayKey} = ${newSpeed}`);
                            } catch (err) {
                                console.error(`❌ Failed to update fan state for ${relayKey}`, err);
                            }
                        });
                    });

                    fanIndex++;
                }
            }).catch((err) => console.error(`❌ Error fetching relay state for ${relayKey}:`, err));

            relayFetches.push(relayFetch);
        }
    }

    if (DEBUG) console.log("🟡 Waiting for all relay state fetches to complete...");
    await Promise.allSettled(relayFetches);
    if (DEBUG) console.log("✅ All relay state fetches settled.");

    roomDataDisplay.innerHTML = "";
    roomDataDisplay.appendChild(headerDiv);

    if (lightsList.children.length > 0) {
        lightsSection.appendChild(lightsHeader);
        lightsSection.appendChild(lightsList);
        roomDataDisplay.appendChild(lightsSection);
    }
    if (fansContainer.children.length > 0) {
        fansSection.appendChild(fansHeader);
        fansSection.appendChild(fansContainer);
        roomDataDisplay.appendChild(fansSection);
    }

    if (window._3_Select_room_main_sidebar && window._3_Select_room_main_sidebar.classList.contains("show")) {
        window._3_Select_room_main_sidebar.classList.remove("show");
    }

    Swal.close();
    if (DEBUG) console.log("🏁 Room data fully loaded and displayed.");
}