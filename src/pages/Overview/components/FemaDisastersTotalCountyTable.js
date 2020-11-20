import React from 'react';
import {connect} from 'react-redux';
import {reduxFalcor} from "utils/redux-falcor-new";
import get from 'lodash.get';
import Table from '../../../components/avl-components/components/Table/index'
import {fnum} from "../../../utils/sheldusUtils";

var _ = require('lodash')
const DISASTER_DECLARATION_BY_GEOID_ATTRIBUTES = [
    'geoid',
    'name',
    'declaration_date',
    'disaster_number',
    'id'
];

const  tableCols = [
    {
        'Header' : 'Name',
        'accessor': 'name',
        disableFilters: true
    },
    {
        'Header' : 'Disaster Number',
        'accessor': 'disaster_number',
        disableFilters: true
    },
    {
        'Header' : 'Declaration Date',
        'accessor': 'declaration_date',
        Cell : (data) =>{
            return <div style = {{ textAlign: 'center'}}>{new Date(get(data,`row.values.declaration_date`, '')).toLocaleDateString('en-US')}</div>
        },
        disableFilters: true
    },
    {
        'Header' : 'IHP TOTAL',
        'accessor': 'ihp_total',
        Cell : (data) =>{
            return <div style = {{ textAlign: 'center'}}>{fnum(get(data,`row.values.ihp_total`, ''))}</div>
        },
        disableFilters: true
    },
    {
        'Header' : 'PA TOTAL',
        'accessor': 'pa_total',
        Cell : (data) =>{
            return <div style = {{ textAlign: 'center'}}>{fnum(get(data,`row.values.pa_total`, ''))}</div>
        },
        disableFilters: true
    },
    {
        'Header' : 'HMGP TOTAL',
        'accessor': 'hmgp_total',
        Cell : (data) =>{
            return <div style = {{ textAlign: 'center'}}>{fnum(get(data,`row.values.hmgp_total`, ''))}</div>
        },
        disableFilters: true
    },
    {
        'Header' : 'TOTAL COST',
        'accessor': 'total_cost',
        Cell : (data) =>{
            return <div style = {{ textAlign: 'center'}}>{fnum(get(data,`row.values.total_cost`, ''))}</div>
        },
        disableFilters: true
    },
]
class FemaDisastersTotalCountyTable extends React.Component{
    constructor(props) {
        super(props);
    }

    async fetchFalcorDeps(){
        const data  = await this.props.falcor.get(['fema','disasters','declarations','byGeoid',this.props.geoid,'length'])
        let length = get(data ,['json','fema','disasters','declarations','byGeoid',this.props.geoid,'length'],null)
        let ihpData = {},
            paData = {},
            hmgpData = {}
        if(length){
            let to = length > 1 ? length-1 : 1
            const dataByIndex = await this.props.falcor.get(['fema','disasters','declarations','byGeoid',this.props.geoid,'byIndex',[{from:0,to:to}],DISASTER_DECLARATION_BY_GEOID_ATTRIBUTES])
            const geoName = await this.props.falcor.get(['geo',this.props.geoid,'name'])
            let graph = get(dataByIndex,['json','fema','disasters','declarations','byGeoid',this.props.geoid,'byIndex'],null)
            if(graph){
                let disaster_numbers = Object.keys(graph).filter(d => d!=='$__path').reduce((a,c) =>{
                    a.push(graph[c].disaster_number)
                    return a
                },[])
                ihpData = await this.props.falcor.get(['fema','disasters','declarations','byGeoid',this.props.geoid,'byId',disaster_numbers,'ihp_total'])
                paData = await this.props.falcor.get(['fema','disasters','declarations','byGeoid',this.props.geoid,'byId',disaster_numbers,'pa_total'])
                hmgpData = await this.props.falcor.get(['fema','disasters','declarations','byGeoid',this.props.geoid,'byId',disaster_numbers,'hmgp_total'])
            }

            return {dataByIndex,geoName,ihpData,paData,hmgpData}
        }
        else { return Promise.resolve({}) }
    }

    processData(){
        let graph = get(this.props.falcorCache,['fema','disasters','declarations','byGeoid','byId'],null)
        let geo = get(this.props.falcorCache,['geo',this.props.geoid,'name'])
        let totals = get(this.props.falcorCache,['fema','disasters','declarations','byGeoid',this.props.geoid,'byId'],null)
        let data = []
        if(graph && totals && !Object.keys(totals).map(d => totals[d].ihp_total && totals[d].pa_total && totals[d].hmgp_total).includes(undefined)){
            Object.keys(graph).forEach(id =>{
                if(graph[id].geoid.value === this.props.geoid){
                    let value  = DISASTER_DECLARATION_BY_GEOID_ATTRIBUTES.reduce((a,c) =>{
                        if(c === 'geoid'){
                            a[c] = geo
                        }else{
                            a['ihp_total'] = get(totals,[graph[id]['disaster_number'].value,'ihp_total','value'],0)
                            a['pa_total'] = get(totals,[graph[id]['disaster_number'].value,'pa_total','value'],0)
                            a['hmgp_total'] = get(totals,[graph[id]['disaster_number'].value,'hmgp_total','value'],0)
                            a[c] = get(graph,[id,c,'value'],'')
                        }

                        return a
                    },{})
                    data.push(value)
                }

            })
            data.map(d =>{
                d['total_cost'] = d['ihp_total'] + d['pa_total'] + d['hmgp_total']
            })
        }
        return data
    }

    render(){
        let data = this.processData()
        return(
            <div>
                {
                    data.length > 0 ?
                        <Table
                            defaultPageSize={10}
                            showPagination={true}
                            columns={tableCols}
                            data = {data}
                            initialPageSize={10}
                            minRows={data.length}
                            sortBy={'total_cost'}
                            sortOrder={'asc'}
                        />
                        : <div>Loading...</div>
                }
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        activeAmount:state.femaDisasterDeclarations.activeAmount,
        activeStateGeoid : state.stormEvents.activeStateGeoid,
        activeStateAbbrev : state.stormEvents.activeStateAbbrev,
        graph: state.graph,
        hazards: get(state.graph, 'riskIndex.hazards.value', [])
    };
};
const mapDispatchToProps = {
};

export default connect(mapStateToProps,mapDispatchToProps)(reduxFalcor(FemaDisastersTotalCountyTable))
