## 03 - Style overlay

In this exercise we are going to experiment with applying custom styles to an overlay. We will also add a new Layer control to the Leaflet map.

Leaflet Docs
- [GeoJSON](http://leafletjs.com/reference-1.0.3.html#geojson)
- [Controls](http://leafletjs.com/reference-1.0.3.html#control-layers)

### Steps

1. In your browser, click on `03/`

2. In code editor, open `03/index.js`. Copy and paste the code below into the file.

3. Leaflet allows you to pass a variety of options to `L.geoJson` to style your layer. The options are written as [callback functions](http://www.impressivewebs.com/callback-functions-javascript/).

    ```javascript

      /************************************************************************
      ADD TICK LOCATIONS
      ************************************************************************/
  
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
      // We're also passing in a callback function that takes the response JSON and adds it to the document.
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


    ```

4. In the browser you should see orange circles added to your map for tick collection locations using styles we specified in the geojsonMarkerOptions object.

5. If you click on a marker it will open a popup with text we specified in the bindPopup function.

6. Let's also add a Leaflet Layer Control to the bottom left of our map. Experiment with different [options](http://leafletjs.com/reference.html#control) you can pass to Leaflet Controls

    ```javascript
      /************************************************************************
        ADD LAYER CONTROL
      ************************************************************************/

      // Create a new Leaflet layer control
      var layerControl = L.control.layers(null, null, { position: 'bottomleft' }).addTo(map);

      // Add basemap defined earlier to layer control
      layerControl.addBaseLayer(CartoDB_Positron, "Grayscale");
    ```

7. You should see a new Layer control added to the bottom left of the Leaflet map. 


__Step through the code, read the comments to understand what's happening at each step. Ask questions!__

__Remember to refresh your browser to see your changes.__


### Bonus

* Experiment with different options for styling geojson - nicely summarized [here](http://savaslabs.com/2015/05/18/mapping-geojson.html#adding-popups)

* Leaflet comes with some basic [controls](http://leafletjs.com/reference.html#control) out of the box. You can create a new [custom control](http://odoe.net/blog/custom-leaflet-control/) or use plugins for additional controls.

