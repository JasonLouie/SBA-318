import { timeOptions } from "../constants/time.js";
import Message from "../classes/Message.js";
import { findChatMessages, generateRandomId } from "../functions/functions.js";

export default class Chat {
    #id;
    name;
    #users = []; // List of User instances within the chat
    #image_url; // Relative path to image_url
    #timestamp;

    constructor(image_url, users = [], id, name) {
        this.#image_url = image_url || "../images/profile-dark.png";
        this.#id = id || generateRandomId();
        users.forEach(u => this.#users.push(u.id));
        this.name = name || users.join(", ");
        this.#timestamp = new Date();
    }

    get id() {
        return this.#id;
    }

    get numUsers() {
        return this.#users.length;
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

    addUser(user) {
        this.#users.push(user);
    }

    removeUser(userId) {
        let removed = false;
        this.#users.find((u, i) => {
            if (u == userId){
                this.#users.splice(i, 1);
                removed = true;
                return true;
            }
        });
        return removed;
    }

    hasUser(userId) {
        return this.#users.includes(Number(userId));
    }

    toJSON() {
        return {
            id: this.#id,
            name: this.name,
            image_url: this.#image_url,
            preview: this.preview,
            users: this.#users,
            dateCreated: this.dateCreated,
            timeCreated: this.timeCreated
        };
    }
}