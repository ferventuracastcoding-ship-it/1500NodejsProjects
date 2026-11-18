// Import Express.
const express = require("express");

// Create the Express application.
const app = express();

// Define the server port.
const PORT = 3000;

// Allow Express to read JSON.
app.use(express.json());

// Serve the frontend.
app.use(express.static("public"));

// Pokémon database.
let pokemon = [
    {
        id: 1,
        name: "Bulbasaur",
        type: "Grass",
        hp: 45,
        attack: 49,
        defense: 49
    },

    {
        id: 4,
        name: "Charmander",
        type: "Fire",
        hp: 39,
        attack: 52,
        defense: 43
    },

    {
        id: 7,
        name: "Squirtle",
        type: "Water",
        hp: 44,
        attack: 48,
        defense: 65
    },

    {
        id: 25,
        name: "Pikachu",
        type: "Electric",
        hp: 35,
        attack: 55,
        defense: 40
    },

    {
        id: 143,
        name: "Snorlax",
        type: "Normal",
        hp: 160,
        attack: 110,
        defense: 65
    },

    {
        id: 150,
        name: "Mewtwo",
        type: "Psychic",
        hp: 106,
        attack: 110,
        defense: 90
    }
];

/*
========================================
GET ALL POKÉMON
Must pracice this syntax to get way
betterat Javascript.
========================================
*/

app.get("/api/pokemon", (req, res) => {

    // Start with every Pokémon.
    let results = pokemon;

    // Search by name.
    if (req.query.search) {

        const search =
            req.query.search.toLowerCase();

        results = results.filter(p =>
            p.name.toLowerCase().includes(search)
        );
    }

    // Filter by type.
    if (req.query.type) {

        results = results.filter(p =>
            p.type.toLowerCase() ===
            req.query.type.toLowerCase()
        );
    }

    // Return Pokémon.
    res.json(results);
});

/*
========================================
GET ONE POKÉMON
========================================
*/

app.get("/api/pokemon/:id", (req, res) => {

    // Convert URL ID to a number.
    const id = Number(req.params.id);

    // Find Pokémon.
    const foundPokemon =
        pokemon.find(p => p.id === id);

    // Check if Pokémon exists.
    if (!foundPokemon) {

        return res.status(404).json({
            error: "Pokémon not found."
        });
    }

    // Return Pokémon.
    res.json(foundPokemon);
});

/*
========================================
CREATE POKÉMON
========================================
*/

app.post("/api/pokemon", (req, res) => {

    // Get information from request.
    const {
        name,
        type,
        hp,
        attack,
        defense
    } = req.body;

    // Validate required information.
    if (!name || !type) {

        return res.status(400).json({
            error: "Name and type are required."
        });
    }

    // Generate new ID.
    const newId =
        pokemon.length > 0
            ? Math.max(...pokemon.map(p => p.id)) + 1
            : 1;

    // Create Pokémon.
    const newPokemon = {

        id: newId,

        name,

        type,

        hp: Number(hp || 1),

        attack: Number(attack || 1),

        defense: Number(defense || 1)
    };

    // Add Pokémon.
    pokemon.push(newPokemon);

    // Return created Pokémon.
    res.status(201).json(newPokemon);
});

/*
========================================
UPDATE POKÉMON
========================================
*/

app.put("/api/pokemon/:id", (req, res) => {

    // Convert ID.
    const id = Number(req.params.id);

    // Find Pokémon index.
    const index =
        pokemon.findIndex(p => p.id === id);

    // Check if found.
    if (index === -1) {

        return res.status(404).json({
            error: "Pokémon not found."
        });
    }

    // Update Pokémon.
    pokemon[index] = {

        ...pokemon[index],

        ...req.body,

        id: pokemon[index].id
    };

    // Return updated Pokémon.
    res.json(pokemon[index]);
});

/*
========================================
DELETE POKÉMON
========================================
*/

app.delete("/api/pokemon/:id", (req, res) => {

    // Convert ID.
    const id = Number(req.params.id);

    // Find index.
    const index =
        pokemon.findIndex(p => p.id === id);

    // Check if found.
    if (index === -1) {

        return res.status(404).json({
            error: "Pokémon not found."
        });
    }

    // Remove Pokémon.
    const deleted =
        pokemon.splice(index, 1);

    // Return deleted Pokémon.
    res.json({
        message: "Pokémon deleted.",
        pokemon: deleted[0]
    });
});

/*
========================================
RANDOM POKÉMON
========================================
*/

app.get("/api/random", (req, res) => {

    // Generate random index.
    const index =
        Math.floor(Math.random() * pokemon.length);

    // Return random Pokémon.
    res.json(pokemon[index]);
});

/*
========================================
POKÉMON STATS
========================================
*/

app.get("/api/stats", (req, res) => {

    // Calculate total Pokémon.
    const totalPokemon =
        pokemon.length;

    // Calculate average HP.
    const averageHP =
        pokemon.reduce(
            (sum, p) => sum + p.hp,
            0
        ) / totalPokemon;

    // Calculate average attack.
    const averageAttack =
        pokemon.reduce(
            (sum, p) => sum + p.attack,
            0
        ) / totalPokemon;

    // Calculate average defense.
    const averageDefense =
        pokemon.reduce(
            (sum, p) => sum + p.defense,
            0
        ) / totalPokemon;

    // Return statistics.
    res.json({

        totalPokemon,

        averageHP:
            Number(averageHP.toFixed(2)),

        averageAttack:
            Number(averageAttack.toFixed(2)),

        averageDefense:
            Number(averageDefense.toFixed(2))
    });
});

/*
========================================
BATTLE SIMULATOR
========================================
*/

app.get("/api/battle/:id1/:id2", (req, res) => {

    // Get first Pokémon.
    const pokemon1 =
        pokemon.find(
            p => p.id === Number(req.params.id1)
        );

    // Get second Pokémon.
    const pokemon2 =
        pokemon.find(
            p => p.id === Number(req.params.id2)
        );

    // Validate Pokémon.
    if (!pokemon1 || !pokemon2) {

        return res.status(404).json({
            error: "Both Pokémon must exist."
        });
    }

    // Calculate battle power.
    const power1 =
        pokemon1.hp +
        pokemon1.attack +
        pokemon1.defense;

    const power2 =
        pokemon2.hp +
        pokemon2.attack +
        pokemon2.defense;

    // Determine winner.
    let winner;

    if (power1 > power2) {

        winner = pokemon1;

    } else if (power2 > power1) {

        winner = pokemon2;

    } else {

        winner = null;
    }

    // Return battle result.
    res.json({

        pokemon1,

        pokemon2,

        power1,

        power2,

        winner:
            winner
                ? winner.name
                : "Draw"
    });
});

/*
========================================
START SERVER
========================================
*/

app.listen(PORT, () => {

    console.log(
        `Pokémon API running at http://localhost:${PORT}`
    );

});
