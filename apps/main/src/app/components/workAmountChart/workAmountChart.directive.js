(function() {
  'use strict';

  angular
    .module('main')
    .directive('workAmountChart', workAmountChart);

  /** @ngInject */
  function workAmountChart() {
    var directive = {
      restrict: 'E',
      templateUrl: 'app/components/workAmountChart/workAmountChart.html',
      scope: {
          selector: '@',
		  data    : '=',
		  columns    : '=',
		  pattern : '=',
		  selected: '=',
		  cn:'@'
      },
	  link : linkFunc
    };

    return directive;

    /** @ngInject */
    function linkFunc(scope, element) {


		var className=scope.cn;
		var data   = [];
		if(scope.data.length){
			data=scope.data.filter(function(e,i,a){if(e.class==className){return e;}})
			};
		var columns = scope.columns.filter(function(e,i,a){if(e.class==className){return e;}});
		var width  = scope.width  || 250;
		var height = scope.height || 20;
	    var color  = d3.scale.category20c();

		
		var svg = d3.select(element[0])
		.select(".work-amount-chart")
		.append("svg")
		.attr("id", scope.cn)
		.attr("width", width)
		.attr("height", height);

		var barHeight = 6;
		var barMargin = 6;
		var lineWidth = 2;
		var margin = {"left":25,"top":5,"bottom":10,"right":0};

//setTimeout(function(){
//	console.log(data);
//	updateChart(data,columns);},2000);

		
		function updateChart(data,columns){
console.log(data);
//			data   = data.className;
console.log(className+":"+JSON.stringify(data));
			// clean first
			svg.remove();
			
			svg = d3.select(element[0])
			.select(".work-amount-chart")
			.append("svg")
			.attr("id", scope.cn)
			.attr("width", width)
			.attr("height", height);
			
			var x = d3.scale.linear().domain([0, 130]).range([0, width]);
//			var y = d3.scale.linear().range([height, 0]);
			var columnClasses=columns.map(function(x){return x.class});
			var y = d3.scale.ordinal()
			    .domain(className)
			    .rangePoints([0,height]);			
			var yAxis = d3.svg.axis().scale(y).tickFormat('').tickSize(0).orient("left");

			
			var g = svg.append("g");
/*			
			// columns
			if(!columns) return;
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
	*/
			// data
//			for(var i = 0; i < data.data.history.length ; i++ ){
			console.log(data);
			// if empty, nothing to do
			if(angular.equals({}, data)) return;
			
				var d = data;

					var bars = g.selectAll("g.bar-chart")
					.data(d)
					.enter().append("g")
//					.attr("class", "bar-chart series-"+d.name)
					.attr("class", "bar-chart")
					.attr("transform", function(d,i){
//						return "translate(" + y(d.class) + ", 0)";
//						return "translate("+((i*6)+margin.left)+", "+(0.74*((y(d.class)))+margin.top)+")";
						return "translate("+margin.left+", "+margin.top+")";
//						return "translate("+margin.left+", "+(i*(barHeight+barMargin) + margin.top)+")";
					});
					
					bars.append("rect")
				    .attr("class", "bar")
				    .attr("width", 6*d[0].amount)
					.attr("y", -2)
				    .attr("height", barHeight+4);
//			}
			

		}
		
		scope.$watch('columns', function(newValue, oldValue) {
			if(newValue !== undefined && angular.isArray(newValue)) {
				var nv=newValue.filter(function(e,i,a){if(e.class==className){return e;}});
				updateChart(scope.data,nv);
			}
		});
		scope.$watch('data', function(newValue, oldValue) {
			console.log(newValue);
			if(newValue !== undefined && angular.isArray(newValue)) {
				var nv=newValue.filter(function(e,i,a){if(e.class==className){return e;}});
				updateChart(nv,columns);
			}
		});

    }
  }

})();
