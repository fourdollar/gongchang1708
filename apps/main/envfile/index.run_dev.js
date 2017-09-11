(function() {
  'use strict';

  angular
    .module('main')
    .run(runBlock);

  /** @ngInject */
  function runBlock($log, $httpBackend) {
	  
	  $log.debug(" =====================================\n"+
	             "\n"+
                 "   Cognitive Factory Demo App @2016\n"+
	             "        - development mode -\n"+
	             "\n"+
                 " =====================================\n");
	
	$log.debug('load backend mocks');
	backend($httpBackend);
	
    $log.debug('runBlock end');
  }
  
  /** backend mock for local development */
  /** this sync xml http request is deprecated... but we use this solution..
      because we don't have another solution for gettting json as synced json object */
  function getjson(url){
	   var req = new XMLHttpRequest();
	   req.open('GET',url ,false);
	   req.onerror = function(){}
	   req.send(null);
	   return req;
  }
  function jsonreq(url){
	  var req = getjson(url);
	  return [req.status, req.response, {}];
  }
  /** backend mock for local development */
  function backend($httpBackend){
	  
	  $httpBackend.when('GET', /\/api\/v0\/factory\/members\/(.+)\/assessment/
	  , undefined, undefined, ['memberId']).respond(
		   function(method, url, data, headers, params){
			   var standard = getjson('/mock/data/assessment/standard.json');
			   var standardRes = JSON.parse(standard.response);
			   var member   = getjson('/mock/data/assessment/'+params.memberId+'.json');
			   var memberRes = JSON.parse(member.response);
			   // merge assessment data
			   memberRes['data'] = {
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
				   memberRes['data']['columns'].push({
					   "id"  : standardRes['standard_work_amount'][i].id,
					   "name": standardRes['standard_work_amount'][i].name
				   });
				   memberRes['data']['data'][0]['data'].push(standardRes['standard_work_amount'][i].timer);
				   index[standardRes['standard_work_amount'][i].id] = i;
			   }
			   for(var i = 0;i < memberRes.work_amount.length ; i ++ ){
				   var dataIdx = index[memberRes.work_amount[i].id];
				   memberRes['data']['data'][1]['data'][dataIdx] = memberRes.work_amount[i].timer;
			   }
			   
			   return [member.status, memberRes, {}];
		   }
	  );
	  $httpBackend.when('GET', /\/api\/v0\/factory\/getmembers/
	  , undefined, undefined, []).respond(
		  function(method, url, data, headers, params){
			  return jsonreq('/mock/data/factory/members.json');
		  }
	  );
	  $httpBackend.when('GET', /\/api\/v0\/factory\/sunburstdata/
	  , undefined, undefined, ['factoryId']).respond(
		  function(method, url, data, headers, params){
			  return jsonreq('/mock/data/patterns/sunburst.json');
		  }
	  );
	  $httpBackend.when('GET', /\/api\/v0\/factory\/getworklist/
	  , undefined, undefined, ['factoryId']).respond(
		  function(method, url, data, headers, params){
			  return jsonreq('/mock/data/progress/list.json');
		  }
	  );	  
	  $httpBackend.when('GET', /\/api\/v0\/factory\/(.+)\/members\/(.+)\/videoList/
	  , undefined, undefined, ['factoryId', 'memberId']).respond(
		  function(method, url, data, headers, params){
			  return jsonreq('/mock/data/video/'+params.memberId+'.json');
		  }
	  );	  
	  $httpBackend.when('GET', /\/api\/v0\/factory\/(.+)\/watsonNotice/
	  , undefined, undefined, ['factoryId']).respond(
		  function(method, url, data, headers, params){
			  return jsonreq('/mock/data/watson/notice01.json');
		  }
	  );
	  $httpBackend.when('GET', /\/api\/v0\/factory\/analyzework/
	  , undefined, undefined, ['factoryId']).respond(
		  function(method, url, data, headers, params){
			  return jsonreq('/mock/data/patterns/timeline.json');
		  }
	  );	  
	  
	  // passThrough
	  $httpBackend.whenGET(/.*/).passThrough();
	  $httpBackend.whenPOST(/.*/).passThrough();
	  $httpBackend.whenDELETE(/.*/).passThrough();
	  $httpBackend.whenPUT(/.*/).passThrough();
  }

})();
