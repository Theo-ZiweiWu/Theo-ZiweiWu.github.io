var width = 600,
    height = 400, 
    centered;

let body = d3.select("#body");

const geojson_url = "https://raw.githubusercontent.com/Theo-ZiweiWu/Prototype-DRIEE-TDB/master/EPCI-ile-de-france.geojson";
const data_url = "https://raw.githubusercontent.com/Theo-ZiweiWu/Prototype-DRIEE-TDB/master/airparif_consommation_epci.csv";
const chiffres_url = "https://raw.githubusercontent.com/Theo-ZiweiWu/Prototype-DRIEE-TDB/master/page_chiffre_cles.csv"

var annee_c = "2017";
var mapInfo = undefined;
var data = undefined;
var selectedEPCI = undefined;


Promise.all([
    d3.csv("airparif_consommation_epci.csv"),
    d3.json(geojson_url)
]).then((datasources)=>{
    update_chiffre_cles();
    mapInfo = datasources[1];
    data = datasources[0];
    let line_data = get_history(data);
    data = annee_filter(data);
    var sec_info = get_secteurInfo(data);
    var eng_info = get_energieInfo(data);
    drawTreemap(eng_info);
    drawPie(sec_info);
    prepare_data(mapInfo, data);
    drawMap(data, mapInfo, "conso_tot");
    drawLineChart(line_data);
})

function set_html(id, text){
    document.getElementById(id).innerHTML = text;
}

function get_secteurInfo(data){
    var sec_info = [{
        "Secteur": "Agriculture",
        "Consommation": d3.sum(data.filter(d=>d.secteur === "AGR"),d=>d.consommation)
    },{
        "Secteur": "Tertiaire",
        "Consommation": d3.sum(data.filter(d=>d.secteur === "TER"),d=>d.consommation)
    },{
        "Secteur": "Industrie",
        "Consommation": d3.sum(data.filter(d=>d.secteur === "IND"),d=>d.consommation)
    },{
        "Secteur": "Residentiel",
        "Consommation": d3.sum(data.filter(d=>d.secteur === "RES"),d=>d.consommation)
    },{
        "Secteur": "Transport Routier",
        "Consommation": d3.sum(data.filter(d=>d.secteur === "TRAF"),d=>d.consommation)
    }];
    return sec_info;
}

function get_energieInfo(data){
    var eng_info = [{
        "Energie": "Electricité", 
        "Consommation": d3.sum(data.filter(d=>d.energie === "ELEC"),d=>d.consommation)
    },{
        "Energie": "Gaz Naturel", 
        "Consommation": d3.sum(data.filter(d=>d.energie === "GN"),d=>d.consommation)
    },{
        "Energie": "Produit pétrolier et charbon", 
        "Consommation": d3.sum(data.filter(d=>d.energie === "PP_CMS"),d=>d.consommation)
    },{
        "Energie": "URB", 
        "Consommation": d3.sum(data.filter(d=>d.energie === "URB"),d=>d.consommation)
    },{
        "Energie": "Bois", 
        "Consommation": d3.sum(data.filter(d=>d.energie === "BOIS"),d=>d.consommation)
    }];
    console.log(eng_info);
    return eng_info;
}

function update_chiffre_cles(){
    d3.csv("page_chiffre_cles.csv").then((data)=>{
        consomm_1 = data.filter(function(d){return d.id === "consommation_1";});
        consomm_2 = data.filter(function(d){return d.id === "consommation_2";});
        consomm_3 = data.filter(function(d){return d.id === "consommation_3";});
        precarite_1 = data.filter(function(d){return d.id === "precarite_1";});
        precarite_2 = data.filter(function(d){return d.id === "precarite_2";});
        precarite_3 = data.filter(function(d){return d.id === "precarite_3";});
        emission_1 = data.filter(function(d){return d.id === "emission_1";});
        emission_2 = data.filter(function(d){return d.id === "emission_2";});
        emission_3 = data.filter(function(d){return d.id === "emission_3";});
        bati_1 = data.filter(function(d){return d.id === "bati_1";});
        bati_2 = data.filter(function(d){return d.id === "bati_2";});
        bati_3 = data.filter(function(d){return d.id === "bati_3";});
        transport_1 = data.filter(function(d){return d.id === "transport_1";});
        transport_2 = data.filter(function(d){return d.id === "transport_2";});
        transport_3 = data.filter(function(d){return d.id === "transport_3";});
        chaleur_1 = data.filter(function(d){return d.id === "chaleur_1";});
        chaleur_2 = data.filter(function(d){return d.id === "chaleur_2";});
        chaleur_3 = data.filter(function(d){return d.id === "chaleur_3";});
        autre_enr_1 = data.filter(function(d){return d.id === "autre_enr_1";});
        autre_enr_2 = data.filter(function(d){return d.id === "autre_enr_2";});
        autre_enr_3 = data.filter(function(d){return d.id === "autre_enr_3";});
        set_html("consomm_1_chiffre", consomm_1[0].chiffre_cles);
        set_html("consomm_2_chiffre", consomm_2[0].chiffre_cles);
        set_html("consomm_3_chiffre", consomm_3[0].chiffre_cles);
        set_html("consomm_1_description", consomm_1[0].description);
        set_html("consomm_2_description", consomm_2[0].description);
        set_html("consomm_3_description", consomm_3[0].description);
        set_html("consomm_1_des_sup", consomm_1[0].description_sup);
        set_html("consomm_2_des_sup", consomm_2[0].description_sup);
        set_html("consomm_3_des_sup", consomm_3[0].description_sup);
        set_html("consomm_1_mot_cle", consomm_1[0].mot_cle);
        set_html("consomm_2_mot_cle", consomm_2[0].mot_cle);
        set_html("consomm_3_mot_cle", consomm_3[0].mot_cle);
        
        set_html("precarite_1_chiffre", precarite_1[0].chiffre_cles);
        set_html("precarite_2_chiffre", precarite_2[0].chiffre_cles);
        set_html("precarite_3_chiffre", precarite_3[0].chiffre_cles);
        set_html("precarite_1_description", precarite_1[0].description);
        set_html("precarite_2_description", precarite_2[0].description);
        set_html("precarite_3_description", precarite_3[0].description);
        set_html("precarite_1_des_sup", precarite_1[0].description_sup);
        set_html("precarite_2_des_sup", precarite_2[0].description_sup);
        set_html("precarite_3_des_sup", precarite_3[0].description_sup);
        set_html("precarite_1_mot_cle", precarite_1[0].mot_cle);
        set_html("precarite_2_mot_cle", precarite_2[0].mot_cle);
        set_html("precarite_3_mot_cle", precarite_3[0].mot_cle);
        
        set_html("emission_1_chiffre", emission_1[0].chiffre_cles);
        set_html("emission_2_chiffre", emission_2[0].chiffre_cles);
        set_html("emission_3_chiffre", emission_3[0].chiffre_cles);
        set_html("emission_1_description", emission_1[0].description);
        set_html("emission_2_description", emission_2[0].description);
        set_html("emission_3_description", emission_3[0].description);
        set_html("emission_1_des_sup", emission_1[0].description_sup);
        set_html("emission_2_des_sup", emission_2[0].description_sup);
        set_html("emission_3_des_sup", emission_3[0].description_sup);
        set_html("emission_1_mot_cle", emission_1[0].mot_cle);
        set_html("emission_2_mot_cle", emission_2[0].mot_cle);
        set_html("emission_3_mot_cle", emission_3[0].mot_cle);
        
        set_html("bati_1_chiffre", bati_1[0].chiffre_cles);
        set_html("bati_2_chiffre", bati_2[0].chiffre_cles);
        set_html("bati_3_chiffre", bati_3[0].chiffre_cles);
        set_html("bati_1_description", bati_1[0].description);
        set_html("bati_2_description", bati_2[0].description);
        set_html("bati_3_description", bati_3[0].description);
        set_html("bati_1_des_sup", bati_1[0].description_sup);
        set_html("bati_2_des_sup", bati_2[0].description_sup);
        set_html("bati_3_des_sup", bati_3[0].description_sup);
        set_html("bati_1_mot_cle", bati_1[0].mot_cle);
        set_html("bati_2_mot_cle", bati_2[0].mot_cle);
        set_html("bati_3_mot_cle", bati_3[0].mot_cle);
        
        set_html("transport_1_chiffre", transport_1[0].chiffre_cles);
        set_html("transport_2_chiffre", transport_2[0].chiffre_cles);
        set_html("transport_3_chiffre", transport_3[0].chiffre_cles);
        set_html("transport_1_description", transport_1[0].description);
        set_html("transport_2_description", transport_2[0].description);
        set_html("transport_3_description", transport_3[0].description);
        set_html("transport_1_des_sup", transport_1[0].description_sup);
        set_html("transport_2_des_sup", transport_2[0].description_sup);
        set_html("transport_3_des_sup", transport_3[0].description_sup);
        set_html("transport_1_mot_cle", transport_1[0].mot_cle);
        set_html("transport_2_mot_cle", transport_2[0].mot_cle);
        set_html("transport_3_mot_cle", transport_3[0].mot_cle);
        
        set_html("chaleur_1_chiffre", chaleur_1[0].chiffre_cles);
        set_html("chaleur_2_chiffre", chaleur_2[0].chiffre_cles);
        set_html("chaleur_3_chiffre", chaleur_3[0].chiffre_cles);
        set_html("chaleur_1_description", chaleur_1[0].description);
        set_html("chaleur_2_description", chaleur_2[0].description);
        set_html("chaleur_3_description", chaleur_3[0].description);
        set_html("chaleur_1_des_sup", chaleur_1[0].description_sup);
        set_html("chaleur_2_des_sup", chaleur_2[0].description_sup);
        set_html("chaleur_3_des_sup", chaleur_3[0].description_sup);
        set_html("chaleur_1_mot_cle", chaleur_1[0].mot_cle);
        set_html("chaleur_2_mot_cle", chaleur_2[0].mot_cle);
        set_html("chaleur_3_mot_cle", chaleur_3[0].mot_cle);
        
        set_html("autre_enr_1_chiffre", autre_enr_1[0].chiffre_cles);
        set_html("autre_enr_2_chiffre", autre_enr_2[0].chiffre_cles);
        set_html("autre_enr_3_chiffre", autre_enr_3[0].chiffre_cles);
        set_html("autre_enr_1_description", autre_enr_1[0].description);
        set_html("autre_enr_2_description", autre_enr_2[0].description);
        set_html("autre_enr_3_description", autre_enr_3[0].description);
        set_html("autre_enr_1_des_sup", autre_enr_1[0].description_sup);
        set_html("autre_enr_2_des_sup", autre_enr_2[0].description_sup);
        set_html("autre_enr_3_des_sup", autre_enr_3[0].description_sup);
        set_html("autre_enr_1_mot_cle", autre_enr_1[0].mot_cle);
        set_html("autre_enr_2_mot_cle", autre_enr_2[0].mot_cle);
        set_html("autre_enr_3_mot_cle", autre_enr_3[0].mot_cle);
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

function drawTreemap(data){
    let width_map = 900;
    let height_map = 250;
    console.log(data);
    var svg_tree = d3.select("#container_treemap")
        .attr("transform", "translate(" + 10 + ", " + 10 + ")");
        
    var color_tree = d3.scaleOrdinal()
    .domain(["Electricité", "Produit pétrolier et charbon", "Gaz Naturel", "URB", "Bois"])
    .range(["#18A1CD", "#525252", "#09BB9F", "#F67272", "#09A785"]);

    root = {};
    root["name"] = "root";
    children = [];
    for(let c of data){
        obj = {
            energie: c.Energie,
            parent: "Root",
            consommation: c.Consommation
        };
        children.push(obj);
    }
    root["children"] = children;
    tree = d3.hierarchy(root);
    
    tree.sum(function(d) { return +d.consommation})

    
    d3.treemap()
    .size([width_map, height_map])
    .padding(4)
    (tree)

    svg_tree
        .selectAll("rect")
        .data(tree.leaves())
        .enter()
        .append("rect")
        .attr('x', function (d) { return d.x0; })
        .attr('y', function (d) { return d.y0; })
        .attr('width', function (d) { return d.x1 - d.x0; })
        .attr('height', function (d) { return d.y1 - d.y0; })
        .style("stroke", "white")
        .style("fill", function(d) { return color_tree(d.data.energie);});
    
    // and to add the text labels
    svg_tree
        .selectAll("text")
        .data(tree.leaves())
        .enter()
        .append("text")
        .attr("x", function(d){ return d.x0+10})    // +10 to adjust position (more right)
        .attr("y", function(d){ return d.y0+20})    // +20 to adjust position (lower)
        .text(function(d){ return d.data.energie})
        .attr("font-size", "15px")
        .attr("fill", "white")

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
            return colorScale(d.data.secteur)})
        .on("mousemove", (d)=>{
            console.log(d.data.secteur);
            showTooltipPie(d.data.secteur, d.data.consommation,[d3.event.pageX + 30, d3.event.pageY - 30]);})
        .on("mouseleave", d=>{
            d3.select("#tooltip2").style("display","none")});
}

function change_year(a){
    d3.csv("airparif_consommation_epci.csv").then((data_s)=>{
        annee_c = a;
        data = annee_filter(data_s);
        var sec_info = get_secteurInfo(data);
        var eng_info = get_energieInfo(data);
        drawTreemap(eng_info);
        drawPie(sec_info);
        prepare_data(mapInfo, data);
        drawMap(data, mapInfo,"conso_tot");
    })
}

function prepare_data(mapInfo, data){
    let secteurs=["RES","TRAF","TER","IND","AGR"];
    let energie=["ELEC","URB","BOIS","GN"];
    let dataSecteur = {};
    let dataEnergie = {};
    for(let c of data){
        let par_secteur = {};
        let par_energie = {};
        let epci = c.epci;
        for(let s of secteurs){
            par_secteur[s] = d3.sum(data.filter(d=>d.epci === c.epci && 
                d.secteur === s),d=>d.consommation);
        }
        for(let e of energie){
            par_energie[e] = d3.sum(data.filter(d=>d.epci === c.epci && 
                d.energie === e),d=>d.consommation);
        }
        par_energie["PP_CMS"] = d3.sum(data.filter(d=>d.epci === c.epci && 
            d.energie === "PP + CMS"),d=>d.consommation);
        par_secteur["TOT"] = d3.sum(data.filter(d=>d.epci === c.epci),d=>d.consommation);
        dataSecteur[epci] = par_secteur;
        dataEnergie[epci] = par_energie;
    };

    mapInfo.features = mapInfo.features.map(d => {
        let epci = d.properties.code;
        let conso = dataSecteur[epci];
        let conso_eng = dataEnergie[epci];
        
        d.properties.conso_agr = Math.round(conso.AGR);
        d.properties.conso_ind = Math.round(conso.IND);
        d.properties.conso_res = Math.round(conso.RES);
        d.properties.conso_traf = Math.round(conso.TRAF);
        d.properties.conso_ter = Math.round(conso.TER);
        d.properties.conso_tot = Math.round(conso.TOT);
        d.properties.conso_elec = Math.round(conso_eng.ELEC);
        d.properties.conso_urb = Math.round(conso_eng.URB);
        d.properties.conso_bois = Math.round(conso_eng.BOIS);
        d.properties.conso_gn = Math.round(conso_eng.GN);
        d.properties.conso_pp_cms = Math.round(conso_eng.PP_CMS);

        return d;
    });
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
            Annee: y,
            Consommation_totale: d3.sum(data.filter(function(d){return d.annee === y;}),
                d=>d.consommation)/1000,
            Consommation_moyenne: d3.sum(data.filter(function(d){return d.annee === y;}),
            d=>d.consommation)/12150
        });
    }
    console.log(history)
    return history;
}

function drawLineChart(data){
    var svg = d3.select("#container_linechart")
    var myChart = new dimple.chart(svg, data);
    myChart.setBounds(50, 20, 300, 140);
    var x = myChart.addCategoryAxis("x", "Annee");
    x.addOrderRule("Annee");
    var y1 = myChart.addMeasureAxis("y", "Consommation_totale");
    var y2 = myChart.addMeasureAxis("y", "Consommation_moyenne");
    var s = myChart.addSeries(null, dimple.plot.bar,[x,y1]);
    var t = myChart.addSeries(null, dimple.plot.line,[x,y2]);
    t.lineMarkers = true;
    myChart.defaultColors = [
        new dimple.color("#09A785", "#FF483A", 1),
    ];
    myChart.draw();
}

function drawMap(data, mapInfo, sec){
    
    let maxConso = d3.max(mapInfo.features,
        d => d.properties[sec]);
    
    let midConso = d3.median(mapInfo.features,
        d => d.properties[sec]);
    console.log(maxConso, midConso);

    let cScale = d3.scaleLinear()
        .domain([0, 1000000, 2000000, 3000000, 4000000, maxConso])
        .range(["#18A1CD","#09A785", "#0AD8A2","#FFD29B","#FFB55F","#FF8900"]);

    let bodyHeight = width;
    let bodyWidth = height;

    let projection = d3.geoMercator()
        .center([3.9, 48.4])
        .scale(10600);

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
            d3.select("#tooltip").style("display","none");
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
            
            let tree_data = [{
                "Energie": "ELEC", 
                "Consommation": d.properties.conso_elec
            },{
                "Energie": "GN", 
                "Consommation": d.properties.conso_gn
            },{
                "Energie": "PP_CMS", 
                "Consommation": d.properties.conso_pp_cms
            },{
                "Energie": "URB", 
                "Consommation": d.properties.conso_urb
            },{
                "Energie": "BOIS", 
                "Consommation": d.properties.conso_bois
            }];
            drawTreemap(tree_data);
            drawPie(pie_data);
        })
        
}
