const mongoose = require("mongoose");

const matchSchema = new mongoose.Schema({
    user1Id: { type: String, required: true },
    user2Id: { type: String, required: true },
    questionId: { type: String, required: true },
    category: { type: String, required: true },
    difficulty: { type: String, required: true },
    status: {
        type: String,
        enum: ["pending", "matched", "canceled"],
        default: "pending",
    },
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date}
});

module.exports = mongoose.model("Match", matchSchema);
