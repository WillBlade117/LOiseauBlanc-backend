const mongoose = require("mongoose");

const tweetSchema = mongoose.Schema({
    date: Date,
    content: String,
    hasLiked: [{ type: mongoose.Schema.Types.ObjectId, ref: "users" }],
    author: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
});

const Tweet = mongoose.model("tweets", tweetSchema);

module.exports = Tweet;