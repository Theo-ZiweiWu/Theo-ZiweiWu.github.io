
let body_chaleur_biomasse = d3.select("#body_chaleur_biomasse");


Promise.all([
    d3.csv("data/page6_chaleur/chaleur_biomasse.csv"),
    d3.json("data/page6_chaleur/departements-ile-de-france.geojson")
]).then((datasources)=>{
    mapInfo_bio = datasources[1];
    data_bio = datasources[0];
    evolution_bio = get_history_bio(data_bio);
    bioLineChart(evolution_bio);
    prepare_bio_data(mapInfo_bio, data_bio);
    drawProdMap_bio(data_bio, mapInfo_bio);
})

function get_history_bio(data){
    let years = data.map(function(d){return d.Annee;});
    years = [...new Set(years)]
    let history_bio = []
    for (let y of years){
        history_bio.push({
            year: y,
            value: d3.sum(data.filter(function(d){return d.Annee <= y;}),
                d=>d.Production_estim_MWh) 
        })
    }
    return history_bio;
}

function bioLineChart(data){
    var svg_bio = d3.select("#chaleur_container_2_2")
    var bio = new dimple.chart(svg_bio, data);
    bio.setBounds(60, 20, 370, 230);
    var x = bio.addCategoryAxis("x", "year");
    x.addOrderRule("year");
    bio.addMeasureAxis("y", "value");
    var s = bio.addSeries(null, dimple.plot.line);
    s.lineMarkers = true;
    bio.draw();
}

function prepare_bio_data(mapInfo_bio, data){
    let prod_biomasse = {};
    for(let c of data){
        let dep = c.Departement;
        prod_biomasse[dep] = d3.sum(data.filter(d=>d.Departement === dep),d=>d.Production_estim_MWh);
    };

    mapInfo_bio.features = mapInfo_bio.features.map(d => {
        let dep = d.properties.code_departement;
        let prod = prod_biomasse[dep];

        d.properties.production = Math.round(prod);
        return d;
    });
}

function drawProdMap_bio(data, mapInfo_bio){
    
    let maxProd_bio = d3.max(mapInfo_bio.features,
        d => d.properties.production);
    
    let midProd_bio = d3.median(mapInfo_bio.features,
        d => d.properties.production);
    console.log(maxProd_bio, midProd_bio);

    let cScale = d3.scaleLinear()
        .domain([0, midProd_bio, maxProd_bio])
        .range(["#FFD29B","#FFB55F", "#FF8900"]);

        let projection = d3.geoMercator()
        .center([3.9, 48.4])
        .scale(10600);

    let path = d3.geoPath()
        .projection(projection);

    body_chaleur_biomasse.selectAll("path")
        .data(mapInfo_bio.features)
        .enter().append("path")
        .attr('d', d=>path(d))
        .attr("stroke", "white")
        .attr("fill",d => d.properties.production ?
            cScale(d.properties.production): "#E0E0E0")
        .on("mouseover", (d)=>{
            showBioTooltip(d.properties.code_departement, d.properties.production,
                [d3.event.pageX + 30, d3.event.pageY - 30]);
        })
        .on("mouseleave", d=>{
            d3.select("#tooltip_biomasse").style("display","none")
        });
}

function showBioTooltip(nom, prod, coords){
    let x = coords[0];
    let y = coords[1];

    d3.select("#tooltip_biomasse")
        .style("display", "block")
        .style("top", (y)+"px")
        .style("left", (x)+"px")
        .html("<b>Département : </b>" + nom + "<br>"
            + "<b>Production de Biomasse : </b>" + prod + "MWh<br>")
        
}
