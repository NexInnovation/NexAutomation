import {
    auth,
    db,
    signInWithEmailAndPassword,
    ref,
    get,
    update,
    remove
} from "../../firebase-module.js";

import {
    fillMemberListSidebar
} from "../ui/fill_function_to_all_panel.js";

/**
 * Deletes a member and all related data from DB + Auth.
 * @param {string} email - Member email
 * @param {string} uid - Member UID
 */
export async function deleteMemberByEmail(email, uid) {
    console.log("🟡 Starting member deletion process for:", email);

    // 🟡 Suppress onAuthStateChanged during admin re-login
    sessionStorage.setItem("suppressOnAuthChange", "true");

    try {
        // 🔶 Prompt for member & admin passwords
        const {
            value: formValues
        } = await Swal.fire({
            title: "Delete Member",
            html: `
          <p>Enter member password and your (admin) password:</p>
          <input id="swal-member-password" type="password" class="swal2-input" placeholder="Member Password" />
          <input id="swal-admin-password" type="password" class="swal2-input" placeholder="Admin Password" />
        `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: "Delete",
            preConfirm: () => {
                const memberPassword = document.getElementById("swal-member-password").value;
                const adminPassword = document.getElementById("swal-admin-password").value;
                if (!memberPassword || !adminPassword) {
                    Swal.showValidationMessage("Both passwords are required!");
                    return false;
                }
                return {
                    memberPassword,
                    adminPassword
                };
            }
        });

        if (!formValues) {
            console.log("🟡 Deletion cancelled by user.");
            sessionStorage.removeItem("suppressOnAuthChange");
            return;
        }

        const {
            memberPassword,
            adminPassword
        } = formValues;
        const currentRole = localStorage.getItem("currentUser_role");
        if (currentRole !== "admin") {
            Swal.fire({
                icon: "error",
                title: "Access Denied",
                text: "Only an admin can delete members!"
            });
            console.warn("⚠️ Current user is not admin. Aborting deletion.");
            sessionStorage.removeItem("suppressOnAuthChange");
            return;
        }

        // 🔎 Fetch admin email dynamically from localStorage
        const allUsers = JSON.parse(localStorage.getItem("allUsers") || "{}");
        const adminUid = Object.keys(allUsers.admin)[0];
        if (!adminUid) {
            console.error("❌ Admin UID not found in localStorage.");
            Swal.fire({
                icon: "error",
                title: "Admin UID Missing",
                text: "Admin UID not found in localStorage. Please refresh or re-login as admin."
            });
            sessionStorage.removeItem("suppressOnAuthChange");
            return;
        }

        const adminEmail = allUsers.admin[adminUid]?.email;
        if (!adminEmail) {
            console.error("❌ Admin email not found in localStorage.");
            Swal.fire({
                icon: "error",
                title: "Admin Email Missing",
                text: "Admin email not found in localStorage. Please refresh or re-login as admin."
            });
            sessionStorage.removeItem("suppressOnAuthChange");
            return;
        }

        // 1️⃣ Sign in as the member
        console.log("🟡 Signing in as member...");
        await signInWithEmailAndPassword(auth, email, memberPassword);
        console.log("✅ Signed in as member.");

        // 2️⃣ Delete member Auth account
        console.log("🟡 Deleting member auth user...");
        await auth.currentUser.delete();
        console.log("✅ Member Auth user deleted.");

        // 3️⃣ Re-login as admin
        console.log("🟡 Re-signing in as admin...");
        await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
        console.log("✅ Admin re-logged in.");

        // 🔴 Re-fetch homeId for admin
        console.log("🟡 Fetching admin homeId from DB...");
        const adminUserRef = ref(db, `/users/${adminUid}/homeId`);
        const adminHomeIdSnap = await get(adminUserRef);
        if (!adminHomeIdSnap.exists()) {
            throw new Error("❌ Admin homeId not found in DB!");
        }
        const homeId = adminHomeIdSnap.val();
        console.log("✅ Fetched admin homeId:", homeId);

        // ✅ Update localStorage (so it's fresh for other scripts)
        localStorage.setItem("currentUser_homeId", homeId);
        console.log("✅ Updated admin homeId in localStorage:", homeId);

        // 🔴 Small delay to ensure Auth context is refreshed
        await new Promise(resolve => setTimeout(resolve, 500));

        // 4️⃣ Remove from /users/{uid}
        try {
            await remove(ref(db, `/users/${uid}`));
            console.log("✅ Removed from /users/{uid}");
        } catch (err) {
            console.error("❌ Failed to remove from /users/{uid}:", err.message);
        }

        // 5️⃣ Remove from /automation/{homeId}/user-list/{uid}
        try {
            await remove(ref(db, `/automation/${homeId}/user-list/${uid}`));
            console.log("✅ Removed from /automation/{homeId}/user-list/{uid}");
        } catch (err) {
            console.error("❌ Failed to remove from /automation/{homeId}/user-list/{uid}:", err.message);
        }

        // 6️⃣ Remove from /automation/{homeId}/user/member/{uid}
        try {
            await remove(ref(db, `/automation/${homeId}/user/member/${uid}`));
            console.log("✅ Removed from /automation/{homeId}/user/member/{uid}");
        } catch (err) {
            console.error("❌ Failed to remove from /automation/{homeId}/user/member/{uid}:", err.message);
        }

        // 7️⃣ Remove from /automation/{uid}
        // try {
        //     await remove(ref(db, `/automation/${uid}`));
        //     console.log("✅ Removed from /automation/{uid}");
        // } catch (err) {
        //     console.error("❌ Failed to remove from /automation/{uid}:", err.message);
        // }

        // 8️⃣ Decrement total member count
        try {
            const homeDataRef = ref(db, `/automation/${homeId}/home-data/`);
            const homeDataSnap = await get(homeDataRef);
            if (homeDataSnap.exists()) {
                const homeData = homeDataSnap.val();
                const totalMembers = homeData["total member"] || 0;
                const newTotal = totalMembers > 0 ? totalMembers - 1 : 0;
                await update(homeDataRef, {
                    "total member": newTotal
                });
                console.log("✅ Decremented total member to:", newTotal);
            } else {
                console.warn("⚠️ home-data not found, skipping total member decrement.");
            }
        } catch (err) {
            console.error("❌ Failed to update total member count:", err.message);
        }

        // ✅ Remove the deleted member from localStorage
        try {
            console.log("🟡 Updating localStorage to remove deleted member...");
            if (allUsers.members && allUsers.members[uid]) {
                delete allUsers.members[uid];
                localStorage.setItem("allUsers", JSON.stringify(allUsers));
                console.log("✅ Deleted member from localStorage.");
            } else {
                console.warn("⚠️ Deleted member not found in localStorage.");
            }
        } catch (err) {
            console.error("❌ Error updating localStorage:", err.message);
        }

        // ✅ Refill the member list in the UI
        console.log("🔄 Refreshing member list UI...");
        fillMemberListSidebar();
        console.log("✅ Member list refreshed.");

        Swal.fire({
            icon: "success",
            title: "Member Deleted",
            text: `Member ${email} and all related data have been deleted.`
        });

    } catch (error) {
        console.error("❌ Error in member deletion flow:", error);
        Swal.fire({
            icon: "error",
            title: "Error",
            text: error.message
        });
    } finally {
        sessionStorage.removeItem("suppressOnAuthChange");
        console.log("🟩 Deletion flow complete. Resumed normal auth change handling.");
    }
}