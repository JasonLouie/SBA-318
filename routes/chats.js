import express from "express";
import { chats } from "../data/data.js";
import EndpointError from "../classes/EndpointError.js";

const router = express.Router();

router.get("/", (req, res) => {
    res.json(chats);
});

router.get("/:id", (req, res, next) => {
    const chat = chats.filter(c => c.id == req.params.id);
    if (chat) {
        res.json(chat);
    } else {
        next(new EndpointError(404, "Chat does not exist"));
    }
});

export default router;