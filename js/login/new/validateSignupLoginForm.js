// validateSignupLoginForm.js

// *********************************************************** Signup ***********************************************************
/**
 * Validates the signup form fields.
 * @param {string} firstName - The user's first name.
 * @param {string} email - The user's email address.
 * @param {string} password - The user's password.
 * @param {boolean} DEBUG - Flag to enable console logging for debug.
 * @returns {boolean} Returns true if validation passes; otherwise, returns false.
 */
export function validateSignupForm(firstName, email, password, DEBUG = false) {
    if (DEBUG) console.log("🔍 Signup form data:", {
        firstName,
        email,
        // password: password ? '***' : '(empty)',
        password
    });

    if (!firstName) {
        Swal.fire({
            icon: 'warning',
            title: 'Missing Name',
            text: 'Please enter your first name.'
        });
        return false;
    }

    if (!email) {
        Swal.fire({
            icon: 'warning',
            title: 'Missing Email',
            text: 'Please enter your email address.'
        });
        return false;
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
        Swal.fire({
            icon: 'error',
            title: 'Invalid Email',
            text: 'Please enter a valid email address.'
        });
        return false;
    }

    if (!password) {
        Swal.fire({
            icon: 'warning',
            title: 'Missing Password',
            text: 'Please enter a password.'
        });
        return false;
    }

    if (password.length < 6) {
        Swal.fire({
            icon: 'error',
            title: 'Weak Password',
            text: 'Password must be at least 6 characters long.'
        });
        return false;
    }

    return true;
}


// *********************************************************** Login ***********************************************************
/**
 * Validates the login form fields.
 * @param {string} email - The user's email address.
 * @param {string} password - The user's password.
 * @param {boolean} DEBUG - Flag to enable console logging for debug.
 * @returns {boolean} Returns true if validation passes; otherwise, returns false.
 */
export function validateLoginForm(email, password, DEBUG = false) {
    if (DEBUG) console.log("🔍 Login form data:", {
        email,
        // password: password ? '***' : '(empty)',
        password
    });

    if (!email) {
        Swal.fire({
            icon: 'warning',
            title: 'Missing Email',
            text: 'Please enter your email address.'
        });
        return false;
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
        Swal.fire({
            icon: 'error',
            title: 'Invalid Email',
            text: 'Please enter a valid email address.'
        });
        return false;
    }

    if (!password) {
        Swal.fire({
            icon: 'warning',
            title: 'Missing Password',
            text: 'Please enter a password.'
        });
        return false;
    }

    if (password.length < 6) {
        Swal.fire({
            icon: 'error',
            title: 'Weak Password',
            text: 'Password must be at least 6 characters long.'
        });
        return false;
    }

    return true;
}