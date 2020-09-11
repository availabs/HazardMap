import React from 'react';
import {connect} from 'react-redux';
import {reduxFalcor} from "utils/redux-falcor-new";
import get from 'lodash.get';
import { fnum } from "utils/sheldusUtils"
import hazardcolors from "constants/hazardColors";
import * as d3 from "d3";
import Table from "../../components/avl-components/components/Table";
import {Link} from 'react-router-dom';
var format =  d3.format("~s")
const fmt = (d) => d < 1000 ? d : format(d)
let years = []
const start_year = 1996
const end_year = 2019
for (let i = start_year; i <= end_year; i++) {
    years.push(i)
}
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
];
const attributes=['disaster_number',
    'total_number_ia_approved',
    'total_amount_ihp_approved',
    'total_amount_ha_approved',
    'total_amount_ona_approved',
    'total_obligated_amount_pa',
    'total_obligated_amount_cat_ab',
    'total_obligated_amount_cat_c2g',
    'pa_load_date',
    'ia_load_date',
    'total_obligated_amount_hmgp',
    'last_refresh']
const tableCols = [
    {
        Header: 'Disaster Number',
        accessor: 'disaster_number',
        Cell: (data) => {
            return (
                <div style={{cursor: 'pointer'}}>
                    <Link to={`/fema_disasters/disaster/${data.row.original.disaster_number}`}>{data.row.original.disaster_number}</Link>
                </div>
            )
        }
    },
    {
        Header: 'Total Number IA Approved',
        accessor: 'total_number_ia_approved',
        disableFilters: true
    },
    {
        Header: 'Total Amount IHP Approved',
        accessor: 'total_amount_ihp_approved',
        disableFilters: true
    },
    {
        Header : 'Total Amount ONA Approved',
        accessor: 'total_amount_ona_approved',
        disableFilters: true
    },
    {
        Header : 'Total Obligated Amount PA',
        accessor: 'total_obligated_amount_pa',
        disableFilters: true
    },
    {
        Header:'Total Obligated Amount CAT AB',
        accessor:'total_obligated_amount_cat_ab',
        disableFilters: true
    },
    {
        Header:'Total Obligated Amount CAT C2G',
        accessor:'total_obligated_amount_cat_c2g',
        disableFilters: true
    },
    {
        Header:'PA Load Date',
        accessor: 'pa_load_date',
        disableFilters: true
    },
    {
        Header:'IA Load Date',
        accessor: 'ia_load_date',
        disableFilters: true
    },
    {
        Header:'Total Obligated Amount HGMP',
        accessor: 'total_obligated_amount_hmgp',
        disableFilters: true
    },
    {
        Header:'Last Refresh',
        accessor: 'last_refresh',
        disableFilters: true
    }
];
class FemaDisasters extends React.Component {
    constructor(props) {
        super(props);
        this.state = {

        };

    }
    componentDidMount(){
        document.body.classList.add("overflow-y-hidden")
    }
    componentWillUnmount(){
        this.setState = (state,callback)=>{
            return;
        };
    }



    fetchFalcorDeps() {
        return this.props.falcor.get(['fema','disasters','length'])
            .then(response =>{
                let length = get(response.json,['fema','disasters','length'],null)
                if(length){
                    this.props.falcor.get(['fema','disasters','byIndex',[{from:0,to:length-1}],attributes])
                        .then(response =>{
                            return response
                        })

                }

            })
    }

    processData(){
        if(Object.keys(this.props.falcorCache).length > 0){
            let graph = get(this.props.falcorCache,['fema','disasters','byId'],{})
            let data = []
            Object.keys(graph).filter(d => d!=='$__path').forEach(item =>{
                data.push(
                    attributes.reduce((out,attribute) =>{
                    if(graph[item][attribute]){
                        out[attribute] =  attribute.includes('date') || attribute.includes('last_refresh') ? new Date(graph[item][attribute].value).toLocaleDateString('en-US') : attribute === 'disaster_number' ? graph[item][attribute].value  :fnum(graph[item][attribute].value) || '$0'
                    }
                    return out
                },{}))
            })
            return data
        }
    }

    render() {
        let data = this.processData();
        return (
            <div className="max-w-7x">
                {data && data.length > 0 ?
                    <Table
                        defaultPageSize={10}
                        showPagination={false}
                        columns={tableCols}
                        data={data}
                        initialPageSize={10}
                        minRows={data.length}
                        sortBy={'last_refresh'}
                        sortOrder={'desc'}
                    />
                    :
                    <div>
                        Loading ....
                    </div>
                }
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
        path: '/fema_disasters/',
        mainNav: true,
        exact: true,
        name: 'FEMA Disasters',
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
                connect(mapStateToProps, mapDispatchToProps)(reduxFalcor(FemaDisasters))
            ]
        }
    },

]
