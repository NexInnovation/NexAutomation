import {
    getDatabase,
    ref,
    get,
}
from "../firebase-module.js";
import {
    auth,
    db
} from "./dashboard.js";

export async function testLogAllMembers() {
    const user = auth.currentUser;
    if (!user) {
        console.error("❌ No authenticated user.");
        return;
    }

    const homeId = sessionStorage.getItem("homeId");
    if (!homeId) {
        console.error("❌ No homeId in sessionStorage.");
        return;
    }

    const userRef = ref(db, `automation/${homeId}/user`);
    console.log("📦 Fetching members from path:", `automation/${homeId}/user`);

    try {
        const snapshot = await get(userRef);
        if (!snapshot.exists()) {
            console.log("ℹ️ No members found.");
            return;
        }

        const members = snapshot.val();
        console.log("✅ Members fetched:");

        for (const uid in members) {
            const member = members[uid];
            console.log(`👤 UID: ${uid}`);
            console.log(`   ↳ Name: ${member.firstName || "(No Name)"}`);
            console.log(`   ↳ Email: ${member.email || "(No Email)"}`);
            console.log(`   ↳ Role: ${member.role}`);
            console.log("--------");
        }
    } catch (err) {
        console.error("❌ Error fetching members:", err);
    }
}

export async function loadMemberListToSidebar() {
    const user = auth.currentUser;
    if (!user) return;

    const homeId = sessionStorage.getItem("homeId");
    if (!homeId) return;

    // Prepare containers
    const adminContainer = document.getElementById("admin-list-container");
    const memberScrollWrapper = document.getElementById("member-scroll-wrapper");

    adminContainer.innerHTML = ""; // clear admin slot
    memberScrollWrapper.innerHTML = ""; // clear member scroll area

    const userRef = ref(db, `automation/${homeId}/user`);

    try {
        const snapshot = await get(userRef);

        if (!snapshot.exists()) {
            memberScrollWrapper.innerHTML = `
          <div class="card-style">No members available.</div>
        `;
            return;
        }

        const members = snapshot.val();
        let memberFound = false;

        for (const uid in members) {
            const member = members[uid];
            const name = member.firstName || "(No Name)";
            const email = member.email || "(No Email)";
            const role = member.role || "unknown";

            const div = document.createElement("div");
            div.className = "card-style";
            div.innerHTML = `
          ${name} :<br>
          ${email}<br>
        `;

            // card.innerHTML = `${name} : <br/>${email}<br/>(${role})`;

            if (role === "admin") {
                adminContainer.appendChild(div);
            } else {
                memberScrollWrapper.appendChild(div);
                memberFound = true;
            }
        }

        // Show 'No members' message only if none were added
        if (!memberFound) {
            const div = document.createElement("div");
            div.className = "card-style";
            div.innerText = "No members available.";
            memberScrollWrapper.appendChild(div);
        }

    } catch (err) {
        console.error("❌ Failed to load member list:", err);
        memberScrollWrapper.innerHTML = `
        <div class="card-style">Error loading members.</div>
      `;
    }
}