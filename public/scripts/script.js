import { signUp } from "./requests.js";
const form = document.getElementById("signup-form");
const signUpBtn = document.getElementById("signup-btn");
const formTypeBtn = document.getElementById("form-type-btn");
const status = document.getElementById("status");
const formAlert = document.getElementById("form-alert");
const usernameField = document.getElementById("username");
const emailField = document.getElementById("email");
const passwordField = document.getElementById("password");
const formResponse = document.getElementById("form-response");
const signupResponse = document.getElementById("signup-response");

formTypeBtn.addEventListener("click", (e) => {
    if (e.target === e.currentTarget) {
        e.target.classList.toggle("on");
        e.target.parentElement.classList.toggle("on");
        if (e.target.classList.contains("on")) {
            useCustomValidation();
        } else {
            removeCustomValidation();
        }
    }
});

function useCustomValidation() {
    createConfirmPassword();
    usernameField.addEventListener("input", validateUsername);
    emailField.addEventListener("input", validateEmail)
    passwordField.addEventListener("input", validatePassword);
    form.addEventListener("submit", formValidate);

    // Do not use the url-encoded format
    form.removeAttribute("method");
    form.removeAttribute("action");

    formResponse.classList.remove("hidden");

    function createConfirmPassword() {
        form.appendChild(Object.assign(document.createElement("input"), {type: "password", id: "confirmPassword", name: "confirmPassword", placeholder: "Confirm password", autocomplete: "off"}));
    }
}

function removeCustomValidation() {
    // Remove confirm password
    removeConfirmPassword();

    // Remove field validation
    usernameField.removeEventListener("input", validateUsername);
    emailField.removeEventListener("input", validateEmail)
    passwordField.removeEventListener("input", validatePassword);

    form.removeEventListener("submit", formValidate);

    // Use the url-encoded format
    form.method = "POST";
    form.action = "/api/v1/users";

    formResponse.classList.add("hidden");

    function removeConfirmPassword() {
        const confirmPassword = form.elements["confirmPassword"];
        if (confirmPassword) {
            confirmPassword.remove();
        }
    }
}

async function formValidate(e) {
    e.preventDefault();
    const confirmPasswordField = form.elements["confirmPassword"];
    signUpBtn.disabled = true;
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
            updateSignUpResponse(response);
        } catch (error) {
            if (error.status === 409) {
                const conflictType = error.response.data.error.split(" ")[0];
                if (conflictType === "Email") {
                    emailField.setCustomValidity(error.response.data.error);
                } else if (conflictType === "Username") {
                    usernameField.setCustomValidity(error.response.data.error);
                }
                form.reportValidity();
            }
            updateSignUpResponse(error);
        } finally {
            formAlert.appendChild(Object.assign(document.createElement("p"), { textContent: "Request sent to the server." }));
            setTimeout(() => {
                if (formAlert.firstElementChild) {
                    formAlert.removeChild(formAlert.firstElementChild);
                }
            }, 3000);
        }
    } else {
        const selectedInput = document.activeElement; // Show validity for input user is interacting with when user submitted
        if (selectedInput && selectedInput.form === form && selectedInput.localName === "input" && !selectedInput.checkValidity()) {
            if (selectedInput === confirmPasswordField) {
                passwordField.reportValidity();
            } else {
                selectedInput.reportValidity();
            }
        } else { // If an input is not selected and user submitted, then show validity for the first input that is invalid
            const firstInvalidField = form.querySelector(':invalid');
            if (firstInvalidField) {
                firstInvalidField.reportValidity();
            }
        }
    }
    signUpBtn.disabled = false;
}

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

function updateSignUpResponse(response) {
    clearResponse();
    const frag = new DocumentFragment();
    const div = frag.appendChild(Object.assign(document.createElement("div"), { id: "response" }))
    const pre = div.appendChild(document.createElement("pre"));
    if (response.status === 201) {
        status.textContent = `Status Code: ${response.status}`;
        pre.innerHTML = `{
    <span class="key">id</span>: ${response.data.id},
    <span class="key">username</span>: "${response.data.username}",
    <span class="key">email</span>: "${response.data.email}",
    <span class="key">password</span>: "${response.data.password}"
}`
    } else {
        status.textContent = `Status Code: ${response.status}`;
        pre.innerHTML = `{
    <span class="key">status</span>: ${response.status},
    <span class="key">response</span>: {
        <span class="key">data</span>: {
            <span class="key">error</span>: "${response.response.data.error}"
        }
    }
}`
    }
    signupResponse.appendChild(frag);

    function clearResponse() {
        if (signupResponse.firstElementChild) {
            signupResponse.removeChild(signupResponse.firstElementChild);
        }
    }
}