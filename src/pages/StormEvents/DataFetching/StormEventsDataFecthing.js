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
const processMapData = (sw,geo_names,filtered_geographies,hazard, year) =>{

    let data = []
    Object.keys(sw).filter(d => d !== '$__path').forEach(item =>{
        data.push({
            geoid : item,
            county_fips_name : `${get(geo_names,`${item}.name`,'')},${get(sw,`${item}.${hazard}.${year}.${'state'}`,'')}`,
            year: year,
            hazard : hazards.reduce((a,c) => {
                if(c.value === hazard){
                    a = c.name
                }
                return a
            },''),
            total_damage : get(sw, `${item}.${hazard}.${year}.${'total_damage'}`, 0),
            property_damage : get(sw, `${item}.${hazard}.${year}.${'property_damage'}`, 0),
            crop_damage : get(sw, `${item}.${hazard}.${year}.${'crop_damage'}`, 0),
            num_events : get(sw, `${item}.${hazard}.${year}.${'num_events'}`, 0),
            num_episodes : get(sw, `${item}.${hazard}.${year}.${'num_episodes'}`, 0)
        })
    })
    return data

}

const processGraphData = (sw,geo_fips,columns) => {
    let data = []
    data = years.reduce((a, year) => {
        a.push({
            'year': year.toString(),
        })
        return a
    }, [])
    Object.keys(sw).forEach(hazard => {
        data.forEach(item => {
            item[hazard] = get(sw, [hazard,item.year,columns], 0)
        })
    })
    return data
}

const processTableData = (columns,sw,year) =>{
    let header_columns =["name","value",...columns]
    let data = []
    data = Object.keys(sw).map(hazard =>{
        return header_columns.reduce((a,header) =>{
            hazards.forEach(item =>{
                if(item.value === hazard){
                    if (header === 'name' || header === 'value') {
                        a[header] = item[header]
                    }
                    else if(header === 'annualized_damage'){
                        a[header] = get(sw,[hazard,"allTime",header],0)
                    }
                    else{
                        a[header] = get(sw,[hazard,year,header],0)
                    }
                }
            })
            return a
        },{})
    })
    return data
}

export const stormEventsData = async (type = '',columns = [],fips_value,geography_filter,hazard,year) =>{
    let geo_fips = fips_value
    let geography = geography_filter || 'counties'
    let filtered_geographies = []
    let fips_domain = []
    let domain = [1000000, 5000000, 10000000, 100000000, 1000000000, 10000000000]
    let data = []
    let severeWeather ={}
    let  geoNames = {}
    let severeWeather_US = {}
    let severeWeather_fips = {}
    if(geo_fips){
        const geoData =await falcorGraph.get(['geo', geo_fips, geography, 'geoid'],
            ['geo', fips, ['name']])
        let graph = get(geoData,['json','geo'],null)
        filtered_geographies = Object.values(graph)
            .reduce((out, state) => {
                if (state[geography]) {
                    out = [...out, ...state[geography]]
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
        severeWeather_fips = await falcorGraph.get(['severeWeather',geo_fips,hazard,year,columns])
        severeWeather = await falcorGraph.get(['severeWeather',filtered_geographies,hazard,year,columns])
        geoNames = await falcorGraph.get(['geo',filtered_geographies,['name']])
    }
    else{
        severeWeather_US = await falcorGraph.get(['severeWeather',[""],hazard,year,columns])
    }
    if(type === 'map'){
        if(filtered_geographies.length > 0){
            let geo_names = get(geoNames,'json.geo',{})
            let sw = get(severeWeather, 'json.severeWeather', {})
            data = processMapData(sw,geo_names,filtered_geographies,hazard,year)
        }

    }
    if(type === 'graph'){
        let sw = geo_fips ? get(severeWeather_fips, ['json','severeWeather',geo_fips], null) :
            get(severeWeather_US, ['json','severeWeather',[""]], null)
        data = sw ? processGraphData(sw,geo_fips,columns) : []

    }
    if(type === 'table'){
        let sw = geo_fips ? get(severeWeather_fips, ['json','severeWeather',geo_fips], null) :
            get(severeWeather_US, ['json','severeWeather',[""]], null)
        data = sw ? processTableData(columns,sw,year) : []
    }
    return {
        filtered_geographies : filtered_geographies,
        fips_domain : fips_domain,
        domain: domain,
        data : data,
        popover : [
            {
                'name' : 'Property Damage',
                'value' : 'property_damage',
                type: fnum
            },
            {
                'name' : 'Crop Damage',
                'value' : 'crop_damage',
                type: fnum
            },
            {
                'name' : 'Injuries',
                'value' : 'injuries',
                type: fmt
            },
            {
                'name' : 'Property Damage',
                'value' : 'property_damage',
                type: fnum
            },
            {
                'name' : 'Fatalities',
                'value' : 'fatalities',
                type : fmt
            },
            ]
    }
}

