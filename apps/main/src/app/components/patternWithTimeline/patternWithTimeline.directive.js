(function() {
  'use strict';

  angular
    .module('main')
    .directive('cogfPatternTimeline', cogfPatternTimeline);

  /** @ngInject */
  function cogfPatternTimeline() {
    var directive = {
      restrict: 'E',
      templateUrl: 'app/components/patternWithTimeline/patternWithTimeline.html',
      scope: {
          creationDate: '=',
          wh: '=',
          pl: '='
              },
      controller: PatternTimelineController,
      controllerAs: 'vm',
      bindToController: true,
    };

    return directive;

    /** @ngInject */
    function PatternTimelineController($scope,$timeout,dashboardService) {
		var vm = this;
		vm.wh = undefined;
		vm.pl = undefined;
		$scope.data=undefined;
		$scope.columns=undefined;
		$scope.colClassArr=undefined;

		$scope.$watch('vm.pl', function(newV,oldV){
			if(!newV){
			}else{
				$scope.columns=vm.pl;
				$scope.colClassArr=$scope.columns.map(function(x){return x.class;});
			}
		});
		$scope.$watch('vm.wh', function(newV,oldV){
			if(!newV){
			}else{
				$scope.data=vm.wh.filter(function(e,i,a){if($scope.colClassArr.indexOf(e.class)!=-1){return e;}});
			}
		});
/*
console.log("A");		
		dashboardService.getProgressList()
		.then(function(data){
				$scope.columns = data;
		}, function(err){
				$scope.columns = undefined;
		});

		dashboardService.getPatternTimelineData()
		.then(function(tldata){
				$scope.timelineData = tldata;
		}, function(tlerr){
				$scope.timelineData = undefined;
		});
*/

    }
  }

})();
