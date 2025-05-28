import {
    auth,
    signInWithEmailAndPassword
} from "../../firebase-module.js"; // Assuming you're using Firebase

export async function login(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    } catch (error) {
        throw error; // 🔁 Pass the error back to show in Swal
    }
}