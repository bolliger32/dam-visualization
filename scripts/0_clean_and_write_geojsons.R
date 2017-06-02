##################################################################################
### THIS SCRIPT DOWNLOADS THE NID DAMS DATA SET, CLEANS IT, AND RESAVES IT AS .CSV
##################################################################################

### DEFINE YOUR NATEL DIRECTORY - uncomment this when working in Rstudio
#setwd("~/dam-visualization/scripts")

library(dams)
library(dplyr)

dams <- get_nid()
dams_bu <- dams

### SELECT COLUMNS OF INTEREST
dams <- dams %>%
  select(Dam_Name,NID_ID,Latitude,Longitude,River,Owner_Name,Owner_Type,Dam_Type,Primary_Purpose,All_Purposes,Year_Completed,Dam_Length,Dam_Height,Structural_Height,Hydraulic_Height,NID_Height,Max_Discharge,Max_Storage,Normal_Storage,NID_Storage,Surface_Area,Drainage_Area,Permitting_Authority,State_Reg_Dam,State_Reg_Agency, Fed_Owner, Fed_Operation, Source_Agency, State,Url_Address,Submit_Date)

### THROW OUT ROWS WITH N/A LAT OR LONG
dams <- dams[!is.na(dams$Latitude)&!is.na(dams$Longitude),]

### DEFINE FUNCTION TO REPLACE EMPTY CELLS WITH NA
empty_as_na <- function(x){
  if("factor" %in% class(x)) x <- as.character(x) ## since ifelse wont work with factors
  ifelse(as.character(x)!="", x, NA)
}

### CHANGE LAT LONG COLUMN NAMES TO MAKE MORE COMPATIBLE WITH csv-geoJson PLUGIN
dams <- dams %>%
  rename(latitude = Latitude) %>%
  rename(longitude = Longitude) %>%
  mutate_each(funs(empty_as_na)) 

### ADD KEY 
key <- seq(1,nrow(dams))
dams<-cbind(key, dams)

### DELETE DAMS WITH HYDROELECTRIC PURPOSE
dams_hydroelectric <- factor()
for(i in 1:nrow(dams)){
  purposes <- c(as.character(dams[i,"Primary_Purpose"]),strsplit(as.character(dams[i,"All_Purposes"]),', ',fixed=TRUE))
  if("Hydroelectric" %in% purposes[[1]] | "Hydroelectric" %in% purposes[[2]]) {
    dams_hydroelectric <- c(dams_hydroelectric,dams[i,"key"])
  }
  
}
dams_subset <- subset(dams, !dams$key %in% dams_hydroelectric)

### DELETE DAMS THAT DON'T MEET SIZE REQUIREMENTS
dams_subset <- subset(dams, dams$Hydraulic_Height >= 10 | is.na(dams$Hydraulic_Height))
dams_subset <- subset(dams_subset, dams_subset$Hydraulic_Height <= 60 | is.na(dams_subset$Hydraulic_Height))
dams_subset <- subset(dams_subset, dams_subset$NID_Height <= 100 | is.na(dams_subset$NID_Height))
dams_subset <- subset(dams_subset, dams_subset$Drainage_Area >=2 | is.na(dams_subset$Drainage_Area))
summary(dams_subset$Drainage_Area) ## dams with NA drainage area are significant

### SAVE AS .CSV
write.csv(dams, file="../docs/data/dams.csv",row.names = F)
write.csv(dams_subset, file="../docs/data/dams_subset.csv",row.names = F)

### Write to GeoJSON
library(rgdal)
dams$latitude <- as.character(dams$latitude)
dams$longitude <- as.character(dams$longitude)
dams$latitude <- as.numeric(dams$latitude)
dams$longitude <- as.numeric(dams$longitude)
dams_subset$latitude <- as.character(dams_subset$latitude)
dams_subset$longitude <- as.character(dams_subset$longitude)
dams_subset$latitude <- as.numeric(dams_subset$latitude)
dams_subset$longitude <- as.numeric(dams_subset$longitude)

dams_spdf <- SpatialPointsDataFrame(coords=dams[,c("longitude","latitude")],data=dams[,c(1,2,3,6:32)], proj4string = CRS("+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs"))
dams_subset_spdf <- SpatialPointsDataFrame(coords=dams_subset[,c("longitude","latitude")],data=dams_subset[,c(1,2,3,6:32)], proj4string = CRS("+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs"))

writeOGR(dams_spdf, '../docs/data/dams.geojson','dams',driver='GeoJSON')
writeOGR(dams_subset_spdf, '../docs/data/dams.geojson','dams',driver='GeoJSON')

### SAVE INDIVIDUAL STATE FILES
states <- unique(dams$State)
write(states,'../docs/data/states.txt')
i <- 1
for(i in 1:length(unique(dams$State))){
  dams_state <- dams[dams$State==unique(dams$State)[i],]
  dams_state$latitude <- as.character(dams_state$latitude)
  dams_state$longitude <- as.character(dams_state$longitude)
  dams_state$latitude <- as.numeric(dams_state$latitude)
  dams_state$longitude <- as.numeric(dams_state$longitude)
  dams_state <- SpatialPointsDataFrame(coords=dams_state[,c("longitude","latitude")],data=dams_state[,c(1,2,3,6:32)], proj4string = CRS("+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs"))
  writeOGR(dams_state, paste('../docs/data/dams_',unique(dams$State)[i],'.geojson',sep=""),paste('dams_',unique(dams$State)[i],sep=""),driver='GeoJSON',overwrite_layer = T)
}

### REPEAT FOR SUBSET
states <- unique(dams_subset$State)
write(states,'../docs/data/states_subset.txt')
for(i in 1:length(unique(dams_subset$State))){
  dams_subset_state <- dams_subset[dams_subset$State==unique(dams_subset$State)[i],]
  dams_subset_state$latitude <- as.character(dams_subset_state$latitude)
  dams_subset_state$longitude <- as.character(dams_subset_state$longitude)
  dams_subset_state$latitude <- as.numeric(dams_subset_state$latitude)
  dams_subset_state$longitude <- as.numeric(dams_subset_state$longitude)
  dams_subset_state <- SpatialPointsDataFrame(coords=dams_subset_state[,c("longitude","latitude")],data=dams_subset_state[,c(1,2,3,6:32)], proj4string = CRS("+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs"))
  writeOGR(dams_subset_state, paste('../docs/data/dams_subset_',unique(dams_subset$State)[i],'.geojson',sep=""),paste('dams_subset_',unique(dams_subset$State)[i],sep=""),driver='GeoJSON')
}

## Test: Check sum of dams across state files
totaln <- 0
for(i in 1:length(unique(dams_subset$State))){
  state_file <- (paste('../docs/data/dams_subset_',unique(dams_subset$State)[i],'.geojson',sep=""))
  state_file <- readOGR(state_file)
  n <- nrow(state_file)
  totaln <- totaln+n
}

# The below should be TRUE
totaln == nrow(dams_subset)
