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
    Tweet.deleteOne({ date: req.params.date })
        .then(result => {
            if (result.deletedCount === 1) {
                return res.json({ result: true, message: 'document deleted !' })
            }
            res.json({ result: false })
        })
});

//Ajouter un like :
router.put('/like/:date', (req, res) => {
    const tweetDate = req.params.date;
    const token = req.body.token;
    User.findOne({ token: token })
        .then(data => {
            if (!data) {
                return res.json({ result: false, message: 'User not found' });
            }
            const userId = data._id;
            Tweet.updateOne(
                { date: tweetDate },
                { $addToSet: { hasLiked: userId } } //$addToSet ajoute l'utilisateur seulement s'il n'est pas déjà dans le tableau
            )
                .then(result => {
                    if (result.nModified === 0) {
                        return res.json({ result: false, message: 'Tweet not found or user already liked' });
                    }
                    res.json({ result: true, message: 'User liked the tweet' });
                })
        })
});

//Retirer un like :
router.put('/unlike/:date', (req, res) => {
    const tweetDate = req.params.date;
    const token = req.body.token;
    User.findOne({ token: token })
        .then(data => {
            if (!data) {
                return res.json({ result: false, message: 'User not found' });
            }
            const userId = data._id;
            Tweet.updateOne(
                { date: tweetDate },
                { $pull: { hasLiked: userId } } //$pull retire l'utilisateur du tableau des likes
            )
                .then(result => {
                    if (result.nModified === 0) {
                        return res.json({ result: false, message: 'Tweet not found or user had not liked' });
                    }
                    res.json({ result: true, message: 'User unliked the tweet' });
                })
        })
});

module.exports = router;