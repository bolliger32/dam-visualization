(function(){

  /********************************************************************************
    INITIALIZE MAP
  ********************************************************************************/
  //Initialize a new Leaflet map object
  //Pass an object of options to initialization function
    var map = L.map('map', {
      center: [37, -120],
      zoom: 6,
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


  /********************************************************************************
    ADD LAYER CONTROL
  ********************************************************************************/

  // Create a new Leaflet layer control
  var layerControl = L.control.layers(null, null, { position: 'bottomleft' }).addTo(map);

  // Add basemap defined earlier to layer control
  layerControl.addBaseLayer(CartoDB_Positron, "Grayscale");


  /********************************************************************************
      ADD TICK LOCATIONS
  ********************************************************************************/

  // Intialize a variable to hold a Leaflet geoJson layer
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

  // Create a callback function to create a custom marker
  function createMarker(feature, latlng) {
    return L.circleMarker(latlng, geojsonMarkerOptions);
  }

  // Create a callback function to generate popup content
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
  $.getJSON("../../assets/data/tick_locations.geojson", function(data) {

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
  $.getJSON('../../assets/data/ca_counties_census.topojson')
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

    // For each layer it call function handleLayer that we define below
    countyLayer.eachLayer(handleLayer);

    // Move data behind tick locations
    countyLayer.bringToBack();

    // Add overlay to layer control
    layerControl.addOverlay(countyLayer, "CA Counties");

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







// Do not delete the brackets below
})();
