var express = require('express')
, router = express.Router();
var extend = require('util')._extend;
var __ = require('lodash');
var _ = require('underscore');
var memberlist = require('../data/assessment/members.json');
var workstandard = require('../data/assessment/standard.json');
var workstandard_id = _.map(workstandard.standard_work_amount, function(data_temp) {return data_temp.id});
var worklist = require('../data/patterns/worklist.json');
var fs = require('fs');
var serverdata = 'server/data'
var request = require('request');
var async = require('async');
var bluemix_services = require('./bluemix_services.js');

var data_for_assessment_base = _.map(workstandard_id, function(map_data_temp){
	var find_classname = _.find(worklist.data,function(find_data_temp){return find_data_temp.id == map_data_temp;});
	var find_standard = _.find(workstandard.standard_work_amount,function(find_data_temp){return find_data_temp.id == map_data_temp;});
	var find_deviation = _.find(workstandard.deviation_work_amount,function(find_data_temp){return find_data_temp.id == map_data_temp;});
	return [find_classname.class, find_standard.timer, find_deviation.timer];

});

var data_assessment_header = ["class", "Mean", "Sdev","User"];

var analyze_worktime = function (req, res, callback){
	var memberId  = req.params.memberId;
	var resdata = JSON.parse(fs.readFileSync(serverdata+'/assessment/'+memberId+'.json','utf8'));
	var data_for_assessment = __.cloneDeep(data_for_assessment_base);
	console.log(data_for_assessment, data_for_assessment_base);
	for(var i=0;i<workstandard_id.length;i++){
		var find_usertimer = _.find(resdata.work_amount,function(find_data_temp){return find_data_temp.id == workstandard_id[i];})
		if(find_usertimer != undefined){
			data_for_assessment[i].push(find_usertimer.timer);
		}else{
			data_for_assessment[i].push(0);
		}

	}

	var data_for_assessment_table = {
		"tablename":"mean_dev.xlsx",
		"header":data_assessment_header,
		"data":data_for_assessment
	};
	console.log(data_for_assessment_table);

	async.waterfall([
		function (next){
			//spssで個人と全体とを比較
			bluemix_services.spss_analyze2(data_for_assessment_table,"assessment", function(watson_vr_spss_res) {
				var spss_assessment_data = watson_vr_spss_res[0].data;
				var spss_assessment_header = watson_vr_spss_res[0].header;
				var dialog_input = "";
				for (var i=0;i<spss_assessment_data.length;i++){
					dialog_input += spss_assessment_data[i][spss_assessment_header.indexOf("comment_id")];
				}

				var name_values = [];

				_.each(spss_assessment_data, function(data_temp) {
					if(data_temp[spss_assessment_header.indexOf("timeover_flag")] == 1){
						var spss_data_class = data_temp[spss_assessment_header.indexOf("class")];
						if(spss_data_class == "cpu" || spss_data_class == "mem"){
							spss_data_class += "_only";
						}
						name_values.push({
							name: "overtime_" + spss_data_class + "_value",
							value: data_temp[spss_assessment_header.indexOf("timeover")]
						});
					}
				});
				next(null, name_values, dialog_input);
			});
		},
		function(name_values, dialog_input, next){
			//時間がかかっている作業のみDialogのプロファイルに時間を設定
			if(name_values.length == 0){
				dialog_input += " no_overtime";
			}

			// Conversation 対応
			console.log("###############################");
			console.log("Conversation呼び出し");
			console.log(JSON.stringify(name_values));
			console.log(JSON.stringify(dialog_input));
			console.log("###############################");

			var conversation_context = [];
			var temp_name = [];
			var temp_value = [];
			_.each(name_values, function(temp_name_value, index){
				temp_name.push(temp_name_value.name);
				temp_value.push(temp_name_value.value);
			})
			conversation_context = _.object(temp_name,temp_value);
			var conversation_params = {
				"context": conversation_context
			}

			bluemix_services.conversation_message(conversation_params, dialog_input,  function(conversation_message_result){
				console.log("###############################");
				console.log("conversation_message_result:");
				console.log(JSON.stringify(conversation_params));
				console.log(JSON.stringify(conversation_message_result));
				console.log(JSON.stringify(conversation_message_result.comment));

				next(null, conversation_message_result.comment);
			});
		}
	],function(err, dialog_comment){
		var standard_user_data = _.extend(workstandard, resdata);
		dialog_comment = _.filter(dialog_comment, function(com){return com != "";});
		standard_user_data = _.extend(standard_user_data, {dialog_summary: dialog_comment[0], dialog_detail: dialog_comment.slice(1)});
		callback(standard_user_data);
	});
};

module.exports = function() {


	/*****************************************************************************
	Get Factory Members
	*****************************************************************************/
	router.get('/api/v0/factory/getmembers', function(req,res){
		res.json(memberlist);
	});

	/*****************************************************************************
	Get Member Assessment Data
	*****************************************************************************/
	// require: memberId
	router.get('/api/v0/factory/members/:memberId/assessment', function(req,res){
		var memberId  = req.params.memberId;


		try{
			analyze_worktime(req, res, function(data){
				var resdata = extend(data, workstandard);

				var standardRes = workstandard;
				// merge assessment data
				resdata['data'] = {
					"columns" : [],
					"data" :[
						{
							"name": "standard",
							"type": "bar",
							"data":[]
						},
						{
							"name": "my",
							"type": "line",
							"data":[]
						}
					]
				};
				var index = {};
				for(var i = 0;i < standardRes['standard_work_amount'].length;i ++){
					resdata['data']['columns'].push({
						"id"  : standardRes['standard_work_amount'][i].id,
						"name": standardRes['standard_work_amount'][i].name
					});
					resdata['data']['data'][0]['data'].push(standardRes['standard_work_amount'][i].timer);
					index[standardRes['standard_work_amount'][i].id] = i;
				}
				for(var i = 0;i < resdata.work_amount.length ;i ++){
					var dataIdx = index[resdata.work_amount[i].id];
					resdata['data']['data'][1]['data'][dataIdx] = resdata.work_amount[i].timer;
				}
				res.json(resdata);
				//res.json(data);
			});


		} catch(e){
			res.status(404);
			res.json({"message":"Error to access data. Check request parameters."});
		}
	});

	/*****************************************************************************
	Get Sunburst Data
	*****************************************************************************/
	router.get('/api/v0/factory/sunburstdata', function(req,res){
		var resdata = JSON.parse(fs.readFileSync(serverdata+'/patterns/sunburstdata.json','utf8'));
		res.json(resdata);
	});

	/*****************************************************************************
	Get Timeline
	*****************************************************************************/
	router.get('/api/v0/factory/patterns/timeline', function(req,res){
		var resdata = JSON.parse(fs.readFileSync(serverdata+'/patterns/timeline.json','utf8'));
		res.json(resdata);
	});


	/*****************************************************************************
	Get Work List
	*****************************************************************************/
	router.get('/api/v0/factory/getworklist', function(req,res){
		res.json(worklist.data);
	});

	/*****************************************************************************
	Get Progress Data
	*****************************************************************************/
	router.get('/api/v0/factory/getprogress', function(req,res){
		try{
			var resdata = JSON.parse(fs.readFileSync(serverdata+'/progress/progress.json','utf8')).data;
			res.json(resdata);
		} catch(e){
			res.status(404);
			res.json({"message":"Error to access data. Check request parameters."});
		}
	});

	/*****************************************************************************
	Get Video List
	*****************************************************************************/
	// require: memberId
	router.get('/api/v0/factory/getVideos/:memberId/', function(req,res){
		var memberId = req.params.memberId;
		var member_temp = _.find(memberlist['members'], function(member) { return member.id == memberId; });
		var membervideo = (member_temp != undefined) ? member_temp.video : [];
		res.json(membervideo);
	});

	return {
		getRoute : function(){
			return router;
		}
	};
};
