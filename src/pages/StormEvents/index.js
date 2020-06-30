import React from 'react';
import {connect} from 'react-redux';
import {reduxFalcor} from "utils/redux-falcor-new";
import get from 'lodash.get';
import AvlMap from "components/AvlMap";
import StoemEventsLayerFactory from "./StormEventsLayer"
import StackedBarGraph from "./components /bar /stackedBarGraph";
//import HazardStatBox from "./components /statbox/hazardStatBox";
import HazardListTable from "./components /listTable/hazardListTable";
import Select from "../../components/avl-components/components/Inputs/select";

let years = []
const start_year = 1996
const end_year = 2019
for (let i = start_year; i <= end_year; i++) {
    years.push(i)
}

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

    StormEventsLayer = StoemEventsLayerFactory({active: true});

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
        return this.props.falcor.get(['riskIndex', 'hazards'])
    }

    handleChange(e) {
        console.log('---', e);
        let newSelect = this.state.update
        newSelect.year = e
        this.setState({
            update: newSelect
        })

    }

    render() {
        return (
            <div className='flex flex-col lg:flex-row h-full box-border overflow-hidden'>
                <div className='flex-auto h-full order-last lg:order-none overflow-hidden'>
                    <div className='h-full'>
                        <AvlMap
                            layers={[
                                this.StormEventsLayer
                            ]}
                            height={'96%'}
                            center={[0, 0]}
                            zoom={4}
                            year={2018}
                            hazards={this.props.hazards}
                            fips={''}
                            styles={[
                                {name: 'Blank', style: 'mapbox://styles/am3081/ck80d5hds0r9y1ip3cs3aplld'}
                            ]}
                            sidebar={false}
                            attributes={false}
                            layerProps={{
                                [this.StormEventsLayer.name]: {
                                    year: this.state.year,
                                    hazard : this.state.hazard

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
                <div className='h-56 lg:h-auto lg:w-1/3 p-2 lg:min-w-64 overflow-auto'>
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
                            geoid={[""]}
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
        graph: state.graph,
        hazards: get(state.graph, 'riskIndex.hazards.value', [])
    };
};

const mapDispatchToProps = {};

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
            style: {height: 'calc(100vh - 1rem)'}
        },
        children: [
            connect(mapStateToProps, mapDispatchToProps)(reduxFalcor(NationalLanding))
        ]

    }
}]