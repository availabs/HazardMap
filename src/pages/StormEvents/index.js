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
import hazardcolors from "constants/hazardColors";
import * as d3 from "d3";
let years = []
const start_year = 1996
const end_year = 2019
for (let i = start_year; i <= end_year; i++) {
    years.push(i)
}
const fips = ["01", "02", "04", "05", "06", "08", "09", "10", "11", "12", "13", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "40", "41", "42", "44", "45", "46", "47", "48", "49", "50", "51", "53", "54", "55", "56"]
const history = require('history').createBrowserHistory({forceRefresh:false});
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
                        {/*<HazardStatBox
                                geoid={[""]}
                                year={this.state.update.year}
                            />*/}
                        <HazardListTable
                            geoid={this.props.activeStateGeoid ? [this.props.activeStateGeoid] : [""]}
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
        graph: state.graph,
        hazards: get(state.graph, 'riskIndex.hazards.value', [])
    };
};
const mapDispatchToProps = {
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
    }]