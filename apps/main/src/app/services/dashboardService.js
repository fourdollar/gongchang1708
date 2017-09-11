(function() {
  'use strict';

  angular
    .module('main')
    .service('dashboardService', dashboardService);

  /** @ngInject */
  function dashboardService($http) {
	var getProgressList = function(factoryId){
		  var url = '/api/v0/factory/getworklist';
		  return $http.get(url).then(function(response) {
			  return response.data;
		  });
	  };
	var getVideoList = function(memberId){
		var url = '/api/v0/factory/getVideos/'+memberId;
		return $http.get(url).then(function(response) {
			return response.data;
		});
	};
	var getWatsonNotice = function(factoryId){
		  var url = '/api/v0/factory/00/watsonNotice';
		  return $http.get(url).then(function(response) {
			  return response.data;
		  });
	  };
      var getPatternTimelineData = function(factoryId) {
		  var url = '/api/v0/factory/analyzework';
		  return $http.get(url).then(function(response) {
			  return response.data;
		  });
	  };
/*	  var getFactoryMember = function(factoryId){
		  var url = '/api/v0/factory/00/members';
		  return $http.get(url).then(function(response) {
			  return response.data;
		  });
	  };
      var getAssessmentData = function(memberId) {
		  var url = '/api/v0/factory/00/members/'+memberId+'/assessment';
		  return $http.get(url).then(function(response) {
			  return response.data;
		  });
	  };
      var getPatternSunburstData = function(memberId) {
		  var url = '/api/v0/factory/00/patterns/sunburst';
		  return $http.get(url).then(function(response) {
			  return response.data;
		  });
	  };
	  */
	  return {
		  getProgressList : getProgressList,
		  getVideoList : getVideoList,
		  getWatsonNotice : getWatsonNotice,
		  getPatternTimelineData : getPatternTimelineData
	  };
  }

})();
