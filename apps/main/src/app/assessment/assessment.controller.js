(function() {
  'use strict';

  angular
    .module('main')
    .controller('AssessmentController', AssessmentController);

  /** @ngInject */
  function AssessmentController($scope) {
	  $scope.selectedMember = undefined;
  }
})();
