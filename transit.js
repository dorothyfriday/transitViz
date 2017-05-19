// Variable holding future tooltip
var div = d3.select("body").append("div")
    .attr("class", "tooltip valign-wrapper")
    .style("opacity", 0);

// Basemap settings
var map = L.map('mapcontainer').setView([39.78, -104.94], 10);
L.tileLayer('https://api.mapbox.com/styles/v1/drc0g/cj1cqr0u9006b2rquqfpf1qtu/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZHJjMGciLCJhIjoiY2lvbG44bXR6MDFxbHY0amJ1bTB3bGNqdiJ9.yVn2tfcPeU-adm015g_8xg', {
    attribution: 'Map data &copy; <a href="http://maps.rtd-denver.com/GisDatadownload/datadownload.aspx">RTD</a>, <a href="http://gis.drcog.org/datacatalog/">DRCOG </a>, <a href="http://www.costar.com">CoStar Realty Information, Inc.</a>, <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'your.mapbox.project.id',
    accessToken: 'pk.eyJ1IjoiZHJjMGciLCJhIjoiY2lvbG44bXR6MDFxbHY0amJ1bTB3bGNqdiJ9.yVn2tfcPeU-adm015g_8xg'
}).addTo(map);

// Attention leaflet, svgs en route
var svgmap = d3.select(map.getPanes().overlayPane).append("svg"),
    gmap = svgmap.append("g").attr("class", "leaflet-zoom-hide");

// Selecting div id from html
var transitLines = d3.select("#transitLines");

// Setting scale for future circles
var sqrtScale = d3.scaleSqrt()
	.domain([0, 8000])
	.range([0, 25]);

// Hello data
d3.json("housing_emp.json", function(error, data) {
  if (error) throw error;

// Creates custom projection for svg window *Thank you D3
  var transform = d3.geoTransform({point: projectPoint});
  var path = d3.geoPath().projection(transform)

// Add path element from data  
  var feature = gmap.selectAll("path")
      .data(data.features)
    .enter().append("path").style("fill","#04244D")
    .attr("class", function(d) {return "pt-" + d.properties.stationid});

// Do the following shit on zoom, view, or reset of map.
  map.on("zoom viewreset", reset);
  reset();

// Reposition the SVG to cover the features.
  function reset() {
    var bounds = path.bounds(data),
        topLeft = bounds[0],
        bottomRight = bounds[1];

    svgmap .attr("width", bottomRight[0] - topLeft[0])
           .attr("height", bottomRight[1] - topLeft[1])
           .style("left", topLeft[0] + "px")
           .style("top", topLeft[1] + "px");

    gmap   .attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");

    feature.attr("d", path);
  }

// Use Leaflet to implement a D3 geometric transformation.
  function projectPoint(x, y) {
    var point = map.latLngToLayerPoint(new L.LatLng(y, x));
    this.stream.point(point.x, point.y);
  }
    
// Adding the chart with data.
    
        var groupedData = _.groupBy(data.features, function(x){return x.properties.route});
        var groupedArr = _.keys(groupedData).map(function(y){
        return {name: y, data: _.sortBy(groupedData[y], function(num){ return num.properties.position; })}
        });
        console.log(groupedArr);
        console.log(groupedData);
        
//Adding rows to the chart
 
        var row = transitLines.selectAll("div")
            .data(groupedArr)
            .enter()
            .append("div")
			.attr("class", "valign-wrapper row")
       			.style("height", "100px")
        
        var column1 = row.append("div")
                         .attr("class","col s2 m2 l2");
		
        var column2 = row.append("div")
                        .attr("class", "col s10 m10 l10")

//Adding text to the chart
            column1.append("h6")
			.attr("class", "valign")
            .text(function(d, i){
                return d.name;
            })
            .style("text-align", "right");

//Adding shapes to the chart
	    column2.append("svg").style("width", 800).style("height",200).attr("class", "chart");

        var svg = d3.selectAll(".chart")

        var g = svg.append("g")

//Adding station lines to the chart
        g.append("line")
            .attr("x1", 100)
            .attr("y1", 100)
            .attr("y2", 100)
            .attr("x2", function (d, i){
                return 100 + (d.data.length * 40)
        })

//Adding circles to the chart.
        svg.selectAll("circle")
          .data(function(d){
        
            return d.data;

            
          }).enter().append("circle")
            .attr("r", function (d) {return sqrtScale(d.properties.units * 2);})
            .attr("cx", function (d, i){return 100+(i * 40) })
            .attr("cy", 100)
            .attr("fill", "#04244D")
            .attr("stroke","white")
			.attr("opacity", 0.75)
            .attr("stroke-width","1")

//on mouseover, create a tooltip (change opacity of tooltip) and highlight the point with matching station id on the map.
            .on("mouseover", function(d){
                div.transition()
                .duration(200)
                .style("opacity",0.9)
                div.html(d.properties.station + ", Near " + d.properties.units + " Units")
                .style("left",(d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px")
           
		//See here's where you add matching station id on map!
                var sel = ".pt-" + d.properties.stationid
            
                d3.selectAll(sel)
                  .style("fill", "#04244D")
                  .style("stroke","red")
                  .style("stroke-width", 10)
                  .style("z-index", 10000);
            })
            .on("mouseout", function(d) {
            div.transition()
                .duration(1200)
                .style("opacity", 0)
                
            var sel = ".pt-" + d.properties.stationid
            
                d3.selectAll(sel)
                  .style("fill","#04244D")
                  .style("stroke","#04244D")
                  .style("stroke-width", 1);
        });
});

