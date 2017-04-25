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
    maxZoom: 16,
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

var Topo_WorldImagery = L.tileLayer('https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}', {
  attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});
var ImageryTopo_WorldImagery = L.tileLayer('https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryTopo/MapServer/tile/{z}/{y}/{x}', {
  attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});
var HydroNHD_WorldImagery = L.tileLayer('https://basemap.nationalmap.gov/arcgis/rest/services/USGSHydroNHD/MapServer/tile/{z}/{y}/{x}', {
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

  // Create a function to generate popup content
  function bindPopup(feature, layer) {
	  var popupcontent = [];
		for (var prop in feature.properties) {
			popupcontent.push("<td>" + prop + "</td><td>" + feature.properties[prop] + "</td>");
		}
	  var popupTable = "<div><table><tr>" + popupcontent.join("</tr>") + "</div></table>"
		layer.bindPopup(popupTable);
  }

  // Get variables and values JSON for use later on in filter creation
  var filterJSON = (function () {
    var filterJSON = null;
    $.ajax({
        'url':"../assets/data/filterText.json",
        'success': function(data) {filterJSON=data},
        'async': false,
        'global': false,
        'dataType': "json"});
    return filterJSON; })();
  
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
  var layerControl = L.control.layers(null, null, { position: 'topleft', }).addTo(map);

  // Add basemap defined earlier to layer control
  layerControl.addBaseLayer(Esri_WorldImagery, "Imagery");
  layerControl.addBaseLayer(Topo_WorldImagery, "Topography");
  layerControl.addBaseLayer(ImageryTopo_WorldImagery, "Imagery + Topography");
  layerControl.addBaseLayer(HydroNHD_WorldImagery, "Hydrography");



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
  
  function switchAvailValues(selector,varName) {
    $(selector).empty();
    selector.options[0] = new Option('Choose '+varName+':',"reset");
    for(index in filterJSON['vals'][varName]) {
      selector.options[selector.options.length] = new Option(filterJSON['vals'][varName][index], filterJSON['vals'][varName][index]);
    }
    selector.onchange = function () {applyFilter(selector.value)};
  }
  
  
  var filterBar = L.control({position: 'topright'});
	filterBar.onAdd = function () {
//    var var_selector_div = L.DomUtil.create('div', 'info legend');
//    var_selector_div.innerHTML = '<select><option>Test</select></option>';
		var div = L.DomUtil.create('div', 'info legend');
		div.innerHTML = '<select id="varSel"><option value=null>Select Variable:</option></select><select id="valSel"></select>';
    var varSel = div.firstChild;
    var valSel = div.childNodes[1];
    for(index in filterJSON['types']) {
      varSel.options[varSel.options.length] = new Option(index, index)
    }
    varSel.onchange = function() {switchAvailValues(valSel,varSel.value)};
      
//    div.innerHTML = '<select><option value="reset">Dam Type</option><option value="Rockfill">Rockfill</option><option value="Earth">Earth</option><option value="Multi-Arch">Multi-Arch</option><option value="Timber Crib">Timber Crib</option><option value="RCC">RCC</option><option value="Masonry">Masonry</option><option value="Stone">Stone</option><option value="Concrete">Concrete</option><option value="Gravity">Gravity</option><option value="Arch">Arch</option><option value="Buttress">Buttress</option><option value="Other">Other</option></select>';
//		selector.onchange = function () {applyFilter(selector.value)};
//    selector.onmousedown = selector.ondblclick = L.DomEvent.stopPropagation;
		return div;
	};
	map.addControl(filterBar);
	
map.on('zoomend', function(){
    var z = map.getZoom();

    if (z > 8) {
        return damLocations.addTo(map);
		return clusteredMarkers.removeFrom(map);
    }
    if (z < 8) {
        return damLocations.removeFrom(map);
	}	
});



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
	var theader4 = document.createElement('th');
	var theader5 = document.createElement('th');
	var theader6 = document.createElement('th');
	var theader7 = document.createElement('th');
	var theader8 = document.createElement('th');
	var theader9 = document.createElement('th');
	var theader10 = document.createElement('th');
	var trH = document.createElement('tr');
	var headertext1 = document.createTextNode('Dam Name');
	var headertext2 = document.createTextNode('Type');
	var headertext3 = document.createTextNode('Height (ft)');
	var headertext4 = document.createTextNode('River');
	var headertext5 = document.createTextNode('Primary Purpose');
	var headertext6 = document.createTextNode('Max Discharge');
	var headertext7 = document.createTextNode('Storage');
	var headertext8 = document.createTextNode('Drainage Area');
	var headertext9 = document.createTextNode('Reg Agency');
	var headertext10 = document.createTextNode('Owner');
	theader1.appendChild(headertext1);
	theader2.appendChild(headertext2);
	theader3.appendChild(headertext3);
	theader4.appendChild(headertext4);
	theader5.appendChild(headertext5);
	theader6.appendChild(headertext6);
	theader7.appendChild(headertext7);
	theader8.appendChild(headertext8);
	theader9.appendChild(headertext9);
	theader10.appendChild(headertext10);
	trH.appendChild(theader1);
	trH.appendChild(theader2);
	trH.appendChild(theader3);
	trH.appendChild(theader4);
	trH.appendChild(theader5);
	trH.appendChild(theader6);
	trH.appendChild(theader7);
	trH.appendChild(theader8);
	trH.appendChild(theader9);
	trH.appendChild(theader10);
	table.appendChild(trH);

	info.update = function (props) {

		var tr1 = document.createElement('tr');
		var td1 = document.createElement('td');
		var text1 = document.createTextNode(props ? props.Dam_Name : '');
		
		var td2 = document.createElement('td');
		var text2 = document.createTextNode(props ? ' ' + props.Dam_Type + ' ': '');
		
		var td3 = document.createElement('td');
		var text3 = document.createTextNode(props ? ' ' + props.Hydraulic_Height + ' ' : '');
		
		var td4 = document.createElement('td');
		var text4 = document.createTextNode(props ? ' ' + props.River + ' ' : '');
		
		var td5 = document.createElement('td');
		var text5 = document.createTextNode(props ? ' ' + props.Primary_Purpose + ' ' : '');
		
		var td6 = document.createElement('td');
		var text6 = document.createTextNode(props ? ' ' + props.Max_Discharge + ' ' : '');
		
		var td7 = document.createElement('td');
		var text7 = document.createTextNode(props ? ' ' + props.NID_Storage + ' ' : '');
		
		var td8 = document.createElement('td');
		var text8 = document.createTextNode(props ? ' ' + props.Drainage_Area + ' ' : '');
		
		var td9 = document.createElement('td');
		var text9 = document.createTextNode(props ? ' ' + props.State_Reg_Agency + ' ' : '');
		
		var td10 = document.createElement('td');
		var text10 = document.createTextNode(props ? ' ' + props.Owner_Name + ' ' : '');
		
		td1.appendChild(text1);
		tr1.appendChild(td1);
		table.appendChild(tr1);	
		
		td2.appendChild(text2);
		tr1.appendChild(td2);

		td3.appendChild(text3);
		td4.appendChild(text4);
		td5.appendChild(text5);
		td6.appendChild(text6);
		td7.appendChild(text7);
		td8.appendChild(text8);
		td9.appendChild(text9);
		td10.appendChild(text10);
		tr1.appendChild(td3);
		tr1.appendChild(td4);
		tr1.appendChild(td5);
		tr1.appendChild(td6);
		tr1.appendChild(td7);
		tr1.appendChild(td8);
		tr1.appendChild(td9);
		tr1.appendChild(td10);

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
   	var table2 = document.createElement('table');
	table2.appendChild(trH);
	table=table2;
   info._div.innerHTML='';  
   map.eachLayer(function (layer) { 
   layer.closePopup()});
   damLocations.setStyle({
    radius: 7,
    fillColor: "#fdae6b",
    color: "#e6550d",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
		});
}

map.on('click', onMapClick);	

})();