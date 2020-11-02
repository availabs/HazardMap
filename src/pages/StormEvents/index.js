import React from 'react';
import {connect} from 'react-redux';
import {reduxFalcor} from "utils/redux-falcor-new";
import get from 'lodash.get';
import AvlMap from "components/AvlMap";
import StormEventsLayerFactory from "./StormEventsLayer"
import StackedBarGraph from "../components/bar /stackedBarGraph";
//import HazardStatBox from "./components /statbox/hazardStatBox";
import Legend from "./components/Legend"
import {fnumClean } from "utils/sheldusUtils"
import HazardListTable from "../components/listTable/hazardListTable";
// import Select from "components/avl-components/components/Inputs/select";
import Modal from "components/avl-components/components/Modal/avl-modal"
import Table from "components/avl-components/components/Table/index"
import hazardcolors from "constants/hazardColors";
import * as d3 from "d3";
import {setActiveStateGeoid} from "store/stormEvents";
import {CSVLink} from 'react-csv';
import {shmp} from 'pages/components/shmp-theme.js'
import SlideOver from './components/SlideOver'


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
        Header: 'Total Damage',
        accessor: 'total_damage',
        disableFilters: true
    },
    {
        Header: 'Property Damage',
        accessor: 'property_damage',
        disableFilters: true
    },
    {
        Header: 'Crop Damage',
        accessor: 'crop_damage',
        disableFilters: true
    },
    {
        Header: '# Events',
        accessor: 'num_events',
        disableFilters: true
    },
    {
        Header: '# Episodes',
        accessor: 'num_episodes',
        disableFilters: true
    },
];
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
]
class NationalLanding extends React.Component {
    StormEventsLayer = StormEventsLayerFactory({active: true});
    constructor(props) {
        super(props);
        // Don't call this.setState() here!
        this.state = {
            layer: 'Tracts Layer',
            year: 'allTime',
            hazard: 'riverine',
            select: {
                domain: [...years, 'allTime'],
                value: []
            },
            geography : [{name : 'County',value : 'counties'},{name:'Municipality',value:'cousubs'},{name:'Tracts',value:'tracts'}],
            geography_filter : 'counties',
            data : [],
            current_fips : [],
            current_fips_name : "us",
            showModal : false
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
        } else {
            this.setYear('allTime')
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
        return this.props.falcor.get(
            ['geo',geo_fips,geography, 'geoid'])
            .then(response =>{
                this.filtered_geographies = Object.values(response.json.geo)
                    .reduce((out, state) => {
                        if (state[geography]) {
                            out = [...out, ...state[geography]]
                        }
                        return out
                    }, [])
                this.props.falcor.get(['severeWeather',this.filtered_geographies,this.state.hazard,this.state.year,['total_damage', 'num_episodes','property_damage','crop_damage','num_episodes','num_events','state','state_fips']],
                    ['geo',this.filtered_geographies,['name']])
                    .then(response =>{
                        let geo_names = get(response,'json.geo',{})
                        let sw = get(response, 'json.severeWeather', {})
                        let data = []
                        Object.keys(sw).filter(d => d !== '$__path').forEach(item =>{
                            data.push({
                                county_fips_name : `${get(geo_names,`${item}.name`,'')},${get(sw,`${item}.${this.state.hazard}.${this.state.year}.${'state'}`,'')}`,
                                year: this.state.year,
                                hazard : hazards.map(d => d.value === this.state.hazard ? d.name : ''),
                                total_damage : get(sw, `${item}.${this.state.hazard}.${this.state.year}.${'total_damage'}`, 0).toLocaleString(),
                                property_damage : get(sw, `${item}.${this.state.hazard}.${this.state.year}.${'property_damage'}`, 0).toLocaleString(),
                                crop_damage : get(sw, `${item}.${this.state.hazard}.${this.state.year}.${'crop_damage'}`, 0).toLocaleString(),
                                num_events : get(sw, `${item}.${this.state.hazard}.${this.state.year}.${'num_events'}`, 0).toLocaleString(),
                                num_episodes : get(sw, `${item}.${this.state.hazard}.${this.state.year}.${'num_episodes'}`, 0).toLocaleString()
                            })
                        })
                        let lossByCounty = Object.keys(sw)
                            .reduce((a, c) => {
                                if (get(sw[c], `${this.state.hazard}.${this.state.year}.${'total_damage'}`, false)) {
                                    a[c] = get(sw[c], `${this.state.hazard}.${this.state.year}.${'total_damage'}`, false)
                                }
                                return a
                            }, {})
                        let lossDomain = Object.values(lossByCounty).sort((a, b) => a-b)
                        let domain =  [0,d3.quantile(lossDomain, 0),d3.quantile(lossDomain, 0.25),d3.quantile(lossDomain, 0.5),
                            d3.quantile(lossDomain, 0.75),d3.quantile(lossDomain, 1)]
                        this.setState({
                            domain : [1000000,5000000,10000000,100000000,1000000000],//domain,
                            data :data
                        })
                        return response
                    })
            })
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
                                this.StormEventsLayer
                            ]}
                            height={'90%'}
                            center={[0, 0]}
                            zoom={4}
                            year={2018}
                            fips={''}
                            styles={[
                                {name: 'Blank', style: 'mapbox://styles/am3081/ckaml4r1e1uip1ipgtx5vm9zk'}
                            ]}
                            sidebar={false}
                            attributes={false}
                            layerProps={{
                                [this.StormEventsLayer.name]: {
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
                                data={{
                                    storm_event:"severeWeather",
                                    category:[""],
                                    columns:['total_damage'],
                                    header:['Damage','Yearly Avg Damage','# Episodes'],
                                    sort:"annualized_damage"
                                }}
                                setYear={this.setYear.bind(this)}
                                initialLoad={this.state.initialLoad}
                                hazard={this.state.hazard}
                            />
                        </div>
                    </div>
                </div>
                <SlideOver
                    HeaderTitle={<div>Storm Events Losses</div>}
                >
                    <HazardListTable
                        data={
                            {storm_event:"severeWeather",category:[""],
                            columns:['total_damage', 'annualized_damage', 'num_episodes'],
                            header:['Damage','Yearly Avg Damage','# Episodes'],
                            sort:"annualized_damage"}}
                        geoid={this.props.activeStateGeoid.length > 0 ? this.props.activeStateGeoid.map(d => d.state_fips) : [""]}
                        year={this.state.year}
                        setHazard={this.setHazard.bind(this)}
                        activeHazard={this.state.hazard}
                    />
                    <Modal 
                        show={ this.state.showModal }
                        onHide={ e => this.setState({ showModal: false }) }
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
                                        onClick = {(e) =>{
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
                </SlideOver>
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
    setActiveStateGeoid
};

export default [{
    path: '/stormevents/',
    mainNav: true,
    exact: true,
    name: 'Storm Events',
    layoutSettings: {
        fixed: true,
        maxWidth: '',//'max-w-7xl',
        headerBar: false,
        nav: 'top',
        theme: shmp,
    },
    component: connect(mapStateToProps, mapDispatchToProps)(reduxFalcor(NationalLanding))
},{
    path: '/stormevents/state/:stateId',
    mainNav: false,
    exact: true,
    name: 'Storm Events',
    authed:false,
    layoutSettings: {
        fixed: true,
        maxWidth: '',//'max-w-7xl',
        headerBar: false,
        nav: 'top',
        theme: shmp,
    },
    component:connect(mapStateToProps, mapDispatchToProps)(reduxFalcor(NationalLanding))
}]
