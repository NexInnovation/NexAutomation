import {
    db,
    ref,
    get,
    update
} from "../../firebase-module.js";
import DB_PATHS from "../../db-paths.js";

export async function showRoomOnDashboard(deviceId, roomName) {
    console.log(`🚀 [showRoomOnDashboard] Load room data for: ${roomName} (Device ID: ${deviceId})`);

    const devices = JSON.parse(localStorage.getItem("devices") || "{}");
    console.log("📦 Loaded devices from localStorage:", devices);

    const device = devices[deviceId];
    console.log("📦 Selected device object:", device);

    const homeId = localStorage.getItem("currentUser_homeId");
    console.log("🏠 Current homeId:", homeId);

    const roomDataDisplay = document.getElementById("room-data-display");
    console.log("📌 Room data display element:", roomDataDisplay);

    if (!device) {
        console.warn("⚠️ No device data found. Showing fallback message.");
        roomDataDisplay.innerHTML = "<p>No data found for this room.</p>";
        return;
    }

    console.log("🟢 Showing loading dialog for room data fetch...");
    Swal.fire({
        title: 'Fetching room data...',
        text: 'Please wait while we load current states.',
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => Swal.showLoading(),
    });

    // Create header
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
    console.log("📝 Created header element for room.");

    const lightsSection = document.createElement("div");
    lightsSection.classList.add("room-section", "lights-section");
    const lightsHeader = document.createElement("h3");
    lightsHeader.textContent = "Lights";
    const lightsList = document.createElement("ul");
    lightsList.classList.add("device-list");
    console.log("💡 Created Lights section container.");

    const fansSection = document.createElement("div");
    fansSection.classList.add("room-section", "fans-section");
    const fansHeader = document.createElement("h3");
    fansHeader.textContent = "Fans";
    const fansContainer = document.createElement("div");
    fansContainer.id = "fan-container";
    console.log("🌀 Created Fans section container.");

    let fanIndex = 1;
    const relayFetches = [];

    for (const relayKey in device) {
        console.log(`🔍 Checking relay: ${relayKey}`);
        if (relayKey.startsWith("R")) {
            const relay = device[relayKey];
            console.log(`🔧 Relay object:`, relay);

            const relayStatePath = DB_PATHS.relayState(homeId, deviceId, relayKey);
            console.log(`🛤️ Relay state path in DB: ${relayStatePath}`);

            const relayFetch = get(ref(db, relayStatePath)).then((stateSnap) => {
                console.log(`📥 Fetched relay state snapshot for ${relayKey}:`, stateSnap.val());
                const state = stateSnap.exists() ? stateSnap.val() : 0;

                if (relay.type === 1) {
                    console.log(`💡 Adding light relay: ${relayKey}`);
                    const li = document.createElement("li");

                    const nameSpan = document.createElement("span");
                    nameSpan.textContent = relay.name || relayKey;

                    const switchLabel = document.createElement("label");
                    switchLabel.classList.add("switch");

                    const checkbox = document.createElement("input");
                    checkbox.type = "checkbox";
                    checkbox.id = `${deviceId}-${relayKey}`;
                    checkbox.name = `relay-checkbox-${deviceId}-${relayKey}`;
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
                        const status = checkbox.checked ? "ON" : "OFF";
                        console.log({
                            type: "light",
                            name: nameSpan.textContent,
                            relayKey,
                            status
                        });

                        try {
                            console.log("📝 Updating relay state in Firebase:", relayStatePath, checkbox.checked ? 1 : 0);
                            await update(ref(db), {
                                [relayStatePath]: checkbox.checked ? 1 : 0
                            });
                            console.log(`✅ Updated relay state in Firebase: ${relayKey} = ${checkbox.checked ? 1 : 0}`);
                        } catch (err) {
                            console.error("❌ Failed to update relay state:", err);
                        }
                    });
                } else if (relay.type === 2) {
                    console.log(`🌀 Adding fan relay: ${relayKey}`);
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

                    // fdb state update here
                    // After appending fanBox to fansContainer
                    console.log(`🔵 Initializing fan visuals for ${relayKey} (${fanName.textContent}) with fetched state: ${state}`);
                    const den = fanBox.querySelector(".den");
                    let angle, dotSpanRotation, dotSpanOpacity;
                    switch (state) {
                        case 0:
                            angle = -90;
                            dotSpanRotation = 90;
                            dotSpanOpacity = 1;
                            break;
                        case 1:
                            angle = -30;
                            dotSpanRotation = 30;
                            dotSpanOpacity = 0.9;
                            break;
                        case 2:
                            angle = 30;
                            dotSpanRotation = -30;
                            dotSpanOpacity = 0.5;
                            break;
                        case 3:
                            angle = 90;
                            dotSpanRotation = -90;
                            dotSpanOpacity = 0.4;
                            break;
                        case 4:
                            angle = 150;
                            dotSpanRotation = -150;
                            dotSpanOpacity = 0.5;
                            break;
                        case 5:
                            angle = 210;
                            dotSpanRotation = -210;
                            dotSpanOpacity = 0.9;
                            break;
                    }
                    console.log(`🛠️ Setting --rotation-angle to: ${angle}deg`);
                    console.log(`🛠️ Setting --dot-span-rotation to: ${dotSpanRotation}deg`);
                    console.log(`🛠️ Setting dot span opacity to: ${dotSpanOpacity}`);
                    den.style.setProperty("--rotation-angle", `${angle}deg`);
                    den.style.setProperty("--dot-span-rotation", `${dotSpanRotation}deg`);
                    den.querySelector(".dot span").style.opacity = dotSpanOpacity;
                    console.log(`✅ Fan dialer visuals for ${relayKey} initialized.`);


                    const inputs = rotaryWrapper.querySelectorAll("input[type='radio']");
                    inputs.forEach((input) => {
                        input.addEventListener("change", async () => {
                            console.log(`🎯 Manual click detected on fan dialer input:`, input.id);
                            const selectedSpeed = input.id.split("_").pop();
                            console.log({
                                type: "fan",
                                name: fanName.textContent,
                                relayKey,
                                selectedSpeed
                            });

                            // Log which radio is checked
                            console.log("🔎 Current checked states after click:");
                            inputs.forEach((radio) => {
                                console.log(`🔘 ${radio.id}: checked = ${radio.checked}`);
                            });

                            let angle, dotSpanRotation, dotSpanOpacity;
                            switch (selectedSpeed) {
                                case "off":
                                    angle = -90;
                                    dotSpanRotation = 90;
                                    dotSpanOpacity = 1;
                                    break;
                                case "1":
                                    angle = -30;
                                    dotSpanRotation = 30;
                                    dotSpanOpacity = 0.9;
                                    break;
                                case "2":
                                    angle = 30;
                                    dotSpanRotation = -30;
                                    dotSpanOpacity = 0.5;
                                    break;
                                case "3":
                                    angle = 90;
                                    dotSpanRotation = -90;
                                    dotSpanOpacity = 0.4;
                                    break;
                                case "4":
                                    angle = 150;
                                    dotSpanRotation = -150;
                                    dotSpanOpacity = 0.5;
                                    break;
                                case "5":
                                    angle = 210;
                                    dotSpanRotation = -210;
                                    dotSpanOpacity = 0.9;
                                    break;
                            }

                            console.log("🌀 Applying dialer visuals for selection:");
                            console.log(`↪️ angle: ${angle}deg`);
                            console.log(`↪️ dot span rotation: ${dotSpanRotation}deg`);
                            console.log(`↪️ dot span opacity: ${dotSpanOpacity}`);

                            const den = fanBox.querySelector(".den");
                            den.style.setProperty("--rotation-angle", `${angle}deg`);
                            den.style.setProperty("--dot-span-rotation", `${dotSpanRotation}deg`);
                            den.querySelector(".dot span").style.opacity = dotSpanOpacity;

                            try {
                                const newSpeed = selectedSpeed === "off" ? 0 : parseInt(selectedSpeed);
                                console.log("📝 Updating Firebase for fan speed change:", {
                                    relayKey,
                                    relayStatePath,
                                    newSpeed
                                });
                                await update(ref(db), {
                                    [relayStatePath]: newSpeed
                                });
                                console.log(`✅ Firebase updated: ${relayKey} = ${newSpeed}`);
                            } catch (err) {
                                console.error("❌ Failed to update fan state in Firebase:", err);
                            }
                        });
                    });



                    fanIndex++;
                }
            });

            relayFetches.push(relayFetch);
        }
    }

    console.log("🟡 Waiting for all relay state fetches to complete...");
    await Promise.all(relayFetches);
    console.log("✅ All relay state fetches completed.");

    // lightsSection.appendChild(lightsHeader);
    // lightsSection.appendChild(lightsList);
    // fansSection.appendChild(fansHeader);
    // fansSection.appendChild(fansContainer);

    // console.log("📝 Adding header, lights, and fans to roomDataDisplay.");
    // roomDataDisplay.innerHTML = "";
    // roomDataDisplay.appendChild(headerDiv);
    // roomDataDisplay.appendChild(lightsSection);
    // roomDataDisplay.appendChild(fansSection);

    let lightsCount = lightsList.childElementCount;
    let fansCount = fansContainer.childElementCount;

    console.log(`🔎 Number of lights: ${lightsCount}`);
    console.log(`🔎 Number of fans: ${fansCount}`);

    roomDataDisplay.innerHTML = "";
    roomDataDisplay.appendChild(headerDiv);

    if (lightsCount > 0) {
        lightsSection.appendChild(lightsHeader);
        lightsSection.appendChild(lightsList);
        roomDataDisplay.appendChild(lightsSection);
        console.log("✅ Lights section added to room display.");
    } else {
        console.log("⚠️ No lights found for this room. Skipping Lights section.");
    }

    if (fansCount > 0) {
        fansSection.appendChild(fansHeader);
        fansSection.appendChild(fansContainer);
        roomDataDisplay.appendChild(fansSection);
        console.log("✅ Fans section added to room display.");
    } else {
        console.log("⚠️ No fans found for this room. Skipping Fans section.");
    }


    // const fans = fansContainer.querySelectorAll(".fan");
    // fans.forEach((fan) => {
    //     const den = fan.querySelector(".den");
    //     den.style.setProperty("--rotation-angle", "-90deg");
    //     den.style.setProperty("--dot-span-rotation", "90deg");
    //     den.querySelector(".dot span").style.opacity = 1;
    // });
    // console.log("✅ Fan dialer visuals initialized to OFF state.");

    if (window._3_Select_room_main_sidebar && window._3_Select_room_main_sidebar.classList.contains("show")) {
        window._3_Select_room_main_sidebar.classList.remove("show");
        console.log("✅ Sidebar 3 closed after loading room data.");
    }

    console.log("🟢 Closing loading dialog (Swal)...");
    Swal.close();
    console.log("🏁 Room data fully loaded and displayed.");
}