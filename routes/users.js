import express from "express";
import { users, chats, messages } from "../data/data.js";
import EndpointError from "../classes/EndpointError.js";
import User from "../classes/User.js";
import { chatExists, findChatMessages, findUserChat, findUserChatMessages, findUserChats, userExists } from "../functions/functions.js";

const router = express.Router();

router.route("/")
    .get((req, res) => { // Get all users (May not want users to access this)
        res.json(users);
    })
    .post((req, res, next) => { // Signing up
        if (req.body.username && req.body.email && req.body.password) {

            // Username must be unique
            if (users.find(u => u.username == req.body.username)) {
                next(new EndpointError(409, "Username Already Taken"));
            }

            // Email must be unique
            if (users.find(u => u.email == req.body.email)) {
                next(new EndpointError(409, "Email Already Taken"));
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
    .patch((req, res, next) => { // Change email, password, or profile pic (may implement)
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
    if (!userExists(req.params.id)) {
        next(new EndpointError(404, "User does not exist"));
    } else {
        const userChats = findUserChats(req.params.id);
        res.json(userChats);
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
            next(new EndpointError(403, "User is not part of the chat group"));
        }
    }
});

// Get the particular chat that the user is in
router.get("/:id/chats/:chatId/messages", (req, res, next) => {
    if (!userExists(req.params.id)) {
        next(new EndpointError(404, "User does not exist"));
    } else if (!chatExists(req.params.chatId)) {
        next(new EndpointError(404, "Chat does not exist"));
    } else if (findUserChat(req.params.id, req.params.chatId)) {
        let chatMessages = findChatMessages(req.params.chatId);
        if (Object.keys(req.query).length > 0){
            verifyQueries();
            const userId = req.query["userId"];
            if (userId) {
                if (!userExists(userId)) {
                    next(new EndpointError(404, "User does not exist"));
                    return;
                } else if (findUserChat(userId, req.params.chatId)) {
                    chatMessages = chatMessages.filter(m => m.senderId == userId);
                } else {
                    next(new EndpointError(403, "User is not part of the chat group"));
                    return;
                }
            }
            if (req.query["limit"]) {
                chatMessages = chatMessages.slice(Number(req.query["limit"]) * -1);
            }
        }
        res.json(chatMessages);
        
    } else {
        next(new EndpointError(403, "User is not part of the chat group"));
    }

    function verifyQueries() {
        const allowedQueries = ["userId", "limit"];
        for (const key in req.query) {
            if (!allowedQueries.includes(key)) {
                next(error(new EndpointError(403, "Cannot access this")));
            }
        }
    }
});

// Get all messages that the user sent
router.get("/:id/messages", (req, res, next) => {
    if (!userExists(req.params.id)) {
        next(new EndpointError(404, "User does not exist"));
    } else {
        const userMessages = messages.filter(m => m.senderId == req.params.id);
        res.json(userMessages);
    }
});

export default router;