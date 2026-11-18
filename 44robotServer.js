// Load environment variables.
require("dotenv").config();

// Import Express.
const express = require("express");

// Import cryptographic utilities.
const crypto = require("crypto");

// Create Express application.
const app = express();

// Define port.
const PORT = process.env.PORT || 3000;

// Enable JSON request bodies.
app.use(express.json());

// Serve frontend files.
app.use(express.static("public"));

// --------------------------------------------------
// ROBOT MISSION DATABASE
// --------------------------------------------------

const robots = [
    {
        id: "ROBOT-001",
        name: "Atlas",
        type: "Exploration",
        status: "READY",
        battery: 94,
        mission: "Library Intelligence Mission"
    },

    {
        id: "ROBOT-002",
        name: "Nova",
        type: "Communication",
        status: "READY",
        battery: 87,
        mission: "Music Communications Mission"
    },

    {
        id: "ROBOT-003",
        name: "Titan",
        type: "Logistics",
        status: "READY",
        battery: 76,
        mission: "Cloud Storage Mission"
    },

    {
        id: "ROBOT-004",
        name: "Orion",
        type: "AI",
        status: "READY",
        battery: 91,
        mission: "Artificial Intelligence Mission"
    }
];

// --------------------------------------------------
// OAUTH STATE STORAGE
// --------------------------------------------------

// Stores temporary OAuth state values.
//
// In production, use a database or secure session
// storage instead of an in-memory Map.
const oauthStates = new Map();

// Stores tokens for this demonstration.
//
// In production, encrypt tokens and store them
// in a secure database/session system.
const tokens = {
    discord: null,
    dropbox: null,
    spotify: null
};

// --------------------------------------------------
// HELPER FUNCTIONS
// --------------------------------------------------

function generateState() {

    return crypto
        .randomBytes(32)
        .toString("hex");
}

function saveOAuthState(provider, state) {

    oauthStates.set(
        state,
        {
            provider,
            createdAt: Date.now()
        }
    );
}

function consumeOAuthState(state, provider) {

    const record =
        oauthStates.get(state);

    if (!record) {
        return false;
    }

    oauthStates.delete(state);

    const fiveMinutes =
        5 * 60 * 1000;

    if (
        Date.now() - record.createdAt >
        fiveMinutes
    ) {
        return false;
    }

    return record.provider === provider;
}

function formEncode(data) {

    return new URLSearchParams(data)
        .toString();
}

// --------------------------------------------------
// HOME
// --------------------------------------------------

app.get("/", (req, res) => {

    res.sendFile(
        __dirname + "/public/index.html"
    );
});

// --------------------------------------------------
// ROBOT ROUTES
// --------------------------------------------------

app.get("/api/robots", (req, res) => {

    res.json({
        mission: "ROBOT-ALPHA",
        count: robots.length,
        robots
    });
});

app.get("/api/robots/:id", (req, res) => {

    const robot =
        robots.find(
            robot =>
                robot.id === req.params.id
        );

    if (!robot) {

        return res.status(404).json({
            error: "Robot not found."
        });
    }

    res.json(robot);
});

// --------------------------------------------------
// MISSION STATUS
// --------------------------------------------------

app.get("/api/mission", (req, res) => {

    res.json({
        missionId: "MISSION-001",
        missionName:
            "Robot Multi-API Authentication Mission",

        objective:
            "Authenticate and communicate with five external APIs.",

        robotCount: robots.length,

        systems: {
            books: Boolean(
                process.env.GOOGLE_BOOKS_API_KEY
            ),

            openai: Boolean(
                process.env.OPENAI_API_KEY
            ),

            discord: Boolean(
                tokens.discord
            ),

            dropbox: Boolean(
                tokens.dropbox
            ),

            spotify: Boolean(
                tokens.spotify
            )
        }
    });
});

// ==================================================
// GOOGLE BOOKS API
// ==================================================

app.get("/api/books/search", async (req, res) => {

    try {

        const query =
            req.query.q || "robotics";

        const url =
            new URL(
                "https://www.googleapis.com/books/v1/volumes"
            );

        url.searchParams.set(
            "q",
            query
        );

        url.searchParams.set(
            "maxResults",
            "10"
        );

        if (
            process.env.GOOGLE_BOOKS_API_KEY
        ) {

            url.searchParams.set(
                "key",
                process.env.GOOGLE_BOOKS_API_KEY
            );
        }

        const response =
            await fetch(url);

        const data =
            await response.json();

        if (!response.ok) {

            return res.status(
                response.status
            ).json(data);
        }

        res.json({
            robot: "ROBOT-001",
            mission:
                "Library Intelligence Mission",
            query,
            books: data.items || []
        });

    } catch (error) {

        res.status(500).json({
            error:
                "Google Books request failed."
        });
    }
});

// ==================================================
// OPENAI API
// ==================================================

app.post("/api/openai/mission", async (req, res) => {

    try {

        if (
            !process.env.OPENAI_API_KEY
        ) {

            return res.status(503).json({
                error:
                    "OPENAI_API_KEY is not configured."
            });
        }

        const prompt =
            req.body.prompt ||
            "Create a short mission briefing for a robot exploring a digital library.";

        const response =
            await fetch(
                "https://api.openai.com/v1/responses",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${process.env.OPENAI_API_KEY}`
                    },

                    body: JSON.stringify({
                        model:
                            process.env.OPENAI_MODEL ||
                            "gpt-6.2-astra",

                        input: prompt
                    })
                }
            );

        const data =
            await response.json();

        if (!response.ok) {

            return res.status(
                response.status
            ).json(data);
        }

        res.json({
            robot: "ROBOT-004",
            mission:
                "Artificial Intelligence Mission",

            response:
                data.output_text || data
        });

    } catch (error) {

        res.status(500).json({
            error:
                "OpenAI request failed."
        });
    }
});

// ==================================================
// DISCORD OAUTH
// ==================================================

app.get("/auth/discord", (req, res) => {

    const state =
        generateState();

    saveOAuthState(
        "discord",
        state
    );

    const params =
        new URLSearchParams({

            client_id:
                process.env.DISCORD_CLIENT_ID,

            response_type:
                "code",

            redirect_uri:
                process.env.DISCORD_REDIRECT_URI,

            scope:
                "identify email",

            state
        });

    const authorizationURL =
        `https://discord.com/oauth2/authorize?${params}`;

    res.redirect(
        authorizationURL
    );
});

app.get(
    "/auth/discord/callback",
    async (req, res) => {

        try {

            const {
                code,
                state
            } = req.query;

            if (
                !consumeOAuthState(
                    state,
                    "discord"
                )
            ) {

                return res.status(400).send(
                    "Invalid Discord OAuth state."
                );
            }

            const response =
                await fetch(
                    "https://discord.com/api/oauth2/token",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/x-www-form-urlencoded"
                        },

                        body: formEncode({

                            client_id:
                                process.env.DISCORD_CLIENT_ID,

                            client_secret:
                                process.env.DISCORD_CLIENT_SECRET,

                            grant_type:
                                "authorization_code",

                            code,

                            redirect_uri:
                                process.env.DISCORD_REDIRECT_URI
                        })
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {

                return res.status(
                    response.status
                ).json(data);
            }

            tokens.discord =
                data;

            res.send(
                "<h1>Discord authentication successful.</h1><p>Robot-002 is now connected.</p><a href='/'>Return to Command Center</a>"
            );

        } catch (error) {

            res.status(500).send(
                "Discord authentication failed."
            );
        }
    }
);

// ==================================================
// DROPBOX OAUTH
// ==================================================

app.get("/auth/dropbox", (req, res) => {

    const state =
        generateState();

    saveOAuthState(
        "dropbox",
        state
    );

    const params =
        new URLSearchParams({

            client_id:
                process.env.DROPBOX_CLIENT_ID,

            response_type:
                "code",

            redirect_uri:
                process.env.DROPBOX_REDIRECT_URI,

            token_access_type:
                "offline",

            state
        });

    const authorizationURL =
        `https://www.dropbox.com/oauth2/authorize?${params}`;

    res.redirect(
        authorizationURL
    );
});

app.get(
    "/auth/dropbox/callback",
    async (req, res) => {

        try {

            const {
                code,
                state
            } = req.query;

            if (
                !consumeOAuthState(
                    state,
                    "dropbox"
                )
            ) {

                return res.status(400).send(
                    "Invalid Dropbox OAuth state."
                );
            }

            const response =
                await fetch(
                    "https://api.dropboxapi.com/oauth2/token",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/x-www-form-urlencoded"
                        },

                        body: formEncode({

                            code,

                            grant_type:
                                "authorization_code",

                            client_id:
                                process.env.DROPBOX_CLIENT_ID,

                            client_secret:
                                process.env.DROPBOX_CLIENT_SECRET,

                            redirect_uri:
                                process.env.DROPBOX_REDIRECT_URI
                        })
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {

                return res.status(
                    response.status
                ).json(data);
            }

            tokens.dropbox =
                data;

            res.send(
                "<h1>Dropbox authentication successful.</h1><p>Robot-003 is now connected.</p><a href='/'>Return to Command Center</a>"
            );

        } catch (error) {

            res.status(500).send(
                "Dropbox authentication failed."
            );
        }
    }
);

// ==================================================
// SPOTIFY OAUTH
// ==================================================

app.get("/auth/spotify", (req, res) => {

    const state =
        generateState();

    saveOAuthState(
        "spotify",
        state
    );

    const params =
        new URLSearchParams({

            client_id:
                process.env.SPOTIFY_CLIENT_ID,

            response_type:
                "code",

            redirect_uri:
                process.env.SPOTIFY_REDIRECT_URI,

            scope:
                "user-read-private user-read-email",

            state
        });

    const authorizationURL =
        `https://accounts.spotify.com/authorize?${params}`;

    res.redirect(
        authorizationURL
    );
});

app.get(
    "/auth/spotify/callback",
    async (req, res) => {

        try {

            const {
                code,
                state
            } = req.query;

            if (
                !consumeOAuthState(
                    state,
                    "spotify"
                )
            ) {

                return res.status(400).send(
                    "Invalid Spotify OAuth state."
                );
            }

            const basicAuth =
                Buffer
                    .from(
                        `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
                    )
                    .toString("base64");

            const response =
                await fetch(
                    "https://accounts.spotify.com/api/token",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/x-www-form-urlencoded",

                            "Authorization":
                                `Basic ${basicAuth}`
                        },

                        body: formEncode({

                            grant_type:
                                "authorization_code",

                            code,

                            redirect_uri:
                                process.env.SPOTIFY_REDIRECT_URI
                        })
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {

                return res.status(
                    response.status
                ).json(data);
            }

            tokens.spotify =
                data;

            res.send(
                "<h1>Spotify authentication successful.</h1><p>Robot-002 is now connected.</p><a href='/'>Return to Command Center</a>"
            );

        } catch (error) {

            res.status(500).send(
                "Spotify authentication failed."
            );
        }
    }
);

// ==================================================
// SPOTIFY USER PROFILE
// ==================================================

app.get(
    "/api/spotify/profile",
    async (req, res) => {

        try {

            if (
                !tokens.spotify
            ) {

                return res.status(401).json({
                    error:
                        "Spotify is not authenticated."
                });
            }

            const response =
                await fetch(
                    "https://api.spotify.com/v1/me",
                    {
                        headers: {
                            Authorization:
                                `Bearer ${tokens.spotify.access_token}`
                        }
                    }
                );

            const data =
                await response.json();

            res.status(
                response.status
            ).json(data);

        } catch (error) {

            res.status(500).json({
                error:
                    "Spotify profile request failed."
            });
        }
    }
);

// ==================================================
// DISCORD USER PROFILE
// ==================================================

app.get(
    "/api/discord/profile",
    async (req, res) => {

        try {

            if (
                !tokens.discord
            ) {

                return res.status(401).json({
                    error:
                        "Discord is not authenticated."
                });
            }

            const response =
                await fetch(
                    "https://discord.com/api/users/@me",
                    {
                        headers: {
                            Authorization:
                                `Bearer ${tokens.discord.access_token}`
                        }
                    }
                );

            const data =
                await response.json();

            res.status(
                response.status
            ).json(data);

        } catch (error) {

            res.status(500).json({
                error:
                    "Discord profile request failed."
            });
        }
    }
);

// ==================================================
// DROPBOX ACCOUNT
// ==================================================

app.get(
    "/api/dropbox/account",
    async (req, res) => {

        try {

            if (
                !tokens.dropbox
            ) {

                return res.status(401).json({
                    error:
                        "Dropbox is not authenticated."
                });
            }

            const response =
                await fetch(
                    "https://api.dropboxapi.com/2/users/get_current_account",
                    {
                        method: "POST",

                        headers: {
                            Authorization:
                                `Bearer ${tokens.dropbox.access_token}`,

                            "Content-Type":
                                "application/json"
                        },

                        body: "{}"
                    }
                );

            const data =
                await response.json();

            res.status(
                response.status
            ).json(data);

        } catch (error) {

            res.status(500).json({
                error:
                    "Dropbox account request failed."
            });
        }
    }
);

// ==================================================
// START SERVER. Must finish typing code to be
// proficient at the programming language syntax.
// ==================================================

app.listen(
    PORT,
    () => {

        console.log("");
        console.log(
            "🤖 ROBOT MISSION COMMAND CENTER"
        );

        console.log(
            `http://127.0.0.1:${PORT}`
        );

        console.log("");

    }
);
