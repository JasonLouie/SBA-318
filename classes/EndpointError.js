export default class EndpointError {
    #message
    #status
    constructor(status, message) {
        this.#status = status;
        this.#message = message;
    }

    get status() {
        return this.#status;
    }

    get message() {
        return this.#message;
    }

    toJSON() {
        return (
            {
                message: this.message
            }
        )
    }
}