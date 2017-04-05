# Leaflet Exercises
The exercises here are designed to showcase some ways you can use Leaflet and D3 to build custom web applciations. You can complete these exercises in any order and at your own pace. Choose ones you want to learn, and skip those you already know. You can bring your own data or use what we provide. 

## First step - Start a local server
Although you can just open your HTML file in any browser and view it, when you are loading external data sources it is more reliable to run a local server. There are many different ways of setting up a local server depending on what operating system you use. Here's a very simple one.

* If you are using the VM with Ubuntu or any Linux/Mac machines:
    - These operating systems come with Python already installed. Python has a module called [SimpleHTTPServer](http://www.pythonforbeginners.com/modules-in-python/how-to-use-simplehttpserver/) which you can use when you need a quick web server running and you don't want to mess with setting up Apache/Ngnix.
    - Open a Terminal. Change directory to the workshop folder. Start a local server using Python.
    ```
        > cd Documents/Bootcamp/Day_3/Web_Apps_with_Leaflet_and_D3/
        > python -m SimpleHTTPServer
    ```

* If you are using a Windows machine:
    - Install Python or use the Python package that ArcGIS installs to start SimpleHTTPServer
    - Open Command Prompt. Change directory to the workshop folder. Start a local server.
    - You don't have to type in the whole folder name, write the first few letters (case-sensitive) and press `Tab` key to auto-complete. Note backslash and not forward slashes in Windows.
    ```
        > cd Documents\Bootcamp\Day_3\Web_Apps_with_Leaflet_and_D3\
        > C:\Python27\ArcGIS10.4\python -m SimpleHTTPServer
    ```

* Open a browser. Type `localhost:8000` into the url bar at top. You should see a list of directories/files.

### Workflow for these exercises
You are going to be working in multiple windows.
* Minimize (__don't close__) Command Prompt/Terminal window
* Browser tab opened to `localhost:8000`. If you follow any of the links from here, open the links in a new tab.
* [GitHub repo](https://github.com/berkeley-gif/bootcamp/blob/master/Day_3/Web_Apps_with_Leaflet_and_D3/leaflet/README.md) open in another browser tab
* Javascript file for exercise open in a code editor, e.g. Sublime Text
* At any point you will be editing the index.js files only, e.g. `leaflet/01/index.js`

### Exercises
* 01 - [Make a map](./01/make_a_map.md)
* 02 - [Add Overlay](./02/add_overlay.md)
* 03 - [Style Overlay](./03/style_overlay.md)
* 04 - [Working with larger datasets](./04/working_with_larger_datasets.md)
* 05 - [Add a Leaflet plugin for Geocoding](./05/add_a_geocoder.md)
* 06 - [Spatial Analysis in your browser](./06/spatial_analysis_in_your_browser.md)
* Review:
    - Adding content and styling to make it look like a real website
    - Adding legends
    - An example of using the MarkerCluster Leaflet plugin
    - An example of using the Turf.js buffer functionality



