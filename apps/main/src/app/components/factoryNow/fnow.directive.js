(function() {
  'use strict';

  angular
    .module('main')
    .directive('cogfFactoryNow', cogfFactoryNow);

  /** @ngInject */
  function cogfFactoryNow() {
    var directive = {
      restrict: 'E',
      templateUrl: 'app/components/factoryNow/fnow.html',
      scope: {
          member : '='
      },
      controller: FNowController,
      controllerAs: 'vm',
      bindToController: true
    };

    return directive;

    /** @ngInject */
    function FNowController($scope, assessmentService) {
        var vm = this;
		$scope.select = function(index){
			if($scope.isSelected(index) === true) {
				$scope.selectedMember = undefined;
				vm.member = undefined;
			} else {
				$scope.selectedMember = index;
				vm.member = $scope.factorynow.members[index];
			}
		}
		$scope.isSelected = function(index){
			return $scope.selectedMember == index;
		}
		
		$scope.orders = [
			{"key":"Performance"}, {"key":"Total Working Time"}
		];
		$scope.factorynow = {
	  		"order": "",
	  		"members" : []
	  	};
		
		vm.loading = true;
		assessmentService.getFactoryMember()
		.then(function(data){
			vm.loading = false;
			$scope.factorynow.members = data.members;
		});
    }
  }

})();
