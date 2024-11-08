const rateLimit = require("express-rate-limit");

// Rate limiter specifically for token verification
const verifyTokenLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 10, // Limit each IP to 10 requests per minute
    message: "Too many verification attempts, please try again later.",
});

// Middleware to verify token with rate limiting
const verifyToken = async (req, res, next) => {
    verifyTokenLimiter(req, res, async () => {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res
                .status(401)
                .json({ error: "Authentication token is missing or invalid" });
        }

        const token = authHeader.split(" ")[1];

        try {
            // Verify token with Firebase Admin SDK
            const decodedToken = await admin.auth().verifyIdToken(token);
            req.user = decodedToken; // Add decoded token data to req object
            next();
        } catch (error) {
            console.error("Token verification failed:", error);
            res.status(401).json({ error: "Token verification failed" });
        }
    });
};

module.exports = verifyToken;
