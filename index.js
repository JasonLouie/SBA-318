import express from "express";
import userRouter from "./routes/users.js";
import EndpointError from "./classes/EndpointError.js";
import { timeOptions } from "./constants/time.js";

const app = express();
const port = 3000;

app.set("view engine", "ejs");

app.use(express.static("public"));

app.use((req, res, next) => {
    console.log(`${req.method} Request made to url ${req.url} at ${new Date().toLocaleTimeString("en-US", timeOptions)}`);
    next();
});

app.get("/", (req, res) => {
    res.render("index");
});

app.use("/users", userRouter);

// Invalid route handler
app.use((req, res, next) => {
    next(new EndpointError(404, "Content not found"));
});

// Error handler
app.use((err, req, res, next) => {
    res.status(err.status || 500).json({error: err.message});
});

app.listen(port, () => {
    console.log(`Listening for connections on port ${port}`);
});

// users/id - Shows user profile
// users/id/chats - Shows chats for a user
// users/id/chats/id - Shows specific chat (Will probably be used)
// users/id/chats/id/messages - When user clicks on a particular chat
// users/id/chats/id/messages/id - DELETE, POST, PATCH/PUT message (for the latter, body will be input or replacement message in input)
// users/id/chats/id/messages/id?limit=num - Add query parameters (last number of messages)