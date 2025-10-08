import express from "express";
import { messages, users } from "../data/data.js";
import EndpointError from "../classes/EndpointError.js";
import User from "../classes/User.js";
import { chatExists, findChatMessages, findUserChat, findUserChatMessage, findUserChatMessages, findUserChats, findUserMessages, userExists, verifyKeys } from "../functions/functions.js";

const router = express.Router();

router.route("/")
    .get((req, res, next) => { // Get all users (May not want users to access this)
        if (Object.keys(req.query).length > 0) {
            if (!verifyKeys(req.query, ["userId"])) {
                next(new EndpointError(403, "Query must be 'userId'."));
                return;
            }
            const userId = req.query["userId"];
            if (userId) {
                const user = users.find(u => u.id == userId);
                if (user) {
                    res.json(user);
                } else {
                    next(new EndpointError(404, "User does not exist"));
                }
            }
        } else {
            res.json(users);
        }
    })
    .post((req, res, next) => { // Signing up
        if (req.body.username && req.body.email && req.body.password) {
            // Username must be unique
            if (users.find(u => u.username == req.body.username)) {
                next(new EndpointError(409, "Username Already Taken"));
                return;
            }

            // Email must be unique
            if (users.find(u => u.email == req.body.email)) {
                next(new EndpointError(409, "Email Already Taken"));
                return;
            }

            const user = new User(req.body.username, req.body.email, req.body.password);
            users.push(user);
            res.json(users[users.length - 1]);
        } else {
            next((new EndpointError(400, "Insufficient Data")));
        }
    });

router.route("/:id")
    .get((req, res, next) => {
        const user = users.find(u => u.id == req.params.id);
        if (user) {
            res.json(user);
        } else {
            next(new EndpointError(404, "User does not exist"));
        }
    })
    .patch((req, res, next) => { // Change email or password
        const user = users.find((u, i) => {
            if (u.id == req.params.id) {
                for (const key in req.body) {
                    users[i][key] = req.body[key];
                }
                return true;
            }
        });
        if (user) {
            res.json(user);
        } else {
            next(new EndpointError(404, "User does not exist"));
        }

    })
    .delete((req, res, next) => { // Delete user
        const user = users.find((u, i) => {
            if (u.id == req.params.id) {
                users[i] = new User(req.params.id, "Deleted User");
                // Delete user only by removing their credentials but keep a deleted user placeholder for chats with them in it
            }
        });
        if (user) {
            res.json(user);
        } else {
            next(new EndpointError(404, "User does not exist"));
        }
    });

// Get all chats that the user is in
router.get("/:id/chats", (req, res, next) => {
    try {
        const userChats = findUserChats(req.params.id);
        res.json(userChats);
    } catch (error) {
        next(error);
    }
});

// Get the particular chat that the user is in
router.get("/:id/chats/:chatId", (req, res, next) => {
    if (!userExists(req.params.id)) {
        next(new EndpointError(404, "User does not exist"));
    } else if (!chatExists(req.params.chatId)) {
        next(new EndpointError(404, "Chat does not exist"));
    } else {
        const userChat = findUserChat(req.params.id, req.params.chatId);
        if (userChat) {
            res.json(userChat);
        } else {
            next(new EndpointError(404, "User is not part of the chat group"));
        }
    }
});

// Get the messages of a chat that the user is in
router.get("/:id/chats/:chatId/messages", (req, res, next) => {
    try {
        if (findUserChat(req.params.id, req.params.chatId)) {
            let chatMessages = findChatMessages(req.params.chatId);
            if (Object.keys(req.query).length > 0) {
                if (!verifyKeys(req.query, ["userId", "limit"])) {
                    throw new EndpointError(403, "Query must be 'userId' or 'limit'.");
                }
                const userId = req.query["userId"];
                const limit = req.query["limit"];
                if (userId) {
                    if (!userExists(userId)) {
                        throw new EndpointError(404, "User does not exist");
                    } else if (findUserChat(userId, req.params.chatId)) {
                        chatMessages = chatMessages.filter(m => m.senderId == userId);
                    } else {
                        throw new EndpointError(404, "User is not part of the chat group");
                    }
                }
                if (limit) {
                    chatMessages = chatMessages.slice(Number(limit) * -1);
                }
            }
            res.json(chatMessages);
        } else {
            throw new EndpointError(404, "User is not part of the chat group");
        }
    } catch (error) {
        next(error);
    }
});

// Route for particular message, from a particular chat, and belonging to the user that sent it
router.route("/:id/chats/:chatId/messages/:messageId")
    .get((req, res, next) => {
        try {
            if (findUserChat(req.params.id, req.params.chatId)) {
                const message = findUserChatMessage(req.params.id, req.params.chatId, req.params.messageId);
                if (message) {
                    res.json(message);
                } else {
                    throw new EndpointError(403, "Message cannot be accessed");
                }
            } else {
                throw new EndpointError(404, "User is not part of the chat group");
            }
        } catch (error) {
            next(error);
        }
    })
    .patch((req, res, next) => {
        try {
            if (req.body && Object.keys(req.body).length === 1 && req.body["message"]) {
                if (findUserChat(req.params.id, req.params.chatId)) {
                    const message = messages.find((m, i) => {
                        if (m.userId == req.params.id && m.chatId == req.params.chatId && m.id == req.params.messageId) {
                            messages[i]["message"] = req.body["message"];
                            return true;
                        }
                    });
                    if (message) {
                        res.json(message);
                    } else {
                        throw new EndpointError(403, "Message cannot be accessed");
                    }
                } else {
                    throw new EndpointError(404, "User is not part of the chat group");
                }
            } else {
                throw new EndpointError(403, "Cannot modify anything other than the contents of the message");
            }
        } catch (error) {
            next(error);
        }
    })
    .delete((req, res, next) => {
        try {
            if (findUserChat(req.params.id, req.params.chatId)) {
                if (!messageExists(req.params.messageId)) {
                    throw new EndpointError(404, "Message does not exist");
                }
                const message = messages.find((m, i) => {
                    if (m.userId == req.params.id && m.chatId == req.params.chatId && m.id == req.params.messageId) {
                        messages.splice(i, 1);
                        return true;
                    }
                });
                if (message) {
                    res.json(message);
                } else {
                    throw new EndpointError(403, "Message cannot be accessed");
                }
            } else {
                throw new EndpointError(404, "User is not part of the chat group");
            }
        } catch (error) {
            next(error);
        }
    })

// Get all messages that the user sent
router.get("/:id/messages", (req, res, next) => {
    try {
        const userMessages = findUserMessages(req.params.id);
        res.json(userMessages);
    } catch (error) {
        next(error);
    }
});

export default router;