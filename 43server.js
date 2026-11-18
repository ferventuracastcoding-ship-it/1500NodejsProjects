http://localhost:3000/api/pokemon
http://localhost:3000/api/pokemon/25
http://localhost:3000/api/pokemon/type/fire
http://localhost:3000/api/pokemon/search/char
http://localhost:3000/api/pokemon/random
http://localhost:3000/api/pokemon/stats/strongest
http://localhost:3000/api/pokemon/count

// Import Express.
const express = require("express");

// Import Pokémon router.
const pokemonRoutes =
    require("./routes/pokemonRoutes");

// Create Express application.
const app = express();

// Define server port.
const PORT = 3000;

// Enable JSON requests.
app.use(express.json());

// Mount Pokémon routes.
app.use(
    "/api/pokemon",
    pokemonRoutes
);

// Home route.
app.get("/", (req, res) => {

    res.json({
        message: "Pokémon Node.js API",
        routes: {
            all: "/api/pokemon",
            pikachu: "/api/pokemon/25",
            fire: "/api/pokemon/type/fire",
            search: "/api/pokemon/search/char",
            random: "/api/pokemon/random",
            strongest: "/api/pokemon/stats/strongest",
            count: "/api/pokemon/count"
        }
    });
});

// Start server.
app.listen(PORT, () => {

    console.log(
        `Pokémon API running on http://localhost:${PORT}`
    );

});
