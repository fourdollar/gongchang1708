(function() {
  'use strict';

  angular
    .module('main')
    .controller('DashboardController', DashboardController);

  /** @ngInject */
  function DashboardController($scope, $rootScope) {
     $scope.watsonComment = undefined;
     $scope.progressList=undefined;
     $scope.workHisotry=undefined;
     $scope.workAmount=undefined;
	 $scope.selectedMember=$rootScope.selectedMember;
  }
})();
