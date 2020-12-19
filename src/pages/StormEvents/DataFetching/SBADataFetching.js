import get from "lodash.get";
import {falcorGraph} from "store/falcorGraphNew"
import config from "../components/config";


export const sbaData = async (type='',columns=[],fips_value,geography_filter,hazard,year) =>{
    let geo_fips = fips_value ? fips_value : config['fips']
    let geography = geography_filter || 'counties'
    let zip_codes = []
    let filtered_geographies = []
    let sba_US = {}
    let sbaData = {}
    let geoNames = {}
    let sbaZipData = {}
    let sbaData_fips = {}
    let geom = {}
    const geoData =await falcorGraph.get(['geo', geo_fips, 'counties', 'geoid'],
        ['geo',config.fips,['name']])
    let graph = get(geoData,['json','geo'],null)
    filtered_geographies = Object.values(graph)
        .reduce((out, state) => {
            if (state.counties) {
                out = [...out, ...state.counties]
            }
            return out
        }, [])

    if(type === 'map'){
        if(geography === 'counties'){
            sbaData = await falcorGraph.get(
                ['sba','all',filtered_geographies,hazard,year,columns])
            geoNames = await falcorGraph.get(['geo',filtered_geographies,['name']])
        }
        if(geography === 'zip_codes'){
            const zipData = await falcorGraph.get(['geo',filtered_geographies,'byZip',['zip_codes']])
            let graph_zip = get(zipData,['json','geo'],null)
            if(graph_zip){
                zip_codes = Object.values(graph_zip).reduce((out,geo) =>{
                    if(geo.byZip){
                        out = [...out,...geo.byZip['zip_codes']]
                    }
                    return out
                },[])
            }
            sbaZipData = await falcorGraph.get(
                ['sba','all','byZip',zip_codes,hazard,year,columns]
            )
        }
        if(fips_value){
            geom = await falcorGraph.get(['geo',fips_value,'boundingBox','value'])
        }
        return {sbaData,sbaZipData,geoNames,geom}

    }
    if(fips_value){
        sbaData_fips = await falcorGraph.get(
            ['sba','all',geo_fips,hazard,year,columns])
        return sbaData_fips

    }else{
        sba_US = await falcorGraph.get(['sba','all',[""],hazard,year,columns])
        return sba_US
    }




}


