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
                firstname: data.firstname,
                username: data.username,
                content: req.body.content,
                hasLiked: [],
                author: data._id,
            });
            newTweet.save().then((newDoc) => {
                res.json({ result: true, content: newDoc });
            });
        });
});

router.get("/", (req, res) => {
    Tweet.find().sort({date: -1}).then((data) => {
      res.json({ result: true, content: data });
    });
  });

router.delete("/:date", (req, res) => {
    Tweet.deleteOne({date: req.params.date})
    .then(result => {
        if (result.deletedCount === 1){
           return res.json({ result: true, message: 'document deleted !' })
        }
        res.json({ result: false })
    })
});

module.exports = router;