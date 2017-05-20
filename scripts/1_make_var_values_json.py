import json
import pandas as pd
import operator

for in_data in ['dams','dams_subset']:
    with open('../docs/data/{}.geojson'.format(in_data)) as f:
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

    # Field Names
    names = {i:i.replace('_',' ') for i in types.keys()}
    names['Fed_Operation'] = "Federal Agency Operating"
    names['All_Purposes'] = 'Dam Purpose (all)'
    names['Primary_Purpose'] = 'Dam Purpose (primary)'
    names['Fed_Owner'] = 'Federal Agency Owning'
    names['Max_Storage'] = 'Max Storage (acre-feet)'
    names['Normal_Storage'] = 'Normal Storage (acre-feet)'
    names['Hydraulic_Height'] = 'Hydraulic Height (feet)'
    names['Structural_Height'] = 'Structural Height (feet)'
    names['Dam_Height'] = 'Dam Height (feet)'
    names['NID_Height'] = 'Max Height (feet)'
    names['Dam_Length'] = 'Dam Length (feet)'
    names['Source_Agency'] = 'Data Source'
    names['State_Reg_Agency'] = 'State Regulatory Agency'
    names['State_Reg_Dam'] = 'State Regulation'
    names['Surface_Area'] = 'Surface Area (acres)'
    names = sorted(names.items(), key=operator.itemgetter(1))


    for v in vals:
        vals[v] = sorted(vals[v])
    out_json = {
        'types':types,
        'vals':vals,
        'names':names
    }

    with open('../docs/data/filterText{}.json'.format(in_data.lstrip('dams')),'w') as f:
        json.dump(out_json,f)

