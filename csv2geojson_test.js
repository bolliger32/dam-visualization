 <script>     
   
 //Set the view coordinates of the map and the zoom:
 var map = L.map('map').setView([37, -90], 4); 
      
 //Use "CartoDB.DarkMatter" as TileLayer provider
 L.tileLayer.provider('CartoDB.DarkMatter').addTo(map);
       
      //add the geoJson File to the map and style it:
       geojson = L.geoJson(dams, {    
           
            //this makes circles out of the standard leaflet marker pins
            pointToLayer: function(feature, latlng) {               
                return new L.CircleMarker(latlng, {
                    radius: 5,
                    fillColor: "red",
                    color: "#000",
                    weight: 1,
                    opacity: 1,
                    fillOpacity: 0.4
                });
            },

           //bind a Pop-Up Window on each Circle to display some information from the geoJson File
           onEachFeature: function (feature, layer) {
                layer.bindPopup("<b>Event Type: </b>" + feature.properties.EVENT_TYPE + "<br>" +
                                "<b>Country: </b>" + feature.properties.COUNTRY + "<br>" +
                                "<b>Location: </b>" + feature.properties.LOCATION + "<br>" +
                                "<b>Details: </b>" + feature.properties.NOTES);     
    }}
        ).addTo(map);
</script>     
