
let body_chaleur_gth = d3.select("#body_chaleur_gth");


Promise.all([
    d3.csv("chaleur_GTH.csv"),
    d3.json("departements-ile-de-france.geojson")
]).then((datasources)=>{
    mapInfo_gth = datasources[1];
    data_gth = datasources[0];
    prepare_gth_data(mapInfo_gth, data_gth);
    drawProdMap_gth(data_gth, mapInfo_gth);
})

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
        .center([3.1, 48.7])
        .scale(15000);

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
