import React from 'react';
import {connect} from 'react-redux';
import {reduxFalcor} from "utils/redux-falcor-new";
import get from 'lodash.get';
import { fnum } from "utils/sheldusUtils"
import hazardcolors from "constants/hazardColors";
import {stormEventsData} from "../../StormEvents/DataFetching/StormEventsDataFecthing";
import {sbaData} from "../../StormEvents/DataFetching/SBADataFetching";
import {femaDisastersData} from "../../StormEvents/DataFetching/FEMADisastersDataFetching";
import config from "../../StormEvents/components/config";

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
        if(oldProps.data_type !== this.props.data_type){
            this.fetchFalcorDeps()
        }
    }

    async fetchFalcorDeps(){
        switch (this.props.data_type) {
            case 'sba':
                return sbaData(this.props.type,config[this.props.data_type].data_columns,this.props.geoid,'counties',config['hazards'],this.props.year)
            case 'stormevents':
                return stormEventsData(this.props.type,config[this.props.data_type].data_columns,this.props.geoid,'counties',config['hazards'],this.props.year)// "" is for the whole country
            case 'fema':
                return femaDisastersData(this.props.type,config[this.props.data_type].data_columns,this.props.geoid,'counties',config['hazards'],this.props.year)
            default:
                return Promise.resolve({})
        }

    }

    processData(){
        const graph = this.props.geoid ? get(this.props.falcorCache,`${config[this.props.data_type].fetch_url}.${this.props.geoid}`,null) :
                get(this.props.falcorCache,`${config[this.props.data_type].fetch_url}.[""]`,null)
        let header_columns =["name","value",...config[this.props.data_type].table_column]
        let data = []
        if(graph){
            data = Object.keys(graph).map(hazard =>{
                return header_columns.reduce((a,header) =>{
                    config['Hazards'].forEach(item =>{
                        if(item.value === hazard){
                            switch(header) {
                                case 'name':
                                    a[header] = item.name
                                    break;
                                case 'value':
                                    a[header] = item.value
                                    break;
                                case 'annualized_damage':
                                    a[header] = get(graph,[item.value,"allTime",header],0)
                                    break;
                                default :
                                    a[header] = get(graph,[item.value,this.props.year,header],0)
                            }

                        }
                    })
                    return a
                },{})
            })

        }

        return data
    }

    processFemaData(){
        const graph = this.props.geoid ? get(this.props.falcorCache,`${config[this.props.data_type].fetch_url}`,null) :
            get(this.props.falcorCache,`${config[this.props.data_type].fetch_url}.[""]`,null)
        const graphById = get(this.props.falcorCache,`${config[this.props.data_type].fetch_url}.byId`,null)
        let graph_data = []
        let femaData = []
        if(graphById && graph) {
            graph_data = config['Hazards'].reduce((a, c) => {
                a.push({
                    'hazard': c.value,
                    'count' : 0
                })
                return a
            }, [])
            graph_data.map(d =>{
                let sum = 0
                return Object.keys(graphById).filter(d => d !== '$__path').forEach(item =>{
                    if(this.props.year === 'allTime') {
                        if(get(graphById[item],['disaster_type','value'],'').toString() === d.hazard) {
                            sum += +get(graphById[item],['total_cost','value'],0)
                            return d['total_cost_summaries'] = sum
                        }
                    }else{
                        if(get(graphById[item],['disaster_type','value'],'').toString() === d.hazard && get(graphById[item],['year','value'],'').toString() === this.props.year.toString()){
                            sum += +get(graphById[item],['total_cost','value'],0)
                            return d['total_cost_summaries'] = sum
                        }
                    }

                })
            })
            if(this.props.geoid){
                config['Hazards'].forEach(hazard =>{
                    let total_cost = 0
                    let total_cost_summaries = 0
                    Object.keys(graph).filter(d => d!== '$__path').forEach(item =>{
                        total_cost += get(graph[item],[hazard.value,this.props.year,'total_cost','value'],0)
                        total_cost_summaries += get(graph[item],[hazard.value,this.props.year,'total_cost_summaries','value'],0)
                    })
                    femaData.push({
                        'name': hazard.name,
                        'value': hazard.value,
                        'total_cost': total_cost,
                        'total_cost_summaries': total_cost_summaries
                    })
                })
            }else{
                femaData =Object.keys(graph).filter(d => d!=="$__path").map(hazard => {
                    return ["name", "value", "total_cost", "total_cost_summaries"].reduce((a, header) => {
                        config['Hazards'].forEach(item => {
                            if (item.value === hazard) {
                                if (header === 'name' || header === 'value') {
                                    a[header] = item[header]
                                } else {
                                    a[header] = get(graph[hazard], [this.props.year, header,'value'], 0)
                                }
                            }
                        })
                        return a
                    }, {})
                })

            }

            graph_data.forEach(dd =>{
                femaData.map(d =>{
                    if(d.value === dd.hazard){
                        d['total_cost_summaries'] = dd.total_cost_summaries || 0

                    }
                    return d
                })
            })
        }
        return femaData

    }

    render(){
        const data = this.props.data_type !== 'fema' ?
            this.processData() : this.processFemaData()
        return(
                <div className="align-middle inline-block min-w-full overflow-hidden"
                    key={0}>
                    <table className="min-w-full">
                        <thead>
                        <tr>
                            <th className="px-3  py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase ">
                                Hazard
                            </th>
                            {config[this.props.data_type].table_header.map((header,i) =>{
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
                        {   data.length ?
                            data
                            .filter(d => Object.keys(d).length !== 0)
                            .sort((a,b) => b[config[this.props.data_type].sort] - a[config[this.props.data_type].sort])
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
                                        {config[this.props.data_type].table_column.map((column,i) =>{
                                            return (
                                                <td className="px-4 py-2 whitespace-no-wrap text-sm leading-5 font-base text-gray-900 text-right" key={i}>
                                                    {!column.includes("num") || !column.includes("total") ? fnum(hazard[column]) : hazard[column].toLocaleString()}
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
        falcorCache : state.falcorCache,
        geoid:ownProps.geoid,
    };
};
export default connect(mapStateToProps, mapDispatchToProps)(reduxFalcor(HazardListTable))
