# SBA-318

This is an express server application. It is an WebChatAPI created to handle text chats between two or more users and uses Node.js, Express, and EJS (to render a view). At the moment, it is not connected to any databases and uses static data. Any information created, updated, or deleted will only take effect during the current instance that the API is being ran (data does not persist). The primary endpoint is the users endpoint and anything implemented in this specific endpoint is expected to be available for all users with an account. The chats and messages endpoints are not meant for all users to access (mainly administrators). For the scope of this project, some methods are implemented and enabled. Below are tables explaining the HTTP Responses, classes in this project, and a code snippet with comments for static data.

## Base URL

The base url for the api is `localhost:3000/api/v1`

## HTTP Responses

<table>
    <tr>
        <th><h3>Status Code</h3></th>
        <th><h3>Description</h3></th>
    </tr>
    <tr>
        <td>200 - OK</td>
        <td>Successfully retrieved information.</td>
    </tr>
    <tr>
        <td>201 - Created</td>
        <td>Succesfully created new entry.</td>
    </tr>
    <tr>
        <td>400 - Bad Request</td>
        <td>Missing information in the request body.</td>
    </tr>
    <tr>
        <td>403 - Forbidden</td>
        <td>
            Attempting to modify or delete data that should not
            be modified/deleted or does not exist.
        </td>
    </tr>
    <tr>
        <td>404 - Not Found</td>
        <td>The resource does not exist.</td>
    </tr>
    <tr>
        <td>409 - Conflict</td>
        <td>
            Attempting to create a new resource when it already
            exists (happens when certain fields should be
            unique).
        </td>
    </tr>
    <tr>
        <td>500 - Internal Server Error</td>
        <td>
            An unexpected error occurred when sending the
            request.
        </td>
    </tr>
</table>

## Classes

<table>
    <tr>
        <th><h3>Class</h3></th>
        <th><h3>Fields</h3></th>
        <th><h3>JSON Structure</h3></th>
        <th><h3>Description</h3></th>
    </tr>
    <tr>
        <td>EndpointError.js</td>
        <td>
            status (private, number), message (private, string)
        </td>
        <td>
            <pre><code>{
    message: string
}</code></pre>
        </td>
        <td>
            Represents an endpoint error and used for custom
            error handling.
        </td>
    </tr>
    <tr>
        <td>User.js</td>
        <td>
            id (private, number), username (private, string),
            email (public, string), password (public, string)
        </td>
        <td>
            <pre><code>{
    id: number,
    username: string,
    email: string,
    password: string
}</code></pre>
        </td>
        <td>
            Represents a user and stores information on a user.
            Ideally, none of the properties should be private,
            but for the scope of the project it makes sense
            (must be public for patch requests).
        </td>
    </tr>
    <tr>
        <td>Chat.js</td>
        <td>
            id (private, number), name (public, string), users
            (private, array of userIds), image_url (private,
            string), timestamp (private, Date object)
        </td>
        <td>
            <pre><code>{
    id: number,
    name: string,
    image_url: string,
    preview: Message (JSON format),
    users: number[],
    dateCreated: string,
    timeCreated: string
}</code></pre>
        </td>
        <td>
            Represents a chat and stores information related to
            a chat. Ideally, none of the properties should be
            private, but for the scope of the project it makes
            sense (must be public for patch requests).
        </td>
    </tr>
    <tr>
        <td>Message.js</td>
        <td>
            id (private, number), senderId (private, number),
            chatId (private, number), message (public, string),
            timestamp (private, Date object)
        </td>
        <td>
            <pre><code>{
    id: number,
    senderId: number,
    chatId: number,
    message: string,
    dateSent: string,
    timeSent: string
}</code></pre>
        </td>
        <td>
            Represents a message and stores information related
            to a message. Ideally, none of the properties should
            be private, but for the scope of the project it
            makes sense (must be public for patch requests).
        </td>
    </tr>
</table>

## Static Dataset

<pre><code>// Init user data
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

const messages = [message1, message2, message3, message4, message5, message6];</code></pre>