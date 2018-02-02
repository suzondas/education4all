var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/nodeauth');

var db = mongoose.connection;

// Referrer Schema
var ReferrerSchema = mongoose.Schema({
	referrer: {
		type: String
	},
	referrelId:{
		type:Array,
		default:[{id:'',user:''}]
	}
});

var Referrer = module.exports = mongoose.model('Referrer', ReferrerSchema);

module.exports.getReferrerById = function(id, callback){
	Referrer.findById(id, callback);
}

