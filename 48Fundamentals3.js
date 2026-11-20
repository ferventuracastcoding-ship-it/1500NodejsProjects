// Import Node's built-in HTTP module.
const http = require("http");

// Import Node's built-in URL module.
const { URL } = require("url");

// Import our robot data and functions.
const robots = require("./robots");

// Create the HTTP server.
const server = http.createServer((request, response) => {

    // Parse the requested URL.
    const url = new URL(
        request.url,
        `http://${request.headers.host}`
    );

    // Allow JSON responses.
    response.setHeader("Content-Type", "application/json");

    // Handle GET /robots.
    if (
        request.method === "GET" &&
        url.pathname === "/robots"
    ) {

        response.writeHead(200);

        response.end(
            JSON.stringify(robots.getAll())
        );

        return;
    }

    // Handle GET /robots/:id.
    if (
        request.method === "GET" &&
        url.pathname.startsWith("/robots/")
    ) {

        // Extract the ID from the URL.
        const id = Number(
            url.pathname.split("/")[2]
        );

        // Find the robot.
        const robot = robots.getById(id);

        // Robot not found.
        if (!robot) {

            response.writeHead(404);

            response.end(
                JSON.stringify({
                    error: "Robot not found"
                })
            );

            return;
        }

        // Return the robot.
        response.writeHead(200);

        response.end(
            JSON.stringify(robot)
        );

        return;
    }

    // Handle GET /status.
    if (
        request.method === "GET" &&
        url.pathname === "/status"
    ) {

        response.writeHead(200);

        response.end(
            JSON.stringify({
                server: "Online",
                robots: robots.getAll().length,
                timestamp: new Date().toISOString()
            })
        );

        return;
    }

    // Handle unknown routes.
    response.writeHead(404);

    response.end(
        JSON.stringify({
            error: "Route not found"
        })
    );
});

// Start the server.
server.listen(3000, () => {

    console.log("--------------------------------");
    console.log("NODE.JS ROBOT API");
    console.log("--------------------------------");

    console.log(
        "Server running at http://localhost:3000"
    );

    console.log(
        "GET  /robots"
    );

    console.log(
        "GET  /robots/1"
    );

    console.log(
        "GET  /status"
    );
});
