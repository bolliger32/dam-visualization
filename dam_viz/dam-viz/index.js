(function(){
  /********************************************************************************
    INITIALIZE MAP
  ********************************************************************************/

  //Initialize a new Leaflet map object
  //Pass an object of options to initialization function
  var map = L.map('map', {
	center: [38, -98],
    zoom: 3,
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
//    var popupcontent = [];
//		for (var prop in feature.properties) {
//			popupcontent.push("<td>" + prop + "</td><td>" + feature.properties[prop] + "</td>");
//		}
//	  var popupTable = "<div><table><tr>" + popupcontent.join("</tr>") + "</div></table>";
    return L.circleMarker(latlng, geojsonMarkerOptions).bindPopup(newpopup);
  }

  // Get variables and values JSON for use later on in filter creation
  var filterJSON = (function () {
    var filterJSON = null;
    $.ajax({
        'url':"../assets/data/filterText.json",
        'success': function(data) {filterJSON=data;},
        'async': false,
        'global': false,
        'dataType': "json"});
    return filterJSON; })();
  
  // Use ajax call to get data. After data comes back apply styles and bind popup
  // If you're experienced with jQuery, you'll recognize we're making a GET 
  // request and expecting JSON in the response body. 
  // We're also passing in a callback function that takes the response JSON and adds it to the document.
  function addDams(filterFunc) {
    $.getJSON("../assets/data/dams.geojson", function(data) {

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



  function getFilterFunc(filters) {
    var num_filters = filters.childNodes.length;
    var filterFunc = function(feature, layer) {
      for (var i = 0; i < num_filters; i++) {
        var curFilter = filters.childNodes[i]
        
        var varName = curFilter.childNodes[0].value;
        var valFilter = curFilter.childNodes[1]
        
        // if Categorical filter, check all checkboxes
        if (filterJSON['types'][varName] === "str") {
          var passFilter = false;
          var selected = [];
          for (index in filterJSON['vals'][varName]) {
            var curValName = filterJSON['vals'][varName][index];
            var tmpValName = curValName.replace(/,/g,"_");
            var tmpValName = tmpValName.replace(/ /g,"_");
            var curVal = document.getElementById(tmpValName);
            if (curVal.checked) {
              if (feature.properties[varName] == curValName) passFilter = true;
            }
          }
          if (passFilter == false) return false;
        }
        
        // If numerical filter, use >,<,= functionality
        else if (filterJSON['types'][varName] === "float") {
          var compType = valFilter.childNodes[0].value;
          var compVal = parseFloat(valFilter.childNodes[1].value);
          var inclNull = valFilter.childNodes[2].childNodes[1].checked;
          if (feature.properties[varName] == null) {
            return inclNull? true : false;
          } else if (compType == "=") {
            if (feature.properties[varName] != compVal) return false;
          } else if (compType == ">") {
            if (feature.properties[varName] <= compVal) return false;
          } else if (compType == "<") {
            if (feature.properties[varName] >= compVal) return false;
          }
        }
        
        // If all_purposes, where you're selecting if a 
      }
      return true;
    }
    return filterFunc;
  }
  
  function applyFilter(filters) {
    map.removeLayer(damLocations);
    clusteredMarkers.clearLayers();
    layerControl.removeLayer(damLocations);
    layerControl.removeLayer(clusteredMarkers);
    if (filters == "reset") {
      addDams();
    } else {
      var filterFunc = getFilterFunc(filters);
      addDams(filterFunc);
    }
  }
  
  function switchAvailValues(filterDiv,varName) {
    if (filterDiv.childNodes.length > 1) {
      filterDiv.removeChild(filterDiv.childNodes[1]);
    }
    
    var newSelector = document.createElement("div");
    newSelector.class = "valFilter";
    filterDiv.appendChild(newSelector);
    
    var valueType = filterJSON['types'][varName];
    if(valueType === "str" || valueType === "multiple") {
      var boxes = [];
      $(document).ready(function(){
        $.each(filterJSON['vals'][varName],function(index,value){
          var val = value.replace(/,/g,"_").replace(/ /g,"_");
          var checkbox="<td><label for="+val+">"+value+"</label></td><td><input type='checkbox' id="+val+" value="+val+" name="+val+"></td>";
          boxes.push(checkbox);
        })
      });
      newSelector.innerHTML = '<table><tr>' + boxes.join("</tr>") + "</table>";
      if (valueType === "multiple") newSelector.innerHTML = '<div><label for="exclude">Exclude selected</label><input type="checkbox" id="exclude"></div>' + newSelector.innerHTML;
    } 
    else if (valueType === "float") {
      newSelector.innerHTML = '<select><option value="=">=</option><option value=">">\></option><option value="<">\<</option></select><input type="text" class="textVarEntry"><div><label for="inclVar'+varName+'">Include missing</label><input type="checkbox" id="inclVar'+varName+'"></div>'
    }
  }
  
  function removeFilters(filterDiv) {
    while (filterDiv.childNodes.length > 1) {
      filterDiv.removeChild(filterDiv.lastChild);
    }
    while (filterDiv.firstChild.childNodes.length > 1) {
      filterDiv.firstChild.removeChild(filterDiv.firstChild.lastChild);
    }
    filterDiv.firstChild.firstChild.value = "selectVar0";
  }
  
  function addFilter(filtersDiv) {
    var numFilters = filtersDiv.childNodes.length;
    var newFilterDiv = document.createElement("div");
    newFilterDiv.style.maxHeight = "200px";
    newFilterDiv.style.overflow = "auto";
    newFilterDiv.innerHTML = '<select id="varSel"><option value="selectVar'+numFilters.toString()+'">Select Variable:</option></select>'
    filtersDiv.appendChild(newFilterDiv);
    var newFilter = filtersDiv.lastChild;
    var varSel = newFilter.firstChild;
    for(index in filterJSON['types']) {
      varSel.options[varSel.options.length] = new Option(index, index)
    }
    varSel.onchange = function() {switchAvailValues(newFilter,varSel.value)};
  }
  var filterBar = L.control({position: 'topright'});
	filterBar.onAdd = function () {
		var div = L.DomUtil.create('div', 'info legend');
		div.innerHTML = '<input type="button" id="addFilterRow" value="+"><input type="button" id="resetFilter" value="Reset Filters"><input type="button" id="applyFilter" value="Apply Filters"><div id="filters" style="max-height:500px; overflow:auto"><div id="filter0" style="max-height:200px; overflow:auto"><select id="varSel"><option value="selectVar0">Select Variable:</option></select></div></div>';
    var addFilterButton = div.childNodes[0];
    var clearFilterButton = div.childNodes[1];
    var applyFilterButton = div.childNodes[2];
    
    var filters = div.childNodes[3];
    var filter0 = filters.firstChild;
    var varSel = filter0.firstChild;
    
    for(index in filterJSON['types']) {
      varSel.options[varSel.options.length] = new Option(index, index)
    }
    varSel.onchange = function() {switchAvailValues(filter0,varSel.value)};
    addFilterButton.onclick = function() {addFilter(filters)};
    applyFilterButton.onclick = function() {applyFilter(filters)};
    clearFilterButton.onclick = function() {applyFilter("reset"); removeFilters(filters);};
      
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
		map.removeLayer(damLocations);
    clusteredMarkers.clearLayers();
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