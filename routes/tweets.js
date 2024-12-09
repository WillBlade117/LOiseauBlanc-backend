const express = require('express');
const router = express.Router();
const User = require("../models/user");
const Tweet = require('../models/tweet');
const axios = require('axios'); // Ajoutez axios pour faire des requêtes HTTP

// Fonction pour extraire les hashtags du contenu du tweet
const extractHashtags = (content) => {
    const hashtagRegex = /#\w+/g;
    const hashtags = content.match(hashtagRegex) || [];
    return hashtags.map(hashtag => hashtag.substring(1)); // Supprime le caractère '#'
};

// Poster un tweet :
router.post('/', async (req, res) => {
    try {
        const user = await User.findOne({ token: req.body.token });
        if (!user) {
            return res.json({ result: false, message: 'User not found' });
        }

        const hashtags = extractHashtags(req.body.content);
        const newTweet = new Tweet({
            date: Date.now(),
            firstname: user.firstname,
            username: user.username,
            content: req.body.content,
            hasLiked: [],
            author: user._id,
            hashtags: hashtags // Ajoutez les hashtags ici
        });

        await newTweet.save();

        // Appeler la route de collecte des tendances après avoir enregistré le tweet
        await axios.post('http://localhost:3000/trends/collect');

        res.json({ result: true, content: newTweet });
    } catch (error) {
        res.json({ result: false, message: error.message });
    }
});

// Récupérer les tweets :
router.get("/", (req, res) => {
    const token = req.query.token;
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    User.findOne({ token: token })
        .then(user => {
            if (!user) {
                return res.json({ result: false, message: 'User not found' });
            }
            const userId = user._id;

            Tweet.find().sort({ date: -1 }).skip(skip).limit(limit).then((tweets) => {
                const tweetsWithLikeInfo = tweets.map(tweet => {
                    return {
                        ...tweet.toObject(),
                        isLiked: tweet.hasLiked.includes(userId)
                    };
                });
                res.json({ result: true, content: tweetsWithLikeInfo });
            }).catch(error => {
                res.json({ result: false, message: error.message });
            });
        }).catch(error => {
            res.json({ result: false, message: error.message });
        });
});

// Supprimer un tweet :
router.delete("/:date", (req, res) => {
    Tweet.deleteOne({ date: req.params.date })
        .then(result => {
            if (result.deletedCount === 1) {
                return res.json({ result: true, message: 'document deleted !' });
            }
            res.json({ result: false });
        });
});

// Ajouter un like :
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
                { $addToSet: { hasLiked: userId } } // $addToSet ajoute l'utilisateur seulement s'il n'est pas déjà dans le tableau
            )
                .then(result => {
                    if (result.nModified === 0) {
                        return res.json({ result: false, message: 'Tweet not found or user already liked' });
                    }
                    res.json({ result: true, message: 'User liked the tweet' });
                });
        });
});

// Retirer un like :
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
                { $pull: { hasLiked: userId } } // $pull retire l'utilisateur du tableau des likes
            )
                .then(result => {
                    if (result.nModified === 0) {
                        return res.json({ result: false, message: 'Tweet not found or user had not liked' });
                    }
                    res.json({ result: true, message: 'User unliked the tweet' });
                });
        });
});

module.exports = router;
