# dam-visualization
Visualization of non-powered dam locations in the U.S., with functionality for filtering and comparing sites. To view site, go to https://bolliger32.github.io/dam-visualization/

## Notes
- For now, there are two datasets that you can visualize. The first contains all dams in the NID with lat/lon locations. The second filters out any dams meeting the following criteria:
    - already generates hydropower
    - has a hydraulic height < 10 or > 60 ft.
    - has no data for hydraulic height but has a "NID height" (max of hydraulic, structural and "dam" height) > 100 ft.
    - has a drainage area < 2 sq. mi.
- this filtering occurs in the "0_clean_and_write_geojson.R" script. If different filtered criteria are desired, that script should be altered.