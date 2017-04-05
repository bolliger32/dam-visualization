// Adapted from Mike Bostock's block - Zoom to Bounding Box II
// https://bl.ocks.org/mbostock/9656675
function drawPolygon() {

  // Various internal, private variables of the module.
  var margin = {top: 10, right: 50, bottom: 20, left: 50};
  var width = 300;
  var height = 220;

  var polygonLabel = 'County';

  var projection = d3.geoConicEqualArea()
    .parallels([34, 40.5])
    .rotate([120, 0]);

  var path = d3.geoPath()
    .projection(projection);

  var zoom = d3.zoom()
    .on("zoom", zoomed);
    
  var initialTransform = d3.zoomIdentity
    .translate(0,0)
    .scale(1);

  var g;

  var feature;

  var dispatcher = d3.dispatch("polyMouseover", "polyMouseleave");
      
  // Main internal module functionality
  function draw(selection) {
      var chartW = width - margin.left - margin.right;
      var chartH = height - margin.top - margin.bottom;

      var svg = selection.append("svg")
        .attr("width", chartW)
        .attr("height", chartH);

      g = svg
        .append("g")
        .classed('container', true);

      label = svg.append('text')
        .attr("transform", "translate(" + (chartW / 2) + " ," + (chartH - margin.top) + ")")
        .style("text-anchor", "middle")
        .text('');

      var bounds = path.bounds(feature),
        dx = bounds[1][0] - bounds[0][0],
        dy = bounds[1][1] - bounds[0][1],
        x = (bounds[0][0] + bounds[1][0]) / 2,
        y = (bounds[0][1] + bounds[1][1]) / 2,
        //scale = Math.max(1, Math.min(8, 0.9 / Math.max(dx / chartW, dy / chartH))),
        scale = 30,
        translate = [chartW / 2 - scale * x, chartH / 2 - scale * y];

      var transform = d3.zoomIdentity
        .translate(translate[0], translate[1])
        .scale(scale);

      g.datum(feature)
        .append("path")
        .attr("d", path)
        .on("mouseover", function(d){
          d3.select(this)
            .style('fill', 'red');
        })
        .on("mouseleave", function(d){
          d3.select(this)
            .style('fill', 'inherit');
        });

      label.text(feature.properties['CountyNAME']);

      svg.transition()
        .duration(750)
        .call(zoom.transform, transform);
  }

  function zoomed() {
    var transform = d3.event.transform; 
    g.style("stroke-width", 1.5 / transform.k + "px");
    g.attr("transform", transform);
  }

  // A series of public getter/setter functions
  draw.on = function () {
    var value = dispatcher.on.apply(dispatcher, arguments);
    return value === dispatcher ? chart : value;
  };

  draw.data = function(_) {
    if (!arguments.length) return feature;
    feature = _;
    return draw;
  };


  return draw;
}