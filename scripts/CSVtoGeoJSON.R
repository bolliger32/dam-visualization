
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


### Save individual state files
for(i in 1:length(unique(dams$State))){
  dams_state <- dams[dams$State==unique(dams$State)[i],]
  dams_state$latitude <- as.character(dams_state$latitude)
  dams_state$longitude <- as.character(dams_state$longitude)
  dams_state$latitude <- as.numeric(dams_state$latitude)
  dams_state$longitude <- as.numeric(dams_state$longitude)
  dams_state <- SpatialPointsDataFrame(coords=dams_state[,c("longitude","latitude")],data=dams_state[,c(1,2,3,6:32)], proj4string = CRS("+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs"))
  writeOGR(dams_state, paste('../data/dams_',unique(dams$State)[i],'.geojson',sep=""),paste('dams_',unique(dams$State)[i],sep=""),driver='GeoJSON')
}
