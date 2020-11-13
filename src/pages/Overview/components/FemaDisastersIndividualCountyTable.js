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
            return <div style = {{ textAlign: 'center'}}>{new Date(get(data,`row.values.declaration_date`, 'mm/dd/yyyy')).toLocaleDateString('en-US')}</div>
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

];
const hmgp_projects_tableCols = [

    {
        'Header' : 'Disaster Number',
        'accessor': 'disaster_number',
        disableFilters: true
    },
    {
        'Header': 'Program Area',
        'accessor': 'program_area',
        disableFilters: true
    },
    {
        'Header': 'Project Title',
        'accessor': 'project_title',
        disableFilters: true
    },
    {
        'Header': 'Federal Share Obligated',
        'accessor': 'federal_share_obligated',
        Cell: (data) => {
            return <div style={{textAlign: 'center'}}>{fnum(get(data, `row.values.federal_share_obligated`, ''))}</div>
        },
        disableFilters: true
    },
    {
        'Header': 'Project Amount',
        'accessor': 'project_amount',
        Cell: (data) => {
            return <div style={{textAlign: 'center'}}>{fnum(get(data, `row.values.project_amount`, ''))}</div>
        },
        disableFilters: true
    }
]
const hmgp_properties_tableCols = [

    {
        'Header' : 'Disaster Number',
        'accessor': 'disaster_number',
        disableFilters: true
    },
    {
        'Header': 'Property Action',
        'accessor': 'property_action',
        disableFilters: true
    },
    {
        'Header': 'Structure Type',
        'accessor': 'structure_type',
        disableFilters: true
    },
    {
        'Header': 'Program Area',
        'accessor': 'program_area',
        disableFilters: true
    },
    {
        'Header': 'Title',
        'accessor': 'title',
        disableFilters: true
    },
    {
        'Header': 'Number of Properties',
        'accessor': 'number_of_properties',
        disableFilters: true
    },
    {
        'Header': 'Actual Amount Paid',
        'accessor': 'actual_amount_paid',
        Cell: (data) => {
            return <div style={{textAlign: 'center'}}>{fnum(get(data, `row.values.actual_amount_paid`, ''))}</div>
        },
        disableFilters: true
    },

]
class FemaDisastersIndividualCountyTable extends React.Component{
    constructor(props) {
        super(props);
    }

    async fetchFalcorDeps(){
        const data  = await this.props.falcor.get(['fema','disasters','declarations','byGeoid',this.props.geoid,'length'])
        let length = get(data ,['json','fema','disasters','declarations','byGeoid',this.props.geoid,'length'],null)
        let ihpData = {},
            paData = {},
            hmgpProjectsData= {},
            hmgpPropertiesData = {}
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
                hmgpProjectsData = await this.props.falcor.get(['fema','disasters','declarations','byGeoid',this.props.geoid,'byId',disaster_numbers,'hmgp_projects'])
                hmgpPropertiesData = await this.props.falcor.get(['fema','disasters','declarations','byGeoid',this.props.geoid,'byId',disaster_numbers,'hmgp_properties'])
            }

            return {dataByIndex,geoName,ihpData,paData,hmgpProjectsData,hmgpPropertiesData}
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

    processHMGPProjectsData(){
        let graph = get(this.props.falcorCache,['fema','disasters','declarations','byGeoid','byId'],null)
        let totals = get(this.props.falcorCache,['fema','disasters','declarations','byGeoid',this.props.geoid,'byId'],null)
        let data = []
        if(graph && totals){
            Object.keys(graph).forEach(id =>{
                get(totals,[graph[id].disaster_number.value,'hmgp_projects','value'],[]).forEach(d =>{
                    data.push(d)
                })

            })
            if(data.length === 0){
                data.push({})
            }
        }

        return data
    }

    processHMGPPropertiesData(){
        let graph = get(this.props.falcorCache,['fema','disasters','declarations','byGeoid','byId'],null)
        let totals = get(this.props.falcorCache,['fema','disasters','declarations','byGeoid',this.props.geoid,'byId'],null)
        let data = []
        if(graph && totals){
            Object.keys(graph).forEach(id =>{
                get(totals,[graph[id].disaster_number.value,'hmgp_properties','value'],[]).forEach(d =>{
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
        let data = this.props.type === 'ia' ?
            this.processIAData() :
            this.props.type === 'pa' ?
                this.processPAData() :
                this.props.type === 'hmgp_projects' ?
                    this.processHMGPProjectsData() : this.processHMGPPropertiesData()
        return(
            <div>
                {
                    data.length > 0 ?
                        <Table
                            defaultPageSize={15}
                            showPagination={true}
                            columns={this.props.type === 'ia' ?
                                ia_tableCols :
                                this.props.type === 'pa' ?
                                    pa_tableCols :
                                    this.props.type === 'hmgp_projects' ?
                                        hmgp_projects_tableCols : hmgp_properties_tableCols}
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
