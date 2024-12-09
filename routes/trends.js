const express = require('express');
const router = express.Router();
const Tweet = require('../models/tweet');
const Trend = require('../models/trend');

// Route pour collecter et stocker les tendances
router.post('/collect', async (req, res) => {
    try {
        const trends = await Tweet.aggregate([
            { $unwind: "$hashtags" },
            { $group: { _id: "$hashtags", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        // Mettez à jour les tendances existantes et insérez les nouvelles tendances
        const bulkOps = trends.map(trend => ({
            updateOne: {
                filter: { term: trend._id },
                update: { $set: { count: trend.count } },
                upsert: true
            }
        }));

        await Trend.bulkWrite(bulkOps);

        res.json({ result: true, trends });
    } catch (error) {
        res.json({ result: false, message: error.message });
    }
});

// Route pour récupérer les tendances
router.get('/', async (req, res) => {
    try {
        const trends = await Trend.find().sort({ count: -1 });
        res.json({ result: true, trends });
    } catch (error) {
        res.json({ result: false, message: error.message });
    }
});

module.exports = router;
