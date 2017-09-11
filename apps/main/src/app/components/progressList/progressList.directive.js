(function() {
  'use strict';

  angular
    .module('main')
    .directive('cogfProgressList', cogfProgressList);

  /** @ngInject */
  function cogfProgressList() {
    var directive = {
      restrict: 'E',
      templateUrl: 'app/components/progressList/progressList.html',
      scope: {
          creationDate: '=',
          pl:'=',
          wa:'='
      },
      controller: ProgressListController,
      controllerAs: 'vm',
      bindToController: true
    };

    return directive;

    /** @ngInject */
    function ProgressListController($scope,dashboardService,$timeout) {
    	var vm=this;
    	vm.pl=undefined;
    	vm.wa=undefined;
    	$scope.data={};
		dashboardService.getProgressList()
		.then(function(data){

			var filteredData=data.filter(function(e,i,a){if(e.showinlist){return e;}});
			vm.pl = filteredData;
		});
		$scope.$watch('vm.wa', function(newV,oldV){
			if(!newV){
			}else{
				vm.columnArr=vm.pl.map(function(x){return x.class});
				$scope.data=vm.wa.filter(function(x){if(vm.columnArr.indexOf(x.class)!=-1){return x;}});
				console.log($scope.data);
			}
		});
    }
  }

})();
