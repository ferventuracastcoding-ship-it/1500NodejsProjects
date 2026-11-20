// practice code to get better at Node.js
// Import Express.
const express = require("express");

// Import path for working with file paths.
const path = require("path");

// Create the Express application.
const app = express();

// Set the server port.
const PORT = 3000;

// Allow JSON requests.
app.use(express.json());

// Serve files from the public directory.
app.use(express.static(path.join(__dirname, "public")));

// Store conversation history in memory.
const conversations = [];

// --------------------------------------------------
// AI RESPONSE ENGINE
// --------------------------------------------------

function generateAIResponse(message) {
    // Convert the message to lowercase.
    const text = message.toLowerCase();
    // Greeting detection.
    if (
        text.includes("hello") ||
        text.includes("hi") ||
        text.includes("hey")
    ) {
        return "Hello! I am your Node.js AI assistant. How can I help you today?";
    }
    // JavaScript question.
    if (
        text.includes("javascript") ||
        text.includes("js")
    ) {
        return `
JavaScript is a programming language commonly used for web development.

Important JavaScript concepts include:

1. Variables
2. Functions
3. Arrays
4. Objects
5. Classes
6. Promises
7. Async/Await
8. Closures
9. DOM manipulation
10. APIs

For Node.js development, JavaScript can also run on the server.
        `.trim();
    }

    // Node.js question.
    if (
        text.includes("node.js") ||
        text.includes("nodejs")
    ) {
        return `
Node.js allows JavaScript to run outside the browser.

Common Node.js technologies include:

• Express
• MongoDB
• PostgreSQL
• REST APIs
• WebSockets
• Authentication
• File systems
• Streams
• Event-driven programming

A typical Node.js application has a server that receives requests,
processes data, and sends responses back to clients.
        `.trim();
    }

    // AI question.
    if (
        text.includes("artificial intelligence") ||
        text.includes("ai")
    ) {
        return `
Artificial Intelligence allows software to perform tasks that normally
require human-like reasoning.

AI applications can include:

• Chatbots
• Code assistants
• Image recognition
• Recommendation systems
• Classification
• Search
• Natural-language processing
• Machine learning
        `.trim();
    }

    // Coding question.
    if (
        text.includes("code") ||
        text.includes("program")
    ) {
        return `
I can help you design a programming project.

A good Node.js architecture is:

Client
   ↓
Express API
   ↓
Controller
   ↓
Service
   ↓
Database / AI Model
   ↓
Response

For a production AI application, you would normally connect the
AI service layer to an actual language model API.
        `.trim();
    }

    // Database question.
    if (
        text.includes("database") ||
        text.includes("sql") ||
        text.includes("mongodb")
    ) {
        return `
A Node.js application can communicate with databases through a
database driver or ORM.

Examples:

SQL:
- PostgreSQL
- MySQL
- SQLite

NoSQL:
- MongoDB
- Redis

For an AI application, a database can store users, conversations,
messages, prompts, settings, and AI responses.
        `.trim();
    }

    // Default response.
    return `
I received your message:

"${message}"

I am a Node.js AI assistant. Try asking me about JavaScript,
Node.js, APIs, databases, AI, algorithms, or software architecture.
    `.trim();
}

// --------------------------------------------------
// CHAT API
// --------------------------------------------------

app.post("/api/chat", (req, res) => {

    // Get the user's message.
    const message = req.body.message;

    // Validate the request.
    if (!message || message.trim() === "") {
        return res.status(400).json({
            error: "Message is required."
        });
    }

    // Generate the AI response.
    const response = generateAIResponse(message);

    // Create a conversation record.
    const conversation = {
        id: conversations.length + 1,
        userMessage: message,
        aiResponse: response,
        timestamp: new Date().toISOString()
    };

    // Save the conversation.
    conversations.push(conversation);

    // Send the response to the browser.
    res.json({
        success: true,
        response: response,
        conversationId: conversation.id
    });
});

// --------------------------------------------------
// CONVERSATION API
// --------------------------------------------------

app.get("/api/conversations", (req, res) => {

    // Return all conversations.
    res.json(conversations);
});

// --------------------------------------------------
// HEALTH CHECK
// --------------------------------------------------

app.get("/api/health", (req, res) => {

    // Return server status.
    res.json({
        status: "online",
        application: "Node.js AI Assistant",
        conversations: conversations.length
    });
});

// --------------------------------------------------
// START SERVER
// --------------------------------------------------

app.listen(PORT, () => {

    console.log(`
========================================
      NODE.JS AI ASSISTANT
========================================

Server running at:

http://localhost:${PORT}

AI API:

POST /api/chat

Conversation API:

GET /api/conversations

Health:

GET /api/health

========================================
    `);
});
