import React from 'react';
import {connect} from 'react-redux';
import {reduxFalcor} from "utils/redux-falcor-new";
import get from 'lodash.get';
import Table from '../../../components/avl-components/components/Table/index'

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
    'Header' : 'County',
    'accessor': 'geoid',
    disableFilters: true
},
    {
        'Header' : 'Name',
        'accessor': 'name',
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
        'Header' : 'Disaster Number',
        'accessor': 'disaster_number',
        disableFilters: true
    },

]
class FemaDisastersCountyTable extends React.Component{
    constructor(props) {
        super(props);
    }

    async fetchFalcorDeps(){
       const data  = await this.props.falcor.get(['fema','disasters','declarations','byGeoid',this.props.geoid,'length'])
        let length = get(data ,['json','fema','disasters','declarations','byGeoid',this.props.geoid,'length'],null)
        if(length){
            let to = length > 1 ? length-1 : 1
            const dataByIndex = await this.props.falcor.get(['fema','disasters','declarations','byGeoid',this.props.geoid,'byIndex',[{from:0,to:to}],DISASTER_DECLARATION_BY_GEOID_ATTRIBUTES])
            const geoName = await this.props.falcor.get(['geo',this.props.geoid,'name'])
            return {dataByIndex,geoName}
        }
        else { return Promise.resolve({}) }
    }

    processData(){
        let graph = get(this.props.falcorCache,['fema','disasters','declarations','byGeoid','byId'],null)
        let geo = get(this.props.falcorCache,['geo',this.props.geoid,'name'])
        let data = []
        if(graph){
           Object.keys(graph).forEach(id =>{
               let value  = DISASTER_DECLARATION_BY_GEOID_ATTRIBUTES.reduce((a,c) =>{
                   if(c === 'geoid'){
                       a[c] = geo
                   }else{
                       a[c] = get(graph,[id,c,'value'],'')
                   }

                   return a
               },{})
               data.push(value)
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
                            sortBy={'declaration_date'}
                            sortOrder={'desc'}
                        />
                        : null
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

export default connect(mapStateToProps,mapDispatchToProps)(reduxFalcor(FemaDisastersCountyTable))
