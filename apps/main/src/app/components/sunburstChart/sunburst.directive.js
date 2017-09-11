(function() {
  'use strict';

  angular
    .module('main')
    .directive('sunburstChart', sunburstChart);

  /** @ngInject */
  function sunburstChart() {
    var directive = {
      restrict: 'E',
      templateUrl: 'app/components/sunburstChart/sunburst.html',
      scope: {
          selector: '@',
		  data    : '=',
		  pattern : '=',
		  member  : '=',
		  selectData: '='
      },
	  link : linkFunc
    };

    return directive;

    /** @ngInject */
    function linkFunc(scope, element) {
		var data   = scope.data;
		var width  = scope.width  || 400;
		var height = scope.height || 250;
		var radius = Math.min(width, height) / 2;
	    var color  = d3.scale.category20c();
		
		var svg = d3.select(element[0])
		.select(".sunburst-chart")
		.append("svg")
		.attr("id", scope.selector)
		.attr("width", width)
		.attr("height", height)
		.append("g")
		.attr("transform", "translate("+width/3+","+ height * .5 +")");
		
		var g = svg.selectAll("g");
		
		var x = d3.scale.linear().domain([0, 5000]).range([0, width]);
		
		var partition = d3.layout.partition()
	    .sort(null)
	    .size([2 * Math.PI, radius * radius])
	    .value(function(d) { return 1; });
		
		var arc = d3.svg.arc()
	    .startAngle(function(d) { return d.x; })
	    .endAngle(function(d) { return d.x + d.dx; })
	    .innerRadius(function(d) { return Math.sqrt(d.y)+1; })
	    .outerRadius(function(d) { return Math.sqrt(d.y + d.dy); });
		
		// Stash the old values for transition.
		function stash(d) {
		  d.x0 = d.x;
		  d.dx0 = d.dx;
		}

		// Interpolate the arcs in data space.
		function arcTween(a) {
		  var i = d3.interpolate({x: a.x0, dx: a.dx0}, a);
		  return function(t) {
		    var b = i(t);
		    a.x0 = b.x;
		    a.dx0 = b.dx;
		    return arc(b);
		  };
		}
		
		
		function getAngle(d) {
		    // Offset the angle by 90 deg since the '0' degree axis for arc is Y axis, while
		    // for text it is the X axis.
		    var thetaDeg = (180 / Math.PI * (arc.startAngle()(d) + arc.endAngle()(d)) / 2 - 90);
		    // If we are rotating the text by more than 90 deg, then "flip" it.
		    // This is why "text-anchor", "middle" is important, otherwise, this "flip" would
		    // a little harder.
		    return (thetaDeg > 90) ? thetaDeg - 180 : thetaDeg;
		}
		function computeTextRotation(d) {
		  return (x(d.x + d.dx / 2) - Math.PI / 2) / Math.PI * 180;
		}
		function updateSunburst(root, type){
			var path = svg.datum(root).selectAll("path")
			.data(partition.nodes)
			.enter().append("g");
			
			var pie = path.append("path")
			.attr("class", function(d){
				return "arcpath series-"+(d.children ? d : d.parent).id+
				" name-"+d.name.replace(' ','-');
			})
			.attr("display", function(d) { return d.depth ? null : "none"; }) // hide inner ring
			.attr("d", arc);
			
			pie
			.attr("id", function(d,i){return "s"+i;})
			.style("stroke", "rgba(19, 44, 93, 0.1)")
			.style("fill", function(d) { return color((d.children ? d : d.parent).name); })
			.style("fill-rule", "evenodd")
			.each(stash);
			
			var patharc = svg.selectAll("path");
			var value = function(d) { return d.size; };
			
			patharc
			.data(partition.value(value).nodes)
			.transition()
			.duration(1500)
			.attrTween("d", arcTween);
			
			pie
			.on('mouseover', function(d){
				percentText
                .transition()
				.duration(500)
                .ease('cubic-in-out')
                .attr('opacity', 1)
                .tween('text', function() {
					var i = d3.interpolateRound(0, 100*(d.value/d.parent.value));
					return function(t) {
						this.textContent = Math.round(i(t)) + "%";
					};
				});
				
				// selection path
				d3.selectAll("path")
                .transition()
				.duration(500)
                .ease('cubic-in-out')
				.attr('opacity', 0.3);
				
				d3.selectAll("path.name-"+d.name.replace(' ','-'))
                .transition()
				.duration(500)
                .ease('cubic-in-out')
				.attr('opacity', 1);
				if(d.parent) {
					d3.selectAll("path.name-"+d.parent.name.replace(' ','-'))
	                .transition()
					.duration(500)
	                .ease('cubic-in-out')
					.attr('opacity', 1);
					if(d.parent.parent) {
						d3.selectAll("path.name-"+d.parent.parent.name.replace(' ','-'))
		                .transition()
						.duration(500)
		                .ease('cubic-in-out')
						.attr('opacity', 1);
					}
				}
				
				scope.selectData = d;
			})
			.on('mouseout', function(d){
				percentText.transition()
                .duration(500).ease('cubic-in-out')
                .attr('opacity', 0);
				
				// cancel selection
				d3.selectAll("path")
                .transition()
				.duration(500)
                .ease('cubic-in-out')
				.attr('opacity', 1);
				
				scope.selectData = undefined;
			});
			
			// legend
			var legends = svg.selectAll("g.legends")
			.data(root.children)
			.enter().append("g")
			.attr("class", function(d){ return "legends series-"+(d.children ? d : d.parent).id;})
			.attr("transform", function(d,i){
				return "translate("+(width-250)+","+((i*15)-(height*.5))+")";
			});
			legends.append("rect")
			.attr("class", "legend-rect" )
			.style("fill", function(d) { return color((d.children ? d : d.parent).name); })
		    .attr("width", 3)
		    .attr("height", 13);
			legends.append("text")
			.attr("class", "legend-text")
			.attr("font-size", "12px")
			.attr("x", 4)
		    .attr("y", 15 / 2)
			.attr("dy", ".35em")
			.text(function(d,i) { return d.name; });
			
			// names
			var names = svg.selectAll("g.namelegends")
			.data(root.children[0].children)
			.enter().append("g")
			.attr("class", function(d){ return "namelegends series-"+(d.children ? d : d.parent).id;})
			.attr("transform", function(d,i){
				return "translate("+(width-250)+","+(i*15+15)+")";
			});
			names.append("rect")
			.attr("class", "legend-rect" )
			.style("fill", function(d) { return color((d.children ? d : d.parent).name); })
		    .attr("width", 3)
		    .attr("height", 13);
			names.append("text")
			.attr("class", "legend-text")
			.attr("font-size", "8px")
			.attr("x", 4)
		    .attr("y", 15 / 2)
			.attr("dy", ".35em")
			.text(function(d,i) { return d.name; });
			
			// percent
			var percentText = svg.append('text')
	        .attr('x', 0)
	        .attr('y', 10)
	        .attr('text-anchor', 'middle')
	        .attr('font-size', 20)
	        .attr('font-family', 'Montserrat')
	        .attr('class', 'percent');
			
		}
			
		scope.$watch('data', function(newValue, oldValue) {
			if(newValue !== undefined) {
				updateSunburst(newValue);
			}
		});
		scope.$watch('member', function(newValue, oldValue) {
			if(newValue !== undefined) {
				d3.selectAll("path")
                .transition()
				.duration(500)
                .ease('cubic-in-out')
				.attr('opacity', 0.3);
				
				
				d3.selectAll("path.series-undefined")
                .transition()
				.duration(500)
                .ease('cubic-in-out')
				.attr('opacity', 1);
				d3.selectAll("path.series-"+newValue.id)
                .transition()
				.duration(500)
                .ease('cubic-in-out')
				.attr('opacity', 1);
			} else {
				d3.selectAll("path")
                .transition()
				.duration(500)
                .ease('cubic-in-out')
				.attr('opacity', 1);
			}
		});
    }
  }

})();
