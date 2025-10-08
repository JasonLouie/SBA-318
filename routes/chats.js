import express from "express";
import { chats } from "../data/data.js";
import EndpointError from "../classes/EndpointError.js";

const router = express.Router();

router.get("/", (req, res) => {
    res.json(chats);
});

router.get("/:id", (req, res) => {
    const chat = chats.filter(c => c.id == req.params.id);
    if (!chat) {
        throw new EndpointError(404, "Chat does not exist");
    }
    res.json(chat);
});

export default router;