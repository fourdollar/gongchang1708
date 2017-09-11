(function() {
  'use strict';

  angular
    .module('main')
    .service('assessmentService', assessmentService);

  /** @ngInject */
  function assessmentService($http) {
	  var getFactoryMember = function(factoryId){
		  var url = '/api/v0/factory/getmembers';
		  return $http.get(url).then(function(response) {
			  return response.data;
		  });
	  };
      var getAssessmentData = function(memberId) {
		  var url = '/api/v0/factory/members/'+memberId+'/assessment';
		  return $http.get(url).then(function(response) {
			  return response.data;
		  });
	  };
      var getPatternSunburstData = function(memberId) {
		  var url = '/api/v0/factory/sunburstdata';
		  return $http.get(url).then(function(response) {
			  return response.data;
		  });
	  };
	  var getProgressData = function(factoryId){
		  var url = '/api/v0/factory/getprogress';
		  return $http.get(url).then(function(response){
			  return response.data;
		  });
	  };
	  var getPatternTimelineData = function(memberId,patternId){
		  var url = '/api/v0/factory/patterns/timeline';
		  return $http.get(url).then(function(response){
			  return response.data;
		  });
	  };
	  return {
		  getFactoryMember : getFactoryMember,
		  getAssessmentData : getAssessmentData,
		  getPatternSunburstData : getPatternSunburstData,
		  getProgressData : getProgressData,
		  getPatternTimelineData : getPatternTimelineData
	  };
  }

})();
