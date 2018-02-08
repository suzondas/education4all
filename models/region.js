	var mongoose = require('mongoose');

	mongoose.connect('mongodb://localhost/nodeauth');

	var db = mongoose.connection;

	// Region Schema new set
	var RegionSchema = mongoose.Schema({
		item: {
			type: String
		},
		branch:{
			type:Array
		},
		local:{type:String}
	});

	var Region = module.exports = mongoose.model('Region', RegionSchema);

	module.exports.getRegionById = function(id, callback){
		Region.findById(id, callback);
	}

	module.exports.getRegionAll = function(param, callback){
		Region.find(param, callback);
	}


