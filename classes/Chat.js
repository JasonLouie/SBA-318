import messages from "../data/messages.js";

export default class Chat {
    #users = []; // List of User instances within the chat
    #pic; // Relative path to picture

    constructor(pic = null) {
        this.#pic = pic;
    }

    get users() {
        return {...this.#users};
    }

    get preview() {
        return messages[messages.length-1] || "";
    }

    hasUser(userId) {
        return this.#users.includes(userId);
    }

    toJSON() {
        return {
            users: this.users,
            pic: this.#pic,
            preview: this.preview
        };
    }
}