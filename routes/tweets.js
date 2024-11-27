var express = require('express');
var router = express.Router();
const User = require("../models/user");
const Tweet = require('../models/tweet');

router.post('/', (req, res) => {
    User.findOne({ token: req.body.token })
        .then(data => {
            if (!data) {
                return res.json({ result: false, message: 'User not found' })
            }
            const newTweet = new Tweet({
                date: Date.now(),
                content: req.body.content,
                hasLiked: [],
                author: data._id,
            });
            newTweet.save().then((newDoc) => {
                res.json({ result: true, content: newDoc });
            });
        });
});

module.exports = router;