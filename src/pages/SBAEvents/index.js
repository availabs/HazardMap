import React from 'react';
import {connect} from 'react-redux';
import {reduxFalcor} from "@availabs/avl-components/dist/redux-falcor";
import get from 'lodash.get';
import AvlMap from "components/AvlMap";
import Legend from "pages/StormEvents/components/Legend"
import SlideOver from 'pages/StormEvents/components/SlideOver'
import { fnum, fnumClean } from "utils/sheldusUtils"
import hazardcolors from "constants/hazardColors";
import * as d3 from "d3";

import {setActiveStateGeoid} from "store/modules/stormEvents";
import {CSVLink} from 'react-csv';
import SBAEventsLayer from "./SBAEventsLayer";
import Select from "../../components/avl-components/components/Inputs/select.js";
import HazardListTable from "../components/listTable/hazardListTable";
import StackedBarGraph from "../components/bar /stackedBarGraph";
import Table from "../../components/avl-components/components/Table";
import Modal from "../../components/avl-components/components/Modal/avl-modal";
import {shmp} from 'pages/components/shmp-theme.js'



import {falcorGraph} from "../../store/falcorGraphNew";

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
const tableCols = [
    {
        Header: 'County',
        accessor: 'county_fips_name',
    },
    {
        Header: 'Year',
        accessor: 'year',
        disableFilters: true
    },
    {
        Header: 'Hazard',
        accessor: 'hazard',
        disableFilters: true
    },
    {
        Header: 'Total Loss',
        accessor: 'total_loss',
        disableFilters: true
    },
    {
        Header: '$ Loan',
        accessor: 'loan_total',
        disableFilters: true
    },
    {
        Header: '# Loans',
        accessor: 'num_loans',
        disableFilters: true
    }
];
class SBAHazardLoans extends React.Component {
    SBAEventsLayer = SBAEventsLayer({active: true});
    constructor(props) {
        super(props);
        // Don't call this.setState() here!
        this.state = {
            layer: 'Tracts Layer',
            year: 'allTime',
            hazard: 'riverine',
            data : [],
            current_fips : [],
            current_fips_name : "us",
            geography : [{name : 'County',value : 'counties'},{name:'Zip Codes',value:'zip_codes'}],
            geography_filter : 'counties',
            select: {
                domain: [...years, 'allTime'],
                value: []
            },
        };
        this.handleChange = this.handleChange.bind(this)
    }
   

    componentDidUpdate(prevProps){
        if(this.props.activeStateGeoid !== prevProps.activeStateGeoid){
            this.setState({
                current_fips_name : this.props.activeStateGeoid[0].state_name === "" ? "us" : this.props.activeStateGeoid[0].state_name
            })
        }
    }
    setYear = (year) => {
        if (this.state.year !== year) {
            this.setState({year})
        }
    }
    setHazard = (hazard) =>{
        if (this.state.hazard !== hazard) {
            this.setState({hazard})
        }
    }
    setGeography = (e) =>{
        if(this.state.geography_filter !== e.target.value){
            this.setState({ ...this.state, [e.target.id]: e.target.value })
        }
    }

    fetchFalcorDeps() {
        let geo_fips = this.props.activeStateGeoid.length === 0 ? fips : this.props.activeStateGeoid[0].state_fips
        let geography = this.state.geography_filter === 'counties' ? 'counties' : this.state.geography_filter
        if(geography === 'counties'){
            return falcorGraph.get(['geo',geo_fips,'counties','geoid'])
                .then(response =>{
                    if(geography === 'counties'){
                        this.filtered_geographies = Object.values(response.json.geo)
                            .reduce((out, state) => {
                                if (state.counties) {
                                    out = [...out, ...state.counties]
                                }
                                return out
                            }, [])
                        if(this.filtered_geographies){
                            falcorGraph.get(
                                ['sba','all',this.filtered_geographies,this.state.hazard,this.state.year,['total_loss','loan_total','num_loans','state_abbrev']],
                                ['geo',this.filtered_geographies,['name']]
                            ).then(response => {
                                let geo_names = get(response,'json.geo',{})
                                let sw = get(response, 'json.sba.all', {})
                                let data = []
                                Object.keys(sw).filter(d => d !== '$__path').forEach(item =>{
                                    data.push({
                                        county_fips_name : `${get(geo_names,`${item}.name`,'')},${get(sw,`${item}.${this.state.hazard}.${this.state.year}.${'state_abbrev'}`,'')}`,
                                        year: this.state.year,
                                        hazard : hazards.map(d => d.value === this.state.hazard ? d.name : ''),
                                        total_loss : fnum(get(sw, `${item}.${this.state.hazard}.${this.state.year}.${'total_loss'}`, 0)),
                                        loan_total : fnum(get(sw, `${item}.${this.state.hazard}.${this.state.year}.${'loan_total'}`, 0)),
                                        num_loans : fmt(get(sw, `${item}.${this.state.hazard}.${this.state.year}.${'num_loans'}`, 0))
                                    })
                                })
                               this.setState({
                                    domain : [100000,1000000,1000000,10000000,100000000],//domain,
                                    data :data
                                })
                                return response
                            })
                        }
                    }

                })
        }
        if(geography === 'zip_codes'){
            return falcorGraph.get(['geo',this.filtered_geographies,'byZip',['zip_codes']])
                .then(response => {
                    this.zip_codes = Object.values(response.json.geo).reduce((out,geo) =>{
                        if(geo.byZip){
                            out = [...out,...geo.byZip['zip_codes']]
                        }
                        return out
                    },[])
                    if(this.zip_codes){
                        falcorGraph.get(
                            ['sba','all','byZip',this.zip_codes,this.state.hazard,this.state.year,['total_loss','loan_total','num_loans','state_abbrev']]
                        ).then(response => {
                            let sw = get(response, 'json.sba.all.byZip', {})
                            let data = []
                            Object.keys(sw).filter(d => d !== '$__path').forEach(item =>{
                                data.push({
                                    county_fips_name : `${item}`,
                                    year: this.state.year,
                                    hazard : hazards.map(d => d.value === this.state.hazard ? d.name : ''),
                                    total_loss : fnum(get(sw, `${item}.${this.state.hazard}.${this.state.year}.${'total_loss'}`, 0)),
                                    loan_total : fnum(get(sw, `${item}.${this.state.hazard}.${this.state.year}.${'loan_total'}`, 0)),
                                    num_loans : fmt(get(sw, `${item}.${this.state.hazard}.${this.state.year}.${'num_loans'}`, 0))
                                })
                            })
                            let lossByCounty= Object.keys(sw)
                                .reduce((a, c) => {
                                    if (get(sw[c], `${this.state.hazard}.${this.state.year}.${'total_loss'}`, false)) {
                                        a[c] = get(sw[c], `${this.state.hazard}.${this.state.year}.${'total_loss'}`, false)
                                    }
                                    return a
                                }, {})
                            let lossDomain = Object.values(lossByCounty).sort((a, b) => a-b)
                            let domain =  [0,d3.quantile(lossDomain, 0),d3.quantile(lossDomain, 0.25),d3.quantile(lossDomain, 0.5),
                                d3.quantile(lossDomain, 0.75),d3.quantile(lossDomain, 1)]
                            this.setState({
                                domain : domain,
                                data : data
                            })
                            return response
                        })
                    }
                })
        }

    }
    handleChange(e) {
        this.setState({ year: e })
    }


    render() {
        return (
            <div className='flex flex-col lg:flex-row h-screen box-border w-full -mt-8'>
                <div className='flex-auto h-full order-last lg:order-none'>
                    <div className='h-full'>
                        <div className="mx-auto h-8 w-2/6 pt-20 z-90">
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
                                this.SBAEventsLayer
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
                                [this.SBAEventsLayer.name]: {
                                    year: this.state.year,
                                    hazard : this.state.hazard,
                                    fips : this.props.activeStateGeoid.length > 0 ? this.props.activeStateGeoid.map(d => d.state_fips) : null,
                                    geography : this.state.geography_filter
                                }
                            }}
                        />
                        <div className='relative bottom-40 h-40 z-30 w-full md:px-24'>
                            <StackedBarGraph
                                height={200}
                                data={{storm_event:"sba",
                                    category:["all"],
                                    columns:['total_loss'],
                                    header:['Total Loss',' $ Loan','# Loans'],
                                    sort:["total_loss"]}}
                                setYear={this.setYear.bind(this)}
                                initialLoad={this.state.initialLoad}
                                hazard={this.state.hazard}
                            />
                        </div>
                    </div>
                </div>
                <div className='h-56 lg:h-auto lg:w-1/5 p-2 lg:min-w-64 overflow-auto mt-8'>
                    {this.props.activeStateGeoid.length > 0 && this.props.activeStateGeoid[0].state_fips !== ""?
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
                             }}>
                            <title>Close</title>
                            <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
                        </svg>
                        </span>
                            </div>
                            <div>
                                <select
                                    className="block appearance-none w-full bg-white border border-blue-500 font-bold text-lg px-4 py-3 rounded relative shadow leading-tight focus:outline-none focus:shadow-outline"
                                    onChange={this.setGeography.bind(this)}
                                    value = {this.state.geography_filter}
                                    id = 'geography_filter'
                                >
                                    {this.state.geography.map((geo,i) =>{
                                        return(
                                            <option key={i} value={geo.value}>{geo.name}</option>
                                        )
                                    })}
                                </select>
                                <div
                                    className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg"
                                         viewBox="0 0 20 20">
                                        <path
                                            d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                                    </svg>
                                </div>
                            </div>
                        </div>

                        :null}
                    <div className='bg-white rounded h-full w-full shadow'>
                        <div className='text-3xl'>
                            <Select
                                multi={false}
                                placeholder={"Select a year.."}
                                domain={this.state.select.domain}
                                value={this.state.year}
                                onChange={this.handleChange}
                            />
                        </div>
                        <button
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                            onClick ={() =>{
                                this.setState({
                                    showModal : true
                                })
                            }}>
                            Export Data
                        </button>
                        <Modal show={ this.state.showModal }
                               onHide={ () => this.setState({ showModal: false }) }
                               showCloseButton = {false}
                        >
                            <div style={ { width: `${ window.innerWidth * 0.85 }px` } }>
                                <div className="w-full overflow-auto">
                                    <div className="flex justify-between">
                                        <button
                                            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center">
                                            <svg className="fill-current w-4 h-4 mr-2"
                                                 xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                                <path d="M13 8V2H7v6H2l8 8 8-8h-5zM0 18h20v2H0v-2z"/>
                                            </svg>
                                            <CSVLink className='btn btn-secondary btn-sm'
                                                     style={{width:'100%'}}
                                                     data={this.state.data} filename={`${this.state.current_fips_name}_${this.state.hazard}_${this.state.year}_${this.state.geography_filter}.csv`}>Download CSV</CSVLink>
                                        </button>
                                        <button
                                            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center"
                                            onClick = {() =>{
                                                this.setState({
                                                    showModal:false
                                                })
                                            }}
                                        >
                                            Close
                                        </button>
                                    </div>
                                    <Table
                                        defaultPageSize={10}
                                        showPagination={false}
                                        columns={tableCols}
                                        data={this.state.data}
                                        initialPageSize={10}
                                        minRows={this.state.data.length}
                                    />
                                </div>
                            </div>
                        </Modal>
                        <HazardListTable
                            data={{storm_event:"sba",
                                category:["all"],
                                columns:['total_loss', 'loan_total', 'num_loans'],
                                header:['Total Loss',' $ Loan','# Loans'],
                                sort:["total_loss"]}}
                            geoid={this.props.activeStateGeoid.length > 0 ? this.props.activeStateGeoid.map(d => d.state_fips) : [""]}
                            year={this.state.year}
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
        path: '/sba/',
        mainNav: true,
        exact: true,
        name: 'SBA Hazard Loans',
        layoutSettings: {
            fixed: true,
            maxWidth: '',//'max-w-7xl',
            headerBar: false,
            nav: 'top',
            theme: shmp,
        },
        component:connect(mapStateToProps, mapDispatchToProps)(reduxFalcor(SBAHazardLoans))
    },
]
