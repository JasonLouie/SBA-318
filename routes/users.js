import express from "express";
import { chats, messages, users } from "../data/data.js";
import EndpointError from "../classes/EndpointError.js";
import User from "../classes/User.js";
import { findChatMessages, findUserChat, findChatMessage, findUserChatMessages, findUserChats, findUserMessages, userExists, verifyKeys, findUsersByIds, addNonChatUsersByIds, chatExists, removeChatMessages, findChatUsers } from "../functions/functions.js";
import Chat from "../classes/Chat.js";
import Message from "../classes/Message.js";

const router = express.Router();

router.route("/")
    .get((req, res) => { // Get all users (May not want users to access this)
        if (Object.keys(req.query).length > 0) {
            if (!verifyKeys(req.query, ["userId"])) {
                throw new EndpointError(403, "Query must be 'userId'.");
            }
            const userId = req.query["userId"];
            if (userId) {
                const user = users.find(u => u.id == userId);
                if (user) {
                    res.json(user);
                } else {
                    throw new EndpointError(404, "User does not exist");
                }
            }
        } else {
            res.json(users);
        }
    })
    .post((req, res) => { // Signing up
        if (req.body.username && req.body.email && req.body.password) {
            // Username must be unique
            if (users.find(u => u.username == req.body.username)) {
                throw new EndpointError(409, "Username Already Taken");
            }

            // Email must be unique
            if (users.find(u => u.email == req.body.email)) {
                throw new EndpointError(409, "Email Already Taken");
            }

            const user = new User(req.body.username, req.body.email, req.body.password, users.length + 1);
            users.push(user);
            res.status(201).json(users[users.length - 1]);
        } else {
            throw new EndpointError(400, "Insufficient Data");
        }
    });

router.route("/:id")
    .get((req, res) => {
        const user = users.find(u => u.id == req.params.id);
        if (!user) {
            throw new EndpointError(404, "User does not exist");
        }
        res.json(user);
    })
    .patch((req, res) => { // Change email or password
        if (req.body && verifyKeys(req.body, ["email", "password"])) {
            const user = users.find((u, i) => {
                if (u.id == req.params.id) {
                    for (const key in req.body) {
                        users[i][key] = req.body[key];
                    }
                    return true;
                }
            });
            if (!user) {
                throw new EndpointError(404, "User does not exist");
            }
            res.json(user);
        } else if (!req.body) {
            throw new EndpointError(400, "Must contain a body with 'email' or 'password'!");
        } else {
            throw new EndpointError(403, "Cannot modify anything other than the email or password");
        }
    })
    .delete((req, res) => { // Delete user
        const user = users.find((u, i) => {
            if (u.id == req.params.id) {
                users[i] = new User(req.params.id, "Deleted User");
                // Delete user only by removing their credentials but keep a deleted user placeholder for chats with them in it
                return true;
            }
        });
        if (!user) {
            throw new EndpointError(404, "User does not exist");
        }
        res.json(user);
    });

// Get all chats that the user is in
router.route("/:id/chats")
    .get((req, res) => {
        const userChats = findUserChats(req.params.id);
        res.json(userChats);
    })
    .post((req, res) => { // Creates a new chat
        if (req.body && req.body.users instanceof Array && verifyKeys(req.body, ["users", "image_url", "name"])) {
            if (!req.body.users.includes(Number(req.params.id))) {
                req.body.users.push(req.params.id);
            }
            const chatUsers = findUsersByIds(req.body.users);
            if (chatUsers.length < 2) {
                throw new EndpointError(400, "A chat must contain at least 2 different users");
            }

            // Using chats.length as the id since it is easier to predict in this environment; normally use a randomly generated id
            const chat = new Chat(req.body.image_url, chatUsers, chats.length + 1, req.body.name);
            chats.push(chat);
            res.status(201).json(chats[chats.length - 1]);
        } else {
            throw new EndpointError(400, "Insufficient Data");
        }
    });

// Get the particular chat that the user is in
router.route("/:id/chats/:chatId")
    .get((req, res) => {
        const userChat = findUserChat(req.params.id, req.params.chatId);
        if (!userChat) {
            throw new EndpointError(404, "User is not part of the chat group");
        }
        res.json(userChat);
    })
    .patch((req, res) => { // Handle inviting users to the chat and changing the name and/or photo
        if (req.body && verifyKeys(req.body, ["users", "image_url", "name"])) {
            const chat = chats.find((c, i) => {
                if (c.id == req.params.chatId) {
                    if (req.body.users && req.body.users instanceof Array) { // Handle inviting users
                        addNonChatUsersByIds(req.body.users, chats[i]);
                    } else {
                        throw new EndpointError(400, "Invalid usage of inviting users");
                    }
                    for (const key in req.body) {
                        if (key != "users") { // Handle changing name or image_url
                            chats[i][key] = req.body[key];
                        }
                    }
                    return true;
                }
            });
            res.json(chat);
        } else {
            console.log(verifyKeys(req.body, ["users", "image_url", "name"]), req.body);
            throw new EndpointError(400, "Insufficient Data");
        }
    })
    .delete((req, res) => { // Handle leaving the chat or deleting it (deletes if the last user leaves the chat)
        if (!userExists(req.params.id)) {
            throw new EndpointError(404, "User does not exist");
        } else if (!chatExists(req.params.chatId)) {
            throw new EndpointError(404, "Chat does not exist");
        }
        const userChat = chats.find((c, i) => {
            if (c.hasUser(req.params.id) && c.id == req.params.chatId) {
                const removed = chats[i].removeUser(req.params.id);
                if (!removed) {
                    throw new EndpointError(500, "Unexpected error occurred when leaving the chat")
                }
                if (chats[i].numUsers === 0) { // Delete the chat if no users remain
                    removeChatMessages(req.params.chatId); // Cascade delete the messages of the chat
                    chats.splice(i, 1);
                }
                return true;
            }
        });
        if (!userChat) {
            throw new EndpointError(404, "User is not part of the chat group");
        }
        res.json(userChat);
    });

router.get("/:id/chats/:chatId/users", (req, res) => {
    if (findUserChat(req.params.id, req.params.chatId)) {
        const chatUsers = findChatUsers(req.params.chatId);
        res.json(chatUsers);
    } else {
        throw new EndpointError(404, "User is not part of the chat group");
    }
});

// Get the messages of a chat that the user is in
router.route("/:id/chats/:chatId/messages")
    .get((req, res) => {
        if (findUserChat(req.params.id, req.params.chatId)) {
            let chatMessages = findChatMessages(req.params.chatId);
            if (req.query && Object.keys(req.query).length > 0) {
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
    })
    .post((req, res) => {
        if(findUserChat(req.params.id, req.params.chatId)){
            if (req.body.message) {
                const message = new Message(req.params.id, req.params.chatId, req.body.message, messages.length + 1);
                messages.push(message);
                res.status(201).json(messages[messages.length-1]);
            } else {
                throw new EndpointError(400, "Insufficient or Extra Data");
            }
        } else {
            throw new EndpointError(404, "User is not part of the chat group");
        }
    });

// Route for a particular message, from a particular chat, and belonging to the user that sent it
router.route("/:id/chats/:chatId/messages/:messageId")
    .get((req, res) => {
        if (findUserChat(req.params.id, req.params.chatId)) {
            const message = findChatMessage(req.params.chatId, req.params.messageId);
            if (!message) {
                throw new EndpointError(404, "Message does not exist");
            }
            res.json(message);
        } else {
            throw new EndpointError(404, "User is not part of the chat group");
        }
    })
    .patch((req, res) => {
        if (req.body && Object.keys(req.body).length === 1 && req.body["message"]) {
            if (findUserChat(req.params.id, req.params.chatId)) {
                const message = messages.find((m, i) => {
                    if (m.userId == req.params.id && m.chatId == req.params.chatId && m.id == req.params.messageId) {
                        messages[i]["message"] = req.body["message"];
                        return true;
                    }
                });
                if (!message) {
                    throw new EndpointError(404, "Message does not exist");
                }
                res.json(message);
            } else {
                throw new EndpointError(404, "User is not part of the chat group");
            }
        } else if (!req.body) {
            throw new EndpointError(400, "Must contain a body with 'message'!");
        } else {
            throw new EndpointError(403, "Cannot modify anything other than the contents of the message");
        }
    })
    .delete((req, res) => {
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
                throw new EndpointError(403, "Cannot delete a message that does not belong to user");
            }
        } else {
            throw new EndpointError(404, "User is not part of the chat group");
        }
    });

// Get all messages that the user sent
router.get("/:id/messages", (req, res) => {
    const userMessages = findUserMessages(req.params.id);
    res.json(userMessages);
});

export default router;