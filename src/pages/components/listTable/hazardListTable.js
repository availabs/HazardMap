import React from 'react';
import {connect} from 'react-redux';
import {reduxFalcor} from "utils/redux-falcor-new";
import get from 'lodash.get';
import { falcorGraph } from "store/falcorGraphNew"
import { fnum } from "utils/sheldusUtils"
import * as d3 from "d3";
import hazardcolors from "constants/hazardColors";
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

    fetchFalcorDeps(){
        if(this.props.data.storm_event === 'sba'){
            return this.props.falcor.get(
                [this.props.data.storm_event,this.props.data.category,this.props.geoid,this.state.hazards,this.props.year,this.props.data.columns],
            ).then(response =>{
                return response
            })
        }else{
            return this.props.falcor.get([this.props.data.storm_event,this.props.geoid,this.state.hazards,this.props.year,this.props.data.columns]) // "" is for the whole country
                .then(response =>{
                    return response
                })
        }

    }

    processData(){
        let data = []
        let graph = null
        let header_columns = ["name","value"]
        if(this.props.data.storm_event === 'sba'){
            graph = get(falcorGraph.getCache(),[this.props.data.storm_event,this.props.data.category,this.props.geoid],null)
            header_columns.push(...this.props.data.columns)
        }else{
            graph = get(falcorGraph.getCache(),[this.props.data.storm_event,this.props.geoid],null)
            header_columns.push(...this.props.data.columns)
        }
        if(graph){
            data = Object.keys(graph).map(hazard =>{
                return header_columns.reduce((a,header) =>{
                    hazards.forEach(item =>{
                        if(item.value === hazard){
                            if (header === 'name' || header === 'value') {
                                a[header] = item[header]
                            }
                            else if(header === 'annualized_damage'){
                                a[header] = get(graph,[hazard,"allTime",header],0)
                            }
                            else{
                                a[header] = get(graph,[hazard,this.props.year,header],0)
                            }
                        }
                    })
                    return a
                },{})

            })
        }
        return data
    }

    render(){
        let listTableData = this.processData()
        return(
                <div className="align-middle inline-block min-w-full overflow-hidden"
                    key={0}>
                    <table className="min-w-full">
                        <thead>
                        <tr>
                            <th className="px-3  py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase ">
                                Hazard
                            </th>
                            {this.props.data.header.map((header,i) =>{
                                if(header === 'Damage' || header === 'Total Loss' || header === 'Actual Amount Paid'){
                                    return (
                                        <th className="px-3 text-right py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase "
                                            key={i}
                                        >
                                            {header}-{this.props.year}
                                        </th>
                                    )}else{
                                        return(
                                            <th className="px-3 text-right py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase "
                                                key={i}
                                            >
                                                {header}
                                            </th>
                                        )
                                    }
                                })}

                        </tr>
                        </thead>
                        <tbody>
                        {   listTableData.length > 0 ?
                            listTableData
                            .sort((a,b) => b[this.props.data.sort] - a[this.props.data.sort])
                            .map((hazard,i) =>{
                                return(
                                    <tr className={`bg-white  ${this.props.activeHazard === hazard.value ? 'border-b-4 border-blue-300' : 'border-b border-gray-200' }` }
                                        key={i} id={hazard.value}>
                                        <td style={{backgroundColor:hazardcolors[hazard.value]}} className="px-4 py-2 whitespace-no-wrap text-sm leading-5 font-medium text-gray-100" key={i}>
                                            <div
                                                className="hover:text-blue-100 cursor-pointer"
                                                
                                                onClick={(e) =>{
                                                    e.persist()
                                                    if(this.state.currentHazard !== hazard.value){
                                                        this.props.setHazard(hazard.value)
                                                        this.setState({
                                                            currentHazard : hazard.value
                                                        })
                                                    }else{
                                                        this.props.setHazard(null)
                                                    }

                                                }}
                                                >
                                                {hazard.name}
                                            </div>
                                        </td>
                                        {this.props.data.columns.map((column,i) =>{
                                            return (
                                                <td className="px-4 py-2 whitespace-no-wrap text-sm leading-5 font-medium text-gray-900 text-right" key={i}>
                                                    {!column.includes("num") ? fnum(hazard[column]) : fmt(hazard[column])}
                                                </td>
                                            )
                                        })}

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
        activeStateGeoid : state.user.activeStateGeoid,
        geoid:ownProps.geoid,
        censusKey:ownProps.censusKey,
        graph: state.graph,
        severeWeatherData : get(state.graph,['severeWeather'])
    };
};
export default connect(mapStateToProps, mapDispatchToProps)(reduxFalcor(HazardListTable))