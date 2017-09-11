(function() {
  'use strict';

  angular
    .module('main')
    .directive('cogfConsoleMessage', cogfConsoleMessage);

  /** @ngInject */
  function cogfConsoleMessage() {
    var directive = {
      restrict: 'E',
      templateUrl: 'app/components/consoleAndMessage/console.html',
      scope: {
          creationDate: '=',
          wh: '=',
          wc: '='
      },
      controller: ConsoleController,
      controllerAs: 'vm',
      bindToController: true
    };

    return directive;

    /** @ngInject */
    function ConsoleController($scope) {
    	var vm=this;
		vm.whList=[];
		vm.wcList=[];
		$scope.$watch('vm.wh', function(newV,oldV){
			if(!newV){
			}else{
				var newWH={};
				var d = new Date();
//				vm.now.hour  = pad(d.getHours());
//				vm.now.min   = pad(d.getMinutes());
				if(oldV && oldV.length){
					newWH.src=newV.slice(oldV.length);
				}else{
					newWH.src=newV;
				}
//				newWH.time=d.getHours()+":"+d.getMinutes();
				newWH.time=pad(d.getHours())+":"+pad(d.getMinutes())+":"+pad(d.getSeconds());
				newWH.text=[];
				for(var i=0;i<newWH.src.length;i++){
//						newWH.text.unshift(newWH.time+"　["+newWH.src[i].timer+"]　RECOGNIZED as "+newWH.src[i].class+" - confidence:"+newWH.src[i].score);
						newWH.text.unshift({"time":newWH.time,"timer":newWH.src[i].timer,"class":newWH.src[i].class,"score":newWH.src[i].score});
					}
				vm.whList.unshift(newWH);
			};
		});
		$scope.$watch('vm.wc', function(newV,oldV){
			if(!newV){
			}else{
				var newWC={};
				var d = new Date();
				newWC.src=newV;
				newWC.time=pad(d.getHours())+":"+pad(d.getMinutes())+":"+pad(d.getSeconds());
				newWC.text=[];
				for(var i=0;i<newWC.src.length;i++){
						newWC.text.push(newWC.src[i].comment);
					}
				vm.wcList.unshift(newWC);
			};
		});
	function pad(a){
		return (a<10)?'0'+a:a;
	}
    }
  }

})();
