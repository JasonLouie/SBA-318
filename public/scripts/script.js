import { signUp } from "./requests.js";
const form = document.getElementById("signup-form");
const usernameField = document.getElementById("username");
const emailField = document.getElementById("email");
const passwordField = document.getElementById("password");
const confirmPasswordField = document.getElementById("confirmPassword");

usernameField.addEventListener("input", validateUsername);
emailField.addEventListener("input", validateEmail)
passwordField.addEventListener("input", validatePassword);
confirmPasswordField.addEventListener("input", validateBothPasswords);

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    validateUsername({ target: usernameField });
    validateEmail({ target: emailField });
    validatePassword({ target: passwordField });

    if (form.checkValidity()) {
        try {
            const response = await signUp({
                username: usernameField.value,
                email: emailField.value,
                password: passwordField.value
            });
            form.reset();
            alert("Sign up successful!");
        } catch (error) {
            if (error.status === 409) {
                const conflictType = error.response.data.error.split(" ")[0];
                if (conflictType === "Email"){
                    emailField.setCustomValidity(error.response.data.error);
                } else if (conflictType === "Username"){
                    usernameField.setCustomValidity(error.response.data.error);
                }
                form.reportValidity();
            }
        }
    } else {
        const selectedInput = document.activeElement;
        if (selectedInput && selectedInput.form === form && selectedInput.localName === "input" && !selectedInput.checkValidity()) {
            if (selectedInput === confirmPasswordField) {
                passwordField.reportValidity();
            } else {
                selectedInput.reportValidity();
            }
        } else {
            const firstInvalidField = form.querySelector(':invalid');
            if (firstInvalidField) {
                firstInvalidField.reportValidity();
            }
        }
    }
});

function validateUsername(e) {
    const username = e.target;
    if (!username.value) {
        username.setCustomValidity("Username cannot be blank.");
    } else if (username.value.length < 6) {
        username.setCustomValidity("Username must be at least 6 characters long.");
    } else if (!username.value.match(/^[A-Za-z0-9]+$/)) {
        username.setCustomValidity("Username cannot contain any special characters or whitespaces.");
    } else {
        username.setCustomValidity("");
    }
}

function validateEmail(e) {
    const email = e.target;
    if (!email.value) {
        email.setCustomValidity("Email cannot be blank.");
    } else {
        email.setCustomValidity("");
    }
}

function validatePassword(e) {
    const password = e.target;
    const confirmPassword = form.elements["confirmPassword"];
    if (!password.value) {
        password.setCustomValidity("Password cannot be blank.");
    } else if (password.value.length < 8) {
        password.setCustomValidity("Password must be at least 8 characters long.");
    } else if (!password.value.match(/\W/)) {
        password.setCustomValidity("Password must contain at least one special character.");
    } else if (password.value.toLowerCase().match(/password/)) {
        password.setCustomValidity('Password cannot contain the word "password".');
    } else if (password.value != confirmPassword.value) {
        password.setCustomValidity("Both passwords must match.");
    } else {
        password.setCustomValidity("");
    }
}

function validateBothPasswords(e) {
    const form = document.getElementById("signup-form");
    const password = form.elements["password"];
    const confirmPassword = e.target;
    if (password.value != confirmPassword.value) {
        password.setCustomValidity("Both passwords must match.");
    } else {
        password.setCustomValidity("");
    }
}