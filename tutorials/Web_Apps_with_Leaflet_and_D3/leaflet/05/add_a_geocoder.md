## 05 - Add a Leaflet plugin for Geocoding

Leaflet's functionality can be extended with small libraries other people have written called plugins. There is a huge list of [Leaflet plugins](http://leafletjs.com/plugins.html). 

In this exercise we will add a geocoding plugin called [Leaflet Control Geocoder](https://github.com/perliedman/leaflet-control-geocoder).

### Geocoding services

* There are lot of services that provide geocoding. Some geocoding API's are open sourced like Nominatim and MapZen. Which theoretically means you can create your own instances of these geocoders if you had the technical know how. Other geocoders like Google and ESRI are not.

* [Nominatim](http://wiki.openstreetmap.org/wiki/Nominatim) is an open source geocoder for OSM data. There are different instances of Nominatim avaialble from different providers e.g. OSM, Mapquest, etc. with different terms of service. 

* Another geocoder built with open source software is [MapZen](https://mapzen.com/products/search/?lng=-73.98056&lat=40.72593&zoom=12). MapZen's geocoding service is great and has generous terms of service. Their geocoding service is built on [open-source tools](https://github.com/pelias/pelias) and powered entirely by open data. 

* Other geocoding service providers - Google, Bing, Esri, CARTO, Mapbox, etc.

### Steps

1. In your browser, click on `05/`

2. In code editor, open `05/index.js`. Copy and paste the code below into the file.

    ```javascript
      /************************************************************************
      ADD A GEOCODER
      ************************************************************************/

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
    ```

3. In your browser, you should see a new control add to upper left of the map. Search for a place name.


__Step through the code, read the comments to understand what's happening at each step. Ask questions!__

__Remember to refresh your browser to see your changes.__


