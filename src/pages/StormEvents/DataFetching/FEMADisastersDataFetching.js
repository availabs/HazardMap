import get from "lodash.get";
import {falcorGraph} from "store/falcorGraphNew"
import config from "../components/config";


export const femaDisastersData = async (type,columns,fips_value,geography,hazard,year) =>{
    let geo_fips = fips_value ? fips_value : config['fips']
    const graph = await falcorGraph.get(['fema','disasters','length'])
    let length = get(graph,['json','fema','disasters','length'],null)
    let filtered_geographies = []
    let geom ={}
    let geoNames = {}
    let femaByIdData = {}
    let FemaDisastersCombinedTotalCostData = {}
    let FemaDisastersCombinedTotalCostData_US = {}
    let FemaDisastersCombinedTotalCostZipData = {}
    let FemaDisastersCombinedTotalCostData_fips = {}
    let zip_codes = []

    const geoData =await falcorGraph.get(['geo', geo_fips,'counties', 'geoid'],
        ['geo',config.fips,['name']])
    let geo = get(geoData,['json','geo'],null)
    filtered_geographies = Object.values(geo)
        .reduce((out, state) => {
            if (state['counties']) {
                out = [...out, ...state['counties']]
            }
            return out
        }, [])
    if(length && type ==='table'){
        femaByIdData = await falcorGraph.get(['fema','disasters','byIndex',[{from:0,to:length-1}],[
            "name",
            "year",
            "total_cost",
            "disaster_type"
        ]])
    }
    if(type === 'map'){
        if(fips_value){
            geom = await falcorGraph.get(['geo',fips_value,'boundingBox','value'])
        }
        if(geography === 'counties' ){

            geoNames = await falcorGraph.get(['geo',filtered_geographies,['name']])
            FemaDisastersCombinedTotalCostData = await falcorGraph.get(['fema','disasters',filtered_geographies,hazard,year,columns])

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
                FemaDisastersCombinedTotalCostZipData = await falcorGraph.get(['fema','disasters','byZip',zip_codes,hazard,year,columns])
            }
        }
        return {geom,FemaDisastersCombinedTotalCostData,geoNames,FemaDisastersCombinedTotalCostZipData}

    }
    if(fips_value && type !== 'map'){
        FemaDisastersCombinedTotalCostData_fips =  await falcorGraph.get(['fema','disasters',filtered_geographies,hazard,year,columns])
        return {FemaDisastersCombinedTotalCostData_fips,femaByIdData}
    }else if(!fips_value && (type ==='table' || type === 'graph')){
        FemaDisastersCombinedTotalCostData_US = await falcorGraph.get(['fema','disasters',[""],hazard,year, columns])
        return {FemaDisastersCombinedTotalCostData_US, femaByIdData}
    }


}
