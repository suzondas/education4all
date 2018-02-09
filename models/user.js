var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

mongoose.connect('mongodb://localhost/nodeauth');

var db = mongoose.connection;

// User Schema
var UserSchema = mongoose.Schema({

	//username is replaced with userID and mongodb's default ObjectId is not touched 
	admin:{type:Boolean,default:false},
	username: {
		type: String
	},
	unhashedPassword:{type:String},
	password: {
		type: String
	},
	email: {
		type: String
	},
	name: {
		type: String
	},
	referrer:{
		type:String,
		unique : true
	},
	fatherName:{
		type:String
	},
	motherName:{
		type:String
	},
	institute:{
		type:String
	},
	class:{
		type:String
	},
	group:{
		type:String
	},
	dateOfBirth:{
		type:Date
	},
	sex:{
		type:String
	},
	mobile:{
		type:String
	},
	phone:{
		type:String
	},
	presentAddress:{
		type:Array,
		default:{addressLine:{one:'',two:'',three:'',four:''},countryOrRegion:'',districtOrTown:''}
	},
	permanentAddress:{
		type:Array,
		default:{addressLine:{one:'',two:'',three:'',four:''},countryOrRegion:'',districtOrTown:''}
	},
	profileimage:{
		type: String,
		default:'noimage'
	}
});

var User = module.exports = mongoose.model('User', UserSchema);

module.exports.getUserById = function(id, callback){
	User.findById(id, callback);
}

module.exports.getUserByUsername = function(username, callback){
	var query = {username: username};
	User.findOne(query, callback);
}

module.exports.comparePassword = function(candidatePassword, hash, callback){
	bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
    	callback(null, isMatch);
	});
}

module.exports.createUser = function(newUser, callback){
	bcrypt.genSalt(10, function(err, salt) {
    	bcrypt.hash(newUser.password, salt, function(err, hash) {
   			newUser.password = hash;
   			newUser.save(callback);
    	});
	});
}