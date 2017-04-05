library(rgdal)
setwd("../../Carmen/Documents/dam-visualization/")
dams <- read.csv("data/damstest.csv")
dams$latitude <- as.character(dams$latitude)
dams$longitude <- as.character(dams$longitude)
dams$latitude <- as.numeric(dams$latitude)
dams$longitude <- as.numeric(dams$longitude)

dams <- na.omit(dams)
dams <- SpatialPointsDataFrame(coords=dams[,c(4,3)],data=dams[,c(1,2)], proj4string = CRS("+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs"))
plot(dams)



