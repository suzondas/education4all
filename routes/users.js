//todo: move middleware to service
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
var Region = require('../models/region');

// Authenticated Service
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/users/login');
}

//Unique GUID Start
var ALPHABET = '0123456789abcdefghjklmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ!@#$%&?';

var ID_LENGTH = 8;

var generate = function() {
    var rtn = '';
    for (var i = 0; i < ID_LENGTH; i++) {
        rtn += ALPHABET.charAt(Math.floor(Math.random() * ALPHABET.length));
    }
    return rtn;
}
var UNIQUE_RETRIES = 9999;

var generateUniqueUserId = function(previous, region, city) {
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

    //custom id is username consisting 20 digits sum of each 4 digits of Year, Region, City, Unique ID
    var customId = (new Date()).getFullYear() + region + city + id;
    return customId;
};
var generateUnique = function(level, previous) {
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

    if(level==='admin') {
        return id+'-1'
    }
    else {
        var addedLevel = Number(level.substr(level.indexOf('-')+1))+1;
        return id+'-'+addedLevel;
    }
};
//Unique GUID End
/*Extracting Location Name and Local*/
function extractLocation(q, param){

    if(q==='name'){
        return param.substr(0, param.indexOf("-"));
    }
    if(q==='local'){
        return param.substr(param.indexOf("-") + 1);
    }
}

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.send('respond with a resource');
});

router.get('/register', function(req, res, next) {
    Region.getRegionAll({}, function(err, region) {
        if (err) throw err;
        res.render('register', {
            title: 'Register',
            region: region
        });
    });
});

router.get('/login', function(req, res, next) {
    res.render('login', {
        title: 'Login'
    });
});

router.get('/profile', ensureAuthenticated, function(req,res, next){
    res.render('profile',{user:req.user});
});
router.get('/referredMembers', ensureAuthenticated, function(req,res, next){
    Referrer.findOne({referrer:req.user.id}, function(err, fD) {
        if (err) throw err;

        var userIds  = [];
        fD.referrelId.forEach(function(item){
            if(item.user){
                userIds.push(item.user)
            }
        })
        User.getUsersByIds(userIds,function(err, firstLevelUser){
            if (err) throw err;

            Referrer.getReferrersByIds(userIds,function(err, secondLevelReferrelCode){
            if (err) throw err;

            var secondLevelUserIds = [];
                secondLevelReferrelCode.forEach(function(item){
                    item.referrelId.forEach(function(subItem){
                        if(subItem.user){
                            secondLevelUserIds.push(subItem.user)
                        }
                    })
                });
                User.getUsersByIds(secondLevelUserIds,function(err, secondLevelusersDetails){
                    if (err) throw err;
                    res.render('referredMembers',{data:fD, user:req.user, firstLevelUser:firstLevelUser,secondLevelReferrelCode:secondLevelReferrelCode, secondLevelusersDetails:secondLevelusersDetails});
                });
            });
        })

        // res.render('referredMembers',{data:fD, user:req.user});
    });
});

router.get('/adminPanel', ensureAuthenticated, function(req,res, next){

    if(!req.user.admin) {
        res.redirect('/');
    }

    Referrer.find({}, function(err, referrerData) {
        if (err) throw err;
        User.find({},function(err,usersData){
             if (err) throw err;
             Region.find({},function(err, region){
                if (err) throw err;
                res.render('adminPanel',{referrerData:referrerData, usersData:usersData, region:region});
             })
        });
    });

});

router.get('/updateUserData', ensureAuthenticated, function(req, res, next) {
    res.render('updateUserData', {
        userData: req.user
    });
});
router.get('/removeUser/:userId', ensureAuthenticated, function(req, res, next) {
    console.log(req.params.userId);
    User.findByIdAndRemove(req.params.userId,function(err, data){
        if (err) throw err;
        
        req.flash('success','User has been successfully removed')
        res.redirect('/users/adminPanel');
    });
});
router.get('/profileJSON', ensureAuthenticated, function(req, res, next) {
    res.send(req.user)
});
router.get('/contacts', ensureAuthenticated, function(req, res, next) {
   Referrer.findOne({referrer:req.user.id}, function(err, fD) {
        if (err) throw err;

        var userIds  = [];
        fD.referrelId.forEach(function(item){
            if(item.user){
                userIds.push(item.user)
            }
        })
        User.getUsersByIds(userIds,function(err, firstLevelUser){
            if (err) throw err;

            Referrer.getReferrersByIds(userIds,function(err, secondLevelReferrelCode){
            if (err) throw err;

            var secondLevelUserIds = [];
                secondLevelReferrelCode.forEach(function(item){
                    item.referrelId.forEach(function(subItem){
                        if(subItem.user){
                            secondLevelUserIds.push(subItem.user)
                        }
                    })
                });
                User.getUsersByIds(secondLevelUserIds,function(err, secondLevelusersDetails){
                    if (err) throw err;
                    res.render('contacts',{data:fD, user:req.user, firstLevelUser:firstLevelUser,secondLevelReferrelCode:secondLevelReferrelCode, secondLevelusersDetails:secondLevelusersDetails});
                });
            });
        })

        // res.render('referredMembers',{data:fD, user:req.user});
    });
});
router.get('/forgot-password', function(req, res, next) {
    res.render('forgot-password', {
        title: 'Forgot Password'
    });
});
router.post('/forgot-password', function(req, res, next) {
    var username = req.body.username;
    User.findOne({
        'username': username
    }, function(err, user) {
        if (err) {
            req.flash('error', 'Something Went Wrong!');
            res.redirect('/users/forgot-password');
        }
        if (!user) {

            req.flash('error', 'Invalid User');
            res.redirect('/users/forgot-password');
        }

        if (user) {
            //send email
            var send = require('gmail-send')({
                //var send = require('../index.js')({
                user: 'nodeoauthdev@gmail.com',
                // user: credentials.user,                  // Your GMail account used to send emails
                pass: 'devOauth123',
                // pass: credentials.pass,                  // Application-specific password
                to: user.email,
                // to:   credentials.user,                  // Send to yourself
                // you also may set array of recipients:
                // [ 'user1@gmail.com', 'user2@gmail.com' ]
                // from:    credentials.user             // from: by default equals to user
                // replyTo: credentials.user             // replyTo: by default undefined
                subject: 'Forgot Password Recovery',
                text: 'Dear ' + user.name + ', your password is ' + user.unhashedPassword, // Plain text
                //html:    '<b>html text</b>'            // HTML
            });
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
            send({ // Overriding default parameters
                subject: 'Forgot Password Recovery'
            }, function(err, response) {
                if (err) {
                    console.log(err);
                    req.flash('error', 'Something went wrong');
                    // res.location('/');
                    res.redirect('/');
                }
                req.flash('success', 'Your password was sent to your email address.');
                // res.location('/');
                res.redirect('/');
            });
        }
    });
});

router.post('/login',
    passport.authenticate('local', {
        failureRedirect: '/users/login',
        failureFlash: 'Invalid UserId or password'
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

//
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

    //validate recaptcha
    reCAPTCHA = require('recaptcha2')

    recaptcha = new reCAPTCHA({
        siteKey: '6Ld5EEUUAAAAACTaqFnSxTVpGP4LgB6qWMa_FUNB',
        secretKey: '6Ld5EEUUAAAAAHAo_6mnbcw24m7PLvD4HhoaL_IS'
    })

    recaptcha.validateRequest(req)
        .then(function() {
            // validated and secure
    var name = req.body.name;
    var email = req.body.email;
    var referrer = req.body.referrer;

    //username is skipped as it has no use
    // var username = req.body.username;
    var password = req.body.password;
    var unhashedPassword = req.body.password;
    var password2 = req.body.password2;
    var fatherName = req.body.fatherName;
    var motherName = req.body.motherName;
    var institute = req.body.institute;
    var StdClass = req.body.class;
    var group = req.body.group;
    var dateOfBirth = req.body.dateOfBirth;
    var sex = req.body.sex;
    var mobile = req.body.mobile;
    var phone = req.body.phone;
    var prAddLine1 = req.body.prAddLine1;
    var prAddLine2 = req.body.prAddLine2;
    var prAddLine3 = req.body.prAddLine3;
    var prAddLine4 = req.body.prAddLine4;
    var prCountryRegion = req.body.prCountryRegion;
    var prDistTown = req.body.prDistTown;
    var prmAddLine1 = req.body.prmAddLine1;
    var prmAddLine2 = req.body.prmAddLine2;
    var prmAddLine3 = req.body.prmAddLine3;
    var prmAddLine4 = req.body.prmAddLine4;
    var prmCountryRegion = req.body.prmCountryRegion;
    var prmDistTown = req.body.prmDistTown;
    var userId = generateUniqueUserId('', extractLocation('local', prCountryRegion), extractLocation('local',prDistTown));
    /*Middleware for Adding New User*/
    var newUser = new User({
        admin:false,
        username: userId,
        name: name,
        email: email,
        // username: username,
        referrer: referrer,
        password: password,
        unhashedPassword: unhashedPassword,
        profileimage: profileimage,
        fatherName: fatherName,
        motherName: motherName,
        institute: institute,
        class: StdClass,
        group: group,
        dateOfBirth: dateOfBirth,
        sex: sex,
        mobile: mobile,
        phone: phone,
        presentAddress: {
            addressLine: {
                one: prAddLine1,
                two: prAddLine2,
                three: prAddLine3,
                four: prAddLine4
            },
            countryOrRegion: prCountryRegion,
            districtOrTown: prDistTown
        },
        permanentAddress: {
            addressLine: {
                one: prmAddLine1,
                two: prmAddLine2,
                three: prmAddLine3,
                four: prmAddLine4
            },
            countryOrRegion: prmCountryRegion,
            districtOrTown: prmDistTown
        }

    });

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

    //username is skipped as it has no use
    // req.checkBody('username', 'Username field is required').notEmpty();
    req.checkBody('referrer', 'Referrel ID field is required').notEmpty();
    req.checkBody('password', 'Password field is required').notEmpty();
    req.checkBody('password2', 'Passwords do not match').equals(req.body.password);
    req.checkBody('fatherName', 'Father Name is required').notEmpty();
    req.checkBody('motherName', 'Mother Name is required').notEmpty();
    req.checkBody('institute', 'Institute Name is required').notEmpty();
    req.checkBody('class', 'Class Name is required').notEmpty();
    req.checkBody('group', 'Group Name is required').notEmpty();
    req.checkBody('sex', 'Sex Name is required').notEmpty();
    req.checkBody('dateOfBirth', 'Date of Birth is required').notEmpty();
    req.checkBody('prCountryRegion', 'Present Country/Region is required').notEmpty();
    req.checkBody('prDistTown', 'Present District/Town is required').notEmpty();
    req.checkBody('prmCountryRegion', 'Permanent District/Town is required').notEmpty();
    req.checkBody('prmDistTown', 'Permanent District/Town is required').notEmpty();

    // Check Errors
    var errors = req.validationErrors();

    if (errors) {
        console.log(err)
        res.render('register', {
            errors: errors
        });
    } else {
        if (referrer === '!Wis#@KDz3E') {
            newUser.admin=true;
            User.createUser(newUser, function(err, user) {
                if (err) throw err;
                //console.log(user);
                if (user) {
                    var referrelId = [];
                    for (var i = 0; i < 5; i++) {
                        referrelId.push({
                            id: generateUnique('admin'),
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

        } else {

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
                                User.createUser(newUser, function(err, user) {
                                    if (err) throw err;
                                    //console.log(user);
                                    if (user) {
                                        var referrelId = [];
                                        for (var i = 0; i < 5; i++) {
                                            referrelId.push({
                                                id: generateUnique(referrer),
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

                                                //fD.referrelId[fDIndexOfReferrer].user = user.id;
                                                uFD.referrelId.set(fDIndexOfReferrer, {
                                                    id: referrer,
                                                    user: user.id
                                                });

                                                uFD.save(function(err, updatedData) {
                                                    if (err) return handleError(err);

                                                    var send = require('gmail-send')({
                                                        //var send = require('../index.js')({
                                                        user: 'nodeoauthdev@gmail.com',
                                                        // user: credentials.user,                  // Your GMail account used to send emails
                                                        pass: 'devOauth123',
                                                        // pass: credentials.pass,                  // Application-specific password
                                                        to: email,
                                                        // to:   credentials.user,                  // Send to yourself
                                                        // you also may set array of recipients:
                                                        // [ 'user1@gmail.com', 'user2@gmail.com' ]
                                                        // from:    credentials.user             // from: by default equals to user
                                                        // replyTo: credentials.user             // replyTo: by default undefined
                                                        subject: 'Account Confirmation',
                                                        text: 'Thank you for getting registered. Use the User ID: ' + userId + ' to login to your account', // Plain text
                                                        //html:    '<b>html text</b>'            // HTML
                                                    });
                                                    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
                                                    send({ // Overriding default parameters
                                                        subject: 'Account Verification'
                                                    }, function(err, response) {
                                                        if (err) {
                                                            console.log(err);
                                                            req.flash('error', 'Something went wrong');
                                                            // res.location('/');
                                                            res.redirect('/');
                                                        }
                                                        req.flash('success', 'Registration is completed. Please login using User ID sent to your email address.');
                                                        // res.location('/');
                                                        res.redirect('/');
                                                    });


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
        })
        .catch(function(errorCodes) {
            // invalid
            console.log(errorCodes)
             req.flash('error', 'Invalid reCAPTCHA');
                    res.redirect('/users/register');
        });

});

router.get('/logout', function(req, res) {
    req.logout();
    req.flash('success', 'You are now logged out');
    res.redirect('/users/login');
});

module.exports = router;