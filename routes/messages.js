import express from "express";
import { messages } from "../data/data.js";
import EndpointError from "../classes/EndpointError.js";

const router = express.Router();

router.get("/", (req, res) => {
    res.json(messages);
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
    .patch((req, res, next) => {
        const message = messages.find((m, i) => {
            if (m.id == req.params.id) {
                // Only allow modifying the message
                if (req.body.length > 1 && req.body["message"]) {
                    messages[i]["message"] = req.body["message"];
                } else {
                    next(new EndpointError(403, "Cannot modify anything other than the contents of the message"));
                }
            }
        });
        if (message) {
            res.json(message);
        } else {
            next(new EndpointError(404, "Message does not exist"));
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