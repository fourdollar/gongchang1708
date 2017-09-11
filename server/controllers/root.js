var express = require('express')
, router = express.Router();
var _ = require('lodash');

module.exports = function() {

	/**
	 * App Version
	 */
	router.get('/api/_version', function(req,res){
		res.json({'version': '0.0.1'});
	});

	return {
		getRoute : function(){
			return router;
		}	
	};
};