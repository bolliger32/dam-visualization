TESTING MAPBOX

(function(){


var mapboxgl = require('mapbox-gl/dist/mapbox-gl.js');
 
mapboxgl.accessToken = 'pk.eyJ1IjoiY2FybWVudHViYmVzaW5nIiwiYSI6ImNqMTVlb3Q2bzAxNTQzM3F1NXVtNXp4Mm8ifQ.3J3XSFxrXpID8Epujmex0A';
var map = new mapboxgl.Map({
container: 'YOUR_CONTAINER_ELEMENT_ID',
style: 'mapbox://styles/mapbox/streets-v9'
});