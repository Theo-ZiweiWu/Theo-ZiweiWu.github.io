// set the dimensions and margins of the graph
var margin = {top: 10, right: 30, bottom: 30, left: 150},
width = 900 - margin.left - margin.right,
height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#equilibre-regional")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

// Parse the Data
d3.csv("equilibre-regional-TDB.csv").then((data)=>{
  subgroups = data.columns;

  // List of subgroups = header of the csv files = soil condition here
  // var subgroups = data.columns.slice(1)


  // List of groups = species here = value of the first column called group -> I show them on the X axis
  var groups = d3.map(data, function(d){return(d.Region)}).keys();

  // Add X axis
  var y = d3.scaleBand()
    .domain(groups)
    .range([0, height])
    .padding([0.2])
  svg.append("g")
  .call(d3.axisLeft(y).tickSizeOuter(0));

  // Add Y axis
  var x = d3.scaleLinear()
  .domain([0, 120000000])
  .range([ 0, width]);
  svg.append("g")
  .call(d3.axisBottom(x))
  .attr("transform", "translate(0," + height + ")");

  // color palette = one color per subgroup
  var color = d3.scaleOrdinal()
  .domain(subgroups)
  .range(['#FF8900','#529A99','#52B8D9'])

  //stack the data? --> stack per subgroup
  var stackedData = d3.stack()
  .keys(subgroups)
  (data)




  // ----------------
  // Create a tooltip
  // ----------------
  var tooltip = d3.select("#tooltip_equilibre")
  .append("div")
  .style("position","absolute")
  .style("opacity", 0)
  .attr("class", "tooltip")
  .style("background-color", "white")
  .style("border", "solid")
  .style("border-width", "1px")
  .style("border-radius", "5px")
  .style("padding", "10px");

  console.log(tooltip);
  // Three function that change the tooltip when user hover / move / leave a cell
  var mouseover = function(d) {
    var subgroupName = d3.select(this.parentNode).datum().key;
    var subgroupValue = d.data[subgroupName];
    tooltip
        .html("subgroup: " + subgroupName + "<br>" + "Value: " + subgroupValue)
        .style("opacity", 1)
  }
  var mousemove = function(d) {
  tooltip
    .style("left", (d3.event.pageX+30) + "px") // It is important to put the +90: other wise the tooltip is exactly where the point is an it creates a weird effect
    .style("top", (d3.event.pageY) + "px")
  }
  var mouseleave = function(d) {
  tooltip
    .style("opacity", 0)
  }

  // Show the bars
  svg.append("g")
  .selectAll("g")
  // Enter in the stack data = loop key per key = group per group
  .data(stackedData)
  .enter().append("g")
    .attr("fill", function(d) { return color(d.key); })
    .selectAll("rect")
    // enter a second time = loop subgroup per subgroup to add all rectangles
    .data(function(d) { return d; })
    .enter().append("rect")
      .attr("y", function(d) { return y(d.data.Region); })
      .attr("x", function(d) { return x(d[0]); })
      .attr("width", function(d) { return x(d[1]) - x(d[0]); })
      .attr("height",y.bandwidth())
      .attr("stroke", "white")
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleave)

  })
