const rateLimit = require("express-rate-limit");

const generalLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 5,
    message: "Too many requests, please try again later.",
});

module.exports = {
    generalLimiter,
};
