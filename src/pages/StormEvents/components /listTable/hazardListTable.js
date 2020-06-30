import React from 'react';
import {connect} from 'react-redux';
import {reduxFalcor} from "utils/redux-falcor-new";
import get from 'lodash.get';
import {falcorGraph} from "../../../../store/falcorGraphNew";
import { fnum } from "utils/sheldusUtils"
import * as d3 from "d3";
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
let activeHazard = 'riverine'

class HazardListTable extends React.Component{
    constructor(props) {
        super(props);

        this.state={
            hazards: hazards.reduce((a,c) =>{
                a.push(c.value)
                return a
            },[]),
            currentHazard :''
        }

    }


    componentDidUpdate(oldProps,oldState){
        if(oldProps.activeHazard !== this.props.activeHazard){
            activeHazard = this.props.activeHazard
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
                            value: item.value,
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
        let listTableData = this.processData()
        return(
                <div className="align-middle inline-block min-w-full shadow overflow-hidden sm:rounded-lg border-b border-gray-200"
                    key={0}>
                    <table className="min-w-full">
                        <thead>
                        <tr>
                            <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                                Hazard
                            </th>
                            <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                                Damage-{this.props.year}
                            </th>
                            <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                                Yearly Avg Damage
                            </th>
                            <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                                # Episodes
                            </th>
                        </tr>
                        </thead>
                        <tbody>
                        {   listTableData.length > 0 ?
                            listTableData.map((hazard,i) =>{
                                let className = ""
                                if(i % 2 !==0){
                                    className="bg-white"
                                }else{
                                    className = "bg-gray-50"
                                }
                                return(
                                    <tr className={`${className} ${activeHazard === hazard.value ? 'border-4' : '' }` }
                                        key={i} id={hazard.value}>
                                        <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5 font-medium text-gray-900">
                                            <a
                                                href={"#"}
                                                className="text-indigo-600 hover:text-indigo-900"
                                                onClick={(e) =>{
                                                    e.persist()
                                                    if(this.props.initialLoad){
                                                        this.props.setHazard(hazard.value)
                                                        this.setState({
                                                            currentHazard : hazard.value
                                                        })
                                                    }
                                                }}
                                                >
                                                {hazard.name}
                                            </a>
                                        </td>
                                        <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5 font-medium text-gray-900">
                                            {fnum(hazard.total_damage)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5 font-medium text-gray-900">
                                            {fnum(hazard.annualized_damage)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5 font-medium text-gray-900">
                                            {fmt(hazard.num_episodes)}
                                        </td>
                                    </tr>
                                )
                            })
                        :
                            null
                            }
                        </tbody>
                    </table>
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
export default connect(mapStateToProps, mapDispatchToProps)(reduxFalcor(HazardListTable))