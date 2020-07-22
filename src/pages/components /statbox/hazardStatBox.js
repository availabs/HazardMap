import React from 'react';
import {connect} from 'react-redux';
import {reduxFalcor} from "utils/redux-falcor-new";
import get from 'lodash.get';
import {falcorGraph} from "../../../store/falcorGraphNew";
import { fnum } from "utils/sheldusUtils"
import * as d3 from "d3";
var _ = require('lodash')
var format =  d3.format("~s")
const fmt = (d) => d < 1000 ? d : format(d)
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

class HazardStatBox extends React.Component{
    constructor(props) {
        super(props);

        this.state={
            hazards: hazards.reduce((a,c) =>{
                a.push(c.value)
                return a
            },[])
        }
    }

    fetchFalcorDeps(){
        return this.props.falcor.get(['severeWeather',"",this.state.hazards,this.props.year,['total_damage', 'num_episodes','annualized_damage']]) // "" is for the whole country
            .then(response =>{
                return response
            })
    }

    processData(){
        let graph = get(falcorGraph.getCache(),['severeWeather',""],null)
        let data = []
        if(graph){
            Object.keys(graph).forEach(hazard =>{
                hazards.forEach(item =>{
                    if(item.value === hazard){
                        data.push({
                            name: item.name,
                            total_damage : get(graph,[hazard,this.props.year,"total_damage"],0),
                            num_episodes: get(graph,[hazard,this.props.year,"num_episodes"],0),
                            annualized_damage : get(graph,[hazard,this.props.year,'annualized_damage'],0)
                        })
                    }
                })

            })
        }
        return data
    }

    render(){
        let statBoxData = this.processData()
        return(
            <div>
                {statBoxData.length > 0 ?
                    statBoxData.map((hazard,i) =>{
                        return(
                            <div className="mt-5 grid-cols-6 rounded-lg bg-white overflow-hidden shadow cursor-pointer"
                                 key={i}
                                    onClick={(e) => {
                                        console.log('e',e)
                                    }}>
                                <div className="px-4 py-5 sm:p-6" key={i}>
                                    <dl>
                                        <dt className="text-2xl leading-6 font-Georgia text-gray-900" key={i}>
                                            {hazard.name}
                                        </dt>
                                        <dd className="mt-1 flex justify-between items-baseline md:block lg:flex">
                                            <div className="flex items-baseline text-xl leading-8 font-semibold text-indigo-600">
                                                <div className="flex flex-col border-b border-gray-100 p-6 text-center sm:border-0 sm:border-r">
                                                    {fnum(hazard.total_damage)}
                                                    <div className="order-2 mt-2 text-xs leading-6 font-medium text-gray-500">Total Damage</div>
                                                </div>
                                                <span className="ml-2 text-xl leading-8 font-semibold text-indigo-600">
                                                    <div className="flex flex-col border-b border-gray-100 p-6 text-center sm:border-0 sm:border-r">
                                                    {fnum(hazard.annualized_damage)}
                                                        <div className="order-2 mt-2 text-xs leading-6 font-medium text-gray-500">Annualized Damage</div>
                                                </div>
                                                </span>
                                            </div>
                                        </dd>
                                        <div className="ml-2 text-sm leading-5 font-medium text-gray-500"># Episodes : {fmt(hazard.num_episodes)}</div>
                                    </dl>
                                </div>
                            </div>
                        )
                    })
                    :<div>Loading...</div>}
            </div>
        )
    }
}

const mapDispatchToProps = { };

const mapStateToProps = (state,ownProps) => {
    return {
        geoid:ownProps.geoid,
        censusKey:ownProps.censusKey,
        graph: state.graph,
        severeWeatherData : get(state.graph,['severeWeather'])
    };
};
export default connect(mapStateToProps, mapDispatchToProps)(reduxFalcor(HazardStatBox))