(function() {
  'use strict';

  angular
    .module('main')
    .directive('cogfTargetInfo', cogfTargetInfo);

  /** @ngInject */
  function cogfTargetInfo() {
    var directive = {
      restrict: 'E',
      templateUrl: 'app/components/targetInfo/targetInfo.html',
      scope: {
          creationDate: '='
      },
      controller: TargetInfoController,
      controllerAs: 'vm',
      bindToController: true
    };

    return directive;

    /** @ngInject */
    function TargetInfoController($scope) {
    }
  }

})();
