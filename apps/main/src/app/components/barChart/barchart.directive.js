(function() {
  'use strict';

  angular
    .module('main')
    .directive('barChart', barChart);

  /** @ngInject */
  function barChart() {
    var directive = {
      restrict: 'E',
      templateUrl: 'app/components/barChart/barchart.html',
      scope: {
          selector: '@',
		  data    : '=',
		  max     : '=',
		  width   : '@',
		  height  : '@'
      },
      link : linkFunc
    };

    return directive;

    /** @ngInject */
    function linkFunc(scope, element) {
		var data   = scope.data;
		var width  = scope.width  || 300;
		var height = scope.height || 200;
	    var color  = d3.scale.category20c();
		var max    = scope.max || 50;
		
		var barHeight = 10;
		var barMargin = 6;
		var lineWidth = 2;
		var margin = {"left":80,"top":20,"bottom":10,"right":0};
		
		var svg = d3.select(element[0])
		.select(".bar-chart")
		.append("svg")
		.attr("id", scope.selector)
		.attr("width", width)
		.attr("height", height);
		
		function updateChart(data){
			// clean first
			svg.remove();
			
			svg = d3.select(element[0])
			.select(".bar-chart")
			.append("svg")
			.attr("id", scope.selector)
			.attr("width", width)
			.attr("height", height);
			
			var x = d3.scale.linear().domain([0, max]).range([0, width]);
			var y = d3.scale.linear().range([height, 0]);
			var yAxis = d3.svg.axis().scale(y).tickFormat('').tickSize(0).orient("left");
			
			var g = svg.append("g");
			
			// columns
			if(!data.columns) return;
			
			var columns = g.selectAll("g.columns")
			.data(data.columns)
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
			for(var i = 0; i < data.data.length ; i++ ){
				var d = data.data[i];
				if(d.type == "bar") {
					var bars = g.selectAll("g.bar-chart")
					.data(d.data)
					.enter().append("g")
					.attr("class", "bar-chart series-"+d.name)
					.attr("transform", function(d,i){
						return "translate("+margin.left+", "+(i*(barHeight+barMargin) + margin.top)+")";
					});
					
					bars.append("rect")
				    .attr("class", "bar")
				    .attr("width", x)
					.attr("y", -2)
				    .attr("height", barHeight+4);
				}
				else if(d.type == "line") {
					var lines = g.selectAll("g.line-chart")
					.data(d.data)
					.enter().append("g")
					.attr("class", "line-chart series-"+d.name)
					.attr("transform", function(d,i){
						return "translate("+margin.left+", "+(i*(barHeight+barMargin) + margin.top)+")";
					});
					
					lines.append("rect")
					.attr("class", "line")
				    .attr("width", x)
				    .attr("height", barHeight);
				}
			}
			
			// tooltip
			
			
			// legend
			var legends = g.selectAll("g.legends")
			.data(data.data)
			.enter().append("g")
			.attr("class", function(d){ return "legends series-"+d.name;})
			.attr("transform", function(d,i){
				return "translate("+(width-(data.data.length-i)*d.name.length*8-50)+",0)";
			});
			legends.append("rect")
			.attr("opacity", 0.6)
			.attr("class", "legend-rect" )
		    .attr("width", 2)
		    .attr("height", barHeight);
			legends.append("text")
			.attr("class", "legend-text")
			.attr("x", 4)
		    .attr("y", barHeight / 2)
			.attr("dy", ".35em")
			.text(function(d,i) { return d.name; });
			
		}
		
		scope.$watch('data', function(newValue, oldValue) {
			if(newValue !== undefined) {
				updateChart(newValue);
			}
		});
    }
  }

})();
