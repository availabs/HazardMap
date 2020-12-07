import React from 'react';
import {connect} from 'react-redux';
import {reduxFalcor} from "@availabs/avl-components/dist/redux-falcor/index";
import get from 'lodash.get';
import { falcorGraph } from "store/falcorGraphNew"
import { fnum } from "utils/sheldusUtils"
// import * as d3 from "d3";
import hazardcolors from "constants/hazardColors";
// var format =  d3.format("~s")
// const fmt = (d) => d < 1000 ? d : format(d)
import {stormEventsData} from "../../StormEvents/DataFetching/StormEventsDataFecthing";
import {sbaData} from "../../StormEvents/DataFetching/SBADataFetching";
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
            isLoading : true,
            currentHazard :''
        }

    }

    componentWillUnmount(){
        this.setState = (state,callback)=>{
            return;
        };
    }

    componentDidUpdate(oldProps){
        if(oldProps.hazard !== this.props.hazard){
            this.fetchFalcorDeps()
        }
        if(oldProps.geoid !== this.props.geoid){
            this.fetchFalcorDeps()
        }
        if(oldProps.year !== this.props.year){
            this.fetchFalcorDeps()
        }
    }

    async fetchFalcorDeps(){
        this.hazards = hazards.reduce((a,c) =>{
            a.push(c.value)
            return a
        },[])
        if(this.props.data.data_type === 'sba'){
            this.data = await sbaData(this.props.data.type,this.props.data.columns,this.props.geoid,'counties',this.hazards,this.props.year)
            this.setState({
                isLoading : false
            })
        }else{
            this.data = await stormEventsData(this.props.data.type,this.props.data.columns,this.props.geoid,'counties',this.hazards,this.props.year)
            this.setState({
                isLoading : false
            })


        }

    }


    render(){
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
                        {   this.data && !this.state.isLoading?
                            this.data.data
                            .filter(d => Object.keys(d).length !== 0)
                            .sort((a,b) => b[this.props.data.sort] - a[this.props.data.sort])
                            .map((hazard,i) =>{
                                return(
                                    <tr className={`bg-white  ${this.props.activeHazard === hazard.value ? 'border-b-2 border-blue-500' : 'border-b border-gray-200' }` }
                                        key={i} id={hazard.value}>
                                        <td className="px-4 py-2 whitespace-no-wrap text-md leading-5 font-base text-gray-900" key={i}>
                                            <div
                                                className="hover:text-blue-600 cursor-pointer"

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
                                                <div style={{backgroundColor:hazardcolors[hazard.value]}} className='w-3 h-3 mr-2 inline-block' />{hazard.name}
                                            </div>
                                        </td>
                                        {this.props.data.columns.map((column,i) =>{
                                            return (
                                                <td className="px-4 py-2 whitespace-no-wrap text-sm leading-5 font-base text-gray-900 text-right" key={i}>
                                                    {!column.includes("num") ? fnum(hazard[column]) : hazard[column].toLocaleString()}
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
