
### DEFINE YOUR NATEL DIRECTORY - uncomment this when working in Rstudio
#setwd("~/dam-visualization/scripts")

library(rgdal)
dams <- read.csv("../data/dams.csv")
dams$latitude <- as.character(dams$latitude)
dams$longitude <- as.character(dams$longitude)
dams$latitude <- as.numeric(dams$latitude)
dams$longitude <- as.numeric(dams$longitude)

dams <- SpatialPointsDataFrame(coords=dams[,c("longitude","latitude")],data=dams[,c(1,2,3,6:32)], proj4string = CRS("+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs"))
plot(dams)


writeOGR(dams, '../data/dams.geojson','dams',driver='GeoJSON')
