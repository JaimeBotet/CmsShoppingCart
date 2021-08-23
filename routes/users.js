var express = require('express');
var passport = require('passport');
var bcrypt = require('bcryptjs');
var router = express.Router();

// Get Users Model
var User = require('../models/user');

/**
 * GET register user
 */
router.get('/register', (req, res) => {
    res.render('register', {
        title: 'Register'
    });
});



//Exports
module.exports = router;