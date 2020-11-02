import React from 'react';
import {connect} from 'react-redux';
import {reduxFalcor} from "utils/redux-falcor-new";
import get from 'lodash.get';
import {fnum, fnumClean} from "utils/sheldusUtils"
import * as d3 from "d3";
import FemaDisastersCombinedHazardListTable from "./components/femaDisastersCombinedHazardListTable";
import FemaDisastersCombinedEventsLayerFactory from './layers/femaDisastersCombinedTotalCostEventsLayer'
import AvlMap from "../../components/AvlMap";
import Select from "../../components/avl-components/components/Inputs/select";
import {setActiveStateGeoid} from "../../store/modules/stormEvents";
import {shmp} from "../components/shmp-theme";
import Legend from "../StormEvents/components/Legend";
import hazardcolors from "../../constants/hazardColors";

var format =  d3.format(".2s")
var _ = require('lodash')
const fmt = (d) => d < 1000 ? d : format(d)
let years = []
const start_year = 1953
const end_year = 2020
for(let i = start_year; i <= end_year; i++) {
    years.push(i)
}

const fips = ["01", "02", "04", "05", "06", "08", "09", "10", "11", "12", "13", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "40", "41", "42", "44", "45", "46", "47", "48", "49", "50", "51", "53", "54", "55", "56"]


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
]

class NewFemaDisasters extends React.Component{
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

    fetchFalcorDeps(){
        return this.props.falcor.get(['fema','disasters','length'])
            .then(response =>{
                let length = get(response.json,['fema','disasters','length'],null)
                if(length){
                    this.props.falcor.get(['fema','disasters','byIndex',[{from:0,to:length-1}],attributes])
                        .then(response =>{
                            return response
                        })
                this.setState({
                    domain : [1000000,5000000,10000000,100000000,1000000000]
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

            })
            return _.filter(data,v => _.keys(v).length !== 0)
        }
    }

    render() {
        let data = this.processData();
        return (
            <div className="overflow-auto focus:outline-none h-full">
                <div className='flex flex-col lg:flex-row h-screen box-border overflow-hidden'>
                    <div className='flex-auto h-full order-last lg:order-none overflow-hidden'>
                        <div className='h-full'>
                            <div className="mx-auto h-8 w-2/6 pt-5 z-90">
                                <Legend
                                    title = {`Losses in each County from ${hazards.filter(d => d.value === this.state.hazard)[0].name}, ${this.state.year.replace('allTime', '1996-2019')}`}
                                    type = {"threshold"}
                                    range= {["#F1EFEF",...hazardcolors[this.state.hazard + '_range']]}
                                    domain = {this.state.domain}
                                    format= {fnumClean}
                                />
                            </div>
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
        path: '/fema_disasters/',
        mainNav: true,
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
                connect(mapStateToProps, mapDispatchToProps)(reduxFalcor(NewFemaDisasters))
            ]
        }
    },

]
