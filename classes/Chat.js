import { timeOptions } from "../constants/time.js";
import Message from "../classes/Message.js";
import { findChatMessages, generateRandomId } from "../functions/functions.js";

export default class Chat {
    #name;
    #id;
    #users = []; // List of User instances within the chat
    #pic; // Relative path to picture
    #timestamp = new Date();

    constructor(pic = null, users = [], id=generateRandomId()) {
        this.#pic = pic;
        users.forEach(u => this.#users.push(u.id));
        this.#name = users.join(", ");
        this.#id = id;
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
            name: this.#name,
            pic: this.#pic,
            preview: this.preview,
            users: this.users
        };
    }
}