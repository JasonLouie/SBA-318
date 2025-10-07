import {users, chats, messages} from "../data/data.js";
import User from "../classes/User.js";
import Chat from "../classes/Chat.js";
import Message from "../classes/Message.js";

/**
 * Generates a random id with Date.now() and a random suffix between the lower bound and upper bound inclusively
 * @param {number} min - Lower bound
 * @param {number} max - Upper bound
 * @returns {string} Random string id with a random suffix
 */
export function generateRandomId(min=10, max=99) {
    return String(Date.now()) + String(Math.floor(Math.random() * (max - min + 1)) + min);
}

/**
 * Checks if a User instance with the provided userId exists
 * @param {number} userId
 * @returns {boolean}
 */
export function userExists(userId) {
    return users.find(u => u.id == userId) != undefined;
}

/**
 * Checks if a Chat instance with the provided chatId exists
 * @param {number} chatId
 * @returns {boolean}
 */
export function chatExists(chatId) {
    return chats.find(c => c.id == chatId) != undefined;
}

/**
 * Checks if a Message instance with the provided messageId exists
 * @param {number} messageId
 * @returns {boolean}
 */
export function messageExists(messageId) {
    return messages.find(m => m.id == messageId) != undefined;
}

/**
 * Returns all chats that the user is in
 * @param {number} userId - Id of the user
 * @returns {Chat[]} Array of Chat instances that the user is in
 */
export function findUserChats(userId) {
    return chats.filter(c => c.hasUser(userId));
}

/**
 * Returns the particular chat that the user is in
 * @param {number} userId - Id of the user
 * @param {number} chatId - Id of the chat
 * @returns {Chat | undefined} Chat instance that the user is part of or undefined if that chat doesn't exist or doesn't contain the user
 */
export function findUserChat(userId, chatId) {
    return chats.find(c => c.hasUser(userId) && c.id == chatId);
}

/**
 * Returns all messages that the user sent
 * @param {number} userId - Id of the user
 * @returns {Message[]} Array of Message instances that the user sent
 */
export function findUserMessages(userId) {
    return messages.filter(m => m.senderId == userId);
}

/**
 * Returns all messages a user sent for a particular chat
 * @param {number} userId - Id of the user
 * @param {number} chatId - Id of the chat
 * @returns {Message[]} Array of Message instances that the user sent to a chat
 */ 
export function findUserChatMessages(userId, chatId) {
    return messages.filter(m => m.senderId == userId && m.chatId == chatId);
}

/**
 * Returns all messages for a particular chat
 * @param {number} chatId - Id of the chat
 * @returns {Message[]}
 */
export function findChatMessages(chatId) {
    return messages.filter(m => m.chatId == chatId);
}