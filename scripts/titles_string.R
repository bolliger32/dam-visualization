## Create a string of column names from dams dataset to paste into javascript 

### DEFINE YOUR NATEL DIRECTORY - uncomment this when working in Rstudio
#setwd("~/dam-visualization/data")
dams <- read.csv("dams.csv", sep="|")
titles <- names(dams)

titles_string <- "'"
for(i in 1:length(titles)) {
  title <- titles[i]
  titles_string <- paste(titles_string, title, sep="','")
}

titles_string <- paste(titles_string,"'",sep="")
titles_string <- substring(titles_string,4)
titles_string

write(titles_string, file="titles.txt")

