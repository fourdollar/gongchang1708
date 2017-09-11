(function() {
  'use strict';

  angular
    .module('main')
    .directive('timelineChart', timelineChart);

  /** @ngInject */
  function timelineChart() {
    var directive = {
      restrict: 'E',
      templateUrl: 'app/components/timelineChart/timeline.html',
      scope: {
          selector: '@',
		  data    : '=',
		  columns    : '=',
		  pattern : '=',
		  selected: '=',
		  width : '@',
		  height : '@'
      },
	  link : linkFunc
    };

    return directive;

    /** @ngInject */
    function linkFunc(scope, element) {
//scope.data = {"name": "patterns","columns": [{"id": "A","name": "CPU"},{"id": "B","name": "MEM"},{"id": "C","name": "CARD"},{"id": "D","name": "POWER"},{"id": "E","name": "HDD"},{"id": "F","name": "COVER"},{"id": "G","name": "CPU_C"},{"id": "H","name": "MEM_C"}],
//"data": [{"data":[0.944764,0,0,0,0,0,0.670033,0.940247]}]};

		var data   = scope.data;
		var columns = scope.columns;
		var width  = scope.width  || 990;
		var height = scope.height || 130;
	    var color  = d3.scale.category20c();

		
		var svg = d3.select(element[0])
		.select(".timeline-chart")
		.append("svg")
		.attr("id", scope.selector)
		.attr("width", width)
		.attr("height", height);

		var barHeight = 6;
		var barMargin = 6;
		var lineWidth = 2;
		var margin = {"left":50,"top":20,"bottom":10,"right":0};
		
		var barWidth  = 6;
		
		if(scope.width) {
			barWidth = (scope.width / 990) * 6;
		}

/*setTimeout(function(){
	console.log(data);
	updateChart(data,columns);},2000);
*/
		
		function updateChart(data,columns){
			// clean first
			svg.remove();
			
			svg = d3.select(element[0])
			.select(".timeline-chart")
			.append("svg")
			.attr("id", scope.selector)
			.attr("width", width)
			.attr("height", height);
			
			var x = d3.scale.linear().domain([0, 130]).range([0, width]);
			//var y = d3.scale.linear().range([height, 0]);
			// columnsの値がない場合は描画しない(できない)
			if(!columns) return;

			var columnClasses=columns.map(function(x){return x.class});
			var y = d3.scale.ordinal()
			    .domain(columnClasses)
			    .rangePoints([0,height]);			
			var yAxis = d3.svg.axis().scale(y).tickFormat('').tickSize(0).orient("left");

			
			var g = svg.append("g");
			
			// columns
			var colClassArr = columns.map(function(x){return x.class});
			var columns = g.selectAll("g.columns")
			.data(columns)
			.enter().append("g")
			.attr("class", "columns")
			.attr("transform", function(d,i){
				return "translate(0,"+(i*(barHeight+barMargin) + margin.top)+")";
			});
			columns.append("text")
			.attr("class", "column-text")
			.attr("x", 0)
		    .attr("y", barHeight / 2)
			.attr("dy", ".35em")
			.text(function(d,i) { return d.name; });
	
			// data
//			for(var i = 0; i < data.data.history.length ; i++ ){

			if(data === undefined) return;
			console.log(data);
				var d = data;

					var bars = g.selectAll("g.bar-chart")
					.data(d)
					.enter().append("g")
//					.attr("class", "bar-chart series-"+d.name)
					.attr("class", "bar-chart")
					.attr("transform", function(d,i){
//						return "translate(" + y(d.class) + ", 0)";
						return "translate("+((i*barWidth)+margin.left)+", "+(0.74*((y(d.class)))+margin.top)+")";
//						return "translate("+margin.left+", "+(i*(barHeight+barMargin) + margin.top)+")";
					});
					
					bars.append("rect")
				    .attr("class", "bar")
				    .attr("width", barWidth)
					.attr("y", -2)
				    .attr("height", barHeight+4);
//			}
			

		}
		
		scope.$watch('columns', function(newValue, oldValue) {
			if(newValue !== undefined) {
				updateChart(scope.data,newValue);
			}
		});
		scope.$watch('data', function(newValue, oldValue) {
			if(newValue !== undefined) {
				updateChart(newValue,scope.columns);
			}
		});

    }
  }

})();
