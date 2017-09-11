/*jshint node:true*/

//------------------------------------------------------------------------------
//node.js starter application for Bluemix
//------------------------------------------------------------------------------

//This application uses express as it's web server
//for more info, see: http://expressjs.com
var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');
var shortid = require('shortid');
var watson = require('watson-developer-cloud');
var _ = require('underscore');
var archiver = require('archiver');
var async = require('async');
var extend = require('util')._extend;
var credentials;
var router = express.Router();
var services = require('../config/SERVICES_FOR_LOCAL.json');
var server_settings = require('../config/server_settings.json');
var server_worklist = require('../data/patterns/worklist.json');
var bluemix = require("cfenv").getAppEnv();
var bluemix_services = require('./bluemix_services.js');
var vr_classifier_id = (process.env.ENV_VR_CLASSIFIER_ID === undefined) ? [server_settings['vr_classifier_id']] : [process.env.ENV_VR_CLASSIFIER_ID];
console.log("vr_classifier_id:");
console.log(vr_classifier_id);


/*****************************************************************************
Define Bluemix Credential Section
*****************************************************************************/
//Define Credentials
//if bluemix credentials exists, then override local
credentials = extend({version : 'v3'},{version_date: '2016-05-20'});
if (typeof process.env.VCAP_SERVICES === 'undefined') {
	credentials = extend(credentials, services['watson_vision_combined'][0].credentials); // VCAP_SERVICES
} else {
	credentials = extend(credentials, bluemix.getServiceCreds('watson_vision_combined')); // VCAP_SERVICES
}
console.log("credentials_VR:")
console.log(credentials);
var visualRecognition = watson.visual_recognition(credentials);


var watson_vr = function(req, res, imagefile, callback) {
	var formData = {
		images_file: fs.createReadStream(imagefile),
		classifier_ids: vr_classifier_id
	};
	visualRecognition.classify(formData, function(error, result) {
		if (error) {
			console.log(error);
			callback(result);
			// return res.status(error.error ? error.error.code || 500 : 500).json({
			// 	error: error
			// });
		} else {
			console.log("VR_result");
			console.log(result);
			callback(result);
			return
		}
	});
};



var watson_analyzeWork = function(req, res, callback) {
	// workHistory SPSSに問い合わせて、仕事の振り分けを確定させる
	var workHistory = [];
	var data_for_analytics = [];
	var work_amount = [];
	var work_labels = _.map(server_worklist.data, function(data_temp) {return data_temp.class});

	_.each(req.body.history, function(data_temp,index) {
		var line_array = _.map(work_labels, function(map_data_temp){
			var find_class = _.find(data_temp.classes,function(find_data_temp){return find_data_temp.class == map_data_temp;});
			if(find_class == undefined){
				return 0;

			}else{
				return find_class.score;

			}
		});
		line_array.push(data_temp.timer);

		data_for_analytics.push(line_array);

	});


	var data_header = work_labels.concat();
	data_header.push("timer");


	var data_for_analytics_table = {
		"tablename":"result.csv",
		"header":data_header,
		"data":data_for_analytics
	};

	async.waterfall([
		function(next){ //spssにより画像分類結果の精度を上げる
			bluemix_services.spss_analyze1(data_for_analytics_table,"classify", function(watson_vr_spss_res){
				// console.log("spss_analyze1:watson_vr_spss_res");
				// console.log(JSON.stringify(watson_vr_spss_res));
				var spss_data = watson_vr_spss_res[0].data;
				var spss_header = watson_vr_spss_res[0].header;

				for (var i=0;i<spss_data.length;i++){
					workHistory.push({
						timer: spss_data[i][spss_header.indexOf("timer")],
						class: spss_data[i][spss_header.indexOf("class")],
						score: spss_data[i][spss_header.indexOf("score")]
					});
				}
				next(null, spss_header, spss_data);
			});
		},
		function(spss_header, spss_data, next){ //spssにより作業時間の累計を出し、抜けている作業に対するdialogのcomment_idを返す
			var data_for_sum_table = {
				"tablename":"work.xlsx",
				"header":spss_header,
				"data":spss_data
			};
			// console.log("spss_analyze2:data_for_sum_table");
			// console.log(JSON.stringify(data_for_sum_table));
			bluemix_services.spss_analyze2(data_for_sum_table,"sum", function(watson_vr_spss_sum_res) {
				var spss_sum_data = watson_vr_spss_sum_res[0].data[0];
				var spss_sum_header = watson_vr_spss_sum_res[0].header;
				if (spss_sum_data != undefined){
					work_labels.push('negative');
					for (var i=0;i<work_labels.length;i++) {
						work_amount.push({
							class: work_labels[i],
							amount: spss_sum_data[spss_sum_header.indexOf(work_labels[i] + "_Sum")]
						});
					}
					var dialog_input = spss_sum_data[spss_sum_header.indexOf("comment_id")];
					if(req.body.finished == true || req.body.finished == "true"){
						dialog_input += ' finished_comment';
					}
					// console.log("spss_analyze2:next(null, dialog_input)");
					// console.log(JSON.stringify(dialog_input));
					next(null, dialog_input);
				}else{
					if(req.body.finished == true || req.body.finished == "true"){
						var dialog_input = 'finished_comment';
						next(null, dialog_input);
					}
				}
			});
		},
		function(dialog_input, next){ //dialogにidを送り、メッセージを取得する
			if(dialog_input != ""){
				bluemix_services.dialog_conversation(dialog_input,  function(conversation){
					var dialog_comment_result = conversation.response;
					// console.log('dialog_input:');
					// console.log(dialog_input);
					// console.log('dialog_comment_result:');
					// console.log(dialog_comment_result);
					next(null, dialog_comment_result);
				});
			}
		}
	],
	function(err, dialog_comment_result){ //分析結果をクライアントに返す
		if(err){
			console.log(err);
		}else{
			var dialog_comment_return = [];
			for (var i=0;i<dialog_comment_result.length; i++) {
				if (dialog_comment_result[i] != '') dialog_comment_return.push(JSON.parse(dialog_comment_result[i]));
			}

			var watson_analyzeWork_res = {
				finished: req.body.finished,
				history: workHistory,
				work_amount: work_amount,
				dialog_comment: dialog_comment_return
			}
			console.log('/api/analyzeWork:');
			console.log(watson_analyzeWork_res);
			callback(watson_analyzeWork_res);
		}

	});
}

module.exports = function() {

	/**
	* App Version
	*/
	router.post('/api/v0/factory/classifyImage', function(req, res) {
		req.body.image = req.body.image.replace(/^data:image\/jpeg+;base64,/, "");
		req.body.image = req.body.image.replace(/ /g, '+');
		var imagefile = './server/uploads/' + shortid.generate() + '.jpeg';
		fs.writeFile(imagefile, req.body.image, 'base64', function(err) {
			if (err) console.log(err);
			watson_vr(req, res, imagefile, function(watson_vr_res) {
				// watson_vr_spss(watson_vr_res,function(watson_vr_spss_res) {
				// var result_watson_vr_res = (watson_vr_res.images[0].length == 1) && (watson_vr_res.images[0].classifiers[0].length == 1) ? watson_vr_res.images[0].classifiers[0].classes : [];
				var result_watson_vr_res;
				if (watson_vr_res && watson_vr_res.images && watson_vr_res.images[0] &&
					watson_vr_res.images[0].classifiers &&
					watson_vr_res.images[0].classifiers[0])
					result_watson_vr_res = watson_vr_res.images[0].classifiers[0].classes;
					else result_watson_vr_res = [];
					var classifyImage_result = {
						// watson_vr_spss: watson_vr_spss_res,
						watson_vr: result_watson_vr_res,
						timer: req.body.timer
					};
					console.log('classifyImage_result:')
					console.log(classifyImage_result);
					res.json(classifyImage_result);
					fs.unlink(imagefile, function(err) {
						if (err) throw err;
						console.log('successfully deleted ' + imagefile);
					});
					// });
				});
			});
		});

		router.post('/api/v0/factory/analyzeWork', function(req, res) {
			watson_analyzeWork(req, res, function(watson_analyzeWork_res) {
				res.json(watson_analyzeWork_res);
			})
		});


		return {
			getRoute : function(){
				return router;
			}
		};
	};
