(function() {
  'use strict';

  angular
    .module('main')
    .run(runBlock);

  /** @ngInject */
  function runBlock($log) {
	  
	  $log.debug(" =====================================\n"+
	             "\n"+
                 "   Cognitive Factory Demo App @2016\n"+
	             "\n"+
                 " =====================================\n");
	
    $log.debug('runBlock end');
  }
})();
