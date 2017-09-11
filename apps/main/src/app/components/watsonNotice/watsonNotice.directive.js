(function() {
  'use strict';

  angular
    .module('main')
    .directive('cogfWatsonNotice', cogfWatsonNotice);

  /** @ngInject */
  function cogfWatsonNotice() {
    var directive = {
      restrict: 'E',
      templateUrl: 'app/components/watsonNotice/watsonNotice.html',
      scope: {
          creationDate: '=',
          wc:'='
      },
      controller: WatsonNoticeController,
      controllerAs: 'vm',
      bindToController: true
    };

    return directive;

    /** @ngInject */
    function WatsonNoticeController($scope,dashboardService,$interval,$timeout,$animate) {
		var vm = this;
		$scope.noticeList=[];
		vm.wc=undefined;
		vm.now = {"hour":"-","min":"-"};
		$scope.watsonThinking=0;
//		$scope.currentWC={};
//		$scope.currentWC.src=[];
		$scope.$watch('vm.wc', function(newV,oldV){
			if(!newV){
				$scope.watsonThinking=0;
			}else{
				var newVstr=JSON.stringify(newV);
				var oldVstr=JSON.stringify(oldV);
				if(newVstr==oldVstr){
				}else{
					$scope.watsonThinking=1;
					$timeout(function(){
						$scope.watsonThinking=0;
						var newWC={};
						var d = new Date();
//						vm.now.hour  = pad(d.getHours());
	//					vm.now.min   = pad(d.getMinutes());
						newWC.src=newV;
						newWC.id=newWC.src[0].comment_id;
//						newWC.time=d.getHours()+":"+d.getMinutes();
						newWC.time=pad(d.getHours())+":"+pad(d.getMinutes())+":"+pad(d.getSeconds());
						newWC.text=[];
						for(var i=0;i<newWC.src.length;i++){
								newWC.text.push(newWC.src[i].comment);
							}
						$scope.noticeList.unshift(newWC);
					},2000);
				}

/*
				if($scope.currentWC.src!=newV){
					$scope.watsonThinking=1;
					$timeout(function(){
						$scope.watsonThinking=0;
						var newWC={};
						var d = new Date();
//						vm.now.hour  = pad(d.getHours());
	//					vm.now.min   = pad(d.getMinutes());
						
						$scope.currentWC.src=newV;
						$scope.currentWC.time=d.getHours()+":"+d.getMinutes();
						$scope.currentWC.text="";
						for(var i=0;i<newV.length;i++){
							$scope.currentWC.text=$scope.currentWC.text+newV[i].comment+"<br>";
						}
						$scope.noticeList.unshift($scope.currentWC);
						//コメントキー処理を入れる
//	"comment_id":"no_comment","comment":"作業は順調です。"
					},2000);
				}
	*/			
	function pad(a){
		return (a<10)?'0'+a:a;
	}
			}
		});
/*
		dashboardService.getWatsonNotice()
		.then(function(data){
			$scope.watsonNotice = data.data;			
		});
		$scope.noticeList=[];		

		var mockGetNewNoticeCount=0;
		var mockNoticeListCount=0;
		$scope.mockWNData=[6,17,39,50];
		$interval(mockGetNewNotice,1000,60);

		function mockGetNewNotice(){
			if($scope.mockWNData.indexOf(mockGetNewNoticeCount)!=-1){
				$scope.watsonThinking=1;
				$timeout(function(){
					$scope.watsonThinking=0;
					$scope.noticeList.unshift($scope.watsonNotice[mockNoticeListCount]);					
					mockNoticeListCount++;
				},2000);
			}
			mockGetNewNoticeCount++;
		}

*/


    }
  }

})();
