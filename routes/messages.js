import express from "express";
import { messages } from "../data/data.js";
import EndpointError from "../classes/EndpointError.js";
import { chatExists, userExists, verifyKeys } from "../functions/functions.js";

const router = express.Router();

// NEED TO perform tests FOR STRICT messageId or the other 3
// Gets all messages, a filtered array of messages, or a particular message
// Queries allowed: At least one of the 3 (userId, chatId, limit) or strictly messageId
router.get("/", (req, res) => {
    if (Object.keys(req.query).length === 1 && verifyKeys(req.query, ["messageId"])) {
        const messageId = req.query["messageId"];
        if (messageId) {
            const message = messages.find(m => m.id == messageId);
            if (message) {
                res.json(message);
                return;
            }
        }
        throw new EndpointError(404, "Message does not exist");
    } else if (Object.keys(req.query).length < 4 && verifyKeys(req.query, ["userId", "chatId", "limit"])) {
        const userId = req.query["userId"];
        const chatId = req.query["chatId"];
        const limit = req.query["limit"];
        let queriedMessages = messages;
        if (userId) {
            if (!userExists(userId)) {
                throw new EndpointError(404, "User does not exist");
            } else {
                queriedMessages = queriedMessages.filter(m => m.senderId == userId);
            }
        }
        if (chatId) {
            if (!chatExists(chatId)) {
                throw new EndpointError(404, "Chat does not exist");
            } else {
                queriedMessages = queriedMessages.filter(m => m.chatId == chatId);
            }
        }
        if (limit) {
            queriedMessages = queriedMessages.slice(Number(limit) * -1);
        }
        res.json(queriedMessages);
    } else if (req.query) {
        throw new EndpointError(403, "Query must contain 'userId', 'chatId', and/or 'limit', or only 'messageId'.");
    } else {
        res.json(messages);
    }
});

router.route("/:id")
    .get((req, res) => {
        const message = messages.find(m => m.id == req.params.id);
        if (!message) {
            throw new EndpointError(404, "Message does not exist");
        }
        res.json(message);
    })
    .patch((req, res) => { // Only allow modifying the message
        if (req.body && Object.keys(req.body).length === 1 && req.body["message"]) {
            const message = messages.find((m, i) => {
                if (m.id == req.params.id) {
                    messages[i]["message"] = req.body["message"];
                    return true;
                }
            });
            if (!message) {
                throw new EndpointError(404, "Message does not exist");
            }
            res.json(message);
        } else if (!req.body) {
            throw new EndpointError(400, "Must contain a body with 'message'!");
        } else {
            throw new EndpointError(403, "Cannot modify anything other than the contents of the message");
        }
    })
    .delete((req, res) => {
        const message = messages.find((m, i) => {
            if (m.id == req.params.id) {
                messages.splice(i, 1);
                return true;
            }
        });
        if (!message) {
            throw new EndpointError(404, "Message does not exist");
        }
        res.json(message);
    });

export default router;