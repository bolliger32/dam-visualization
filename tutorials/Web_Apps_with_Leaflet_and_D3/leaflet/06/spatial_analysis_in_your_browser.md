## 06 - Spatial analysis in your browser

In this exercise we are going to experiment with doing a point-in-polygon query directly in your browser using [Turf.js](http://turfjs.org/). Turf.js is a javascript library for spatial analysis supported by MapBox.

[Introduction](https://www.mapbox.com/help/intro-to-turf/) to using Turf.js

### Steps

1. In your browser, click on `06/`

2. In code editor, open `06/index.js`. Copy and paste the code below into the file.

    ```javascript
    /*************************************************************************
    SPATIAL ANALYSIS IN YOUR BROWSER
    **************************************************************************/

    // Many turf functions expect a featurecollection. 
    // Use turf's featurecollection helper method to convert our geojson feature into a
    // featurecollection
    var countyGeojson = turf.featureCollection([county]);

    // Count number of tick locations within county
    var ptsWithin = turf.within(tickLocations.toGeoJSON(), countyGeojson);
    var count = ptsWithin.features.length;

    // Add count to html string
    html = html + '<br/>' + count + ' tick collection locations';

    /**************************************************************************
     ADD THE NEW CODE ABOVE THIS 
    **************************************************************************/
    ```

3. In your browser, when you hover over a county you should see additional information about number of Ticke Collection Locations that lie within the county. 

### Bonus

* Experiment with other turf functions. This [google search](https://www.google.com/webhp?sourceid=chrome-instant&ion=1&espv=2&ie=UTF-8#q=leaflet%20turf%20jsfiddle) brings up a lot of code snippets on JS Fiddle that show what you can do with Leaflet and Turf.
