import React from 'react';
import {connect} from 'react-redux';
import {reduxFalcor} from "utils/redux-falcor-new";
import get from 'lodash.get';
import Table from "../../components/avl-components/components/Table";
import SBAHazardLoans from "../SBAEvents";
import FemaHmapV1 from "../femaHmapV1";
import FemaDisasters from "./index";

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

class FemaDisasterDeclarations extends React.Component{
    constructor(props) {
        super(props);
        this.state ={
            data : []
        }
    }

    fetchFalcorDeps(){
        return this.props.falcor.get([''])
    }

    render(){
        console.log('props',this.props)
        return (
            <div>
                {/*{this.state.data.length > 0 ? <Table
                    defaultPageSize={10}
                    showPagination={false}
                    columns={tableCols}
                    data={this.state.data}
                    initialPageSize={10}
                    minRows={this.state.data.length}
                    onRowClick={function(e,row){ console.log('e',e,row)}}
                /> : <div> Loading</div>}*/}
                in here
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
        path: '/fema_disasters/disaster/:disasterId/',
        mainNav: false,
        exact: true,
        name: 'Disaster Declaration',
        breadcrumbs: [
            {name: 'disasterId', path: '/fema_disasters/disaster/'}
        ],
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
                style: {height: 'calc(100vh)'},

            },
            children: [
                connect(mapStateToProps, mapDispatchToProps)(reduxFalcor(FemaDisasterDeclarations))
            ]
        }
    }
]
