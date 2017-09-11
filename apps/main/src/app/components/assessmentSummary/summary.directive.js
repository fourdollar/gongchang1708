(function() {
  'use strict';

  angular
    .module('main')
    .directive('cogfAssessmentSummary', cogfAssessmentSummary);

  /** @ngInject */
  function cogfAssessmentSummary() {
    var directive = {
      restrict: 'E',
      templateUrl: 'app/components/assessmentSummary/summary.html',
      scope: {
          creationDate: '='
      },
      controller: SummaryController,
      controllerAs: 'vm',
      bindToController: true
    };

    return directive;

    /** @ngInject */
    function SummaryController($scope, assessmentService) {
		assessmentService.getProgressData()
		.then(function(data){
			$scope.assesmentSummary = data;
		});
		$scope.assesmentSummary = [];
    }
  }

})();
