const mongoose = require("mongoose");

const trendSchema = mongoose.Schema({
    term: { type: String, required: true, unique: true },
    count: { type: Number, required: true }
});

const Trend = mongoose.model("trends", trendSchema);

module.exports = Trend;