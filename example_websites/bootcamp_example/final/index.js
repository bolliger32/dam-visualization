(function(){

  /********************************************************************************
    INITIALIZE MAP
  ********************************************************************************/

  //Initialize a new Leaflet map object
  //Pass an object of options to initialization function
  var map = L.map('map', {
    center: [37, -120],
    zoom: 7,
    minZoom: 5,
    maxZoom: 12,
    attributionControl: true,
    touchZoom: false,
    scrollWheelZoom: false
  });


  /********************************************************************************
    ADD BASEMAP
  ********************************************************************************/

  //Initialize a new Leaflet layer
  var CartoDB_Positron = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
    subdomains: 'abcd',
    maxZoom: 19
  });

  //Add layer to map
  map.addLayer(CartoDB_Positron);
  map.setZoom(6);


  /********************************************************************************
    ADD TICK LOCATIONS
  ********************************************************************************/
  
  // Intialize a variable to holda Leaflet geoJson layer
  var tickLocations;

  // Create object to hold options for styling a custom marker
  var geojsonMarkerOptions = {
    radius: 4,
    fillColor: "#DE7A22",
    color: "#C56109",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.5
  };

  // Create a function to create a custom marker
  function createMarker(feature, latlng) {
    return L.circleMarker(latlng, geojsonMarkerOptions);
  }

  // Create a function to generate popup content
  function bindPopup(feature, layer) {
    var popupText = feature.properties.Location;
    if (feature.Specific_Location_Information != undefined) {
      popupText = popupText + " (" + feature.specific_location_information + ")";
    }
    layer.bindPopup(popupText);
  }

  // Use ajax call to get data. After data comes back apply styles and bind popup
  // If you're experienced with jQuery, you'll recognize we're making a GET 
  // request and expecting JSON in the response body. 
  // We're also passing in a callback function that takes the response JSON and adds it to the document.
  $.getJSON("../assets/data/tick_locations.geojson", function(data) {

    // Create new L.geoJson layer with data recieved from geojson file
    // and set the tickLocations variable to new L.geoJson layer
    tickLocations = L.geoJson(data, {
      pointToLayer: createMarker,
      onEachFeature: bindPopup
    });

    // Add tick locations to map
    tickLocations.addTo(map);

    // Add tick locations layer as an overlay to layer control
    // Note: $.getJSON method is asynchronous. Although we intialize layerControl later in the code
    // it should already exists by the time this code runs. 
    layerControl.addOverlay(tickLocations, "Tick Collection Locations");


    /********************************************************************************
      ADD MARKER CLUSTER LAYER
    ********************************************************************************/
    // This functionaility is provided by Leaflet Marker Cluster ibrary
    var clusteredMarkers = L.markerClusterGroup();
    clusteredMarkers.addLayer(tickLocations);
    layerControl.addOverlay(clusteredMarkers, "Tick Collection Locations (Clustered)");


    /********************************************************************************
      ADD 10 MILE BUFFER AROUND TICK LOCATIONS 
    ********************************************************************************/
    var bufferFeatureCollection = turf.buffer(data, 10, 'miles');
    var buffersLayer = L.geoJson(bufferFeatureCollection);
    layerControl.addOverlay(buffersLayer, "10 Mile Buffers around Tick Collection Locations");
  

  });





  /********************************************************************************
    ADD LAYER CONTROL
  ********************************************************************************/

  // Create a new Leaflet layer control
  var layerControl = L.control.layers(null, null, { position: 'bottomleft' }).addTo(map);

  // Add basemap defined earlier to layer control
  layerControl.addBaseLayer(CartoDB_Positron, "Grayscale");


  /********************************************************************************
    ADD A GEOCODER
  ********************************************************************************/

  // Create a new geocoder that uses the Nominatim service provided by OSM
  // The countrycodes : 'us' option restricts searches to locations within US
  // For more options see https://github.com/perliedman/leaflet-control-geocoder
  var nominatim = new L.Control.Geocoder.Nominatim({
    geocodingQueryParams: {
      countrycodes: 'us'
    }
  });

  // Create a new geocoder control and pass in nominatim as the geocding service to use
  var geocoder = L.Control.geocoder({
    position: 'topleft',
    geocoder: nominatim
  }).addTo(map);

  // Intialize a new Leaflet Marker layer to store the geocding result
  var geocodeMarker = new L.Marker();

  // Overwrite the markGeocode function provided by geocoder control
  geocoder.markGeocode = function(result) {
    
    // Pans map to center
    map.setView(result.center, 8);

    // If a Leaflet Marker layer created by previous geocoding query exists, remove it from map
    if (map.hasLayer(geocodeMarker)){
      map.removeLayer(geocodeMarker);
    };

    // Update Leaflet Marker's location and popup content
    // Add to map and open popup
    geocodeMarker
      .setLatLng(result.center)
      .bindPopup(result.name || result.html)
      .addTo(map)
      .openPopup();    

  };

  // If user clicks anywhere on map remove geocoding result
  map.on('click', function(e){
    if (map.hasLayer(geocodeMarker)){
      map.removeLayer(geocodeMarker);
    };
  });


  /********************************************************************************
    ADD COUNTY POLYGONS
  ********************************************************************************/

  // Create a new L.TopoJSON layer
  var countyLayer = new L.TopoJSON();

  // Create a color scale for styling counties
  var colorScale = chroma.scale(['aad4ed', '004966']);
  var colorScaleDataValues = [];
  var colorClassBreaks;

  // The code below is another way to use jQuery's $.getJSON method
  // See https://davidwalsh.name/write-javascript-promises
  // Use the promise object returned by the $.getJSON method. 
  // When the response is returned, the .done method is called with the function (callback)
  // you provide. If the request fails, the .fail method is called.
  $.getJSON('../assets/data/ca_counties_census.topojson')
    .done(addCountyData)
    .fail(function() {
      $('body').append('<p>Oh no, something went wrong with the county layer!</p>');
  });


  function addCountyData(topoData){

    // This is calling the addData method of the new L.TopoJSON layer we defined earlier
    countyLayer.addData(topoData);
    
    // This is calling the addTo method of Leaflet's L.layerGroup
    countyLayer.addTo(map);

    // This is calling the eachLayer method of Leaflet's L.layerGroup
    // Note: L.TopoJSON extends L.GeoJSON extends L.FeatureGroup extends L.layerGroup
    // It iterates over the layers of the group and calls function addToDomain that we define below
    countyLayer.eachLayer(addToDomain);

    // Calculate quantile breaks for color scale
    calcQuantileBreaks();

    // Add legend
    addLegend();

    // For each layer it call function handleLayer that we define below
    countyLayer.eachLayer(handleLayer);

    // Move data behind tick locations
    countyLayer.bringToBack();

    // Add overlay to layer control
    layerControl.addOverlay(countyLayer, "CA Counties");

    // Create county d3 charts
    createPolygonViz(topoData);
  }


  // Add population density values to color scale
  function addToDomain(layer){
    var value = +layer.feature.properties['lyme_disease_avg_rate_avg_rate_2001_2014'];
    colorScaleDataValues.push(value);
  }


  // Calculate quantile breaks for color scale
  function calcQuantileBreaks(){
    colorScaleDataValues.sort();
    colorClassBreaks = chroma.limits(colorScaleDataValues, 'e', 4);
    colorScale.domain(colorClassBreaks);
  }


  // Add legend
  // Inspiration for this legend https://www.mapbox.com/mapbox.js/example/v1.0.0/custom-legend/
  function addLegend(){

    // Append a new span element for each class
    colorClassBreaks.forEach(function(val){
      var color = colorScale(val).hex();
      $('.legend').append("<span style='background:" + color + ";'></span>")
    });

    // Append a new label element for each class
    colorClassBreaks.forEach(function(val){
      $('.legend').append("<label>" + val.toFixed(1) + "</label>")
    });
  }


  // Style each layer
  function handleLayer(layer){

    // Get population density and corresponding color (hexvalue) from color scale
    var density = layer.feature.properties.lyme_disease_avg_rate_avg_rate_2001_2014;
    var fillColor = colorScale(density).hex();  
    
    // Style polygons
    layer.setStyle({
      fillColor : fillColor,
      fillOpacity: 0.8,
      color:'#fff',
      weight:2,
      opacity:.5
    });
    
    // Attach events to each polygon
    layer.on({
      mouseover: enterLayer,
      mouseout: leaveLayer,
    });

  }


  // Function fired when user's mouse enters the layer
  function enterLayer(){

    var county = this.feature;

    // Get county name and pop. density and create a new html string
    var countyName = county.properties.CountyNAME;
    var rate = +county.properties.lyme_disease_avg_rate_avg_rate_2001_2014;
    var html = '<b>' + countyName + '</b><br/>' +'Incidence rate is ' + rate.toFixed(1) + ' per 100,000 person-years';

    // Change style of polygon
    this.setStyle({
      weight:3,
      opacity: 1
    });
    
    /********************************************************************************
    SPATIAL ANALYSIS IN YOUR BROWSER
    ********************************************************************************/

    // Many turf functions expect a featurecollection. 
    // Use turf's featurecollection helper method to convert our geojson feature into a
    // featurecollection
    var countyGeojson = turf.featureCollection([county]);

    // Count number of tick locations within county
    var ptsWithin = turf.within(tickLocations.toGeoJSON(), countyGeojson);
    var count = ptsWithin.features.length;

    // Add count to html string
    html = html + '<br/>' + count + ' tick collection locations';

    // Append html string to p element with .info class
    $('.info').html(html);

  }


  // Function fired when user's mouse leaves the layer
  function leaveLayer(){
    $('.info').text('Hover over a county');
    this.setStyle({
      weight:2,
      opacity:.5
    });
  }


  /********************************************************************************
    ADD A REUSABLE D3 CHART
  ********************************************************************************/
  var countChartEl = document.querySelector('.count-chart .chart-canvas');
  var width = countChartEl.offsetWidth;
  var height = countChartEl.offsetHeight || 300;
  var dateFormat = d3.timeParse("%Y"); // Function for parsing date
  var data;

  // Create an instance of a barChart 
  // Neither data nor selection has yet been passed to the chart, so nothing will
  // actually happen based upon this function call
  var countChart = barChart();

  // Use d3.csv to convert a csv file into an array of objects
  // This method is also asynchronous like jQuery's $.getJSON method
  d3.csv("../assets/data/lyme_disease_2001-2014.csv", function(error, _data) {

    data = _data;

    // Convert string Year into date type and add a new attribute d.date
    // Convert Rate into a number type add a new attribute d.value
    data.forEach(function(d) {
      d.date = dateFormat(d.Year);
      d.value = +d.Count;
    });

    var stateData = data.filter( function(item) {
      return (item.County == 'California' && item.Sex == 'Total');
    });

    // Pass attributes using the setters provided by barChart
    countChart.width(width);
    countChart.height(height);
    countChart.axisLabel('Total Cases');

    // Select the chart-canvas div in HTML, bind data to it, draw the chart  
    d3.select(countChartEl)
      .datum(stateData)
      .call(countChart);

  });


  // Add a form to search for and filter data by County Names
  // Update the same chart with new selection
  var searchBtn = document.querySelector('#count-chart-form input[type="submit"]');
  var searchStr = document.querySelector('#count-chart-form input[type="search"]');
  var locationName = document.querySelector('.count-chart .location');

  searchBtn.addEventListener('click', function(e){
    e.preventDefault();
    e.stopPropagation();

    var county = searchStr.value;
    locationName.innerHTML = county;
    var countyData = data.filter( function(item) {
      return (item.County == county && item.Sex == 'Total');
    });

   if (countyData.length !== 0) {
      searchStr.style.color = 'inherit';
      d3.select(countChartEl)
        .datum(countyData)
        .call(countChart);
   } else {
      searchStr.style.color = 'red';
   }

  });




function createPolygonViz (data) {
  var counties = topojson.feature(data, data.objects.ca_counties_census2);
  counties.features.forEach(function(feature){
    var rate = +feature.properties['lyme_disease_avg_rate_avg_rate_2001_2014'];
    var name = feature.properties['CountyNAME'];
    if (rate >= 4) {
      var countyPolygon = drawPolygon()
        .data(feature);
      d3.select(".polygons-chart .chart-canvas")
        .call(countyPolygon);
    }
  });

}




})();