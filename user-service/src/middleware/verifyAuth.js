const verifyToken = require("./verifyToken"); // Import the token verification middleware

const authenticateUser = (req, res, next) => {
  // Call verifyToken first to validate the token
  verifyToken(req, res, (err) => {
    if (err) {
      return res.status(403).json({ error: "Unauthorized " });
    }

    // Check if user is present in the request object
    if (!req.user) {
      return res.status(403).json({ error: "User not authenticated" });
    }

    // Proceed to the next middleware or route handler
    next();
  });
};

module.exports = authenticateUser;
