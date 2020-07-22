import React from 'react';
import {connect} from 'react-redux';
import {reduxFalcor} from "utils/redux-falcor-new";
import get from 'lodash.get';
import AvlMap from "components/AvlMap";
import StormEventsLayerFactory from "./StormEventsLayer"
import StackedBarGraph from "../components /bar /stackedBarGraph";
//import HazardStatBox from "./components /statbox/hazardStatBox";
import Legend from "components/AvlMap/components/legend/Legend"
import { fnum } from "utils/sheldusUtils"
import HazardListTable from "../components /listTable/hazardListTable";
import SBAHazardLoans from "../SBAEvents/index";
import Select from "components/avl-components/components/Inputs/select";
import Modal from "components/avl-components/components/Modal/avl-modal"
import Table from "components/avl-components/components/Table/index"
import hazardcolors from "constants/hazardColors";
import * as d3 from "d3";
import {setActiveStateGeoid} from "store/stormEvents";
import {CSVLink,/* CSVDownload*/} from 'react-csv';

var format =  d3.format("~s")
const fmt = (d) => d < 1000 ? d : format(d)
let years = []
const start_year = 1996
const end_year = 2019
for (let i = start_year; i <= end_year; i++) {
    years.push(i)
}
const fips = ["01", "02", "04", "05", "06", "08", "09", "10", "11", "12", "13", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "40", "41", "42", "44", "45", "46", "47", "48", "49", "50", "51", "53", "54", "55", "56"]
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
            data : [],
            current_fips : [],
            current_fips_name : "us",
            showModal : false
        };
        this.handleChange = this.handleChange.bind(this)
    }
    componentDidMount(){
        document.body.classList.add("overflow-y-hidden")
    }
    componentWillUnmount(){
        this.setState = (state,callback)=>{
            return;
        };
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

    fetchFalcorDeps() {
        return this.props.falcor.get(
            ['geo',fips, 'counties', 'geoid'])
            .then(response =>{
                this.counties = Object.keys(response.json.geo).filter(d => d!== '$__path')
                    .reduce((out,state) =>{
                        if(this.props.activeStateGeoid && this.props.activeStateGeoid[0].state_fips !== ""){
                            out = [...response.json.geo[this.props.activeStateGeoid[0].state_fips].counties]
                        }else{
                            out = [...out,...response.json.geo[state].counties]
                        }
                        return out
                    },[])
                this.props.falcor.get(['severeWeather',this.counties,this.state.hazard,this.state.year,['total_damage', 'num_episodes','property_damage','crop_damage','num_episodes','num_events','state','state_fips']],
                    ['geo',this.counties,['name']])
                    .then(response =>{
                        let geo_names = get(response,'json.geo',{})
                        let sw = get(response, 'json.severeWeather', {})
                        let data = []
                        Object.keys(sw).filter(d => d !== '$__path').forEach(item =>{
                            data.push({
                                county_fips_name : `${get(geo_names,`${item}.name`,'')},${get(sw,`${item}.${this.state.hazard}.${this.state.year}.${'state'}`,'')}`,
                                year: this.state.year,
                                hazard : hazards.map(d => d.value === this.state.hazard ? d.name : ''),
                                total_damage : fnum(get(sw, `${item}.${this.state.hazard}.${this.state.year}.${'total_damage'}`, 0)),
                                property_damage : fnum(get(sw, `${item}.${this.state.hazard}.${this.state.year}.${'property_damage'}`, 0)),
                                crop_damage : fnum(get(sw, `${item}.${this.state.hazard}.${this.state.year}.${'crop_damage'}`, 0)),
                                num_events : fmt(get(sw, `${item}.${this.state.hazard}.${this.state.year}.${'num_events'}`, 0)),
                                num_episodes : fmt(get(sw, `${item}.${this.state.hazard}.${this.state.year}.${'num_episodes'}`, 0))
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
                            domain : domain,
                            data : data
                        })
                        return response
                    })
            })
    }
    handleChange(e) {
        this.setState({ year: e })
    }


    render() {
        window.addEventListener('popstate', (event) => {
            window.history.replaceState({state : '1'},"whole","/stormevents/")
        });
        return (
            <div className='flex flex-col lg:flex-row h-full box-border overflow-hidden'>
                <div className='flex-auto h-full order-last lg:order-none overflow-hidden'>
                    <div className='h-full'>
                        <div className="relative top-0 right-auto h-8 w-2/6">
                            <Legend
                                title = {'Total Damage'}
                                type = {"threshold"}
                                vertical= {false}
                                range= {["#F1EFEF",...hazardcolors[this.state.hazard + '_range']]}
                                domain = {this.state.domain}
                                format= {fnum}
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
                            //hazards={this.props.hazards}
                            fips={''}
                            styles={[
                                {name: 'Blank', style: 'mapbox://styles/am3081/ck80d5hds0r9y1ip3cs3aplld'}
                            ]}
                            sidebar={false}
                            attributes={false}
                            layerProps={{
                                [this.StormEventsLayer.name]: {
                                    year: this.state.year,
                                    hazard : this.state.hazard,
                                    fips : this.props.activeStateGeoid ? this.props.activeStateGeoid.map(d => d.state_fips) : null
                                }
                            }}
                        />
                        <div className='relative bottom-40 h-40 z-90 w-full'>
                            <StackedBarGraph
                                height={200}
                                setYear={this.setYear.bind(this)}
                                initialLoad={this.state.initialLoad}
                                hazard={this.state.hazard}
                            />
                        </div>
                    </div>
                </div>
                <div className='h-56 lg:h-auto lg:w-1/4 p-2 lg:min-w-64 overflow-auto'>
                        {this.props.activeStateGeoid && !this.props.activeStateGeoid.map(d => d.state_fips).includes("")?
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
                            onClick ={(e) =>{
                                this.setState({
                                    showModal : true
                                })
                            }}>
                            Export Data
                        </button>
                        <Modal show={ this.state.showModal }
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
                                                     data={this.state.data} filename={`${this.state.current_fips_name}_${this.state.hazard}_${this.state.year}_counties.csv`}>Download CSV</CSVLink>
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
                        {/*<HazardStatBox
                                geoid={[""]}
                                year={this.state.update.year}
                            />*/}
                        <HazardListTable
                            data={{storm_event:"severeWeather",category:["all"],columns:['total_loss', 'loan_total', 'num_loans']}}
                            geoid={this.props.activeStateGeoid ? this.props.activeStateGeoid.map(d => d.state_fips) : [""]}
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
export default [


{
    path: '/stormevents/',
    mainNav: true,
    exact: true,
    name: 'NCDC Storm Events',
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
            connect(mapStateToProps, mapDispatchToProps)(reduxFalcor(NationalLanding))
        ]
    }
},
    {
        path: 'stormevents/state/:stateId',
        mainNav: false,
        exact: true,
        name: 'Storm Events',
        authed:false,
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
                style: {height: 'calc(100vh - 1rem)'}
            },
            children: [
                connect(mapStateToProps, mapDispatchToProps)(reduxFalcor(NationalLanding))
            ]
        }
    },

    
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
        theme: 'flat',
    },
    component: {
        type: 'div',
        props: {
            className: 'w-full overflow-hidden pt-16 focus:outline-none',
            style: {height: 'calc(100vh)'}
        },
        children: [
            connect(mapStateToProps, mapDispatchToProps)(reduxFalcor(SBAHazardLoans))
        ]
    }
},
{
    path: '/fema/',
    mainNav: true,
    exact: true,
    name: 'FEMA Distaster Declarations',
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
            connect(mapStateToProps, mapDispatchToProps)(reduxFalcor(NationalLanding))
        ]
    }
},

]