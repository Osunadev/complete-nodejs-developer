const jwt = require('jsonwebtoken');
const User = require('../models/user');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Inside the found user 'tokens.token' will look for a token subcollection (from the tokens array) that matches the token value
        const user = await User.findOne({
            _id: decoded._id,
            'tokens.token': token,
        });

        if (!user) {
            throw new Error();
        }

        // We're addding a new property to the 'req' object so that it can be accessed from the
        // handler function of the route endpoint
        req.user = user;
        req.token = token;

        // If we authenticated correctly
        next();
    } catch (err) {
        res.status(401).send({ error: 'Please authenticate.' });
    }
};

module.exports = auth;
