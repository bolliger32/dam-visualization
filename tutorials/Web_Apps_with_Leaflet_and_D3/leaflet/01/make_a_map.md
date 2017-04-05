## 01 - Make a map

This exercise covers the basics for creating a Leaflet map element and adding a basemap to it.

[Leaflet documentation](http://leafletjs.com/reference-1.0.3.html)

### Steps

1. In your browser, click on `01/`
2. Four things you absolutely need for adding Leaflet map to a web page
    - Leaflet CSS file
    - Leaflet JavaScript file
    - A div element with an `id` attribute
    - A `css` height for your map div
3. In code editor, open `01/index.js`. Copy and paste the code below into the file.

    ```javascript
      /*******************************************************************
       INITIALIZE MAP
      ********************************************************************/

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

      /**********************************************************************
       ADD BASEMAP
      ***********************************************************************/

      //Initialize a new Leaflet layer
      var CartoDB_Positron = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
        subdomains: 'abcd',
        maxZoom: 19
      });

      //Add layer to map
      map.addLayer(CartoDB_Positron);

    ```

4. In your browser you should see a CARTO basemap centered on California.

__Remember to refresh your browser to see your changes.__

### Bonus
* Experiment with different basemaps such as `Stamen Watercolor` or `CartoDB DarkMatter`. You can browse basemap options [here](http://leaflet-extras.github.io/leaflet-providers/preview/index.html).

* Experiment with some api features such as setting zoom and changing the map center. See [here](http://leafletjs.com/reference.html#map-set-methods). e.g.
    ```javascript
      map.setZoom(12);
    ```
