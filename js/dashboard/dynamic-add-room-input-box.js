// Get references
const channelCountSelect = document.getElementById("device-channel-count");
const channelNameFieldsContainer = document.getElementById("channel-name-fields");

// Clear and add input fields dynamically
channelCountSelect.addEventListener("change", () => {
    const count = parseInt(channelCountSelect.value);
    channelNameFieldsContainer.innerHTML = ""; // Clear previous inputs

    if (isNaN(count) || count <= 0 || count > 6) return;

    for (let i = 1; i <= count; i++) {
        // Create fieldset for each channel
        const fieldset = document.createElement("fieldset");
        fieldset.className = "relay-fieldset";

        const legend = document.createElement("legend");
        legend.textContent = `Relay ${i}`;
        fieldset.appendChild(legend);

        // Label and input for name
        const nameLabel = document.createElement("label");
        nameLabel.className = "links_name";
        nameLabel.textContent = `Relay ${i} Name`;

        const nameInput = document.createElement("input");
        nameInput.type = "text";
        nameInput.placeholder = `Relay ${i} Name`;
        nameInput.id = `relay-name-${i}`;
        nameInput.className = "relay-name-input";

        // Label and select for type
        const typeLabel = document.createElement("label");
        typeLabel.className = "links_name";
        typeLabel.textContent = `Relay ${i} Type`;

        const typeSelect = document.createElement("select");
        typeSelect.id = `relay-type-${i}`;
        const option1 = new Option("On/Off (Light/Plug)", "on/off");
        const option2 = new Option("Dimming (Fan)", "dimming");
        typeSelect.appendChild(option1);
        typeSelect.appendChild(option2);

        // Add elements to fieldset
        fieldset.appendChild(nameLabel);
        fieldset.appendChild(nameInput);
        fieldset.appendChild(typeLabel);
        fieldset.appendChild(typeSelect);

        // Add fieldset to container
        channelNameFieldsContainer.appendChild(fieldset);
    }
});