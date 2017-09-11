var request = require('request');
var _ = require('underscore');
var watson = require('watson-developer-cloud');
var services = require('../config/SERVICES_FOR_LOCAL.json');
var credentials;
var credentials_conversation;
var bluemix = require("cfenv").getAppEnv();
var extend = require('util')._extend;
var conversation_service;
var server_settings = require('../config/server_settings.json');
var workspace_id;
var spss_env1;
var spss_env2;

/*****************************************************************************
Define Bluemix Credential Section
*****************************************************************************/
//Define Credentials for Conversatoin
//if bluemix credentials exists, then override local
credentials_conversation = services['conversation'][0].credentials;
credentials_conversation = extend({version : 'v1', version_date: '2017-05-26'}, credentials_conversation);
console.log("credentials_Conversation:")
console.log(credentials_conversation);
conversation_service = watson.conversation(credentials_conversation);

workspace_id = (process.env.ENV_WORKSPACE_ID === undefined) ? server_settings['workspace_id'] : process.env.ENV_WORKSPACE_ID;
console.log("workspace_id:")
console.log(workspace_id);

function conversation_message(params, callback){
	// Replace with the context obtained from the initial request
	console.log("conversation_message:params");
	console.log(JSON.stringify(params));
	var context;
	if (typeof params.context === "undefined") context = {};
	else context = params.context

	conversation_service.message({
		workspace_id: workspace_id,
		input: {'text': params.input},
		context: context
	},  function(err, conversation_response) {
		if (err){
			console.log(err);
			callback({});
		}else{
			console.log("###############################################")
			console.log("conversation_message:conversation_response")
			console.log(JSON.stringify(conversation_response));
			console.log("###############################################")
			var conversation_result = {
				'comment_id': conversation_response.input.text,
				'comment':conversation_response.output.text
			}
			callback(conversation_result);
		}
	});
}

/*****************************************************************************
Define Bluemix Credential Section
*****************************************************************************/
//Define Credentials
//if bluemix credentials exists, then override local
//free planのpredictive analyticsに登録できるモデルは各インスタンスにつき2つまでなので、インスタンスを使い分ける
if (typeof process.env.VCAP_SERVICES === 'undefined') {
	// SPSSのサービス名取得ロジック修正(201708)
	var pm20_1 = _.find(services['pm-20'], function(pm20) { return pm20.name.match(/Predictive.*1/)});
	var pm20_2 = _.find(services['pm-20'], function(pm20) { return pm20.name.match(/Predictive.*2/)});
	spss_env1 = { baseURL: pm20_1.credentials.url, accessKey: pm20_1.credentials.access_key };
	spss_env2 = { baseURL: pm20_2.credentials.url, accessKey: pm20_2.credentials.access_key };
} else if (bluemix.getServiceCreds(/Predictive.*1/) && bluemix.getServiceCreds(/Predictive.*2/)) {
	console.log('bluemix.getServiceCreds(/Predictive.*1/)');
	console.log(bluemix.getServiceCreds(/Predictive.*1/));
	console.log('bluemix.getServiceCreds(/Predictive.*2/)');
	console.log(bluemix.getServiceCreds(/Predictive.*2/));

	spss_env1 = { baseURL: bluemix.getServiceCreds(/Predictive.*1/).url, accessKey: bluemix.getServiceCreds(/Predictive.*1/).access_key };
	spss_env2 = { baseURL: bluemix.getServiceCreds(/Predictive.*2/).url, accessKey: bluemix.getServiceCreds(/Predictive.*2/).access_key };
} else console.log("!!!!!!!!!  Error: Setup Predictive Analytics Service !!!!!!!!!!!!")
console.log("credentials_spss1:")
console.log(spss_env1);
console.log("credentials_spss2:")
console.log(spss_env2);

var spss_analyze = function(env, data_for_analytics, context, callback) {
	if (data_for_analytics == undefined) callback({});
	else {
		var watson_vr_spss_res;
		var scoreURI = env.baseURL + '/score/' + context + '?accesskey=' + env.accessKey;
		console.log('=== SCORE ===');
		console.log('  URI  : ' + scoreURI);
		console.log(' ');
		var options = {
			uri: scoreURI,
			body: data_for_analytics,
			json: true
		};
		var watson_vr_spss_res;
		request.post(options, function(error, response, body){
			if (!error && response.statusCode == 200) {
				console.log(body);
				watson_vr_spss_res = body;
				console.log('watson_vr_spss:');
				console.log(JSON.stringify(watson_vr_spss_res));
				callback(watson_vr_spss_res);
			} else {
				console.log('error: '+ response.statusCode);
			}
		});

	}
}

module.exports = {
	conversation_message: function (input_context, input_text, callback){
		var params = _.extend(input_context, {input: input_text});
		console.log(params);
		conversation_message(params, callback);
	},
	spss_analyze1: function (data_for_analytics, context, callback){
		spss_analyze(spss_env1, data_for_analytics, context, callback);
	},
	spss_analyze2: function (data_for_analytics, context, callback){
		spss_analyze(spss_env2, data_for_analytics, context, callback);
	}

};
