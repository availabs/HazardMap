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
            <div style={{padding: 150}}>
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


export default [
    {
        path: '/fema_disasters/disaster/:disasterId',
        mainNav: false,
        exact: false,
        name: 'Disaster Declaration',
       
        layoutSettings: {
            fixed: true,
            maxWidth: '',//'max-w-7xl',
            headerBar: false,
            nav: 'top',
            theme: 'flat',
        },
        component: reduxFalcor(FemaDisasterDeclarations)
            

    }
]
