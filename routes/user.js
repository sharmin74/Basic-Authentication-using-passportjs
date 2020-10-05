const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const passport = require('passport');
const saltRounds = 5;

const User = require('../models/User');

router.get('/', (req, res) => {
    res.render('index');
});

router.get('/register', (req, res) => {
    res.render('register')
});

router.post('/register', (req, res) => {
    let { name, email, password, confirm } = req.body;
    console.log(name, email, password, confirm);
    if (password.length < 6) {
        req.flash('error', 'Password has to have atleast 6 characters.');
        return res.redirect('/register');
    }
    if (password != confirm) {
        req.flash('error', 'Passwords do not match.');
        return res.redirect('/register');
    }
    User.findOne({ email: email })
        .then((user) => {
            if (user) {
                req.flash('error', 'That email is already registered');
                res.redirect('/register');
            } else {
                const newUser = new User({
                    name,
                    email,
                    password
                });
                bcrypt.genSalt(saltRounds, (err, salt) => {
                    bcrypt.hash(password, salt, (err, hash) => {
                        // Store hash in your password DB.
                        if (err) {
                            console.log(err);
                        } else {
                            newUser.password = hash;
                            newUser.save()
                                .then(user => {
                                    req.flash('success', 'You have successfully registered and can now log in.');
                                    res.redirect('/login');
                                })
                                .catch(err => {
                                    console.log(err);
                                })
                        }
                    });
                });
            }
        })

});

router.get('/login', (req, res) => {
    res.render('login');
});


router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/login',
        successFlash: true,
        failureFlash: true
    })(req, res, next);
});


router.get('/dashboard', (req, res) => {
    if (req.isAuthenticated()) {
        res.render('dashboard', { name: req.user.name });
    } else {
        req.flash('error', 'Please log in to view that resource');
        res.redirect('/login');
    }
});

router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success', 'You are logged out.');
    res.redirect('/login');
});


module.exports = router;