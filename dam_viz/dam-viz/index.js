
(function(){
  /********************************************************************************
    INITIALIZE MAP
  ********************************************************************************/

  //Initialize a new Leaflet map object
  //Pass an object of options to initialization function
  var map = L.map('map', {
	center: [38, -120.5],
    zoom: 6,
    minZoom: 1,
    maxZoom: 10,
    attributionControl: true,
    touchZoom: false,
    scrollWheelZoom: false
  });


  /********************************************************************************
    ADD BASEMAP
  ********************************************************************************/

  //Initialize a new Leaflet layer
var Esri_WorldImagery = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});

  //Add layer to map
  map.addLayer(Esri_WorldImagery);
 // map.setZoom(1);


  /********************************************************************************
    ADD DAM LOCATIONS
  ********************************************************************************/
  
  // Intialize a variable to holda Leaflet geoJson layer
  var damLocations;
  var clusteredMarkers;

  // Create object to hold options for styling a custom marker
  var geojsonMarkerOptions = {
    radius: 7,
    fillColor: "#fdae6b",
    color: "#e6550d",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
  };

	

  // Create a function to create a custom marker
  function createMarker(feature, latlng) {
	  var newpopup = L.popup({ closeOnClick: false, autoClose: false }).setContent(feature.properties.Dam_Name);
    return L.circleMarker(latlng, geojsonMarkerOptions).bindPopup(newpopup);
  }

	// Use ajax call to get data. After data comes back apply styles and bind popup
  // If you're experienced with jQuery, you'll recognize we're making a GET 
  // request and expecting JSON in the response body. 
  // We're also passing in a callback function that takes the response JSON and adds it to the document.
  function addDams(filterFunc) {
    $.getJSON("../assets/data/dams_CA.geojson", function(data) {

    // Create new L.geoJson layer with data recieved from geojson file
    // and set the damLocations variable to new L.geoJson layer
    if (typeof filterFunc === "undefined") {
      damLocations = L.geoJson(data, {
        pointToLayer: createMarker,
        onEachFeature: onEachFeature
      });
    } else {
      damLocations = L.geoJson(data, {
        pointToLayer: createMarker,
        onEachFeature: onEachFeature,
        filter: filterFunc
      });
    }


    // Add dam locations layer as an overlay to layer control
    // Note: $.getJSON method is asynchronous. Although we intialize layerControl later in the code
    // it should already exists by the time this code runs. 
    layerControl.addOverlay(damLocations, "Dam Locations");


    /********************************************************************************
      ADD MARKER CLUSTER LAYER
    ********************************************************************************/
    // This functionaility is provided by Leaflet Marker Cluster Library
    clusteredMarkers = L.markerClusterGroup();
    clusteredMarkers.addLayer(damLocations);
    layerControl.addOverlay(clusteredMarkers, "Dam Locations (Clustered)");

    // Add dam clusters to map
    clusteredMarkers.addTo(map);
    });
  }
  addDams();


  /********************************************************************************
    ADD LAYER CONTROL
  ********************************************************************************/

  // Create a new Leaflet layer control
  var layerControl = L.control.layers(null, null, { position: 'bottomleft', }).addTo(map);

  // Add basemap defined earlier to layer control
  layerControl.addBaseLayer(Esri_WorldImagery, "Imagery");



  function getFilterFunc(value) {
    var filterFunc = function(feature, layer) {
      return feature.properties.Dam_Type === value ? true : false;
    }
    return filterFunc;
  }
  
  function applyFilter(value) {
    map.removeLayer(damLocations);
    clusteredMarkers.clearLayers();
    layerControl.removeLayer(damLocations);
    layerControl.removeLayer(clusteredMarkers);
    if (value === "reset") {
      addDams()
    } else {
      var filterFunc = getFilterFunc(value);
      addDams(filterFunc);
    }
  }
  
  var filterBar = L.control({position: 'topright'});
	filterBar.onAdd = function () {
		var div = L.DomUtil.create('div', 'info legend');
		div.innerHTML = '<select><option value="reset">Dam Type</option><option value="Rockfill">Rockfill</option><option value="Earth">Earth</option><option value="Multi-Arch">Multi-Arch</option><option value="Timber Crib">Timber Crib</option><option value="RCC">RCC</option><option value="Masonry">Masonry</option><option value="Stone">Stone</option><option value="Concrete">Concrete</option><option value="Gravity">Gravity</option><option value="Arch">Arch</option><option value="Buttress">Buttress</option><option value="Other">Other</option></select>';
    var selector = div.firstChild;
		selector.onchange = function () {applyFilter(selector.value)};
    selector.onmousedown = selector.ondblclick = L.DomEvent.stopPropagation;
		return div;
	};
	map.addControl(filterBar);

  /********************************************************************************
    Add table - http://leafletjs.com/examples/choropleth/
  ********************************************************************************/	
	
	var info = L.control({
		position: 'bottomright',
		});

	info.onAdd = function (map) {
		this._div = L.DomUtil.create('div', 'info'); 
		this.update();
		return this._div;
	}

	
	var table = document.createElement('table');
	var theader1 = document.createElement('th');
	var theader2 = document.createElement('th');
	var theader3 = document.createElement('th');
	var trH = document.createElement('tr');
	var headertext1 = document.createTextNode('Dam Name');
	var headertext2 = document.createTextNode('Type');
	var headertext3 = document.createTextNode('Height');
	theader1.appendChild(headertext1);
	theader2.appendChild(headertext2);
	theader3.appendChild(headertext3);
	trH.appendChild(theader1);
	trH.appendChild(theader2);
	trH.appendChild(theader3);
	table.appendChild(trH);

	info.update = function (props) {

		var tr1 = document.createElement('tr');
		var td1 = document.createElement('td');
		var text1 = document.createTextNode(props ? props.Dam_Name : '');
		
		var td2 = document.createElement('td');
		var text2 = document.createTextNode(props ? ' ' + props.Dam_Type + ' ': '');
		
		var td3 = document.createElement('td');
		var text3 = document.createTextNode(props ? ' ' + props.Dam_Height + ' ' : '');
		
		
		td1.appendChild(text1);
		tr1.appendChild(td1);
		table.appendChild(tr1);	
		
		td2.appendChild(text2);
		tr1.appendChild(td2);

		td3.appendChild(text3);
		tr1.appendChild(td3);


		this._div.appendChild(table);
		

	};

	info.addTo(map);
	
	function bringToFront(e) {
		var layer = e.target;

		if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
			layer.bringToFront();
		}

	}
	
	function updateInfo(e) {
		var layer = e.target;	
		info.update(layer.feature.properties);
		layer.setStyle({
			weight: 2,
			color: '#a63603',
			fillColor: '#e6550d',
			dashArray: '',
			fillOpacity: 0.9
		});		
	}


	function onEachFeature(feature, layer) {
		layer.on({
			click: updateInfo,
			mouseover: bringToFront
		});
	}

function onMapClick(e) {
   
   var table2 = document.createElement('table2');
	table2.appendChild(trH);
	table=table2;
   info._div.innerHTML='';  
   map.eachLayer(function (layer) { 
   layer.closePopup()});
   console.log(table2)
}

map.on('click', onMapClick);	

})();

