function barChart() {

  // Various internal, private variables of the module.
  var margin = {top: 10, right: 20, bottom: 45, left: 50},
    width = 450,
    height = 200;

  var xScale = d3.scaleBand();

  var yScale = d3.scaleLinear();

  var xDomain, yDomain;

  var xAxis = d3.axisBottom(xScale)
    .tickFormat(d3.timeFormat("%Y"));

  var yAxis = d3.axisLeft(yScale);

  var axisLabel = 'Axis Label';

  var dispatcher = d3.dispatch("barMouseover", "barMouseleave");
      

  // Main internal module functionality
  function chart(selection) {
    selection.each(function(data) {

      var chartW = width - margin.left - margin.right;
      var chartH = height - margin.top - margin.bottom;

      // Update domains
      xDomain = data.map(function(d) { return d.date; });
      yDomain = [0, d3.max(data, function(d) { return d.value; })]
    
      // Set the domain and range of x-scale.
      xScale
        .domain(xDomain)
        .range([0, chartW])
        .padding(0.1);
         
      // Set the domain and range of y-scale.
      yScale
        .domain(yDomain)
        .range([chartH, 0]);          

      // Select the svg element, if it exists.
      var svg = d3.select(this).selectAll("svg").data([data]);
      var tooltip = d3.select(this).append("div").attr("class", "toolTip");

      var svgEnter = svg.enter()
        .append('svg');

      /**
      * Append the elements which need to be inserted only once to svgEnter
      * Following is a list of elements that area inserted into the svg once
      **/
      var container = svgEnter
        .append("g")
        .classed('container', true);

      container
        .append("g")
        .attr("class", "bars");

      container
        .append("g")
        .attr("class", "y axis");

      container
        .append("g")
        .attr("class", "x axis");


      /*
      *  Following actions happen every time the svg is generated
      */
      svgEnter = svgEnter.merge(svg);

      // Update the outer dimensions.
      svgEnter
        .attr("width", width)
        .attr("height", height);

      // Update the inner dimensions.
      container
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      // Place x axis at the bottom of the chart
      container.select(".x.axis")
        .attr("transform", "translate(0," + chartH + ")")
        .call(xAxis)
        .selectAll("text")
          .style("text-anchor", "end")
          .attr("dx", "-.8em")
          .attr("dy", "-.55em")
          .attr("transform", "rotate(-90)");

      // Place y-axis at the left
      svgEnter.select(".y.axis")
        .call(yAxis)
        .append("text")
          .attr('transform', 'rotate(-90)')
          .attr('y', 0 - margin.left)
          .attr('x', 0 - (chartH / 2))
          .attr('dy', '1em')
          .style('text-anchor', 'middle')
          .text(axisLabel);


      // Setup the enter, exit and update of the actual bars in the chart.
      var barContainer = svgEnter.select(".bars");

      // Select the bars, and bind the data to the .bar elements.
      var bars = barContainer.selectAll(".bar").data(data);

      bars.exit()
        .transition()
          .duration(300)
        .remove();

      // data that needs DOM = enter() (a set/selection, not an event!)
      bars.enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return xScale(d.date); })
        .attr("width", xScale.bandwidth())
        .attr("y", function(d) { return yScale(d.value); })
        .attr("height", function(d) { return chartH - yScale(d.value); })
        .on("mouseover", function(d){
          tooltip
            .style("left", d3.event.pageX + 2 + "px")
            .style("top", d3.event.pageY + 2 + "px")
            .style("display", "inline-block")
            .html(d.value);
        })
        .on("mouseleave", function(d){
          tooltip
            .style("display", "none");
        })

      // the "UPDATE" set:
      bars.transition()
        .duration(300)
          .attr("x", function(d) { return xScale(d.date); })
          .attr("width", xScale.bandwidth())
          .attr("y", function(d) { return yScale(d.value); })
          .attr("height", function(d) { return chartH - yScale(d.value); });
          
    });

  }

  // A series of public getter/setter functions

  chart.margin = function(_) {
    if (!arguments.length) return margin;
    margin = _;
    return chart;
  };

  chart.width = function(_) {
    if (!arguments.length) return width;
    width = _;
    return chart;
  };

  chart.height = function(_) {
    if (!arguments.length) return height;
    height = _;
    return chart;
  };

  chart.axisLabel = function(_) {
    if (!arguments.length) return axisLabel;
    axisLabel = _;
    return chart;
  };

  chart.xDomain = function(_) {
    if (!arguments.length) return xDomain;
    xDomain = _;
    return chart;
  };

  chart.yDomain = function(_) {
    if (!arguments.length) return yDomain;
    yDomain = _;
    return chart;
  };

  chart.on = function () {
    var value = dispatcher.on.apply(dispatcher, arguments);
    return value === dispatcher ? chart : value;
  };


  return chart;
}