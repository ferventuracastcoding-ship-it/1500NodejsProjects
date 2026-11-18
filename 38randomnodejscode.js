// This code is not to be taken seriousely it's to learn the syntax of the langes
PORT=3000

MONGO_URI=mongodb://127.0.0.1:27017/authentication_db

JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=15m

node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"

node_modules/
.env

const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB connected successfully");

    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        process.exit(1);
    }
};

module.exports = connectDB;

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        password: {
            type: String,
            required: true,
            minlength: 8,
            select: false
        },

        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user"
        }
    },
    {
        timestamps: true
    }
);

// Hash password before saving
userSchema.pre("save", async function () {

    if (!this.isModified("password")) return;

    this.password = await bcrypt.hash(this.password, 12);
});

// Compare passwords
userSchema.methods.comparePassword = async function (password) {

    return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("User", userSchema);

const jwt = require("jsonwebtoken");

const generateToken = (userId) => {

    return jwt.sign(
        {
            sub: userId.toString()
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN || "15m",
            algorithm: "HS256"
        }
    );
};

module.exports = generateToken;

const User = require("../models/User");
const generateToken = require("../utils/generateToken");

// REGISTER
exports.register = async (req, res, next) => {

    try {

        const { name, email, password } = req.body;

        // Check existing user
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email already registered"
            });
        }

        // Create user
        const user = await User.create({
            name,
            email,
            password
        });

        res.status(201).json({
            success: true,
            message: "Registration successful",

            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        next(error);
    }
};


// LOGIN
exports.login = async (req, res, next) => {

    try {

        const { email, password } = req.body;

        // Find user and include password
        const user = await User.findOne({ email })
            .select("+password");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Compare password
        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Generate JWT
        const token = generateToken(user._id);

        res.json({
            success: true,
            message: "Login successful",

            token,

            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        next(error);
    }
};


// GET PROFILE
exports.getProfile = async (req, res, next) => {

    try {

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        next(error);
    }
};


// LOGOUT
exports.logout = (req, res) => {

    res.json({
        success: true,
        message: "Logout successful. Clear your token on the client."
    });
};

const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {

    try {

        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Authentication token required"
            });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET,
            {
                algorithms: ["HS256"]
            }
        );

        req.user = {
            id: decoded.sub
        };

        next();

    } catch (error) {

        return res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });
    }
};

module.exports = authenticate;

const express = require("express");

const router = express.Router();

const authController =
    require("../controllers/auth.controller");

const authenticate =
    require("../middleware/auth.middleware");

// Registration
router.post("/register", authController.register);

// Login
router.post("/login", authController.login);

// Protected profile
router.get("/profile", authenticate, authController.getProfile);

// Logout
router.post("/logout", authenticate, authController.logout);

module.exports = router;

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const authRoutes = require("./routes/auth.routes");

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "10kb" }));

app.get("/", (req, res) => {

    res.json({
        success: true,
        message: "Authentication API is running"
    });

});

// Authentication routes
app.use("/api/auth", authRoutes);

// Global error handler
app.use((err, req, res, next) => {

    console.error(err);

    res.status(500).json({
        success: false,
        message: "Internal server error"
    });

});

module.exports = app;

require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/database");

const PORT = process.env.PORT || 3000;

const startServer = async () => {

    await connectDB();

    app.listen(PORT, () => {

        console.log(
            `Server running at http://localhost:${PORT}`
        );

    });
};

startServer();

