const mongoose = require("mongoose");

const tweetSchema = mongoose.Schema({
    date: Date,
    firstname: String,
    username: String,
    content: String,
    hasLiked: [{ type: mongoose.Schema.Types.ObjectId, ref: "users" }],
    author: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    hashtags: [{ type: String }]
});

const Tweet = mongoose.model("tweets", tweetSchema);

module.exports = Tweet;