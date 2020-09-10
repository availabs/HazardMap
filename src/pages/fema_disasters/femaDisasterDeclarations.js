import React from 'react';
import {connect} from 'react-redux';
import {reduxFalcor} from "utils/redux-falcor-new";
import get from 'lodash.get';
import Table from "../../components/avl-components/components/Table";
import {withRouter} from 'react-router'

const tableCols = [
    {
        Header: 'Disaster Number',
        accessor: 'disaster_number',
    },
    {
        Header: 'Declaration Title',
        accessor: 'declaration_title',
        disableFilters: true
    },
    {
        Header: 'Declaration Request Number',
        accessor: 'declaration_request_number',
        disableFilters: true
    },
    {
        Header : 'State',
        accessor: 'state',
    },
    {
        Header : 'Declaration Type',
        accessor: 'declaration_type',
        disableFilters: true
    },
    {
        Header:'Declaration Date',
        accessor:'declaration_date',
        disableFilters: true
    }
];

const attributes=['disaster_number','declaration_title','declaration_request_number','state','declaration_type','declaration_date']

class FemaDisasterDeclarations extends React.Component{
    constructor(props) {
        super(props);
        this.state ={
            data : []
        }
    }

    fetchFalcorDeps(){
        let disaster_number = window.location.pathname.split("/")[3]
        let data = []
        return this.props.falcor.get(['fema','disasters',[disaster_number],'declarations','length'])
            .then(response =>{
                let length = get(response.json,['fema','disasters',disaster_number,'declarations','length'],null)
                if(length){
                    this.props.falcor.get(['fema','disasters',[disaster_number],'declarations','byIndex',[{from:0,to:length}],attributes])
                        .then(response =>{
                            let graph = get(response.json,['fema','disasters',disaster_number,'declarations','byIndex'],{})
                            Object.keys(graph).filter(d => d!=='$__path').forEach(item =>{
                                if(graph[item]){
                                    data.push(attributes.reduce((out,attribute) =>{
                                        out[attribute] =  attribute.includes('date') || attribute.includes('last_refresh') ? new Date(graph[item][attribute]).toLocaleDateString('en-US') : graph[item][attribute] || 'None'
                                        return out
                                    },{}))
                                }

                            })
                            this.setState({
                                data : data
                            })
                        })
                }
            })
    }

    render(){
        return (
            <div>
                {this.state.data.length > 0 ? <Table
                    defaultPageSize={10}
                    showPagination={false}
                    columns={tableCols}
                    data={this.state.data}
                    initialPageSize={10}
                    minRows={this.state.data.length}
                /> : <div> No data</div>}
            </div>
        )
    }
}

const mapStateToProps = (state, ownProps) => {
    return {
        activeStateGeoid : state.stormEvents.activeStateGeoid,
        activeStateAbbrev : state.stormEvents.activeStateAbbrev,
        graph: state.graph,
        hazards: get(state.graph, 'riskIndex.hazards.value', [])
    };
};
const mapDispatchToProps = {

};
export default [
    {
        path: '/fema_disasters/disaster/:disasterId',
        mainNav: false,
        exact: true,
        name: 'Disaster Declaration',
        layoutSettings: {
            fixed: true,
            maxWidth: '',//'max-w-7xl',
            headerBar: false,
            nav: 'top',
            theme: 'flat',
        },
        component: {
            type: 'div',
            props: {
                className: 'w-full overflow-hidden pt-16 focus:outline-none',
                style: {height: 'calc(100vh)'}
            },
            children: [
                connect(mapStateToProps, mapDispatchToProps)(reduxFalcor(FemaDisasterDeclarations))
            ]
        }
    }
]
