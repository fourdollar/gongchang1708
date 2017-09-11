(function() {
  'use strict';

  angular
    .module('main')
    .directive('patternBox', patternBox);

  /** @ngInject */
  function patternBox() {
    var directive = {
      restrict: 'E',
      templateUrl: 'app/components/patternBox/patternbox.html',
      scope: {
          pattern : '=',
		  selectData: '='
      },
      controller: BoxController,
      controllerAs: 'vm',
      bindToController: true
    };

    return directive;

    /** @ngInject */
    function BoxController($scope, dashboardService, assessmentService) {
		var vm = this;
		
		vm.pattern = {
			"process": {
				"name" : undefined,
				"img": undefined
			},
			"member" : {
				"face": undefined,
				"name": undefined
			}
		};
		
		var members = {};
		assessmentService.getFactoryMember()
		.then(function(data){
			members = data.members;
		});
		
		$scope.$watch('vm.selectData', function(newValue, oldValue) {
			if(newValue !== undefined) {
				
				var d    = newValue;
				var id   = (d.children ? d : d.parent).id;
				var name = (d.children ? d : d.parent).name;
				var process = (d.children ? 
					((d.parent.name == "patterns") ? d : d.parent):d.parent.parent).name;
				var processLowerCase = process.toLowerCase();
				
				if(!id) { // top level item
					vm.pattern = {
						"process" : {
							"name"  : process,
							"img":processLowerCase,
							"total" : d.value,
							"percentage" : Math.round(d.value/d.parent.value*100)
						},
						"member" : {
							"face" : undefined,
							"name" : name
						}
					};
				} else {
					var face = "";
					for(var i = 0;i < members.length;i++){
						if(members[i].id == id) {
							face = members[i].face;
						}
					}
					vm.pattern = {
						"process" : {
							"name"  : process,
							"img":processLowerCase,
							"total" : d.value,
							"percentage" : Math.round(d.value/d.parent.value*100)
						},
						"member" : {
							"face" : face,
							"name" : name
						}
					};
					
					// member pattern data
					assessmentService.getPatternTimelineData()
					.then(function(data){
						// work history
						vm.workHistory = data.data;
					});
				}
			}
		});
		
		
		// progress lsit for timeline
		dashboardService.getProgressList()
		.then(function(data){
			var filteredData = data.filter(function(e,i,a){if(e.showinlist){return e;}});
			vm.progressList = filteredData;
		});
		
		// work history
		vm.workHistory = [];
    }
  }

})();
