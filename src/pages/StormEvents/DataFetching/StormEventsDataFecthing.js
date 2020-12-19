import get from "lodash.get";
import {falcorGraph} from "store/falcorGraphNew"
import config from '../components/config'



export const stormEventsData = async (type = '',columns = [],fips_value,geography_filter,hazard,year) =>{
    let geo_fips = fips_value ? fips_value : config['fips']
    let geography = geography_filter || 'counties'
    let filtered_geographies = []
    let severeWeather ={}
    let  geoNames = {}
    let severeWeather_US = {}
    let severeWeather_fips = {}
    let geom = {}
    const geoData =await falcorGraph.get(['geo', geo_fips, geography, 'geoid'],['geo',config.fips,['name']])
    let graph = get(geoData,['json','geo'],null)
    filtered_geographies = Object.values(graph)
        .reduce((out, state) => {
            if (state[geography]) {
                out = [...out, ...state[geography]]
            }
            return out
        }, [])
    if(type === 'map'){
        severeWeather = await falcorGraph.get(['severeWeather',filtered_geographies,hazard,year,columns])
        geoNames = await falcorGraph.get(['geo',filtered_geographies,['name']])
        if(fips_value){
            geom = await falcorGraph.get(['geo',fips_value,'boundingBox','value'])
        }
        return {severeWeather,geoNames,geom}
    }
    if(fips_value){
        severeWeather_fips = await falcorGraph.get(['severeWeather',geo_fips,hazard,year,columns])
        return severeWeather_fips
    }
    else{
        severeWeather_US = await falcorGraph.get(["severeWeather",[""],hazard,year,columns])
        return severeWeather_US

    }


}

