import express from "express";
import users from "../data/users.js";
import chats from "../data/chats.js";
import EndpointError from "../classes/EndpointError.js";
import User from "../classes/User.js";

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

router.get("/:id/chats", (req, res, next) => {
    const userChats = chats.filter(chat => chat.hasUser(req.params.id));
    res.json(userChats);
})

export default router;