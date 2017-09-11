(function() {
  'use strict';

  angular
    .module('main')
    .directive('cogfPatternSummary', cogfPatternSummary);

  /** @ngInject */
  function cogfPatternSummary() {
    var directive = {
      restrict: 'E',
      templateUrl: 'app/components/patternSummary/patternsummary.html',
      scope: {
          member : '='
      },
      controller: SummaryController,
      controllerAs: 'vm',
      bindToController: true
    };

    return directive;

    /** @ngInject */
    function SummaryController($scope, $timeout, assessmentService) {
		var vm = this;
		
		vm.analyzing = true;
		vm.pattern = {};
		vm.member = undefined;
		
		vm.sunburstData = undefined;
		
		assessmentService.getPatternSunburstData()
		.then(function(data){
			$timeout(function(){
				vm.analyzing = false;
				vm.sunburstData = data;
			}, 500);
		}, function(err){
			$timeout(function(){
				vm.analyzing = false;
				vm.sunburstData = undefined;
			}, 500);
		});
    }
  }

})();
