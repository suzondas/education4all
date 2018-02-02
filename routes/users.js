var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer({
    dest: './uploads'
});
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var User = require('../models/user');
var Referrer = require('../models/referrer');

//Unique GUID Start
var ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

var ID_LENGTH = 8;

var generate = function() {
    var rtn = '';
    for (var i = 0; i < ID_LENGTH; i++) {
        rtn += ALPHABET.charAt(Math.floor(Math.random() * ALPHABET.length));
    }
    return rtn;
}
var UNIQUE_RETRIES = 9999;

var generateUnique = function(previous) {
    previous = previous || [];
    var retries = 0;
    var id;

    // Try to generate a unique ID,
    // i.e. one that isn't in the previous.
    while (!id && retries < UNIQUE_RETRIES) {
        id = generate();
        if (previous.indexOf(id) !== -1) {
            id = null;
            retries++;
        }
    }

    return id;
};
//Unique GUID End

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.send('respond with a resource');
});

router.get('/register', function(req, res, next) {
    res.render('register', {
        title: 'Register'
    });
});

router.get('/login', function(req, res, next) {
    res.render('login', {
        title: 'Login'
    });
});

router.post('/login',
    passport.authenticate('local', {
        failureRedirect: '/users/login',
        failureFlash: 'Invalid username or password'
    }),
    function(req, res) {
        req.flash('success', 'You are now logged in');
        res.redirect('/');
    });

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.getUserById(id, function(err, user) {
        done(err, user);
    });
});

passport.use(new LocalStrategy(function(username, password, done) {
    User.getUserByUsername(username, function(err, user) {
        if (err) throw err;
        if (!user) {
            return done(null, false, {
                message: 'Unknown User'
            });
        }

        User.comparePassword(password, user.password, function(err, isMatch) {
            if (err) return done(err);
            if (isMatch) {
                return done(null, user);
            } else {
                return done(null, false, {
                    message: 'Invalid Password'
                });
            }
        });
    });
}));

router.post('/register', upload.single('profileimage'), function(req, res, next) {
    var name = req.body.name;
    var email = req.body.email;
    var referrer = req.body.referrer;
    var username = req.body.username;
    var password = req.body.password;
    var password2 = req.body.password2;

    if (req.file) {
        console.log('Uploading File...');
        var profileimage = req.file.filename;
    } else {
        console.log('No File Uploaded...');
        var profileimage = 'noimage.jpg';
    }

    // Form Validator
    req.checkBody('name', 'Name field is required').notEmpty();
    req.checkBody('email', 'Email field is required').notEmpty();
    req.checkBody('email', 'Email is not valid').isEmail();
    req.checkBody('username', 'Username field is required').notEmpty();
    req.checkBody('referrer', 'Referrel ID field is required').notEmpty();
    req.checkBody('password', 'Password field is required').notEmpty();
    req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

    // Check Errors
    var errors = req.validationErrors();

    if (errors) {
        res.render('register', {
            errors: errors
        });
    } else {
		if(referrer==='!Wis#@KDz3E'){
			var newUser = new User({
                                name: name,
                                email: email,
                                username: username,
								referrer:referrer,
                                password: password,
                                profileimage: profileimage
                            });

                            User.createUser(newUser, function(err, user) {
                                if (err) throw err;
                                //console.log(user);
                                if (user) {
                                    var referrelId = [];
                                    for (var i = 0; i < 5; i++) {
                                        referrelId.push({
                                            id: generateUnique(),
                                            user: ''
                                        });
                                    }
                                    var SaveNewReferrer = new Referrer({
                                        referrer: user.id,
                                        referrelId: referrelId
                                    });
									
                                    SaveNewReferrer.save(function(err, cD) {
                                        if (err) return handleError(err);
                                        // saved!
										 req.flash('success', 'You are now registered and can login');
                                                    res.location('/');
                                                    res.redirect('/');
								});
								}
							});
										
		}else{
        Referrer.findOne({
            "referrelId.id": referrer
        }, function(err, fD) {
            if (fD) {
                var fDIndexOfReferrer;
                for (var i = 0; i < fD.referrelId.length; i++) {
                    if (fD.referrelId[i].id === referrer) {
                        if (fD.referrelId[i].user) {
                            req.flash('error', 'Your Referrel ID is already taken!');
                            res.redirect('/users/register');
                        } else {
                            fDIndexOfReferrer = i;
                            var newUser = new User({
                                name: name,
                                email: email,
                                username: username,
								referrer:referrer,
                                password: password,
                                profileimage: profileimage
                            });

                            User.createUser(newUser, function(err, user) {
                                if (err) throw err;
                                //console.log(user);
                                if (user) {
                                    var referrelId = [];
                                    for (var i = 0; i < 5; i++) {
                                        referrelId.push({
                                            id: generateUnique(),
                                            user: ''
                                        });
                                    }
                                    var SaveNewReferrer = new Referrer({
                                        referrer: user.id,
                                        referrelId: referrelId
                                    });
									
                                    SaveNewReferrer.save(function(err, cD) {
                                        if (err) return handleError(err);
                                        // saved!
										
                                      			
                                            Referrer.findById(fD.id, function(err, uFD) {
                                                if (err) return handleError(err);
												console.log(1);
												console.log(user.id);
												//fD.referrelId[fDIndexOfReferrer].user = user.id;
                                                uFD.referrelId.set(fDIndexOfReferrer,{id:referrer,user:user.id});
                                               console.log(uFD);
                                                uFD.save(function(err, updatedData) {
                                                    if (err) return handleError(err);
                                                    console.log(updatedData);
                                                    req.flash('success', 'You are now registered and can login');
                                                    res.location('/');
                                                    res.redirect('/');
                                                });
                                            });
                                   

                                    });
                                }
                            });
                        }
                    }
                }

            }
            if (!fD) {
                req.flash('error', 'Your Referrel ID was not found!');
                res.redirect('/users/register');
            }
        });


		}
    }


});

router.get('/logout', function(req, res) {
    req.logout();
    req.flash('success', 'You are now logged out');
    res.redirect('/users/login');
});

module.exports = router;