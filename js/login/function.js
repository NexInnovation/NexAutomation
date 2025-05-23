// ✅ Reusable input validation function
export function validateInputs(email, password) {
    if (!email || !email.includes("@") || !email.includes(".")) {
        Swal.fire({
            icon: "warning",
            title: "Invalid Email",
            text: "Enter a valid email address."
        });
        return false;
    }

    if (!password || password.length < 6) {
        Swal.fire({
            icon: "warning",
            title: "Weak Password",
            text: "Password must be at least 6 characters."
        });
        return false;
    }

    return true;
}