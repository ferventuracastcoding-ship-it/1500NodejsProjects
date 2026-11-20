const jwt = require("jsonwebtoken");

const JWT_SECRET =
    process.env.JWT_SECRET ||
    "development-secret-change-this";

function authenticate(req, res, next) {

    const header =
        req.headers.authorization;

    if (!header) {

        return res.status(401).json({
            error: "Authentication required."
        });
    }

    const token =
        header.replace("Bearer ", "");

    try {

        const user =
            jwt.verify(
                token,
                JWT_SECRET
            );

        req.user = user;

        next();

    } catch (error) {

        return res.status(401).json({
            error: "Invalid or expired token."
        });
    }
}

module.exports = {
    authenticate,
    JWT_SECRET
};
