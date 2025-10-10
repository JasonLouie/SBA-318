import User from "../classes/User.js";
import Chat from "../classes/Chat.js";
import Message from "../classes/Message.js";

// Init user data
const user1 = new User("Bobert", "bobby@gmail.com", "Securepass123", 1);
const user2 = new User("SomeUser", "someEmail@gmail.com", "Securepass123", 2);
const user3 = new User("AnotherUser", "anotherEmail@domain.com", "Securepass123", 3);
const user4 = new User("testUser", "testEmail@test.com", "Securepass123", 4);
const user5 = new User("LonelyUser", "lonely@sad.com", "Securepass123", 5);

const users = [user1, user2, user3, user4, user5];

// Init chat data
const chat1 = new Chat(null, [user1, user2], 1);
const chat2 = new Chat(null, [user2, user3], 2);
const chat3 = new Chat(null, [user3, user4], 3);
const chat4 = new Chat(null, [user1, user2, user3, user4], 4);

const chats = [chat1, chat2, chat3, chat4];

// Init chat messages

// Chat 1
const message1 = new Message(1, 1, "Hello there", 1);
const message2 = new Message(2, 1, "Howdy", 2);
const message3 = new Message(1, 1, "Nice to meet you", 3);
const message6 = new Message(2, 1, "Another message", 7);

// Chat 2
const message4 = new Message(2, 2, "This is a test", 5);
const message5 = new Message(2, 2, "test again", 6);

const messages = [message1, message2, message3, message4, message5, message6];

export {users, chats, messages};