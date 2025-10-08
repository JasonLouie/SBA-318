import { timeOptions } from "../constants/time.js";
import Message from "../classes/Message.js";
import { findChatMessages, generateRandomId } from "../functions/functions.js";

export default class Chat {
    #name;
    #id;
    #users = []; // List of User instances within the chat
    #image_url; // Relative path to image_urlture
    #timestamp = new Date();

    constructor(image_url = "../images/profile-dark.png", users = [], id = generateRandomId(), name) {
        this.#image_url = image_url;
        this.#id = id;
        users.forEach(u => this.#users.push(u.id));
        this.#name = name || users.join(", ");
    }

    get id() {
        return this.#id;
    }

    get users() {
        return {...this.#users};
    }

    get preview() {
        const chatMessages = findChatMessages(this.#id);
        return (chatMessages.length > 0) ? chatMessages[chatMessages.length-1] : new Message("", "", ""); // Empty message placeholder
    }

    get dateCreated() {
        return this.#timestamp.toLocaleDateString();
    }

    get timeCreated() {
        return this.#timestamp.toLocaleTimeString("en-US", timeOptions);
    }

    hasUser(userId) {
        return this.#users.includes(Number(userId));
    }

    toJSON() {
        return {
            id: this.#id,
            name: this.#name,
            image_url: this.#image_url,
            preview: this.preview,
            users: this.users
        };
    }
}