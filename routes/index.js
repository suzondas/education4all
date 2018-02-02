var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Referrer = require('../models/referrer');
/* GET home page. */
router.get('/', ensureAuthenticated, function(req, res, next) {
  	Referrer.findOne({referrer:req.user.id}, function(err, fD) {
     res.render('index',{data:fD});
  });
  
});

function ensureAuthenticated(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect('/users/login');
}

module.exports = router;