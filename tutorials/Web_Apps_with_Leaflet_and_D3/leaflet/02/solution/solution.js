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


  /********************************************************************************
      ADD TICK LOCATIONS
  ********************************************************************************/

  // Create an empty L.geoJson object, add it to map
  // Note: we are chaining two methods here; [method chaining](http://schier.co/blog/2013/11/14/method-chaining-in-javascript.html) is a common technique for writing compact code 
  // in scenarios that involve multiple functions on same object consecutively.

  var tickLocations = L.geoJson().addTo(map);      

  // This is an example of asynchronous function
  // All code within the $.getJSON method will be executed once the client (our browser)
  // makes a request to server (in this case our local server) for data
  // and recieves data back from server
  $.getJSON("../../../assets/data/tick_locations.geojson", function(data) {
    tickLocations.addData(data);
  });










// Do not delete the brackets below
})();
