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


const  ia_tableCols = [
    {
        'Header' : 'City,Zip',
        'accessor': 'city_zip',
        disableFilters: false
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
        'Header': 'IHP Amount',
        'accessor': 'ihp_amount',
        Cell: (data) => {
            return <div style={{textAlign: 'center'}}>{fnum(get(data, `row.values.ihp_amount`, ''))}</div>
        },
        disableFilters: true
    },
    {
        'Header': 'HA Amount',
        'accessor': 'ha_amount',
        Cell: (data) => {
            return <div style={{textAlign: 'center'}}>{fnum(get(data, `row.values.ha_amount`, ''))}</div>
        },
        disableFilters: true
    },
    {
        'Header': 'ON A Amount',
        'accessor': 'on_a_amount',
        Cell: (data) => {
            return <div style={{textAlign: 'center'}}>{fnum(get(data, `row.values.on_a_amount`, ''))}</div>
        },
        disableFilters: true
    }

]
const pa_tableCols = [

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
        'Header': 'Applicant Name',
        'accessor': 'application_title',
        disableFilters: true
    },
    {
        'Header': 'Federal Share Obligated',
        'accessor': 'federal_share_obligated',
        Cell: (data) => {
            return <div style={{textAlign: 'center'}}>{fnum(get(data, `row.values.federal_share_obligated`, ''))}</div>
        },
        disableFilters: true
    }

]
class FemaDisastersIndividualCountyTable extends React.Component{
    constructor(props) {
        super(props);
    }

    async fetchFalcorDeps(){
        const data  = await this.props.falcor.get(['fema','disasters','declarations','byGeoid',this.props.geoid,'length'])
        let length = get(data ,['json','fema','disasters','declarations','byGeoid',this.props.geoid,'length'],null)
        let ihpData = {},
            paData = {}
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
                ihpData = await this.props.falcor.get(['fema','disasters','declarations','byGeoid',this.props.geoid,'byId',disaster_numbers,'ia'])
                paData = await this.props.falcor.get(['fema','disasters','declarations','byGeoid',this.props.geoid,'byId',disaster_numbers,'pa'])
                //hmgpData = await this.props.falcor.get(['fema','disasters','declarations','byGeoid',this.props.geoid,'byId',disaster_numbers,'hmgp_total'])
            }

            return {dataByIndex,geoName,ihpData,paData}
        }
        else { return Promise.resolve({}) }
    }

    processIAData(){
        let graph = get(this.props.falcorCache,['fema','disasters','declarations','byGeoid','byId'],null)
        let totals = get(this.props.falcorCache,['fema','disasters','declarations','byGeoid',this.props.geoid,'byId'],null)
        let data = []
        if(graph && totals){
            Object.keys(graph).forEach(id =>{
                get(totals,[graph[id].disaster_number.value,'ia','value'],[]).forEach(d =>{
                    data.push(d)
                })
            })
            if(data.length === 0){
                data.push({})
            }
        }
        return data
    }

    processPAData(){
        let graph = get(this.props.falcorCache,['fema','disasters','declarations','byGeoid','byId'],null)
        let totals = get(this.props.falcorCache,['fema','disasters','declarations','byGeoid',this.props.geoid,'byId'],null)
        let data = []
        if(graph && totals){
            Object.keys(graph).forEach(id =>{
                get(totals,[graph[id].disaster_number.value,'pa','value'],[]).forEach(d =>{
                    data.push(d)
                })

            })
            if(data.length === 0){
                data.push({})
            }
        }

        return data

    }

    render(){
        let data = this.props.type === 'ia' ? this.processIAData() : this.processPAData()
        return(
            <div>
                {
                    data ?
                        <Table
                            defaultPageSize={15}
                            showPagination={true}
                            columns={this.props.type === 'ia' ? ia_tableCols : pa_tableCols}
                            data = {data}
                            initialPageSize={15}
                            minRows={data.length}
                            sortBy={'declaration_date'}
                            sortOrder={'desc'}
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

export default connect(mapStateToProps,mapDispatchToProps)(reduxFalcor(FemaDisastersIndividualCountyTable))
