(function() {
  'use strict';

  angular
    .module('main')
    .config(routerConfig);

  /** @ngInject */
  function routerConfig($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('main', {
        abtract: true,
		views : {
			'@' : {
				templateUrl: 'app/main/main.html',
				controller: 'MainController',
				controllerAs: 'main'
			}
		}
      })
      .state('main.dashboard', {
        url: '/dashboard',
		title: 'Dashboard',
		views : {
			"contentView@main" : {
				templateUrl: 'app/dashboard/dashboard.html',
				controller: 'DashboardController',
				controllerAs: 'dashboard'
			}
		}
      })
      .state('main.assessment', {
        url: '/assessment',
		title: 'Dashboard for Administrator',
		views : {
			"contentView@main" : {
				templateUrl: 'app/assessment/assessment.html',
				controller: 'AssessmentController',
				controllerAs: 'assessment'
			}
		}
      })
	  ;

    $urlRouterProvider.otherwise('/dashboard');
  }

})();
