import React from "react";
import MyPlot from "./MyPlot";
import {connect} from "react-redux";
import {reduxFalcor} from "../../../utils/redux-falcor-new";
import get from "lodash.get";
import { fnum } from "utils/sheldusUtils"

var _ = require('lodash')
let years = []
const start_year = 1996
const end_year = 2019
for (let i = start_year; i <= end_year; i++) {
    years.push(i)
}

const hazards = [
    {value: 'wind', name: 'Wind'},
    {value: 'wildfire', name: 'Wildfire'},
    {value: 'tsunami', name: 'Tsunami/Seiche'},
    {value:'tornado', name:'Tornado'},
    {value:'riverine', name:'Flooding'},
    // {value:'lightning', name:'Lightning'},
    // {value:'landslide', name:'Landslide'},
    // {value:'icestorm', name:'Ice Storm'},
    // {value:'hurricane', name:'Hurricane'},
    // {value:'heatwave', name:'Heat Wave'},
    // {value:'hail', name:'Hail'},
    // {value:'earthquake', name:'Earthquake'},
    // {value:'drought', name:'Drought'},
    // {value:'avalanche', name:'Avalanche'},
    // {value:'coldwave', name:'Coldwave'},
    // {value:'winterweat', name:'Snow Storm'},
    // {value:'volcano', name:'Volcano'},
    // {value:'coastal', name:'Coastal Hazards'}
]


class Test extends React.Component {


    async fetchFalcorDeps() {
        let geoid = window.location.pathname.split("/")[2]
        this.hazards = hazards.reduce((a, c) => {
            a.push(c.value)
            return a
        }, [])
        const name = await this.props.falcor.get(['geo', geoid, ['name']])
        const severeWeather = await this.props.falcor.get(["severeWeather", geoid, this.hazards, years, ['total_damage']])

        return {name, severeWeather}


    }

    makeData() {
        let geoid = window.location.pathname.split("/")[2]
        let graph = get(this.props.falcorCache, ['severeWeather', geoid], null)
        if (graph) {
            return [
                hazards.map((h, hI) => hI),
                ...hazards.map(h => h.value)
                    .map(hazard =>
                        years.map(y => get(graph, [hazard, y, 'total_damage'], 0)))
            ]
        }

        return null
    }


    render() {
       let data= this.makeData()
       if(data){
           return (
               <div className="overflow-auto">
                   <React.StrictMode>
                       <MyPlot data={data}/>
                   </React.StrictMode>
               </div>
           )
       }else{
           return null
       }
    }
}

const mapStateToProps = (state, ownProps) => {
    return {
        activeStateGeoid: state.stormEvents.activeStateGeoid,
        activeStateAbbrev: state.stormEvents.activeStateAbbrev,
        graph: state.graph,
        hazards: get(state.graph, 'riskIndex.hazards.value', [])
    };
};
const mapDispatchToProps = {};

export default [

    {
        path: '/overview.js/:geoid',
        mainNav: false,
        exact: true,
        name: 'Overview',
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
                connect(mapStateToProps, mapDispatchToProps)(reduxFalcor(Test))
            ]
        }
    },


]
