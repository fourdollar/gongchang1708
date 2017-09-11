(function() {
  'use strict';

  angular
    .module('main')
    .directive('cogfCapturingData', cogfCapturingData);

  /** @ngInject */
  function cogfCapturingData() {
    var directive = {
      restrict: 'E',
      templateUrl: 'app/components/capturingData/capturingData.html',
      scope: {
          creationDate: '=',
          wc:'=',
          wh:'=',
          wa:'=',
		  selectedMember:'='
      },
      controller: CapturingDataController,
      controllerAs: 'vm',
      bindToController: true
    };

    return directive;

    /** @ngInject */
    function CapturingDataController($log, $scope, $rootScope, dashboardService,$interval,$sce){		
		var vm=this;
		vm.wc=undefined;
		vm.wh=undefined;
		vm.wa=undefined;
		vm.onPlayerReady = function(API) {vm.API = API;};
		$scope.images=[];
		$scope.n_cnt=0;
		$scope.watson_vr_results = [];
		$scope.video_timer=undefined;
		$scope.analyze_timer=undefined;
		$scope.videoList = [];
		$rootScope.$watch('selectedMember', function(newV, oldV){
			if(newV){
				dashboardService.getVideoList(newV.id)
				.then(function(data){
					$scope.videoList = data;
					console.log($scope.videoList);
					
					$scope.sourcesArr=[];
					for(var i=0; i<$scope.videoList.length;i++){
						$scope.sourcesArr.push([
							{src:"./assets/video/"+$scope.videoList[i]["filename"],type:"video/mp4"}
						]);
					}
				});
			}
		});
		/*
		$scope.videoList=[{"name": "good2" ,"filename": "Nishimura_Good2.mp4"},{"name": "手戻り" ,"filename": "Wataya_Bad(内部カバー入れ忘れで手戻り).mp4"}];
		*/
		$scope.sourcesArr=[];
		for(var i=0; i<$scope.videoList.length;i++){
			$scope.sourcesArr.push([
				{src:"./assets/video/"+$scope.videoList[i]["filename"],type:"video/mp4"}
			]);
		}
		vm.config={}; //sources:$scope.sourcesArr[0]};
//		$scope.videoSrc="./assets/temp/"+$scope.videoList[0]["filename"];
		$scope.videoSrc=undefined;
		$scope.camNo=undefined;
		
		// video ready and then play video automatically
		$scope.selectVideo = function(index){
			$scope.stopVideo(); // 動画が停止するのを待ってから、次の動画を再生する
			var waitStopCompleteHandle = $interval(function(){
				if(vm.API.isReady===true){
					$interval.cancel(waitStopCompleteHandle);
					
					$scope.camNo=index;
					vm.config.sources=$scope.sourcesArr[index];
					
					// cancel interval
					$interval.cancel($scope.video_timer);
					$interval.cancel($scope.analyze_timer);
				}
			}, 1000);
		};
		var nowVideoLoading = undefined; /// 重複してコールされるのを防ぐ...
		$scope.onChangeSource = function($source){
			if(nowVideoLoading !== undefined) return;
			nowVideoLoading = $source;
			setTimeout(function(){ 
				/// 動画再生時に、これまでに蓄積されたWorkHistoryはリセットする
				$scope.watson_vr_results = [];
				
				/// delay for play ... 動画がロードされる前にplayが動いてしまうのを防ぐため..
				$scope.playVideo();
				// set interval
				$scope.video_timer =  $interval($scope.video2Cvs,1000);
				$scope.analyze_timer = $interval(function(){$scope.analyzeWork(false);},3000);
				
				nowVideoLoading = undefined;
			}, 1000);
		};
		$scope.pauseVideo=function(){
			vm.API.pause();
		}
		$scope.playVideo=function(){
			vm.API.play();
		}
		$scope.stopVideo=function(){
			vm.API.stop();
		}
		
	$scope.video2Cvs=function() {
	 // キャンバスの作成
    var cvs = document.getElementById("cv");
    var ctx = cvs.getContext("2d");
	var vleMedia=document.getElementById("disVideoMedia");
    var vle = vleMedia.getElementsByTagName("video")[0];
    // canvasに動画のフレームを描画
    ctx.drawImage(vle, 0, 0, cvs.width, cvs.height);
    var base64 = cvs.toDataURL('image/jpeg', 1.0);
    var image = new Image(80, 45);
        image.src = base64;
	    image.id = "image" + $scope.n_cnt;
    var data = {
      image: base64.replace(/^.*,/, '')
    };
    $scope.images.push(base64);
    $scope.classifyImage($scope.n_cnt);
	$scope.n_cnt++;
		};


  $scope.classifyImage=function(i) {
    var data = {
      // classifierids : classifier_ids,
      image: $scope.images[i].replace(/^.*,/, ''),
      timer: i
    };
    $.post("/api/v0/factory/classifyImage", data, function(response) {
      console.log(response);
      var timer = response.timer;

      if (response.watson_vr) {
        $scope.watson_vr_results.push({
          timer: timer,
          classes: response.watson_vr
        })
      }
    });
  };
  
$scope.analyzeWork=function(finished) {
    // console.log(watson_vr_results);
    var data = {
      finished: finished,
      history: $scope.watson_vr_results
    }
    $.post("/api/v0/factory/analyzeWork", data, function(response) {
      console.log(response);
		vm.wh=response.history;
		vm.wa=response.work_amount;
		if(response.finished==="true"){
					for(var i = 0;i < response.history.length ;i ++ ){
						console.log(JSON.stringify(response.history[i]));
					}
				}
      if (response.dialog_comment.length) {
		vm.wc=response.dialog_comment;
      }
    });

  };
$scope.testfunc=function(){
	vm.wa=[{"class":"cpu","amount":6},{"class":"mem","amount":5},{"class":"card","amount":0},{"class":"power","amount":1},{"class":"hdd","amount":0},{"class":"cover","amount":7},{"class":"cpu_cover","amount":0},{"class":"mem_cover","amount":0},{"class":"fan","amount":0},{"class":"negative","amount":3}];
}

  $scope.dialogComment=function(dialog_comment_temp) {
  	if(dialog_comment_temp.length){
		vm.wc=dialog_comment_temp;
  	}  	
//    $('#dialogComment').html(JSON.stringify(dialog_comment_temp));
  };
  
		vm.onComplete=function(){
			console.log("done!!");
			setTimeout(function(){ // wait 10 sec for receving last frame (by VR)
				$interval.cancel($scope.video_timer);
				$interval.cancel($scope.analyze_timer);
				$scope.analyzeWork(true);
			}, 3000);
		}

	}

  }
})();
