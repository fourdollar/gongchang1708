(function() {
  'use strict';

  angular
    .module('main')
    .directive('acmeNavbar', acmeNavbar);

  /** @ngInject */
  function acmeNavbar() {
    var directive = {
      restrict: 'E',
      templateUrl: 'app/components/navbar/navbar.html',
      scope: {
          creationDate: '='
      },
      controller: NavbarController,
      controllerAs: 'vm',
      bindToController: true
    };

    return directive;
	
	
    /** @ngInject */
    function NavbarController($scope, $interval, $state, $rootScope) {
		var weekStr  = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
		var monthStr = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
	
		var vm = this;
		
		vm.count = 0;
		vm.now = {"day":"-","month":"-","date":"-","hour":"-","min":"-"};
		$interval(function(){
			var d = new Date();
			vm.now.day   = weekStr[d.getDay()];
			vm.now.month = monthStr[d.getMonth()];
			vm.now.date  = pad(d.getDate());
			vm.now.hour  = pad(d.getHours());
			vm.now.min   = pad(d.getMinutes());
			vm.count ++;
		}, 500);
		
		
		// page title
		vm.pagetitle = $state.current.title;
		$rootScope.$on('$stateChangeSuccess', 
		function(event, toState){
			vm.pagetitle = toState.title;
		});
    }
	
	function pad(a){
		return (a<10)?'0'+a:a;
	}
  }

})();
