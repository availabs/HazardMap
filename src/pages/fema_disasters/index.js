import React from 'react';
import {connect} from 'react-redux';
import {reduxFalcor} from "utils/redux-falcor-new";
import get from 'lodash.get';
import { fnum } from "utils/sheldusUtils"
import * as d3 from "d3";
import Table from "../../components/avl-components/components/Table";
import FemaDisastersStackedBarGraph from "./components/femaDisastersStackedBarGraph";
import FemaDisastersCombinedHazardListTable from "./components/femaDisastersCombinedHazardListTable";
import FemaDisastersCombinedEventsLayerFactory from './layers/femaDisastersCombinedTotalCostEventsLayer'
import {Link} from 'react-router-dom';
import Select from "../../components/avl-components/components/Inputs/select";
import AvlMap from "../../components/AvlMap";
import {setActiveStateGeoid} from "store/modules/stormEvents";
import {shmp} from 'pages/components/shmp-theme.js'

var format =  d3.format(".2s")
var _ = require('lodash')
const fmt = (d) => d < 1000 ? d : format(d)
let years = []
const start_year = 1953
const end_year = 2020
for(let i = start_year; i <= end_year; i++) {
    years.push(i)
}
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
        Header : 'Disaster Name',
        accessor: 'name'
    },
    {
        Header : 'Declaration Date',
        accessor: 'declaration_date',
        disableFilters: true,
        Cell: (data) => {
            return <div style = {{ textAlign: 'center'}}>{new Date(get(data,'row.values.declaration_date', '')).toLocaleDateString('en-US')}</div>
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
        Header : 'Total Obligated Amount PA',
        accessor: 'total_obligated_amount_pa',
        disableFilters: true,
        Cell: (data) => {
            return <div style = {{ textAlign: 'right'}}>{fnum(get(data,'row.values.total_obligated_amount_pa', ''))}</div>
        }
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
        Header:'Total Cost',
        accessor: 'total_cost',
        disableFilters: true,
        Cell: (data) => {
            return <div style = {{ textAlign: 'right'}}>{fnum(get(data,'row.values.total_cost', ''))}</div>
        }
    },
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
    FemaCombinedEventsLayer = FemaDisastersCombinedEventsLayerFactory({active:true})
    constructor(props) {
        super(props);
        this.state= {
            select: {
                domain: [...years, 'allTime'],
                value: []
            },
            hazard: 'riverine',
            year: 'allTime',
        }
        this.handleChange = this.handleChange.bind(this)
    }

    setHazard = (hazard) =>{
        if (this.state.hazard !== hazard) {
            this.setState({hazard})
        }
    }

    setYear = (year) => {
        if (this.state.year !== year) {
            this.setState({year})
        }
    }

    handleChange(e) {
        this.setState({ year: e })
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
                        out[attribute] =  graph[item][attribute].value
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
            return _.filter(data,v => _.keys(v).length !== 0)
        }
    }

    render() {
        let data = this.processData();
        return (
            <div className="overflow-auto focus:outline-none h-full">
                <div className="container max-w-7xl mx-auto h-auto">
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
                    <div>
                        <FemaDisastersStackedBarGraph
                            attributes={[
                                "name",
                                "year",
                                "total_cost",
                                "disaster_type"
                            ]}
                            type={'disasters'}
                        />
                    </div>
                    <div>
                        <FemaDisastersStackedBarGraph
                            attributes={[
                                "name",
                                "year",
                                "total_cost",
                                "disaster_type"
                            ]}
                            type={'count'}
                        />
                    </div>
                </div>
                <div className='flex flex-col lg:flex-row h-screen box-border overflow-hidden'>
                    <div className='flex-auto h-full order-last lg:order-none overflow-hidden'>
                        <div className='h-full'>
                            <AvlMap
                                layers={[
                                    this.FemaCombinedEventsLayer
                                ]}
                                height={'90%'}
                                center={[0, 0]}
                                zoom={4}
                                year={2018}
                                //hazards={this.props.hazards}
                                fips={''}
                                styles={[
                                    {name: 'Blank', style: 'mapbox://styles/am3081/ckaml4r1e1uip1ipgtx5vm9zk'}
                                ]}
                                sidebar={false}
                                attributes={false}
                                layerProps={{
                                    [this.FemaCombinedEventsLayer.name]: {
                                        year: this.state.year,
                                        hazard : this.state.hazard,
                                        fips : this.props.activeStateGeoid.length > 0 ? this.props.activeStateGeoid.map(d => d.state_fips) : null,
                                        geography : this.state.geography_filter
                                    }
                                }}
                            />
                        </div>
                    </div>
                    <div className='h-56 lg:h-auto lg:w-1/4 p-2 lg:min-w-64 overflow-auto'>
                        {
                            this.props.activeStateGeoid.length > 0 && this.props.activeStateGeoid[0].state_fips !== "" ?
                                <div>
                                    <div id={`closeMe`} className="bg-white border border-blue-500 font-bold text-lg px-4 py-3 rounded relative">
                                        <span className="block sm:inline">{this.props.activeStateGeoid.map(d => d.state_fips)}-{this.props.activeStateGeoid.map(d => d.state_name)}</span>
                                        <span className="absolute top-0 bottom-0 right-0 px-4 py-3">
                                        <svg className="fill-current h-6 w-6 text-blue-500"
                                             role="button"
                                             xmlns="http://www.w3.org/2000/svg"
                                             viewBox="0 0 20 20"
                                             onClick={(e) =>{
                                                 e.target.closest(`#closeMe`).style.display = 'none'
                                                 this.props.setActiveStateGeoid([{state_fips:"",state_name:""}])
                                                 window.history.pushState({state : '1'},"state","/stormevents/")
                                             }}>
                                            <title>Close</title>
                                            <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
                                        </svg>
                                    </span>
                                    </div>
                                </div>
                                :null
                        }
                        <div className='text-3xl'>
                            <Select
                                multi={false}
                                placeholder={"Select a year.."}
                                domain={this.state.select.domain}
                                value={this.state.year}
                                onChange={this.handleChange}
                            />
                        </div>
                        <FemaDisastersCombinedHazardListTable
                            geoid = {[""]}
                            year = {this.state.year}
                            hazard = {['riverine']}
                            attributes={[
                                "name",
                                "year",
                                "total_cost",
                                "disaster_type"
                            ]}
                            setHazard={this.setHazard.bind(this)}
                            activeHazard={this.state.hazard}
                        />

                    </div>
                </div>

            </div>


        )
    }
}
const mapStateToProps = (state) => {
    return {
        activeStateGeoid : state.stormEvents.activeStateGeoid,
        activeStateAbbrev : state.stormEvents.activeStateAbbrev,
        graph: state.graph,
        hazards: get(state.graph, 'riskIndex.hazards.value', [])
    };
};

const mapDispatchToProps = {
    setActiveStateGeoid
};

export default [
    {
        path: '/fema_test/',
        mainNav: false,
        exact: true,
        name: 'FEMA Disasters',
        layoutSettings: {
            fixed: true,
            maxWidth: '',//'max-w-7xl',
            headerBar: false,
            nav: 'top',
            theme: shmp,
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
