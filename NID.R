##################################################################################
### THIS SCRIPT DOWNLOADS THE NID DAMS DATA SET, CLEANS IT, AND RESAVES IT AS .CSV
##################################################################################

### DEFINE YOUR NATEL DIRECTORY
NATEL <- "C:/Users/Carmen/Dropbox (Stephens Lab)/DS421/Natel"

library(dams)
library(dplyr)

dams <- get_nid()

### SELECT COLUMNS OF INTEREST - THESE WILL BE NARROWED DOWN LATER
dams <- dams %>%
  select(Dam_Name,NID_ID,Longitude,Latitude,River,Owner_Name,Owner_Type,Dam_Type,Primary_Purpose,All_Purposes,Year_Completed,Dam_Length,Dam_Height,Structural_Height,Hydraulic_Height,NID_Height,Max_Discharge,Max_Storage,Normal_Storage,NID_Storage,Surface_Area,Drainage_Area,Volume,Permitting_Authority,State_Reg_Agency, Fed_Owner, Fed_Other, Source_Agency, State)

### CHECK FOR N/A VALUES 
lapply(dams, function(x) which(is.na(x) ) )

### THROW OUT ROWS WITH N/A LAT OR LONG
dams <- dams[!is.na(dams$Latitude)&!is.na(dams$Longitude),]

### PLOT and SAVE AS .CSV
plot(dams$Longitude,dams$Latitude)
setwd(NATEL)
write.csv(dams, file="dams.csv",row.names = F)
