// Import Express.
const express = require("express");

// Import MongoDB client.
const { MongoClient, ObjectId } = require("mongodb");

// Import path utilities.
const path = require("path");

// Create the Express application.
const app = express();

// Define the server port.
const PORT = 3000;

// MongoDB connection string.
// Change this if you are using MongoDB Atlas.
const MONGO_URI = "mongodb://127.0.0.1:27017";

// Name of the database.
const DATABASE_NAME = "productCatalogDB";

// Create the MongoDB client.
const client = new MongoClient(MONGO_URI);

// Store the products collection here.
let productsCollection;

// Enable JSON request bodies.
app.use(express.json());

// Serve the public folder.
app.use(express.static(path.join(__dirname, "public")));

/*
--------------------------------------------------
CONNECT TO MONGODB
--------------------------------------------------
*/

async function connectDatabase() {
    try {
        // Connect to MongoDB.
        await client.connect();

        // Select the database.
        const database = client.db(DATABASE_NAME);

        // Select the products collection.
        productsCollection = database.collection("products");

        // Create an index for faster product searching.
        await productsCollection.createIndex({
            name: "text",
            description: "text",
            category: "text"
        });

        console.log("Connected to MongoDB.");

    } catch (error) {

        // Display connection errors.
        console.error("MongoDB connection error:", error);

        // Stop the application if MongoDB cannot connect.
        process.exit(1);
    }
}

/*
--------------------------------------------------
GET ALL PRODUCTS
--------------------------------------------------
*/

app.get("/api/products", async (req, res) => {

    try {

        // Read optional query parameters.
        const {
            search,
            category,
            minPrice,
            maxPrice,
            sort = "newest"
        } = req.query;

        // Create an empty MongoDB filter.
        const filter = {};

        // Search products.
        if (search) {

            filter.$text = {
                $search: search
            };
        }

        // Filter by category.
        if (category) {

            filter.category = category;
        }

        // Filter by minimum price.
        if (minPrice) {

            filter.price = {
                ...filter.price,
                $gte: Number(minPrice)
            };
        }

        // Filter by maximum price.
        if (maxPrice) {

            filter.price = {
                ...filter.price,
                $lte: Number(maxPrice)
            };
        }

        // Determine sorting.
        let sortOption = {};

        if (sort === "price-low") {

            sortOption = {
                price: 1
            };

        } else if (sort === "price-high") {

            sortOption = {
                price: -1
            };

        } else if (sort === "name") {

            sortOption = {
                name: 1
            };

        } else {

            sortOption = {
                createdAt: -1
            };
        }

        // Find products.
        const products = await productsCollection
            .find(filter)
            .sort(sortOption)
            .toArray();

        // Return products as JSON.
        res.json(products);

    } catch (error) {

        // Return server error.
        res.status(500).json({
            error: "Failed to retrieve products."
        });
    }
});

/*
--------------------------------------------------
GET ONE PRODUCT
--------------------------------------------------
*/

app.get("/api/products/:id", async (req, res) => {

    try {

        // Convert URL ID into MongoDB ObjectId.
        const productId = new ObjectId(req.params.id);

        // Find the product.
        const product = await productsCollection.findOne({
            _id: productId
        });

        // Check whether product exists.
        if (!product) {

            return res.status(404).json({
                error: "Product not found."
            });
        }

        // Return product.
        res.json(product);

    } catch (error) {

        // Handle invalid IDs.
        res.status(400).json({
            error: "Invalid product ID."
        });
    }
});

/*
--------------------------------------------------
CREATE PRODUCT
--------------------------------------------------
*/

app.post("/api/products", async (req, res) => {

    try {

        // Extract product information.
        const {
            name,
            description,
            category,
            price,
            stock,
            image
        } = req.body;

        // Validate required fields.
        if (!name || !category || price === undefined) {

            return res.status(400).json({
                error: "Name, category, and price are required."
            });
        }

        // Create a product object.
        const product = {

            name,

            description: description || "",

            category,

            price: Number(price),

            stock: Number(stock || 0),

            image: image || "",

            createdAt: new Date(),

            updatedAt: new Date()
        };

        // Insert product into MongoDB.
        const result = await productsCollection.insertOne(product);

        // Return the newly created product.
        res.status(201).json({
            message: "Product created successfully.",
            product: {
                _id: result.insertedId,
                ...product
            }
        });

    } catch (error) {

        // Return error.
        res.status(500).json({
            error: "Failed to create product."
        });
    }
});

/*
--------------------------------------------------
UPDATE PRODUCT
--------------------------------------------------
*/

app.put("/api/products/:id", async (req, res) => {

    try {

        // Convert ID to ObjectId.
        const productId = new ObjectId(req.params.id);

        // Extract update information.
        const {
            name,
            description,
            category,
            price,
            stock,
            image
        } = req.body;

        // Build update object.
        const updates = {
            updatedAt: new Date()
        };

        // Only update fields that were supplied.
        if (name !== undefined) {
            updates.name = name;
        }

        if (description !== undefined) {
            updates.description = description;
        }

        if (category !== undefined) {
            updates.category = category;
        }

        if (price !== undefined) {
            updates.price = Number(price);
        }

        if (stock !== undefined) {
            updates.stock = Number(stock);
        }

        if (image !== undefined) {
            updates.image = image;
        }

        // Update the product.
        const result = await productsCollection.updateOne(
            {
                _id: productId
            },
            {
                $set: updates
            }
        );

        // Check whether product exists.
        if (result.matchedCount === 0) {

            return res.status(404).json({
                error: "Product not found."
            });
        }

        // Return success.
        res.json({
            message: "Product updated successfully."
        });

    } catch (error) {

        // Handle invalid IDs.
        res.status(400).json({
            error: "Invalid product ID."
        });
    }
});

/*
--------------------------------------------------
DELETE PRODUCT
--------------------------------------------------
*/

app.delete("/api/products/:id", async (req, res) => {

    try {

        // Convert ID to ObjectId.
        const productId = new ObjectId(req.params.id);

        // Delete product.
        const result = await productsCollection.deleteOne({
            _id: productId
        });

        // Check whether product existed.
        if (result.deletedCount === 0) {

            return res.status(404).json({
                error: "Product not found."
            });
        }

        // Return success.
        res.json({
            message: "Product deleted successfully."
        });

    } catch (error) {

        // Handle invalid IDs.
        res.status(400).json({
            error: "Invalid product ID."
        });
    }
});

/*
--------------------------------------------------
PRODUCT STATISTICS
--------------------------------------------------
*/

app.get("/api/products/stats/summary", async (req, res) => {

    try {

        // Calculate catalog statistics.
        const stats = await productsCollection.aggregate([

            {
                $group: {

                    _id: null,

                    totalProducts: {
                        $sum: 1
                    },

                    totalInventory: {
                        $sum: "$stock"
                    },

                    averagePrice: {
                        $avg: "$price"
                    }
                }
            }

        ]).toArray();

        // Return statistics.
        res.json(stats[0] || {
            totalProducts: 0,
            totalInventory: 0,
            averagePrice: 0
        });

    } catch (error) {

        // Return error.
        res.status(500).json({
            error: "Failed to calculate statistics."
        });
    }
});

/*
--------------------------------------------------
START SERVER to practice node.js syntax
--------------------------------------------------
*/

async function startServer() {

    // Connect to MongoDB first.
    await connectDatabase();

    // Start Express server.
    app.listen(PORT, () => {

        console.log(`Product Catalog running at:`);
        console.log(`http://localhost:${PORT}`);

    });
}

// Start application.
startServer();
