PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/ecommerceDB
JWT_SECRET=replace_this_with_a_long_random_secret

models/User.js

const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    }
});

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["customer", "admin"],
        default: "customer"
    },
    cart: [cartItemSchema]
}, {
    timestamps: true
});

module.exports = mongoose.model("User", userSchema);

const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: String,
    category: String,
    price: {
        type: Number,
        required: true,
        min: 0
    },
    stock: {
        type: Number,
        default: 0,
        min: 0
    },
    image: String
}, {
    timestamps: true
});

module.exports = mongoose.model("Product", productSchema);

const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product"
        },
        name: String,
        price: Number,
        quantity: Number
    }],
    total: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
        default: "pending"
    },
    paymentStatus: {
        type: String,
        enum: ["unpaid", "paid", "failed"],
        default: "unpaid"
    },
    paymentReference: String
}, {
    timestamps: true
});

module.exports = mongoose.model("Order", orderSchema);

//===========================================================
routes/userRoutes.js
//===========================================================
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const { protect } = require("../middleware/auth");

const router = express.Router();

function createToken(user) {
    return jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    );
}

// REGISTER
router.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password || password.length < 8) {
            return res.status(400).json({
                error: "Provide a name, email, and password of at least 8 characters."
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return res.status(409).json({
                error: "Email is already registered."
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await User.create({
            name,
            email: normalizedEmail,
            password: hashedPassword
        });

        res.status(201).json({
            message: "Account created.",
            token: createToken(user),
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// LOGIN
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({
            email: String(email || "").trim().toLowerCase()
        });

        if (!user || !await bcrypt.compare(password || "", user.password)) {
            return res.status(401).json({
                error: "Incorrect email or password."
            });
        }

        res.json({
            message: "Login successful.",
            token: createToken(user),
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// CURRENT CUSTOMER
router.get("/me", protect, (req, res) => {
    res.json({
        user: req.user
    });
});

module.exports = router;

//====================================================
.5 middleware/auth.js
//====================================================
const jwt = require("jsonwebtoken");
const User = require("../models/User");

async function protect(req, res, next) {
    try {
        const header = req.headers.authorization;

        if (!header || !header.startsWith("Bearer ")) {
            return res.status(401).json({
                error: "Authentication required."
            });
        }

        const token = header.split(" ")[1];

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        const user = await User.findById(decoded.id)
            .select("-password");

        if (!user) {
            return res.status(401).json({
                error: "User no longer exists."
            });
        }

        req.user = user;
        next();

    } catch (error) {
        return res.status(401).json({
            error: "Invalid or expired token."
        });
    }
}

function adminOnly(req, res, next) {
    if (req.user && req.user.role === "admin") {
        return next();
    }

    return res.status(403).json({
        error: "Administrator access required."
    });
}

module.exports = { protect, adminOnly };

//====================================================
.6 USER REGISTRATION AND LOGIN
//====================================================
const jwt = require("jsonwebtoken");
const User = require("../models/User");

async function protect(req, res, next) {
    try {
        const header = req.headers.authorization;

        if (!header || !header.startsWith("Bearer ")) {
            return res.status(401).json({
                error: "Authentication required."
            });
        }

        const token = header.split(" ")[1];

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        const user = await User.findById(decoded.id)
            .select("-password");

        if (!user) {
            return res.status(401).json({
                error: "User no longer exists."
            });
        }

        req.user = user;
        next();

    } catch (error) {
        return res.status(401).json({
            error: "Invalid or expired token."
        });
    }
}

function adminOnly(req, res, next) {
    if (req.user && req.user.role === "admin") {
        return next();
    }

    return res.status(403).json({
        error: "Administrator access required."
    });
}

module.exports = { protect, adminOnly };

//====================================================
.6 ORDER API
//====================================================
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const { protect } = require("../middleware/auth");

const router = express.Router();

function createToken(user) {
    return jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    );
}

// REGISTER
router.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password || password.length < 8) {
            return res.status(400).json({
                error: "Provide a name, email, and password of at least 8 characters."
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return res.status(409).json({
                error: "Email is already registered."
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await User.create({
            name,
            email: normalizedEmail,
            password: hashedPassword
        });

        res.status(201).json({
            message: "Account created.",
            token: createToken(user),
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// LOGIN
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({
            email: String(email || "").trim().toLowerCase()
        });

        if (!user || !await bcrypt.compare(password || "", user.password)) {
            return res.status(401).json({
                error: "Incorrect email or password."
            });
        }

        res.json({
            message: "Login successful.",
            token: createToken(user),
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// CURRENT CUSTOMER
router.get("/me", protect, (req, res) => {
    res.json({
        user: req.user
    });
});

module.exports = router;
//====================================================
.7 ORDER API
//====================================================
const express = require("express");
const Product = require("../models/Product");
const { protect, adminOnly } = require("../middleware/auth");

const router = express.Router();

// GET ALL PRODUCTS
router.get("/", async (req, res) => {
    try {
        const products = await Product.find().sort({
            createdAt: -1
        });

        res.json({
            count: products.length,
            products
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET ONE PRODUCT
router.get("/:id", async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                error: "Product not found."
            });
        }

        res.json(product);

    } catch (error) {
        res.status(400).json({ error: "Invalid product ID." });
    }
});

// ADD PRODUCT - ADMIN ONLY
router.post("/", protect, adminOnly, async (req, res) => {
    try {
        const { name, description, category, price, stock, image } = req.body;

        if (!name || !Number.isFinite(price) || price < 0) {
            return res.status(400).json({
                error: "A product name and valid price are required."
            });
        }

        const product = await Product.create({
            name,
            description,
            category,
            price,
            stock: stock ?? 0,
            image
        });

        res.status(201).json({
            message: "Product created.",
            product
        });

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// DELETE PRODUCT - ADMIN ONLY
router.delete("/:id", protect, adminOnly, async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            return res.status(404).json({
                error: "Product not found."
            });
        }

        res.json({
            message: "Product deleted.",
            product
        });

    } catch (error) {
        res.status(400).json({ error: "Invalid product ID." });
    }
});

module.exports = router;
//====================================================
.8 ORDER API
//====================================================
const express = require("express");

const User = require("../models/User");
const Product = require("../models/Product");
const { protect } = require("../middleware/auth");

const router = express.Router();

// ALL CART ROUTES REQUIRE LOGIN
router.use(protect);

// VIEW CART
router.get("/", async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate("cart.product");

        let total = 0;

        const items = user.cart
            .filter(item => item.product)
            .map(item => {
                const subtotal =
                    item.product.price * item.quantity;

                total += subtotal;

                return {
                    product: item.product,
                    quantity: item.quantity,
                    subtotal
                };
            });

        res.json({
            items,
            total: Number(total.toFixed(2))
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ADD TO CART
router.post("/add", async (req, res) => {
    try {
        const { productId, quantity = 1 } = req.body;

        if (!Number.isInteger(quantity) || quantity < 1) {
            return res.status(400).json({
                error: "Quantity must be a positive integer."
            });
        }

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                error: "Product not found."
            });
        }

        const user = await User.findById(req.user._id);

        const existingItem = user.cart.find(
            item => item.product.toString() === productId
        );

        const newQuantity =
            (existingItem ? existingItem.quantity : 0) + quantity;

        if (newQuantity > product.stock) {
            return res.status(400).json({
                error: "Not enough inventory available."
            });
        }

        if (existingItem) {
            existingItem.quantity = newQuantity;
        } else {
            user.cart.push({
                product: productId,
                quantity
            });
        }

        await user.save();

        res.json({
            message: "Product added to cart.",
            cart: user.cart
        });

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// UPDATE CART QUANTITY
router.patch("/update/:productId", async (req, res) => {
    try {
        const quantity = req.body.quantity;

        if (!Number.isInteger(quantity) || quantity < 1) {
            return res.status(400).json({
                error: "Quantity must be a positive integer."
            });
        }

        const user = await User.findById(req.user._id);

        const item = user.cart.find(
            entry => entry.product.toString() === req.params.productId
        );

        if (!item) {
            return res.status(404).json({
                error: "Cart item not found."
            });
        }

        const product = await Product.findById(req.params.productId);

        if (!product || quantity > product.stock) {
            return res.status(400).json({
                error: "Requested quantity is unavailable."
            });
        }

        item.quantity = quantity;
        await user.save();

        res.json({
            message: "Cart updated.",
            cart: user.cart
        });

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// REMOVE CART ITEM
router.delete("/remove/:productId", async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        user.cart = user.cart.filter(
            item => item.product.toString() !== req.params.productId
        );

        await user.save();

        res.json({
            message: "Item removed.",
            cart: user.cart
        });

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;


//====================================================
.9 ORDER API
//====================================================
const express = require("express");

const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");

const { protect } = require("../middleware/auth");

const router = express.Router();

router.use(protect);

// CHECKOUT - CREATE ORDER
router.post("/checkout", async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate("cart.product");

        if (!user.cart.length) {
            return res.status(400).json({
                error: "Your cart is empty."
            });
        }

        let total = 0;
        const orderItems = [];

        // Validate every item before changing inventory.
        for (const item of user.cart) {
            const product = item.product;

            if (!product) {
                return res.status(400).json({
                    error: "A product in your cart no longer exists."
                });
            }

            if (product.stock < item.quantity) {
                return res.status(400).json({
                    error: `Insufficient stock for ${product.name}.`
                });
            }

            total += product.price * item.quantity;

            orderItems.push({
                product: product._id,
                name: product.name,
                price: product.price,
                quantity: item.quantity
            });
        }

        // Reserve stock with a conditional database update.
        const reserved = [];

        for (const item of orderItems) {
            const updated = await Product.findOneAndUpdate(
                {
                    _id: item.product,
                    stock: { $gte: item.quantity }
                },
                {
                    $inc: { stock: -item.quantity }
                },
                { new: true }
            );

            if (!updated) {
                // Restore stock already reserved for this order.
                for (const previous of reserved) {
                    await Product.updateOne(
                        { _id: previous.product },
                        { $inc: { stock: previous.quantity } }
                    );
                }

                return res.status(409).json({
                    error: "Inventory changed during checkout. Please try again."
                });
            }

            reserved.push(item);
        }

        try {
            const order = await Order.create({
                user: user._id,
                items: orderItems,
                total: Number(total.toFixed(2))
            });

            // Clear the cart only after the order is saved.
            user.cart = [];
            await user.save();

            res.status(201).json({
                message: "Order created. Payment is still pending.",
                order
            });

        } catch (error) {
            // Restore stock if saving the order fails.
            for (const item of reserved) {
                await Product.updateOne(
                    { _id: item.product },
                    { $inc: { stock: item.quantity } }
                );
            }

            throw error;
        }

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET MY ORDERS
router.get("/my-orders", async (req, res) => {
    try {
        const orders = await Order.find({
            user: req.user._id
        }).sort({ createdAt: -1 });

        res.json({
            count: orders.length,
            orders
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET ONE OF MY ORDERS
router.get("/:id", async (req, res) => {
    try {
        const order = await Order.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!order) {
            return res.status(404).json({
                error: "Order not found."
            });
        }

        res.json(order);

    } catch (error) {
        res.status(400).json({ error: "Invalid order ID." });
    }
});

module.exports = router;
