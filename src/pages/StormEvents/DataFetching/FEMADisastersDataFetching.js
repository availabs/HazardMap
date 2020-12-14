import get from "lodash.get";
import {falcorGraph} from "store/falcorGraphNew"
import { fnum, /*fnumClean*/} from "utils/sheldusUtils"
import * as d3 from "d3";

var format =  d3.format("~s")
const fmt = (d) => d < 1000 ? d : format(d)


const fips = ["01", "02", "04", "05", "06", "08", "09", "10", "11", "12", "13", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "40", "41", "42", "44", "45", "46", "47", "48", "49", "50", "51", "53", "54", "55", "56"]
const hazards = [
    {value:'wind', name:'Wind'},
    {value:'wildfire', name:'Wildfire'},
    {value:'tsunami', name:'Tsunami/Seiche'},
    {value:'tornado', name:'Tornado'},
    {value:'riverine', name:'Flooding'},
    {value:'lightning', name:'Lightning'},
    {value:'landslide', name:'Landslide'},
    {value:'icestorm', name:'Ice Storm'},
    {value:'hurricane', name:'Hurricane'},
    {value:'heatwave', name:'Heat Wave'},
    {value:'hail', name:'Hail'},
    {value:'earthquake', name:'Earthquake'},
    {value:'drought', name:'Drought'},
    {value:'avalanche', name:'Avalanche'},
    {value:'coldwave', name:'Coldwave'},
    {value:'winterweat', name:'Snow Storm'},
    {value:'volcano', name:'Volcano'},
    {value:'coastal', name:'Coastal Hazards'}
]
let years = []
const start_year = 1996
const end_year = 2019
for(let i = start_year; i <= end_year; i++) {
    years.push(i)
}

const processMapData = (fema,geo_names,filtered_geographies,geography,hazard, year) =>{

    let data = []
    if(geography === 'counties'){
        Object.keys(fema).filter(d => d !== '$__path').forEach(item =>{
            data.push({
                geoid : item,
                county_fips_name : `${get(geo_names,`${item}.name`,'')}`,
                year: year,
                hazard : hazards.reduce((a,c) => {
                    if(c.value === hazard){
                        a = c.name
                    }
                    return a
                },''),
                total_cost : get(fema, `${item}.${hazard}.${year}.${'total_cost'}`, 0),
                total_disasters : get(fema, `${item}.${hazard}.${year}.${'total_disasters'}`, 0)
            })
        })
    }
    if(geography === 'zip_codes'){
        Object.keys(fema).filter(d => d !== '$__path').forEach(item =>{
            data.push({
                geoid : item,
                county_fips_name : item,
                year: year,
                hazard : hazards.reduce((a,c) => {
                    if(c.value === hazard){
                        a = c.name
                    }
                    return a
                },''),
                total_cost : get(fema, `${item}.${hazard}.${year}.${'total_cost'}`, 0)
            })
        })
    }

    return data

}
const processGraphData = (geo_fips,columns,fema,hazard) => {
    let femaData = []
    femaData = years.reduce((a, year) => {
        a.push({
            'year': year.toString(),
        })
        return a
    }, [])
    if(geo_fips){
        femaData.map(d => {
            let total_cost = 0
            Object.keys(fema).filter(d => d!== '$__path').forEach(item =>{
                total_cost += get(fema,[item,hazard,d.year,'total_cost'],0)
            })
           return d[hazard] = total_cost
        })
    }else{
        femaData.map(d => {
            let total_cost = 0
            Object.keys(fema).filter(d => d!== '$__path').forEach(item =>{

                total_cost += get(fema[item],[d.year,'total_cost'],0)
            })
            return d[hazard] = total_cost
        })
    }
    return femaData

}

const processTableData = (geo_fips,columns,graphById,fema,year) =>{
    let graph_data = []
    let femaData = []
    if(graphById) {
        graph_data = hazards.reduce((a, c) => {
            a.push({
                'hazard': c.value,
                'count' : 0
            })
            return a
        }, [])
        graph_data.map(d =>{
            let sum = 0
            return Object.keys(graphById).filter(d => d !== '$__path').forEach(item =>{
                if(year === 'allTime') {
                    if(get(graphById[item],['disaster_type'],'').toString() === d.hazard) {
                        sum += +get(graphById[item],['total_cost'],0)
                        return d['total_cost_summaries'] = sum
                    }
                }else{
                    if(get(graphById[item],['disaster_type'],'').toString() === d.hazard && get(graphById[item],['year'],'').toString() === year.toString()){
                        sum += +get(graphById[item],['total_cost'],0)
                        return d['total_cost_summaries'] = sum
                    }
                }

            })
        })
        if(geo_fips){
                hazards.forEach(hazard =>{
                    let total_cost = 0
                    let total_cost_summaries = 0
                    Object.keys(fema).filter(d => d!== '$__path').forEach(item =>{
                        total_cost += get(fema,[item,hazard.value,year,'total_cost'],0)
                        total_cost_summaries += get(fema,[item,hazard.value,year,'total_cost_summaries'],0)
                    })
                    femaData.push({
                        'name': hazard.name,
                        'value': hazard.value,
                        'total_cost': total_cost,
                        'total_cost_summaries': total_cost_summaries
                    })
                })
        }else{
            femaData =Object.keys(fema).filter(d => d!=="$__path").map(hazard => {
                    return ["name", "value", "total_cost", "total_cost_summaries"].reduce((a, header) => {
                        hazards.forEach(item => {
                            if (item.value === hazard) {
                                if (header === 'name' || header === 'value') {
                                    a[header] = item[header]
                                } else {
                                    a[header] = get(fema, [item.value, year, header], 0)
                                }
                            }
                        })
                        return a
                    }, {})
                })

        }

        graph_data.forEach(dd =>{
            femaData.map(d =>{
                if(d.value === dd.hazard){
                    d['total_cost_summaries'] = dd.total_cost_summaries || 0

                }
                return d
            })
        })
        return femaData

    }
}

export const femaDisastersData = async (type,columns,geo_fips,geography,hazard,year) =>{
    const domain =  [1000000,5000000,10000000,100000000,1000000000]
    const graph = await falcorGraph.get(['fema','disasters','length'])
    let length = get(graph,['json','fema','disasters','length'],null)
    let data = []
    let filtered_geographies = []
    let fips_domain = []
    let geoNames = {}
    let femaByIdData = {}
    let FemaDisastersCombinedTotalCostData = {}
    let FemaDisastersCombinedTotalCostData_US = {}
    let FemaDisastersCombinedTotalCostZipData = {}
    let zip_codes = []
    if(length){
        femaByIdData = await falcorGraph.get(['fema','disasters','byIndex',[{from:0,to:length-1}],[
                "name",
            "year",
            "total_cost",
            "disaster_type"
        ]])
    }
    if(geo_fips){
        const geoData =await falcorGraph.get(['geo', geo_fips,'counties', 'geoid'],
            ['geo', fips, ['name']])
        let graph = get(geoData,['json','geo'],null)
        filtered_geographies = Object.values(graph)
            .reduce((out, state) => {
                if (state['counties']) {
                    out = [...out, ...state['counties']]
                }
                return out
            }, [])
        fips_domain = Object.keys(graph).filter(d => d!=='$__path')
            .reduce((out, state) => {
                if(fips.includes(state)){
                    out.push({
                        'fips':state,
                        'name': graph[state].name || ''
                    })
                }
                return out
            }, [])
        if(geography === 'counties' && filtered_geographies.length > 0){
            geoNames = await falcorGraph.get(['geo',filtered_geographies,['name']])
            console.time('fema all time data fetching')
            FemaDisastersCombinedTotalCostData = await falcorGraph.get(['fema','disasters',filtered_geographies,hazard,year,columns])
            console.timeEnd('fema all time data fetching')
        }
        if(geography === 'zip_codes' && filtered_geographies.length > 0){
            const zipData = await falcorGraph.get(['geo',filtered_geographies,'byZip',['zip_codes']])
            let graph_zip = get(zipData,['json','geo'],null)
            if(graph_zip){
                zip_codes = Object.values(graph_zip).reduce((out,geo) =>{
                    if(geo.byZip){
                        out = [...out,...geo.byZip['zip_codes']]
                    }
                    return out
                },[])
                FemaDisastersCombinedTotalCostZipData = await falcorGraph.get(['fema','disasters',zip_codes,hazard,year,columns])
            }
        }


    }
    else{
        FemaDisastersCombinedTotalCostData_US = await falcorGraph.get(['fema','disasters',[""],hazard,year, columns])
    }

    if(type === 'map'){
        if(filtered_geographies.length > 0){
            let geo_names = get(geoNames,'json.geo',{})
            let fema = geography === 'counties' ? get(FemaDisastersCombinedTotalCostData, ['json','fema','disasters'], {}) :
                get(FemaDisastersCombinedTotalCostZipData,['json','fema','disasters'],{})
            data = processMapData(fema,geo_names,filtered_geographies,geography,hazard,year)
        }

    }
    if(type === 'table'){
        let graphById = get(femaByIdData,['json','fema','disasters','byIndex'],null)
        let fema = geo_fips ? get(FemaDisastersCombinedTotalCostData, ['json','fema','disasters'], {}):
            get(FemaDisastersCombinedTotalCostData_US, ['json','fema','disasters',[""]], {})
        data = processTableData(geo_fips,columns,graphById,fema,year)

    }
    if(type === 'graph'){
        let fema = geo_fips ? get(FemaDisastersCombinedTotalCostData, ['json','fema','disasters'], {}):
            get(FemaDisastersCombinedTotalCostData_US, ['json','fema','disasters',[""]], {})
        data = processGraphData(geo_fips,columns,fema,hazard)
    }
    return {
        filtered_geographies : filtered_geographies,
        fips_domain : fips_domain,
        domain: domain,
        data : data,
        zip_codes : zip_codes,
        popover : [
            {
                'name' : 'Total Cost',
                'value' : 'total_cost',
                type: fnum
            },
            {
                'name' : '# Episodes',
                'value' : 'total_disasters',
                type: fmt
            },

        ]
    }
}
