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













// Do not delete the brackets below
})();
