import React from 'react';
import {connect} from 'react-redux';
import {reduxFalcor} from "utils/redux-falcor-new";
import get from 'lodash.get';
import { fnum } from "utils/sheldusUtils"
import hazardcolors from "constants/hazardColors";

let years = []
const start_year = 1953
const end_year = 2020
for(let i = start_year; i <= end_year; i++) {
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

const FEMA_COUNTY_ATTRIBUTES =[
    'ia_ihp_amount',
    'ia_ihp_count',
    'pa_project_amount',
    'pa_federal_share_obligated',
    'hma_prop_actual_amount_paid',
    'hma_prop_number_of_properties',
    'hma_proj_project_amount',
    'hma_proj_project_amount_count',
    'hma_proj_federal_share_obligated',
    'hma_proj_federal_share_obligated_count',
    'total_cost',
    "total_disasters"
];

class FemaDisastersCombinedHazardListTable extends React.Component{
    constructor(props) {
        super(props);
        this.state={
            hazards: hazards.reduce((a,c) =>{
                a.push(c.value)
                return a
            },[]),

            currentHazard :'',
            isLoading : true
        }

    }

    componentDidUpdate(oldProps){
        if(this.props.year !== oldProps.year){
            this.fetchFalcorDeps()
        }
    }

    fetchFalcorDeps(){


        this.setState({
            isLoading : true
        });

        return this.props.falcor.get(['fema','disasters','length'])
            .then(response =>{
                let length = get(response.json,['fema','disasters','length'],null)
                let result = {}
                if(length){
                    this.props.falcor.get(['fema','disasters','byIndex',[{from:0,to:length-1}],this.props.attributes])
                        .then( async response =>{
                            this.setState({
                                isLoading : false
                            })
                            console.time("result")
                            result = await this.props.falcor.get(['fema','disasters',[""],this.state.hazards,[this.props.year],FEMA_COUNTY_ATTRIBUTES])
                            console.timeEnd("result")
                            return response
                        })

                return result
                }else { return Promise.resolve({}) }

            })

    }

    processByIdData(){
        let graph_data = []
        let graph = get(this.props.falcorCache,['fema','disasters','byId'],null)
        if(graph) {
            graph_data = hazards.reduce((a, c) => {
                a.push({
                    'hazard': c.value,
                    'count' : 0
                })
                return a
            }, [])
            graph_data.forEach(d =>{
                let sum = 0
                Object.values(graph).filter(d => d !== '$__path').forEach(item =>{
                    if(this.props.year === 'allTime') {
                        if(get(item,['disaster_type','value'],'').toString() === d.hazard) {
                            sum += +get(item,['total_cost','value'],0)
                            d['total_cost_summaries'] = sum
                        }
                    }else{
                        if(get(item,['disaster_type','value'],'').toString() === d.hazard && get(item,['year','value'],'').toString() === this.props.year.toString()){
                            sum += +get(item,['total_cost','value'],0)
                            d['total_cost_summaries'] = sum
                        }
                    }

                })
            })
        }

        return graph_data
    }

    processFemaCountyData(){
        let graph = get(this.props.falcorCache,['fema','disasters',this.props.geoid],null)
        let data = []
        let header_columns = ["name","value","total_cost","total_cost_summaries"]
        let declarationsData = this.processByIdData()
        if(graph){
            data = Object.keys(graph).map(hazard =>{
                return header_columns.reduce((a,header) =>{
                    hazards.forEach(item =>{
                        if(item.value === hazard){
                            if (header === 'name' || header === 'value') {
                                a[header] = item[header]
                            }
                            else{
                                a[header] = get(graph,[item.value,this.props.year,header,'value'],0)
                            }
                        }
                    })
                    return a
                },{})

            })
            declarationsData.forEach(dd =>{
                data.forEach(d =>{
                    if(d.value === dd.hazard){
                        d['total_cost_summaries'] = dd.total_cost_summaries || 0
                    }
                })
            })
        }

        return data
    }

    render(){
        let combineData = this.processFemaCountyData()
        return(
            <div className="align-middle inline-block min-w-full overflow-hidden"
                 key={0}>
                <table className="min-w-full">
                    <thead>
                    <tr>
                        <th className="px-3  py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase ">
                            Hazard
                        </th>
                        <th className="px-3 text-right py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase "

                        >
                            $ Total Cost - {this.props.year}
                        </th>
                        <th className="px-3 text-right py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase "

                        >
                            $ Total Cost Summaries - {this.props.year}
                        </th>
                    </tr>
                    </thead>
                    <tbody>
                    {
                            combineData.sort((a,b) => b['total_cost'] - a['total_cost'])
                            .map((hazard,i) =>{
                                return (
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
                                        <td>
                                            {fnum(hazard.total_cost)}
                                        </td>
                                        <td>
                                            {fnum(hazard.total_cost_summaries)}
                                        </td>
                                    </tr>
                                )
                            })

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
export default connect(mapStateToProps, mapDispatchToProps)(reduxFalcor(FemaDisastersCombinedHazardListTable))
