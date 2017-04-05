## 04 - Working with Larger Datasets

- Geojson files with lots of data can take longer to load depending on size and network speed. And on the web you never want to keep your user waiting :-) There are couple of ways you can deal with larger files.

- Option 1 - Use the topojson format. Topojson is an extension of GeoJSON that encodes topology.
  - Convert geojson to topojson using [mapshaper.org](http://mapshaper.org/). - Reduce file size by simplifying the geometry. Degree of simplification will depend on how much detail you need to show in your map.

- Option 2 - Host the data on service providers like CARTO, ArcGIS Online, Mapbox. These companies also provide their own web mapping libraries (some built on top of Leaflet)

- A [mapmakers cheatsheet](https://github.com/tmcw/mapmakers-cheatsheet) on other options for dealing with large files with Leaflet and web maps in general.

In this exercise we are going to adding topojson file to Leaflet map. We will see how to create a topojson file, add the topojson layer to Leaflet, create and use a color scale for styling our polygons and adding a legend. 

- __Note__: New script tags for working with Topojson data in html file, we will also use a [color js library](http://gka.github.io/chroma.js/) called `chroma.js` to style the counties. Developed by [Gregor Aisch](http://driven-by-data.net/).

### Steps

1. In your browser, click on `04/`

2. We are also using a javascript libarary for dealing with colors called [chroma.js](http://gka.github.io/chroma.js/). The script tag for this has already been added to the html file for this exercise. This library has by Gregor Aisch, a fantastic data visualization professional, who works for NY Times. Check out more of his work [here](http://driven-by-data.net/).

3. In code editor, open `04/index.js`. Copy and paste the code below into the file.

    ```javascript
      /************************************************************************
        ADD COUNTY POLYGONS
      ************************************************************************/
      // Create a new L.TopoJSON layer
      var countyLayer = new L.TopoJSON();

      // Create a color scale for styling counties
      var colorScale = chroma.scale(['aad4ed', '004966']);
      var colorScaleDataValues = [];
      var colorClassBreaks;

      // The code below is another way to use jQuery's $.getJSON method
      // See https://davidwalsh.name/write-javascript-promises
      // Use the promise object returned by the $.getJSON method. 
      // When the response is returned, the .done method is called with the function (callback)
      // you provide. If the request fails, the .fail method is called.
      $.getJSON('../../assets/data/ca_counties_census.topojson')
        .done(addCountyData)
        .fail(function() {
          $('body').append('<p>Oh no, something went wrong with the county layer!</p>');
      });


      function addCountyData(topoData){

        // This is calling the addData method of the new L.TopoJSON layer we defined earlier
        countyLayer.addData(topoData);
        
        // This is calling the addTo method of Leaflet's L.layerGroup
        countyLayer.addTo(map);

        // This is calling the eachLayer method of Leaflet's L.layerGroup
        // Note: L.TopoJSON extends L.GeoJSON extends L.FeatureGroup extends L.layerGroup
        // It iterates over the layers of the group and calls function addToDomain that we define below
        countyLayer.eachLayer(addToDomain);

        // Calculate quantile breaks for color scale
        calcQuantileBreaks();

        // For each layer it call function handleLayer that we define below
        countyLayer.eachLayer(handleLayer);

        // Move data behind tick locations
        countyLayer.bringToBack();

        // Add overlay to layer control
        layerControl.addOverlay(countyLayer, "CA Counties");

      }


      // Add population density values to color scale
      function addToDomain(layer){
        var value = +layer.feature.properties['lyme_disease_avg_rate_avg_rate_2001_2014'];
        colorScaleDataValues.push(value);
      }


      // Calculate quantile breaks for color scale
      function calcQuantileBreaks(){
        colorScaleDataValues.sort();
        colorClassBreaks = chroma.limits(colorScaleDataValues, 'e', 4);
        colorScale.domain(colorClassBreaks);
      }


      // Style each layer
      function handleLayer(layer){

        // Get population density and corresponding color (hexvalue) from color scale
        var density = layer.feature.properties.lyme_disease_avg_rate_avg_rate_2001_2014;
        var fillColor = colorScale(density).hex();  
        
        // Style polygons
        layer.setStyle({
          fillColor : fillColor,
          fillOpacity: 0.8,
          color:'#fff',
          weight:2,
          opacity:.5
        });
        
        // Attach events to each polygon
        layer.on({
          mouseover: enterLayer,
          mouseout: leaveLayer,
        });

      }


      // Function fired when user's mouse enters the layer
      function enterLayer(){

        var county = this.feature;

        // Get county name and pop. density and create a new html string
        var countyName = county.properties.CountyNAME;
        var rate = +county.properties.lyme_disease_avg_rate_avg_rate_2001_2014;
        var html = '<b>' + countyName + '</b><br/>' +'Incidence rate is ' + rate.toFixed(1) + ' per 100,000 person-years';

        // Change style of polygon
        this.setStyle({
          weight:3,
          opacity: 1
        });

        // Append html string to p element with .info class
        $('.info').html(html);

      }


      // Function fired when user's mouse leaves the layer
      function leaveLayer(){
        $('.info').text('Hover over a county');
        this.setStyle({
          weight:2,
          opacity:.5
        });
      }
  
    ```

4. In the browser, you should a chloropleth map of the counties.

5. If you hover over a county it will display information about the county at the bottom of the map (instead of a popup).

__Step through the code, read the comments to understand what's happening at each step. Ask questions!__

__Remember to refresh your browser to see your changes.__

### Bonus

* Another [tutorial on creating choropleth map](http://leafletjs.com/examples/choropleth.html) on Leaflet homepage