
var units = "KWh";
 
var margin_sankey = {top: 10, right: 10, bottom: 10, left: 10},
    width_sankey = 700 - margin_sankey.left - margin_sankey.right,
    height_sankey = 350 - margin_sankey.top - margin_sankey.bottom;
 
var formatNumber = d3.format(",.0f"),    // zero decimal places
    format = function(d) { return formatNumber(d) + " " + units; };
 
// append the svg_sankey_sankey canvas to the page
var svg_sankey = d3.select("#sankey_chart");
 
// Set the sankey diagram properties
var sankey = d3.sankey()
    .nodeWidth(20)
    .nodePadding(10)
    .size([width_sankey, height_sankey]);
 
var path = sankey.link();
 
// load the data
d3.json("demo.json").then((graph)=>{
  var nodeMap = {};
    graph.nodes.forEach(function(x) { nodeMap[x.name] = x; });
    graph.links = graph.links.map(function(x) {
      return {
        source: nodeMap[x.source],
        target: nodeMap[x.target],
        value: x.value
      };
    });
 
  sankey
      .nodes(graph.nodes)
      .links(graph.links)
      .layout(32);
 
 console.log(graph);
// add in the links
  var link = svg_sankey.append("g").selectAll(".link")
      .data(graph.links)
    .enter().append("path")
      .attr("class", "link")
      .attr("d", path)
      .style("stroke-width", function(d) { return Math.max(1, d.dy); })
      .sort(function(a, b) { return b.dy - a.dy; });
 
// add the link titles
  link.append("title")
        .text(function(d) {
      	return d.source.name + " → " + 
                d.target.name + "\n" + format(d.value); });
 
// add in the nodes
  
  var node = svg_sankey.append("g").selectAll(".node")
      .data(graph.nodes)
    .enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) { 
		  return "translate(" + d.x + "," + d.y + ")"; })
    
 
 console.log(node);
// add the rectangles for the nodes
  node.append("rect")
      .attr("height", function(d) { return d.dy; })
      .attr("width", sankey.nodeWidth())
      .style("fill", "blue")
      .style("stroke", "black")
    .append("title")
      .text(function(d) { 
		  return d.name + "\n" + format(d.value); });
 
// add in the title for the nodes
  node.append("text")
      .attr("x", -6)
      .attr("y", function(d) { return d.dy / 2; })
      .attr("dy", ".35em")
      .attr("text-anchor", "end")
      .attr("transform", null)
      .text(function(d) { return d.name; })
    .filter(function(d) { return d.x < width / 2; })
      .attr("x", 6 + sankey.nodeWidth())
      .attr("text-anchor", "start");
 
});


var svg_cee = dimple.newSvg("#CEE-stackchart", 590, 400);
d3.csv("CEE_simplifiee.csv").then((data)=>{
  var cee_chart = new dimple.chart(svg_cee, data);
  cee_chart.setBounds(60, 30, 505, 305);
  var x = cee_chart.addCategoryAxis("x", "DATE");
  x.addOrderRule("DATE");
  cee_chart.addMeasureAxis("y", "MOTANT");
  var s = cee_chart.addSeries("TYPE", dimple.plot.area);
  cee_chart.addLegend(60, 10, 500, 20, "right");
  cee_chart.draw();
});