import json
import pandas as pd

with open('../docs/data/dams.geojson') as f:
    in_json = json.load(f)
    in_ftrs = in_json['features']

    
ftr1 = in_ftrs[0]
prop1 = ftr1['properties']
var_names = prop1.keys()


types = {}
vals = {}
to_skip = ['Url_Address','NID_ID','key']
for v in prop1:
    if v not in to_skip:
        types[v] = type(prop1[v])
        if prop1[v] == None:
            ix = 1
            varval = None
            while varval == None and ix < len(in_ftrs):
                varval = in_ftrs[ix]['properties'][v]
                ix+=1
            types[v] = type(varval)


        if v == 'All_Purposes':
            tmp = [i['properties'][v] for i in in_ftrs]
            tmp = [str(i).split(', ') for i in tmp]
            vals[v] = list(set([item for sublist in tmp for item in sublist]))
        elif types[v] == str:
            vals[v] = list(set([i['properties'][v] for i in in_ftrs]))
        elif types[v] in [float,int]:
            vals[v] = []
            tmp = [i['properties'][v] for i in in_ftrs if i['properties'][v] != None]
            vals[v].append(min(tmp))
            vals[v].append(max(tmp))
            
        for ix,i in enumerate(vals[v]):
            if i == None:
                if types[v] == str: vals[v][ix] = "unlabled"
            
        types[v] = str(types[v])[8:-2]

types['All_Purposes'] = 'multiple'
types['Dam_Name'] = 'open_text'
types['Owner_Name'] = 'open_text'
types['River'] = 'open_text'

del types['Submit_Date']
del vals['Submit_Date']

for v in vals:
    vals[v] = sorted(vals[v])
out_json = {
    'types':types,
    'vals':vals
}

with open('../dam_viz/assets/data/filterText.json','w') as f:
    json.dump(out_json,f)
