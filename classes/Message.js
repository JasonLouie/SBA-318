import { generateRandomId } from "../functions/functions.js";
import { timeOptions } from "../constants/time.js";

export default class Message {
    #id;
    #senderId;
    #chatId;
    message;
    #timestamp = new Date();

    constructor(senderId, chatId, message, id=generateRandomId()) {
        this.#id = id;
        this.#senderId = senderId;
        this.#chatId = chatId;
        this.message = message;
    }

    get id() {
        return this.#id;
    }

    get senderId() {
        return this.#senderId;
    }

    get chatId() {
        return this.#chatId;
    }

    get dateSent() {
        return this.#timestamp.toLocaleDateString();
    }

    get timeSent() {
        return this.#timestamp.toLocaleTimeString("en-US", timeOptions);
    }

    toJSON() {
        return {
            id: this.#id,
            senderId: this.#senderId,
            chatId: this.#chatId,
            message: this.message,
            dateSent: this.dateSent,
            timeSent: this.timeSent
        };
    }
}