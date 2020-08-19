
let body_chaleur_gth = d3.select("#body_chaleur_gth");

d3.csv("data/page6_chaleur/page6_chiffres_cles.csv").then((data)=>{
    chiffre_01 = data.filter(function(d){return d.id === "chiffre_1";});
    chiffre_02 = data.filter(function(d){return d.id === "chiffre_2";});
    chiffre_03 = data.filter(function(d){return d.id === "chiffre_3";});
    set_html("page6_chiffre1", chiffre_01[0].chiffre_cles);
    set_html("page6_chiffre2", chiffre_02[0].chiffre_cles);
    set_html("page6_chiffre3", chiffre_03[0].chiffre_cles);
    set_html("page6_mot1", chiffre_01[0].mots_cles);
    set_html("page6_mot2", chiffre_02[0].mots_cles);
    set_html("page6_mot3", chiffre_03[0].mots_cles);
    set_html("page6_des1", chiffre_01[0].description);
    set_html("page6_des2", chiffre_02[0].description);
    set_html("page6_des3", chiffre_03[0].description);
});

Promise.all([
    d3.csv("data/page6_chaleur/chaleur_GTH.csv"),
    d3.json("data/page6_chaleur/departements-ile-de-france.geojson"),
]).then((datasources)=>{
    mapInfo_gth = datasources[1];
    data_gth = datasources[0];
    draw_gth_line();
    prepare_gth_data(mapInfo_gth, data_gth);
    drawProdMap_gth(data_gth, mapInfo_gth);
})

function draw_gth_line(){
    var svg_gth = dimple.newSvg("#linechart_gth", 450, 400);
    d3.csv("data/page6_chaleur/chaleur_GTH_nb_logement.csv").then((data)=>{
        var line_gth = new dimple.chart(svg_gth, data);
        line_gth.setBounds(60, 30, 330, 230);
        var x = line_gth.addCategoryAxis("x", "ANNEE");
        y1 = line_gth.addMeasureAxis("y", "NB_LOGEMENT");
        y2 = line_gth.addMeasureAxis("y", "PRODUCTION");
        var ges = line_gth.addSeries(null, dimple.plot.line,[x, y2]);
        ges.lineMarkers = true;
        line_gth.defaultColors = [
            new dimple.color("#FF8900", "#EA8000", 1)
        ];

        line_gth.addSeries(null, dimple.plot.line, [x, y1]);
        line_gth.draw();
    });
}


function prepare_gth_data(mapInfo_gth, data){
    let dataEnergie = {};
    for(let c of data){
        let dep = c.Dpt;
        dataEnergie[dep] = d3.sum(data.filter(d=>d.Dpt === dep),d=>d.MWh_GTH);;
    };

    mapInfo_gth.features = mapInfo_gth.features.map(d => {
        let dep = d.properties.code_departement;
        let prod = dataEnergie[dep];

        d.properties.production = Math.round(prod);
        return d;
    });
}

function drawProdMap_gth(data, mapInfo_gth){
    console.log(mapInfo_gth);
    
    let maxProd_gth = d3.max(mapInfo_gth.features,
        d => d.properties.production);
    
    let midProd_gth = d3.median(mapInfo_gth.features,
        d => d.properties.production);
    console.log(maxProd_gth, midProd_gth);

    let cScale = d3.scaleLinear()
        .domain([0, midProd_gth, maxProd_gth])
        .range(["#FFD29B","#FFB55F", "#FF8900"]);

    let projection = d3.geoMercator()
        .center([3.9, 48.4])
        .scale(10600);

    let path = d3.geoPath()
        .projection(projection);

    body_chaleur_gth.selectAll("path")
        .data(mapInfo_gth.features)
        .enter().append("path")
        .attr('d', d=>path(d))
        .attr("stroke", "white")
        .attr("fill",d => d.properties.production ?
            cScale(d.properties.production): "#E0E0E0")
        .on("mouseover", (d)=>{
            showGTHTooltip(d.properties.code_departement, d.properties.production,
                [d3.event.pageX + 30, d3.event.pageY - 30]);
        })
        .on("mouseleave", d=>{
            d3.select("#tooltip_chaleur").style("display","none")
        });
}

function showGTHTooltip(nom, prod, coords){
    let x = coords[0];
    let y = coords[1];

    d3.select("#tooltip_chaleur")
        .style("display", "block")
        .style("top", (y)+"px")
        .style("left", (x)+"px")
        .html("<b>Département : </b>" + nom + "<br>"
            + "<b>Production de Géothermie : </b>" + prod + "MWh<br>")
        
}
