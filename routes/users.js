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

/**
 * POST register user
 */
router.post('/register', (req, res) => {
    var name = req.body.name;
    var email = req.body.email;
    var username = req.body.username;
    var password = req.body.password;
    var password2 = req.body.password2;

    req.checkBody('name', 'Name is required!').notEmpty();
    req.checkBody('email', 'Email is required!').isEmail();
    req.checkBody('username', 'Username is required!').notEmpty();
    req.checkBody('password', 'Password is required!').notEmpty();
    req.checkBody('password2', 'Passwords do not match!').equals(password);

    var errors = req.validationErrors();

    if (errors) {
        res.render('register', {
            title: 'Register',
            user: null,
            errors: errors
        });
    } else {
        User.findOne( {username: username}, (err, user) => {
            if(user) {
                req.flash('danger', 'Username already exists, choose another!');
                res.redirect('/users/register');
            } else {
                var user = new User({
                    name: name,
                    email: email,
                    username: username,
                    password: password,
                    admin: 0
                });

                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(user.password, salt, (err, hash) => {
                        if (err) console.log(err);

                        user.password = hash;

                        user.save( (err) => {
                            if (err) console.log(err);
                            else {
                                req.flash('success', 'You are now registered!');
                                res.redirect('/users/login');
                            }
                        });
                    });
                });
            }
        });
    }
});

/**
 * GET login user
 */
 router.get('/login', (req, res) => {
     if (res.locals.user) res.redirect('/');
     else {
         res.render('login', {
             title: 'Log in'
         });
     }
});

/**
 * POST login user
 */
router.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/users/login',
    failureFlash: true
}));

/**
 * GET logout user
 */
 router.get('/logout', (req, res) => {
     req.logout();

     req.flash('success', 'You are logged out!');
     res.redirect('/users/login');
});

//Exports
module.exports = router;