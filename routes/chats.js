import express from "express";
import { chats } from "../data/data.js";
import EndpointError from "../classes/EndpointError.js";
import { findChatMessages, findChatUsers } from "../functions/functions.js";

const router = express.Router();

router.get("/", (req, res) => {
    res.json(chats);
});

router.get("/:id", (req, res) => {
    const chat = chats.find(c => c.id == req.params.id);
    if (!chat) {
        throw new EndpointError(404, "Chat does not exist");
    }
    res.json(chat);
});

router.get("/:id/users", (req, res) => {
    const chatUsers = findChatUsers(req.params.id);
    res.json(chatUsers);
});

router.get("/:id/messages", (req, res) => {
    const chatMessages = findChatMessages(req.params.id);
    res.json(chatMessages);
});

export default router;