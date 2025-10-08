import express from "express";
import { messages } from "../data/data.js";
import EndpointError from "../classes/EndpointError.js";
import { verifyKeys } from "../functions/functions.js";

const router = express.Router();

router.get("/", (req, res, next) => {
    if (Object.keys(req.query).length > 0) {
        if (!verifyKeys(req.query, ["userId", "messageId", "chatId", "limit"])) {
            next(new EndpointError(403, "Query must be 'userId', 'messageId', 'chatId', or 'limit'."));
            return;
        }
        const messageId = req.query["messageId"];
        if (messageId) {
            const message = messages.find(m => m.id == messageId);
            if (message) {
                res.json(message);
            } else {
                next(new EndpointError(404, "Message does not exist"));
            }
            return;
        }
        const userId = req.query["userId"];
        const chatId = req.query["chatId"];
        const limit = req.query["limit"];
        let queriedMessages = messages;
        if (userId) {
            if (!userExists(userId)) {
                next(new EndpointError(404, "User does not exist"));
                return;
            } else {
                queriedMessages = queriedMessages.filter(m => m.senderId == userId);
            }
        }
        if (chatId) {
            if (!chatExists(chatId)) {
                next(new EndpointError(404, "Chat does not exist"));
                return;
            } else {
                queriedMessages = queriedMessages.filter(m => m.chatId == chatId);
            }
        }
        if (limit) {
            queriedMessages = queriedMessages.slice(Number(limit) * -1);
        }
    } else {
        res.json(messages);
    }
});

router.route("/:id")
    .get((req, res, next) => {
        const message = messages.find(m => m.id == req.params.id);
        if (message) {
            res.json(message);
        } else {
            next(new EndpointError(404, "Message does not exist"));
        }
    })
    .patch((req, res, next) => { // Only allow modifying the message
        if (req.body && Object.keys(req.body).length === 1 && req.body["message"]) {
            const message = messages.find((m, i) => {
                if (m.id == req.params.id) {
                    messages[i]["message"] = req.body["message"];
                    return true;
                }
            });
            if (message) {
                res.json(message);
            } else {
                next(new EndpointError(404, "Message does not exist"));
            }
        } else {
            next(new EndpointError(403, "Cannot modify anything other than the contents of the message"));
            return;
        }
    })
    .delete((req, res, next) => {
        const message = messages.find((m, i) => {
            if (m.id == req.params.id) {
                messages.splice(i, 1);
                return true;
            }
        });
        if (message) {
            res.json(message);
        } else {
            next(new EndpointError(404, "Message does not exist"));
        }
    });

export default router;