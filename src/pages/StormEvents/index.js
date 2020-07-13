import React from 'react';
import {connect} from 'react-redux';
import {reduxFalcor} from "utils/redux-falcor-new";
import get from 'lodash.get';
import AvlMap from "components/AvlMap";
import StormEventsLayerFactory from "./StormEventsLayer"
import StackedBarGraph from "./components /bar /stackedBarGraph";
//import HazardStatBox from "./components /statbox/hazardStatBox";
import Legend from "components/AvlMap/components/legend/Legend"
import { fnum } from "utils/sheldusUtils"
import HazardListTable from "./components /listTable/hazardListTable";
import Select from "components/avl-components/components/Inputs/select";
import Modal from "components/avl-components/components/Modal/avl-modal"
import Table from "components/avl-components/components/Table/index"
import hazardcolors from "constants/hazardColors";
import * as d3 from "d3";
import {setActiveStateGeoid} from "store/stormEvents";
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
        accessor: 'county_fips'
    },
    {
        Header: 'Year',
        accessor: 'year'
    },
    {
        Header: 'Hazard',
        accessor: 'hazard'
    },
    {
        Header: 'Total Damage',
        accessor: 'total_damage'
    },
    {
        Header: 'Property Damage',
        accessor: 'property_damage'
    },
    {
        Header: 'Crop Damage',
        accessor: 'crop_damage'
    },
    {
        Header: '# Events',
        accessor: 'num_events'
    },
    {
        Header: '# Episodes',
        accessor: 'num_episodes'
    },


];

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
            ['geo', fips, 'counties', 'geoid'])
            .then(response =>{
                this.counties = Object.values(response.json.geo)
                    .reduce((out,state) => {
                        if(state.counties){
                            out = [...out,...state.counties]
                        }
                        return out
                    },[])
                this.props.falcor.get(['severeWeather',this.counties,this.state.hazard,this.state.year,['total_damage', 'num_episodes']]) // "" is for the whole country
                    .then(response =>{
                        let sw = get(response, 'json.severeWeather', {})
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
                            domain : domain
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
            window.history.replaceState({state : '1'},"whole","/")
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
                        <div className='relative bottom-64 h-64 z-90 w-full'>
                            <StackedBarGraph
                                height={300}
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
                        {/*<button
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                            onClick ={(e) =>{
                                this.setState({
                                    showModal : true
                                })
                            }}>
                            Export Data
                        </button>
                        {this.state.showModal ?
                            <div className="h-32 w-32">
                            <Modal
                                show={true}
                                onHide = {(e) =>{
                                    this.setState({
                                        showModal:false
                                    })
                                }}
                                children={
                                    <Table
                                    columns={tableCols}
                                    data={["a","b","c"]}
                                    initialPageSize={10}
                                />
                                }
                            />
                            </div>
                            :
                            null
                        }*/}

                        {/*<HazardStatBox
                                geoid={[""]}
                                year={this.state.update.year}
                            />*/}
                        <HazardListTable
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
export default [{
    path: '/',
    mainNav: true,
    exact: true,
    name: 'Storm Events',
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
        path: '/state/:stateId',
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
    }
]