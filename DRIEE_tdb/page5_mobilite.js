var svg_critair = dimple.newSvg("#mobilite_critair", 400, 330);
d3.csv("mobilite_immatriculation.csv").then((data)=>{
    var myChart = new dimple.chart(svg_critair, data);
  myChart.setBounds(85, 45, 300, 215)
  myChart.addCategoryAxis("x", ["DATE"]);
  myChart.addPctAxis("y", "NOMBRE");
  myChart.addSeries("CRIT_AIR", dimple.plot.bar);
  myChart.addLegend(200, 10, 180, 20, "right");
  myChart.draw();
});

var svg_pie = dimple.newSvg("#piechart_energie", 420, 300);
d3.csv("mobilite_energie.csv").then((data)=>{
var pie_energie = new dimple.chart(svg_pie, data);
    pie_energie.setBounds(20, 20, 360, 260)
    pie_energie.addMeasureAxis("p", "NOMBRE");
    pie_energie.addSeries("ENERGIE", dimple.plot.pie);
    pie_energie.addLegend(330, 20, 90, 300, "left");
    pie_energie.draw();
});

var svg_NO2 = dimple.newSvg("#linechart_NO2", 400, 300);
    d3.csv("mobilite_NO2.csv").then((data)=>{
      var linechart_NO2 = new dimple.chart(svg_NO2, data);
      linechart_NO2.setBounds(60, 30, 300, 205);
      var x = linechart_NO2.addCategoryAxis("x", "ANNEE");
      linechart_NO2.addMeasureAxis("y", "NO2");
      var s = linechart_NO2.addSeries("SOURCE", dimple.plot.line);
      s.lineMarkers = true;
      linechart_NO2.addLegend(60, 10, 400, 20, "right");
      linechart_NO2.draw();
});

var svg_ges = dimple.newSvg("#mixchart_ges", 440, 300);
    d3.csv("mobilite_ges.csv").then((data)=>{
        var mixchart_ges = new dimple.chart(svg_ges, data);
        mixchart_ges.setBounds(60, 30, 300, 205);
        var x = mixchart_ges.addCategoryAxis("x", "ANNEE");
        y1 = mixchart_ges.addMeasureAxis("y", "CONSOMMATION");
        y2 = mixchart_ges.addMeasureAxis("y", "EMISSION");
        var ges = mixchart_ges.addSeries(null, dimple.plot.line,[x, y2]);
        ges.lineMarkers = true;
        mixchart_ges.addSeries(null, dimple.plot.bar, [x, y1]);
        mixchart_ges.addLegend(60, 10, 200, 20, "right");
        mixchart_ges.draw();
    });
