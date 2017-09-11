var express = require('express')
, router = express.Router();
var _ = require('lodash');

module.exports = function() {
	
	var fs = require('fs');
	var mockData = 'apps/main/mock/data'

	/**
	 * Get
	 *
	 */
	router.get('/api/v0/factory/getworklist', function(req,res){
//		var factoryId = req.params.factoryId;		
		var resdata = JSON.parse(fs.readFileSync(mockData+'/progress/list.json','utf8'));
		
		res.json(resdata);
	});

	/**
	 * Get
	 *
	 */
	router.get('/api/v0/factory/:factoryId/videoList', function(req,res){
		var factoryId = req.params.factoryId;
		
		var resdata = JSON.parse(fs.readFileSync(mockData+'/video/video.json','utf8'));
		
		res.json(resdata);
	});
	
	/**
	 * Get
	 *
	 */
	router.get('/api/v0/factory/:factoryId/watsonNotice', function(req,res){
		var factoryId = req.params.factoryId;
		
		var resdata = JSON.parse(fs.readFileSync(mockData+'/watson/notice01.json','utf8'));
		
		res.json(resdata);
	});
		
	/**
	 * Get timeline Data
	 *
	 */
	router.get('/api/v0/factory/analyzework', function(req,res){
//		var factoryId = req.params.factoryId;
		
		var resdata = JSON.parse(fs.readFileSync(mockData+'/patterns/timeline.json','utf8'));
		
		res.json(resdata);
	});

	return {
		getRoute : function(){
			return router;
		}	
	};
};