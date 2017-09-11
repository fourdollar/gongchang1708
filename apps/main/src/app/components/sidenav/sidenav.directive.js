(function() {
  'use strict';

  angular
    .module('main')
    .directive('cogfSidenav', cogfSidenav);

  /** @ngInject */
  function cogfSidenav() {
    var directive = {
      restrict: 'E',
      templateUrl: 'app/components/sidenav/sidenav.html',
      scope: {
          creationDate: '='
      },
      controller: SideNavController,
      controllerAs: 'vm',
      bindToController: true
    };

    return directive;

    /** @ngInject */
    function SideNavController($scope, $state, $rootScope, $mdMedia, $mdDialog, $templateCache) {
		
		$scope.customFullscreen = $mdMedia('xs') || $mdMedia('sm');
		
		$scope.toggleMode = function(ev){
			var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'))  && $scope.customFullscreen;
			$mdDialog.show({
				controller: DialogController,
				templateUrl: 'app/components/sidenav/userSelection.dialog.tmpl.html',
				parent: angular.element(document.body),
				targetEvent: ev,
				clickOutsideToClose:true,
				fullscreen: useFullScreen
			})
			.then(function(answer) {
				$scope.user = answer;
				stateByUser(answer);
			}, function() {
			});
		};
		
		$rootScope.$on('$stateChangeSuccess', 
		function(event, toState){
			stateUser(toState);	
		});
		
		$scope.user = {};
		function stateUser(current){ /// default state user
			if(current.name == "main.dashboard") {
				$scope.user = {
					"name" : "Akifumi Wataya",
					"id"   : "00001",
					"face": "akifumi_wataya.jpg"
				};
			} else if(current.name == "main.assessment"){
				$scope.user = {
					"name" : "Yasumasa Maruta",
					"id"   : "ADM01",
					"face" : "yasumasa_maruta.jpg",
					"admin":true
				};
			}
			$scope.state = current;
		}
		function stateByUser(user){ // set state by user selection
			if(user.admin === true) {
				$scope.state = {"name":"main.assessment"};
				$state.go("main.assessment");
			} else {
				$scope.state = {"name":"main.dashboard"};
				$state.go("main.dashboard");
			}
		}
		
		stateUser($state.current);
		
		$scope.isSelected = function(){
			//console.log(this);
		};
		
		$scope.$watch('user', function(newV,oldV) {
			$rootScope.selectedMember = newV;	
		});
		
		
		function DialogController($scope, $mdDialog, assessmentService) {
			assessmentService.getFactoryMember()
			.then(function(data){
				data.members.push({
					"name" : "Yasumasa Maruta",
					"id"   : "ADM01",
					"face": "yasumasa_maruta.jpg",
					"admin":true
				});
				$scope.users = data.members;	
			});
			
			$scope.hide = function() {
				$mdDialog.hide();
			};
			$scope.cancel = function() {
				$mdDialog.cancel();
			};
			$scope.answer = function(answer) {
				$mdDialog.hide(answer);
			};
		}

    }
  }

})();
