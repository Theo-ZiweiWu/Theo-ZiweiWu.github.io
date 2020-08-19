
let body_enr_methan = d3.select("#body_enr_methan");

d3.csv("data/page7_enr/page7_chiffres_cles.csv").then((data)=>{
    chiffre_01 = data.filter(function(d){return d.id === "chiffre_1";});
    chiffre_02 = data.filter(function(d){return d.id === "chiffre_2";});
    chiffre_03 = data.filter(function(d){return d.id === "chiffre_3";});
    set_html("page7_chiffre1", chiffre_01[0].chiffre_cles);
    set_html("page7_chiffre2", chiffre_02[0].chiffre_cles);
    set_html("page7_chiffre3", chiffre_03[0].chiffre_cles);
    set_html("page7_mot1", chiffre_01[0].mots_cles);
    set_html("page7_mot2", chiffre_02[0].mots_cles);
    set_html("page7_mot3", chiffre_03[0].mots_cles);
    set_html("page7_des1", chiffre_01[0].description);
    set_html("page7_des2", chiffre_02[0].description);
    set_html("page7_des3", chiffre_03[0].description);
});

Promise.all([
    d3.csv("data/page7_enr/ENR_methan.csv"),
    d3.json("data/page7_enr/departements-ile-de-france.geojson")
]).then((datasources)=>{
    mapInfo_methan = datasources[1];
    data_methan = datasources[0];
    history_methan = get_history_methan(data_methan);
    data_methan = data_methan.filter(function(d){return d.Annee < 2020;});
    prepare_methan_data(mapInfo_methan, data_methan);
    drawProdMap_methan(data_methan, mapInfo_methan);
    methanLineChart(history_methan);
})

function prepare_methan_data(mapInfo_methan, data){
    let prod_methan = {};
    for(let c of data){
        let dep = c.Departement;
        prod_methan[dep] = d3.sum(data.filter(d=>d.Departement === dep),d=>d.Prod_moyenne_GWh);
    };

    mapInfo_methan.features = mapInfo_methan.features.map(d => {
        let dep = d.properties.code_departement;
        let prod = prod_methan[dep];

        d.properties.production = Math.round(prod);
        return d;
    });
}

function get_history_methan(data){
    let years = data.map(function(d){return d.Annee;});
    years = [...new Set(years)]
    let history_methan = []
    for (let y of years){
        history_methan.push({
            year: y,
            value: d3.sum(data.filter(function(d){return d.Annee <= y;}),
                d=>d.Prod_moyenne_GWh) 
        })
    }
    return history_methan;
}

function methanLineChart(data){
    var svg_methan = d3.select("#enr_container_1_2")
    var methan = new dimple.chart(svg_methan, data);
    methan.setBounds(60, 20, 360, 230);
    var x = methan.addCategoryAxis("x", "year");
    x.addOrderRule("year");
    methan.addMeasureAxis("y", "value");
    var s = methan.addSeries(null, dimple.plot.line);
    s.lineMarkers = true;
    methan.draw();
}

function drawProdMap_methan(data, mapInfo_methan){
    let maxProd_methan = d3.max(mapInfo_methan.features,
        d => d.properties.production);
    
    let midProd_methan = d3.median(mapInfo_methan.features,
        d => d.properties.production);
    console.log(maxProd_methan, midProd_methan);

    let cScale = d3.scaleLinear()
        .domain([0, midProd_methan, maxProd_methan])
        .range(["#FFD29B","#FFB55F", "#FF8900"]);

    let projection = d3.geoMercator()
        .center([3.9, 48.4])
        .scale(10600);

    let path = d3.geoPath()
        .projection(projection);

    body_enr_methan.selectAll("path")
        .data(mapInfo_methan.features)
        .enter().append("path")
        .attr('d', d=>path(d))
        .attr("stroke", "white")
        .attr("fill",d => d.properties.production ?
            cScale(d.properties.production): "#E0E0E0")
        .on("mouseover", (d)=>{
            showMethanTooltip(d.properties.code_departement, d.properties.production,
                [d3.event.pageX + 30, d3.event.pageY - 30]);
        })
        .on("mouseleave", d=>{
            d3.select("#tooltip_methan").style("display","none")
        });
}

function showMethanTooltip(nom, prod, coords){
    let x = coords[0];
    let y = coords[1];

    d3.select("#tooltip_methan")
        .style("display", "block")
        .style("top", (y)+"px")
        .style("left", (x)+"px")
        .html("<b>Département : </b>" + nom + "<br>"
        + "<b>Production de Méthanisation: </b>" + prod*1000 + "MWh<br>");
        
}