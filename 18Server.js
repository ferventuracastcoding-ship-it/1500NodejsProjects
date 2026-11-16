// ==========================================
// BASIC NODE.JS WEB SERVER
// ==========================================

// Import Node's built-in HTTP module.
const http = require("http");

// Choose the port where the server will run.
const PORT = 3000;

// Create the web server.
const server = http.createServer((request, response) => {

    // Display the HTTP request method.
    console.log(
        `${request.method} ${request.url}`
    );

    // Tell the browser that we are sending HTML.
    response.setHeader(
        "Content-Type",
        "text/html"
    );

    // Handle the home page.
    if (request.url === "/") {

        // Send a successful HTTP status.
        response.statusCode = 200;

        // Send HTML to the browser.
        response.end(`
            <!DOCTYPE html>

            <html>

            <head>
                <title>Node.js Web Server</title>

                <style>

                    body {
                        font-family: Arial, sans-serif;
                        background: #111;
                        color: white;
                        text-align: center;
                        padding: 80px;
                    }

                    h1 {
                        color: #00ff99;
                    }

                    .box {
                        max-width: 600px;
                        margin: auto;
                        padding: 30px;
                        border: 2px solid #00ff99;
                        border-radius: 12px;
                    }

                    button {
                        padding: 12px 20px;
                        border: none;
                        border-radius: 8px;
                        cursor: pointer;
                    }

                </style>
            </head>

            <body>

                <div class="box">

                    <h1>Hello from Node.js!</h1>

                    <p>
                        You are connected to your first
                        Node.js web server.
                    </p>

                    <p>
                        Server Status:
                        <strong>ONLINE</strong>
                    </p>

                    <button onclick="alert('Node.js is working!')">
                        Test Server
                    </button>

                </div>

            </body>

            </html>
        `);

        return;
    }

    // Handle the /about page.
    if (request.url === "/about") {

        // Send a successful response.
        response.statusCode = 200;

        // Send the about page.
        response.end(`
            <!DOCTYPE html>

            <html>

            <head>
                <title>About</title>
            </head>

            <body>

                <h1>About This Server</h1>

                <p>
                    This page is being served by Node.js.
                </p>

                <a href="/">
                    Back Home
                </a>

            </body>

            </html>
        `);

        return;
    }

    // Handle unknown pages.
    response.statusCode = 404;

    // Send a 404 page.
    response.end(`
        <!DOCTYPE html>

        <html>

        <head>
            <title>404</title>
        </head>

        <body>

            <h1>404 - Page Not Found</h1>

            <p>
                The page you requested does not exist.
            </p>

            <a href="/">
                Go Home
            </a>

        </body>

        </html>
    `);
});

// Start listening for browser requests.
server.listen(PORT, () => {

    // Tell us that the server has started.
    console.log(`
========================================

      NODE.JS WEB SERVER ONLINE

========================================

Server:
http://localhost:${PORT}

Home:
http://localhost:${PORT}/

About:
http://localhost:${PORT}/about

Press CTRL + C to stop the server.

========================================
`);
});
