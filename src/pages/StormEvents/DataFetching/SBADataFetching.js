import React from "react";
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

const processMapData = (sba,geo_names,filtered_geographies,geography,hazard, year) =>{
    let data = []
    let domain =  [1000000, 5000000, 10000000, 100000000, 1000000000, 10000000000]
    if(geography === 'counties'){

        Object.keys(sba).filter(d => d !== '$__path').forEach(item => {
            data.push({
                geoid : item,
                county_fips_name: `${get(geo_names, `${item}.name`, '')},${get(sba, `${item}.${hazard}.${year}.${'state_abbrev'}`, '')}`,
                year: year,
                hazard: hazards.reduce((a, c) => {
                    if (c.value === hazard) {
                        a = c.name
                    }
                    return a
                }, ''),
                total_loss: get(sba, `${item}.${hazard}.${year}.${'total_loss'}`, 0),
                loan_total: get(sba, `${item}.${hazard}.${year}.${'loan_total'}`, 0),
                num_loans: get(sba, `${item}.${hazard}.${year}.${'num_loans'}`, 0)
            })
        })
    }
    if(geography === 'zip_codes'){
        Object.keys(sba).filter(d => d !== '$__path').forEach(item =>{
            data.push({
                geoid: item,
                county_fips_name : `${item}`,
                year: year,
                hazard : hazards.reduce((a,c) => {
                    if(c.value === hazard){
                        a = c.name
                    }
                    return a
                },''),
                total_loss : get(sba, `${item}.${hazard}.${year}.${'total_loss'}`, 0),
                loan_total : get(sba, `${item}.${hazard}.${year}.${'loan_total'}`, 0),
                num_loans : get(sba, `${item}.${hazard}.${year}.${'num_loans'}`, 0)
            })
        })

    }
    return {data:data,domain: domain}

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

export const sbaData = async (type='',columns=[],fips_value,geography_filter,hazard,year) =>{
    let geo_fips = fips_value
    let geography = geography_filter || 'counties'
    let zip_codes = []
    let data = []
    let domain = []
    let filtered_geographies = []
    let fips_domain = []
    let sba_US = {}
    let sbaData = {}
    let geoNames = {}
    let sbaZipData = {}
    let sbaData_fips = {}
    if(geo_fips){
        const geoData =await falcorGraph.get(['geo', geo_fips, 'counties', 'geoid'],
            ['geo', fips, ['name']])
        let graph = get(geoData,['json','geo'],null)
        filtered_geographies = Object.values(graph)
            .reduce((out, state) => {
                if (state.counties) {
                    out = [...out, ...state.counties]
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
        sbaData_fips = await falcorGraph.get(
            ['sba','all',["36"],hazard,year,columns])
        if(geography === 'counties' && filtered_geographies.length > 0) {
            geoNames = await falcorGraph.get(['geo',filtered_geographies,['name']])
            sbaData = await falcorGraph.get(
                ['sba','all',filtered_geographies,hazard,year,columns])

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
                sbaZipData = await falcorGraph.get(
                    ['sba','all','byZip',zip_codes,hazard,year,columns]
                )
            }

        }

    }else{
        sba_US = await falcorGraph.get(['sba','all',[""],hazard,year,columns])
    }
    if(type === 'map'){
        let sba = geography === 'counties' ? get(sbaData, 'json.sba.all', {}) :
            get(sbaZipData, 'json.sba.all.byZip', {})
        let geo_names = get(geoNames,'json.geo',{})
        let result = processMapData(sba,geo_names,filtered_geographies,
            geography,hazard,year)
        data = result.data
        domain = result.domain

    }
    if(type === 'graph'){
        let sba = geo_fips ? get(sbaData_fips, ['json','sba','all',geo_fips], null) :
            get(sba_US, ['json','sba','all',[""]], null)
        data = sba ? processGraphData(sba,geo_fips,columns) : []

    }
    if(type === 'table'){
        let sba = geo_fips ? get(sbaData_fips, ['json','sba','all',geo_fips], null) :
            get(sba_US, ['json','sba','all',[""]], null)
        data = sba ? processTableData(columns,sba,year) : []
    }
    return {
        filtered_geographies: filtered_geographies,
        data : data,
        domain : domain,
        zip_codes: zip_codes,
        fips_domain : fips_domain,
        popover : [
            {
                'name' : 'Total Loss',
                'value' : 'total_loss',
                type: fnum
            },
            {
                'name' : 'Total Loan',
                'value' : 'loan_total',
                type: fnum
            },
            {
                'name' : '# Loans',
                'value' : 'num_loans',
                type: fmt
            },

        ]
    }



}


