##################################################################################
### THIS SCRIPT DOWNLOADS THE NID DAMS DATA SET, CLEANS IT, AND RESAVES IT AS .CSV
##################################################################################

### DEFINE YOUR NATEL DIRECTORY - uncomment this when working in Rstudio
#setwd("~/dam-visualization/scripts")

library(dams)
library(dplyr)

dams <- get_nid()
dams_bu <- dams

### SELECT COLUMNS OF INTEREST - THESE WILL BE NARROWED DOWN LATER
dams <- dams %>%
  select(Dam_Name,NID_ID,Latitude,Longitude,River,Owner_Name,Owner_Type,Dam_Type,Primary_Purpose,All_Purposes,Year_Completed,Dam_Length,Dam_Height,Structural_Height,Hydraulic_Height,NID_Height,Max_Discharge,Max_Storage,Normal_Storage,NID_Storage,Surface_Area,Drainage_Area,Permitting_Authority,State_Reg_Dam,State_Reg_Agency, Fed_Owner, Fed_Operation, Source_Agency, State,Url_Address,Submit_Date)

### THROW OUT ROWS WITH N/A LAT OR LONG
dams <- dams[!is.na(dams$Latitude)&!is.na(dams$Longitude),]

### CHANGE LAT LONG COLUMN NAMES TO MAKE MORE COMPATIBLE WITH csv-geoJson PLUGIN
dams <- dams %>%
  rename(latitude = Latitude) %>%
  rename(longitude = Longitude)

### ADD KEY 
key <- seq(1,nrow(dams))
dams<-cbind(key, dams)

### FOR NOW JUST USE FIRST COLUMNS OF DAMS
damstest <- dams[,c(1,3:5)]

### SAVE AS .CSV
write.csv(dams, file="dams.csv",row.names = F, quote=F)
write.csv(damstest, file="damstest.csv", row.names = F, quote=F)

### SAVE AS GeoJSON
damsjson <- toJSON(dams)
plot(damsjson)
write(damsjson, file="dams_geojson.json")
getwd()
