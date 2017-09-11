(function() {
  'use strict';

  angular
    .module('main')
    .directive('cogfMachineImage', cogfMachineImage);

  /** @ngInject */
  function cogfMachineImage() {
    var directive = {
      restrict: 'E',
      templateUrl: 'app/components/machineImage/machineImage.html',
      scope: {
          creationDate: '='
      },
      controller: MachineImageController,
      controllerAs: 'vm',
      bindToController: true
    };

    return directive;

    /** @ngInject */
    function MachineImageController($scope) {
    }
  }

})();
