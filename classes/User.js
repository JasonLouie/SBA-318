import { generateRandomId } from "../functions/functions.js";

export default class User {
    #id = generateRandomId();
    #username;
    email;
    password;

    constructor(username, email = null, password = null) {
        this.#username = username;
        this.email = email;
        this.password = password;
    }

    get id() {
        return this.#id;
    }

    get username() {
        return this.#username;
    }

    toJSON() {
        return {
            id: this.#id,
            username: this.#username,
            email: this.email,
            password: this.password
        };
    }
}