// Import the Node.js HTTP module.
const http = require("http");

// Import the URL class.
const { URL } = require("url");

// Import authentication functions.
const auth = require("./auth");

// Import user database functions.
const users = require("./users");

// Create the HTTP server.
const server = http.createServer(async (request, response) => {

    // Parse the requested URL.
    const url = new URL(
        request.url,
        `http://${request.headers.host}`
    );

    // Set JSON response headers.
    response.setHeader(
        "Content-Type",
        "application/json"
    );

    // Allow requests from other origins.
    response.setHeader(
        "Access-Control-Allow-Origin",
        "*"
    );

    // Handle OPTIONS requests.
    if (request.method === "OPTIONS") {

        response.writeHead(204);
        response.end();

        return;
    }

    // POST /register
    if (
        request.method === "POST" &&
        url.pathname === "/register"
    ) {

        try {

            // Read the request body.
            const body = await readBody(request);

            // Convert JSON into an object.
            const data = JSON.parse(body);

            // Validate the submitted information.
            if (!data.username || !data.password) {

                response.writeHead(400);

                response.end(
                    JSON.stringify({
                        error:
                            "Username and password are required."
                    })
                );

                return;
            }

            // Check whether the username already exists.
            const existingUser =
                users.findByUsername(data.username);

            if (existingUser) {

                response.writeHead(409);

                response.end(
                    JSON.stringify({
                        error:
                            "Username already exists."
                    })
                );

                return;
            }

            // Hash the password.
            const passwordHash =
                auth.hashPassword(data.password);

            // Create the new user.
            const user =
                users.create(
                    data.username,
                    passwordHash
                );

            // Return the newly created user.
            response.writeHead(201);

            response.end(
                JSON.stringify({
                    message:
                        "Registration successful.",
                    user
                })
            );

        } catch (error) {

            response.writeHead(400);

            response.end(
                JSON.stringify({
                    error: error.message
                })
            );
        }

        return;
    }

    // POST /login
    if (
        request.method === "POST" &&
        url.pathname === "/login"
    ) {

        try {

            // Read the request body.
            const body = await readBody(request);

            // Parse JSON.
            const data = JSON.parse(body);

            // Find the user.
            const user =
                users.findByUsername(data.username);

            // Reject an unknown user.
            if (!user) {

                response.writeHead(401);

                response.end(
                    JSON.stringify({
                        error:
                            "Invalid username or password."
                    })
                );

                return;
            }

            // Compare the supplied password
            // with the stored password hash.
            const validPassword =
                auth.verifyPassword(
                    data.password,
                    user.passwordHash
                );

            // Reject an invalid password.
            if (!validPassword) {

                response.writeHead(401);

                response.end(
                    JSON.stringify({
                        error:
                            "Invalid username or password."
                    })
                );

                return;
            }

            // Create an authentication token.
            const token =
                auth.createToken(user);

            // Return the token.
            response.writeHead(200);

            response.end(
                JSON.stringify({
                    message: "Login successful.",
                    token: token,
                    user: {
                        id: user.id,
                        username: user.username
                    }
                })
            );

        } catch (error) {

            response.writeHead(400);

            response.end(
                JSON.stringify({
                    error: error.message
                })
            );
        }

        return;
    }

    // GET /profile
    if (
        request.method === "GET" &&
        url.pathname === "/profile"
    ) {

        // Read the Authorization header.
        const authorization =
            request.headers.authorization;

        // Verify the authentication token.
        const user =
            auth.authenticate(authorization);

        // Reject unauthenticated requests.
        if (!user) {

            response.writeHead(401);

            response.end(
                JSON.stringify({
                    error:
                        "Authentication required."
                })
            );

            return;
        }

        // Return the protected profile.
        response.writeHead(200);

        response.end(
            JSON.stringify({
                message:
                    "Protected profile accessed.",
                user: {
                    id: user.id,
                    username: user.username
                }
            })
        );

        return;
    }

    // GET /users
    if (
        request.method === "GET" &&
        url.pathname === "/users"
    ) {

        // Return public user information only.
        const publicUsers =
            users.getAll().map(user => ({
                id: user.id,
                username: user.username
            }));

        response.writeHead(200);

        response.end(
            JSON.stringify(publicUsers)
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

// Read an incoming HTTP request body.
function readBody(request) {

    return new Promise((resolve, reject) => {

        // Store incoming chunks.
        let body = "";

        // Receive data.
        request.on("data", chunk => {

            body += chunk;
        });

        // Finish receiving data.
        request.on("end", () => {

            resolve(body);
        });

        // Handle errors.
        request.on("error", error => {

            reject(error);
        });
    });
}

// Start the server.
server.listen(3000, () => {

    console.log("==============================");
    console.log(" NODE.JS AUTHENTICATION API");
    console.log("==============================");

    console.log(
        "Server: http://localhost:3000"
    );

    console.log("");
    console.log("POST /register");
    console.log("POST /login");
    console.log("GET  /profile");
    console.log("GET  /users");
});
