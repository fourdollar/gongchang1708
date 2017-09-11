(function() {
  'use strict';

  angular
    .module('main')
    .directive('cogfPersonAnalyzedSummary', cogfPersonAnalyzedSummary);

  /** @ngInject */
  function cogfPersonAnalyzedSummary() {
    var directive = {
      restrict: 'E',
      templateUrl: 'app/components/personAnalyzedSummary/personsummary.html',
      scope: {
          member : '='
      },
      controller: SummaryController,
      controllerAs: 'vm',
      bindToController: true
    };

    return directive;

    /** @ngInject */
    function SummaryController($scope, $timeout, $log, assessmentService) {
		var vm = this;
		vm.analyzing = true;
		
		$scope.$watch('vm.member', function(newV,oldV){
			vm.analyzing = true;
		
			if(!newV){
				vm.analyzing = false;
			}
			else {
				assessmentService.getAssessmentData(vm.member.id)
				.then(function(data){
					$timeout(function(){
						vm.analyzing = false;
						$log.debug('assessment data ' , data);
						vm.member.assessment = data;
					}, 500);
				}, function(err){
					$timeout(function(){
						vm.analyzing = false
						vm.member.assessment = {
							"name" : vm.member.name,
							"summary" : "No data found.",
							"description" : "",
							"data":[]
						};
						$log.debug('error ' , err);
					}, 500);
				});
			}
		});
    }
  }

})();
