// Import Express.
const express = require("express");

// Create an Express router.
const router = express.Router();

// Import Pokémon data.
const pokemon = require("../data/pokemon");

/*
========================================
GET /api/pokemon
GET ALL POKÉMON
Mustbe well versed in routes in node.js
========================================
*/

router.get("/", (req, res) => {

    // Copy the Pokémon array.
    let results = [...pokemon];

    // Get search parameter.
    const search = req.query.search;

    // Get type parameter.
    const type = req.query.type;

    // Search Pokémon by name.
    if (search) {

        results = results.filter(p =>

            p.name
                .toLowerCase()
                .includes(search.toLowerCase())

        );
    }

    // Filter Pokémon by type.
    if (type) {

        results = results.filter(p =>

            p.type.toLowerCase() ===
            type.toLowerCase()

        );
    }

    // Return results.
    res.json({
        count: results.length,
        pokemon: results
    });
});

/*
========================================
GET /api/pokemon/:id
GET ONE POKÉMON
========================================
*/

router.get("/:id", (req, res) => {

    // Convert route parameter into a number.
    const id = Number(req.params.id);

    // Find Pokémon.
    const foundPokemon =
        pokemon.find(p => p.id === id);

    // Return 404 if not found.
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
GET /api/pokemon/type/:type
GET POKÉMON BY TYPE
========================================
*/

router.get("/type/:type", (req, res) => {

    // Get requested type.
    const requestedType =
        req.params.type.toLowerCase();

    // Filter Pokémon.
    const results =
        pokemon.filter(p =>
            p.type.toLowerCase() === requestedType
        );

    // Return results.
    res.json({
        type: req.params.type,
        count: results.length,
        pokemon: results
    });
});

/*
========================================
GET /api/pokemon/search/:name
SEARCH BY NAME
========================================
*/

router.get("/search/:name", (req, res) => {

    // Get requested name.
    const name =
        req.params.name.toLowerCase();

    // Search Pokémon.
    const results =
        pokemon.filter(p =>
            p.name.toLowerCase().includes(name)
        );

    // Return results.
    res.json({
        search: req.params.name,
        count: results.length,
        pokemon: results
    });
});

/*
========================================
GET /api/pokemon/stats/strongest
STRONGEST POKÉMON
========================================
*/

router.get("/stats/strongest", (req, res) => {

    // Sort Pokémon by attack.
    const strongest =
        [...pokemon].sort(
            (a, b) => b.attack - a.attack
        );

    // Return strongest Pokémon.
    res.json(strongest);
});

/*
========================================
GET /api/pokemon/random
RANDOM POKÉMON
========================================
*/

router.get("/random", (req, res) => {

    // Generate random index.
    const randomIndex =
        Math.floor(
            Math.random() * pokemon.length
        );

    // Get random Pokémon.
    const randomPokemon =
        pokemon[randomIndex];

    // Return random Pokémon.
    res.json(randomPokemon);
});

/*
========================================
GET /api/pokemon/count
POKÉMON COUNT
========================================
*/

router.get("/count", (req, res) => {

    // Return total number.
    res.json({
        count: pokemon.length
    });
});

// Export router.
module.exports = router;
