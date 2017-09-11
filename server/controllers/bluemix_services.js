var request = require('request');
var _ = require('underscore');
var watson = require('watson-developer-cloud');
var services = require('../config/SERVICES_FOR_LOCAL.json');
var credentials;
var bluemix = require("cfenv").getAppEnv();
var extend = require('util')._extend;
var dialog_service;
var server_settings = require('../config/server_settings.json');
var dialog_id;
var dialog_params = {};
var spss_env1;
var spss_env2;

/*****************************************************************************
Define Bluemix Credential Section
*****************************************************************************/
//Define Credentials
//if bluemix credentials exists, then override local
credentials = services['dialog'][0].credentials;
credentials = extend({version : 'v1'}, credentials);
console.log("credentials_Dialog:")
console.log(credentials);
dialog_service = watson.dialog(credentials);

dialog_id = (process.env.ENV_DIALOG_ID === undefined) ? server_settings['dialog_id'] : process.env.ENV_DIALOG_ID;
console.log("dialog_id:")
console.log(dialog_id);


function dialog_conversation(params, callback){
	dialog_service.conversation(params, function(err, conversation) {
		  if (err){
			    console.log(err);
			    callback({});
		  }else{
			  callback(conversation);
		  }
		});
}

function dialog_updateProfile(params, callback){
	dialog_service.updateProfile(params, function(err, result){
		  if (err){
			    console.log(err);
			    callback({});
		  }else{
			  console.log(result);
			  callback(result);
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
	spss_env1 = { baseURL: services['pm-20'][0].credentials.url, accessKey: services['pm-20'][0].credentials.access_key };
	spss_env2 = { baseURL: services['pm-20'][1].credentials.url, accessKey: services['pm-20'][1].credentials.access_key };
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
		dialog_conversation: function (input, callback){
			var params = _.extend(dialog_params, {input: input});
			console.log(params);
			dialog_conversation(params, callback);
		},
		dialog_updateProfile: function (name_values, callback){
			var params = _.extend({name_values: name_values}, dialog_params);
			console.log(params);
			dialog_updateProfile(params, callback);
		},
		spss_analyze1: function (data_for_analytics, context, callback){
			spss_analyze(spss_env1, data_for_analytics, context, callback);
		},
		spss_analyze2: function (data_for_analytics, context, callback){
			spss_analyze(spss_env2, data_for_analytics, context, callback);
		},
		first_dialog : function(callback){
			dialog_conversation({dialog_id: dialog_id}, function(conversation){
				dialog_params = {
						conversation_id: conversation.conversation_id,
						client_id: conversation.client_id,
						dialog_id: dialog_id
				};
				console.log("Dialog is ready");
				console.log(dialog_params);
				callback();
			});
		}

};