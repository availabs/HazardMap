import React from 'react';
import {connect} from 'react-redux';
import {reduxFalcor} from "utils/redux-falcor-new";
import get from 'lodash.get';
import { fnum } from "utils/sheldusUtils"
import * as d3 from "d3";
import Table from "../../components/avl-components/components/Table";
import FemaDisastersStackedBarGraph from "./components/femaDisastersStackedBarGraph";
import {Link} from 'react-router-dom';
var format =  d3.format(".2s")
const fmt = (d) => d < 1000 ? d : format(d)
let years = []
const start_year = 1996
const end_year = 2019
for (let i = start_year; i <= end_year; i++) {
    years.push(i)
}
const attributes=[
    "disaster_number",
    "name",
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
        disableFilters: true,
        Cell: (data) => {
            return <div style = {{ textAlign: 'right'}}>{fmt(get(data,'row.values.total_number_ia_approved', ''))}</div>
        }
    },
    {
        Header: 'Total Amount IHP Approved',
        accessor: 'total_amount_ihp_approved',
        disableFilters: true,
        Cell: (data) => {
            return <div style = {{ textAlign: 'right'}}>{fnum(get(data,'row.values.total_amount_ihp_approved', ''))}</div>
        }
    },
    {
        Header : 'Total Amount ONA Approved',
        accessor: 'total_amount_ona_approved',
        disableFilters: true,
        Cell: (data) => {
            return <div style = {{ textAlign: 'right'}}>{fnum(get(data,'row.values.total_amount_ona_approved', ''))}</div>
        }
    },
    {
        Header : 'Total Obligated Amount PA',
        accessor: 'total_obligated_amount_pa',
        disableFilters: true,
        Cell: (data) => {
            return <div style = {{ textAlign: 'right'}}>{fnum(get(data,'row.values.total_obligated_amount_pa', ''))}</div>
        }
    },
    {
        Header:'Total Obligated Amount CAT AB',
        accessor:'total_obligated_amount_cat_ab',
        disableFilters: true,
        Cell: (data) => {
            return <div style = {{ textAlign: 'right'}}>{fnum(get(data,'row.values.total_obligated_amount_cat_ab', ''))}</div>
        }
    },
    {
        Header:'Total Obligated Amount CAT C2G',
        accessor:'total_obligated_amount_cat_c2g',
        disableFilters: true,
        Cell: (data) => {
            return <div style = {{ textAlign: 'right'}}>{fnum(get(data,'row.values.total_obligated_amount_cat_c2g', ''))}</div>
        }
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
        disableFilters: true,
        Cell: (data) => {
            return <div style = {{ textAlign: 'right'}}>{fnum(get(data,'row.values.total_obligated_amount_hmgp', ''))}</div>
        }
    },
    {
        Header:'Last Refresh',
        accessor: 'last_refresh',
        disableFilters: true
    }
];
let stat_boxes = [
    {name:'# IA Approved',value:'total_number_ia_approved',amount:0},
    {name:'$ IHP Approved',value:'total_amount_ihp_approved',amount:0},
    {name:'$ ONA Approved',value:'total_amount_ona_approved',amount:0},
    {name:'$ Obligated PA',value:'total_obligated_amount_pa',amount:0},
    {name:'$ Obligated CAT AB',value:'total_obligated_amount_cat_ab',amount:0},
    {name:'$ Obligate CAT C2G',value:'total_obligated_amount_cat_c2g',amount:0},
    {name:'$ Obligated HMGP',value:'total_obligated_amount_hmgp',amount:0},
    {name:'Total Funds',value:'total_funds'}
]
let total_funds = 0
class FemaDisasters extends React.Component {

    componentDidMount(){
        document.body.classList.add("overflow-y-hidden")
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

                }else { return Promise.resolve({}) }
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
                        out[attribute] =  attribute.includes('date') || attribute.includes('last_refresh') ?
                            new Date(graph[item][attribute].value).toLocaleDateString('en-US') :
                            attribute !== 'disaster_number'? graph[item][attribute].value || 0 : graph[item][attribute].value
                    }
                    return out
                },{}))
                stat_boxes.forEach(d =>{
                    if(d && d.value !== 'total_funds'){
                        d.amount += get(graph,[item,d.value,'value'],0) ? parseFloat(get(graph,[item,d.value,'value'],0)) : 0
                    }
                })
                total_funds = stat_boxes.reduce((a,c) =>{
                    if(c.value !== 'total_funds'){
                        a += c.amount
                    }
                    return a
                },0)
            })
            return data
        }
    }

    render() {
        let data = this.processData();
        return (
            <div className="md:max-h-full overflow-auto">
                <div className="container max-w-7xl mx-auto">
                    <div className="mt-5 grid grid-cols-8 gap-5 sm:grid-cols-8 py-5">
                        {stat_boxes.map((stat_box,i) =>{
                            return(
                                <div className="bg-white shadow rounded-lg"  key={i}>
                                    <div className="px-4 py-5 sm:p-6">
                                        <dl>
                                            <dt className="text-sm leading-5 font-medium text-gray-500 break-words">
                                                {stat_box.name}
                                            </dt>
                                            <dd className="mt-1 text-3xl leading-9 font-semibold text-gray-900">
                                                {stat_box.value !== 'total_funds' ? stat_box.value.includes('number')? fmt(stat_box.amount) :fnum(stat_box.amount): fnum(total_funds)}
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                    <div>
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
                    <FemaDisastersStackedBarGraph/>
                </div>
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
