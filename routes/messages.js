import express from "express";
import { messages } from "../data/data.js";
import EndpointError from "../classes/EndpointError.js";
import { chatExists, userExists, verifyKeys } from "../functions/functions.js";

const router = express.Router();

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
    } else if (Object.keys(req.query).length > 0) {
        console.log(req.query);
        throw new EndpointError(400, "Query must contain 'userId', 'chatId', and/or 'limit', or only 'messageId'.");
    } else {
        res.json(messages);
    }
});

router.get("/:id", (req, res) => {
    const message = messages.find(m => m.id == req.params.id);
    if (!message) {
        throw new EndpointError(404, "Message does not exist");
    }
    res.json(message);
});

export default router;