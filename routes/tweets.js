var express = require('express');
var router = express.Router();
const User = require("../models/user");
const Tweet = require('../models/tweet');

//Poster un tweet :
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

//Récupérer les tweets :
router.get("/", (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 15;
    const skip = (page - 1) * limit;
  
    Tweet.find().sort({ date: -1 }).skip(skip).limit(limit).then((data) => {
      res.json({ result: true, content: data });
    }).catch(error => {
      res.json({ result: false, message: error.message });
    });
  });
  
//Supprimer un tweet :
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