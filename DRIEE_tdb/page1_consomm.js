var width = 600,
    height = 400, 
    centered;

let body = d3.select("#body");

const geojson_url = "https://raw.githubusercontent.com/Theo-ZiweiWu/Prototype-DRIEE-TDB/master/communes-ile-de-france.geojson";
const data_url = "https://raw.githubusercontent.com/Theo-ZiweiWu/Prototype-DRIEE-TDB/master/AIRPARIF_conso_2017_4_DRIEE.csv";

var annee_c = "2017";
var mapInfo = undefined;
var data = undefined;
var selectedEPCI = undefined;


Promise.all([
    d3.csv("airparif_consommation_epci.csv"),
    d3.json("EPCI-ile-de-france.geojson")
]).then((datasources)=>{
    mapInfo = datasources[1];
    data = datasources[0];
    let line_data = get_history(data);
    data = annee_filter(data);
    prepare_data(mapInfo, data);
    update_chiffre_cles();
    drawMap(data, mapInfo, "conso_tot");
    drawLineChart(line_data);
})

function set_html(id, text){
    document.getElementById(id).innerHTML = text;
}

function update_chiffre_cles(){
    d3.csv("page_chiffre_cles.csv").then((data)=>{
        consomm_1 = data.filter(function(d){return d.id === "consommation_1";});
        consomm_2 = data.filter(function(d){return d.id === "consommation_2";});
        consomm_3 = data.filter(function(d){return d.id === "consommation_3";});
        comsole.log(consomm_1);
        set_html("consomm_1_chiffre", consomm_1[0].chiffre_cles);
        set_html("consomm_2_chiffre", consomm_2[0].chiffre_cles);
        set_html("consomm_3_chiffre", consomm_3[0].chiffre_cles);
        set_html("consomm_1_description", consomm_1[0].description);
        set_html("consomm_2_description", consomm_2[0].description);
        set_html("consomm_3_description", consomm_3[0].description);
        set_html("consomm_1_des_sup", consomm_1[0].description_sup);
        set_html("consomm_2_des_sup", consomm_2[0].description_sup);
        set_html("consomm_3_des_sup", consomm_3[0].description_sup);
        if(consomm_3[0].unite != ""){
            set_html("consomm_3_unite", consomm_3[0].unite);
        }
    })
}

function showTooltip(nom, conso, coords){
    let x = coords[0];
    let y = coords[1];

    d3.select("#tooltip")
        .style("display", "block")
        .style("top", (y)+"px")
        .style("left", (x)+"px")
        .html("<b>EPCI : </b>" + nom + "<br>"
                    + "<b>Consommation : </b>" + conso + "MWh<br>")
        
}

function showTooltipPie(sec, conso, coords){
    let x = coords[0];
    let y = coords[1];

    d3.select("#tooltip2")
        .style("display", "block")
        .style("top", (y)+"px")
        .style("left", (x)+"px")
        .html("<b>Secteur : </b>" + sec + "<br>"
                    + "<b>Consommation : </b>" + conso + "MWh<br>")
        
}

function drawPie(data){
    let body = d3.select("#piechart");
    let bodyHeight = 200;
    let bodyWidth = 220;

    data = data.map(d => ({
        secteur: d.Secteur,
        consommation: +d.Consommation
    }))
    
    let pie = d3.pie()
        .value(d => d.consommation);
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
        .on("mousemove", (d)=>{
            console.log(d.data.secteur);
            showTooltipPie(d.data.secteur, d.data.consommation,[d3.event.pageX + 30, d3.event.pageY - 30]);
        })
        .on("mouseleave", d=>{
            d3.select("#tooltip2").style("display","none")
        });
}

function change_year(a){
    d3.csv("airparif_consommation_epci.csv").then((data_s)=>{
        annee_c = a;
        data = annee_filter(data_s);
        console.log(data);
        prepare_data(mapInfo, data);
        drawMap(data, mapInfo,"conso_tot");
    })
}

function prepare_data(mapInfo, data){
    let secteurs=["RES","TRAF","TER","IND","AGR"];
    let dataIndex = {};
    for(let c of data){
        let par_secteur = {};
        let epci = c.epci;
        for(let s of secteurs){
            par_secteur[s] = d3.sum(data.filter(d=>d.epci === c.epci && 
                d.secteur === s),d=>d.consommation);
        }
        par_secteur["TOT"] = d3.sum(data.filter(d=>d.epci === c.epci),
        d=>d.consommation);
        dataIndex[epci] = par_secteur;
    };
    console.log(dataIndex);

    mapInfo.features = mapInfo.features.map(d => {
        let epci = d.properties.code;
        let conso = dataIndex[epci];
        d.properties.conso_tot = Math.round(conso.TOT);
        d.properties.conso_agr = Math.round(conso.AGR);
        d.properties.conso_ind = Math.round(conso.IND);
        d.properties.conso_res = Math.round(conso.RES);
        d.properties.conso_traf = Math.round(conso.TRAF);
        d.properties.conso_ter = Math.round(conso.TER);
        return d;
    });
    console.log(mapInfo);
}

function annee_filter(data){
    return data.filter(function(d){return d.annee === annee_c;});
}

function get_history(data){
    let years = data.map(function(d){return d.annee;});
    years = [...new Set(years)]
    let history = []
    for (let y of years){
        history.push({
            year: y,
            value: d3.sum(data.filter(function(d){return d.annee === y;}),
                d=>d.consommation) 
        })
    }
    console.log(history)
    return history;
}

function drawLineChart(data){
    var svg = d3.select("#container_linechart")
    var myChart = new dimple.chart(svg, data);
    myChart.setBounds(60, 20, 300, 200);
    var x = myChart.addCategoryAxis("x", "year");
    x.addOrderRule("year");
    myChart.addMeasureAxis("y", "value");
    var s = myChart.addSeries(null, dimple.plot.area);
    myChart.draw();
    
    /*let width = 300;
    let height = 200;
    let margin = { left: 40, bottom: 20, right: 20, top: 20 }
    let bodyWidth = width - margin.left - margin.right;
    let bodyHeight = height - margin.top - margin.bottom;

    let xScale = d3.scaleLinear()
        .range([0, bodyWidth])
        .domain(d3.extent(data, d => d.year))

    let yScale = d3.scaleLinear()
        .range([bodyHeight, 0])
        .domain([0, d3.max(data, d => d.value)])

    let lineGenerator = d3.line()
        .x(d => xScale(d.year))
        .y(d => yScale(d.value))

    let linechart = d3.select("#container_linechart")

    linechart.select(".body")
        .attr("transform", `translate(${margin.left},${margin.top})`)
        .select("path").datum(data)
        .attr("d", lineGenerator)

    linechart.select(".xAxis")
        .attr("transform", `translate(${margin.left},${height - margin.bottom})`)
        .call(d3.axisBottom(xScale).ticks(5))

    linechart.select(".yAxis")
        .attr("transform", `translate(${margin.left},${margin.top})`)
        .call(d3.axisLeft(yScale).ticks(5).tickFormat(d => (d / 1e6) + "M"))
    */
}


function drawMap(data, mapInfo, sec){
    
    let maxConso = d3.max(mapInfo.features,
        d => d.properties[sec]);
    
    let midConso = d3.median(mapInfo.features,
        d => d.properties[sec]);
    console.log(maxConso, midConso);

    console.log(mapInfo);

    let cScale = d3.scaleLinear()
        .domain([0, 1000000, 2000000, 3000000, 4000000, maxConso])
        .range(["#18A1CD","#09A785", "#0AD8A2","#FFD29B","#FFB55F","#FF8900"]);

    let bodyHeight = width;
    let bodyWidth = height;

    let projection = d3.geoMercator()
        .center([3.1, 48.7])
        .scale(15000);

    let path = d3.geoPath()
        .projection(projection);

    body.selectAll("path")
        .data(mapInfo.features)
        .enter().append("path")
        .attr('d', d=>path(d))
        .attr("stroke", "white")
        .attr("fill",d => d.properties[sec] ?
            cScale(d.properties[sec]): "white")
        .on("mouseover", (d)=>{
            showTooltip(d.properties.nom, d.properties[sec],
                [d3.event.pageX + 30, d3.event.pageY - 30]);
        })
        .on("mouseleave", d=>{
            d3.select("#tooltip").style("display","none")
        })
        .on("click", d=> {
            selectedEPCI = d.properties.nom;
            let pie_data = [{
                "Secteur": "Agriculture",
                "Consommation": d.properties.conso_agr
            },{
                "Secteur": "Tertiaire",
                "Consommation": d.properties.conso_ter
            },{
                "Secteur": "Industrie",
                "Consommation": d.properties.conso_ind
            },{
                "Secteur": "Residentiel",
                "Consommation": d.properties.conso_res
            },{
                "Secteur": "Transport Routier",
                "Consommation": d.properties.conso_traf
            }];
            console.log(pie_data);
            drawPie(pie_data);
        })
}
