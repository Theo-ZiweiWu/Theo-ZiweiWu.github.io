
let body_emiss = d3.select("#body_emiss");


Promise.all([
    d3.csv("airparif_emission_epci.csv"),
    d3.json(geojson_url)
]).then((datasources)=>{
    mapInfo = datasources[1];
    data_emiss = datasources[0];
    data_emiss = annee_filter(data_emiss);
    prepare_emiss_data(mapInfo, data_emiss);
    drawEmissMap(data_emiss, mapInfo, "emiss_tot");
})

var annee_c = "2017";
var selectedEPCI = undefined;

function annee_filter(data){
    return data.filter(function(d){return d.annee === annee_c;});
}

function prepare_emiss_data(mapInfo, data){
    let secteurs=["Agriculture","Transport_R","Tertiaire","Industrie","Residentiel","Transport_A"];
    let dataSecteur = {};
    for(let c of data){
        let par_secteur = {};
        let epci = c.epci;
        for(let s of secteurs){
            par_secteur[s] = d3.sum(data.filter(d=>d.epci === c.epci && 
                d.secteur === s),d=>d.emission);
        }
        par_secteur["Totale"] = d3.sum(data.filter(d=>d.epci === c.epci),d=>d.emission);
        dataSecteur[epci] = par_secteur;
    };

    mapInfo.features = mapInfo.features.map(d => {
        let epci = d.properties.code;
        let emiss = dataSecteur[epci];

        d.properties.emiss_agr = Math.round(emiss.Agriculture);
        d.properties.emiss_ind = Math.round(emiss.Industrie);
        d.properties.emiss_res = Math.round(emiss.Residentiel);
        d.properties.emiss_trR = Math.round(emiss.Transport_R);
        d.properties.emiss_trA = Math.round(emiss.Transport_A);
        d.properties.emiss_tot = Math.round(emiss.Totale);
        d.properties.emiss_ter = Math.round(emiss.Tertiaire);
        return d;
    });
}

function drawEmissMap(data, mapInfo, sec){
    console.log(mapInfo);
    
    let maxEmiss = d3.max(mapInfo.features,
        d => d.properties[sec]);
    
    let midEmiss = d3.median(mapInfo.features,
        d => d.properties[sec]);
    console.log(maxEmiss, midEmiss);

    let cScale = d3.scaleLinear()
        .domain([0, midEmiss, 2*midEmiss, 4*midEmiss, 8*midEmiss, maxEmiss])
        .range(["#18A1CD","#09A785", "#0AD8A2","#FFD29B","#FFB55F","#FF8900"]);

    let bodyHeight = width;
    let bodyWidth = height;

    let projection = d3.geoMercator()
        .center([3.1, 48.7])
        .scale(15000);

    let path = d3.geoPath()
        .projection(projection);

    body_emiss.selectAll("path")
        .data(mapInfo.features)
        .enter().append("path")
        .attr('d', d=>path(d))
        .attr("stroke", "white")
        .attr("fill",d => d.properties[sec] ?
            cScale(d.properties[sec]): "white")
        .on("mouseover", (d)=>{
            showEmissTooltip(d.properties.nom, d.properties[sec],
                [d3.event.pageX + 30, d3.event.pageY - 30]);
        })
        .on("mouseleave", d=>{
            d3.select("#tooltip_emission").style("display","none")
        })
        .on("click", d=> {
            selectedEPCI = d.properties.nom;
            let pie_data = [{
                "Secteur": "Agriculture",
                "Emission": d.properties.emiss_agr
            },{
                "Secteur": "Tertiaire",
                "Emission": d.properties.emiss_ter
            },{
                "Secteur": "Industrie",
                "Emission": d.properties.emiss_ind
            },{
                "Secteur": "Residentiel",
                "Emission": d.properties.emiss_res
            },{
                "Secteur": "Transport Routier",
                "Emission": d.properties.emiss_trR
            },{
                "Secteur": "Transport Autres",
                "Emission": d.properties.emiss_trA
            }];
        drawPieEmiss(pie_data);

        });
}

function showEmissTooltip(nom, emiss, coords){
    let x = coords[0];
    let y = coords[1];

    d3.select("#tooltip_emission")
        .style("display", "block")
        .style("top", (y)+"px")
        .style("left", (x)+"px")
        .html("<b>EPCI : </b>" + nom + "<br>"
                    + "<b>Emission : </b>" + emiss + "teq CO2<br>")
        
}

function drawPieEmiss(data){
    let body = d3.select("#piechart_emiss");
    let bodyHeight = 200;
    let bodyWidth = 220;

    data = data.map(d => ({
        secteur: d.Secteur,
        emission: +d.Emission
    }))
    
    let pie = d3.pie()
        .value(d => d.emission);
    let colorScale = d3.scaleOrdinal().domain(data)
        .range(["#18A1CD", "#09A785", "#09BB9F", "#39F3BB", "#FFB55F", "#FF8900", "#FF483A"])
    let arc = d3.arc()
        .outerRadius(bodyHeight / 2)
        .innerRadius(60);
    let g = body.selectAll(".arc")
        .data(pie(data))
        .enter()
        .append("g")
        
    g.append("path")
        .attr("d", arc)
        .attr("fill", d => {
            return colorScale(d.data.secteur)
        })
        /*
        .on("mousemove", (d)=>{
            console.log(d.data.secteur);
            showTooltipPie(d.data.secteur, d.data.consommation,[d3.event.pageX + 30, d3.event.pageY - 30]);
        })
        .on("mouseleave", d=>{
            d3.select("#tooltip2").style("display","none")
        });
        */
}