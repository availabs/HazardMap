import React from "react";
import get from "lodash.get";
import {falcorGraph} from "store/falcorGraphNew"
var _ = require('lodash')

const attributes=[
    "disaster_number",
    "name",
    "declaration_date",
    "total_cost",
    "disaster_type",
    "total_number_ia_approved",
    'total_amount_ihp_approved',
    'total_amount_ha_approved',
    "total_amount_ona_approved",
    'total_obligated_amount_pa',
    'total_obligated_amount_cat_ab',
    'total_obligated_amount_cat_c2g',
    'pa_load_date',
    'ia_load_date',
    'total_obligated_amount_hmgp',
    'last_refresh'
]

export const femaDisastersData = async () =>{
    const domain =  [1000000,5000000,10000000,100000000,1000000000]
    const graph = await falcorGraph.get(['fema','disasters','length'])
    let length = get(graph,['json','fema','disasters','length'],null)
    let data = []
    if(length){
        await falcorGraph.get(['fema','disasters','byIndex',[{from:0,to:length-1}],attributes])
        let graph = get(falcorGraph.getCache(),['fema','disasters','byId'],{})
        Object.keys(graph).filter(d => d!=='$__path').forEach(item =>{
            data.push(
                attributes.reduce((out,attribute) =>{
                    if(graph[item][attribute]){
                        out[attribute] =  graph[item][attribute].value
                    }
                    return out
                },{}))

        })
        data =  _.filter(data,v => _.keys(v).length !== 0)
        return {
            domain: domain,
            data: data
        }
    }
    return {}
}
