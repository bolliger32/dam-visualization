## 02 - Add overlay

In this exercise we are going to experiment with different ways of adding your thematic data to the Leaflet app. 

[Leaflet Docs - GeoJSON](http://leafletjs.com/reference-1.0.3.html#geojson)

### Steps

1. In your browser, click on `02/`

2. In code editor, open `02/index.js`. Copy and paste the code below into the file.

3. We will use jQuery and it's $.getJSON method to load a geojson file. [jQuery](https://en.wikipedia.org/wiki/JQuery) is a very popular cross-platform JavaScript library designed to simplify the client-side scripting of HTML.

4. To use jQuery you need to include a script tag in your html file to load the library. This has already been done for you for this exercise. If you are interested you can look at the `02/index.html` file in your code editor or inspect it in your browser - it's towards the end. Many popular javascript libraries are available through CDN's (Content Delivery Networks). You can add references to javascript libraries hosted on CDN's or download and host them locally.

    ```javascript
      /************************************************************************
          ADD TICK LOCATIONS
      ************************************************************************/

      /* 
        Create an empty L.geoJson object, add it to map. 
        Note: we are chaining two methods here; [method chaining](http://schier.co/blog/2013/11/14/method-chaining-in-javascript.html) is a common technique for writing compact code in scenarios that involve multiple functions on same object consecutively.
      */

      var tickLocations = L.geoJson().addTo(map);      

      /*
        This is an example of asynchronous function. All code within the $.getJSON method will be executed once the client (our browser) makes a request to server (in this case our local server) for data and recieves data back from server
      */

      $.getJSON("../../assets/data/tick_locations.geojson", function(data) {
        tickLocations.addData(data);
      });

    ```

5. In the browser, you should see markers added to your map for tick locations using Leaflet's default marker style. We will see how to change the marker style and add popus in the next exercise.

__Remember to refresh your browser to see your changes.__

### Bonus

* Another way to load a geojson file is to use the [Leaflet AJAX plugin](https://github.com/calvinmetcalf/leaflet-ajax). If you want to try this first add the `js/lib/leaflet.ajax.js` within script tags to your html file. Make sure any Leaflet plugin js library you use in listed after Leaflet library. And then use the following code: 
    ```javascript
      var geojsonLayer = new L.geoJson.AJAX("geojson/tick_locations.geojson");/geojsonLayer.addTo(map);
    ```

* [Leaflet Geojson Tutorial](http://leafletjs.com/examples/geojson.html)

* [You might not need jQuery](http://youmightnotneedjquery.com/)

