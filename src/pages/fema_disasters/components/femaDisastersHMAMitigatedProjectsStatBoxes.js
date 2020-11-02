import React from 'react';
import {connect} from 'react-redux';
import {reduxFalcor} from "utils/redux-falcor-new";
import get from 'lodash.get';
import {setActiveAmount} from "../../../store/modules/femaDisasterDeclarations";
import {fnum} from "../../../utils/sheldusUtils";


const HMA_MITIGATED_PROJECTS_ATTRIBUTES = [
    'project_amount',
    'project_amount_count',
    'federal_share_obligated',
    'federal_share_obligated_count'
]

let stat_boxes = [
    {name:'$ Project Amount',value:'project_amount',amount:0,count:0},
    {name:'$ Federal Share Obligated Amount',value:'federal_share_obligated',amount:0,count:0},
];

class FemaDisastersHMAMitigatedProjectsTotalsStatBoxes extends React.Component{

    fetchFalcorDeps(){
        return this.props.falcor.get(['fema','disasters','byId',this.props.disaster_number,'hma_mitigated_projects_totals',HMA_MITIGATED_PROJECTS_ATTRIBUTES])
            .then(response =>{
                return response
            })
    }

    processData(){
        let graph = get(this.props.falcorCache,['fema','disasters','byId',this.props.disaster_number,'hma_mitigated_projects_totals'],null)
        if(graph){
            return Object.keys(graph).forEach(item =>{
                 stat_boxes.forEach(d =>{
                    if(d.value === item && !item.includes("_count")){
                        d.amount = graph[item].value || 0
                    }
                    if(item.includes("count") && d.value === item.split("_count")[0]){
                        d.count = parseInt(graph[item].value) || 0
                    }

                })
            })
        }
    }

    render(){
        this.processData()
        return(
            <div className="mt-5 grid grid-cols-6 gap-5 sm:grid-cols-6 py-5">
                {stat_boxes.map((stat_box,i) =>{
                    return(
                        <div className="bg-white overflow-hidden shadow rounded-lg cursor-pointer" key={i}  onClick={() =>{
                            console.log('e',stat_box.value)
                            this.props.setActiveAmount(stat_box.value)
                        }}>
                            <div className="px-4 py-5 sm:p-6">
                                <dl>
                                    <dt className="text-base leading-6 font-normal text-gray-900 break-words">
                                        {stat_box.name}
                                    </dt>
                                    <dd className="mt-1 flex justify-between items-baseline md:block lg:flex">
                                        <div className="flex items-baseline text-2xl leading-8 font-semibold text-indigo-600">
                                            {fnum(stat_box.amount)}
                                        </div>
                                    </dd>
                                    <dd className="mt-1 flex justify-between items-baseline md:block lg:flex">
                                        <div className="text-sm leading-5 font-medium text-gray-500">
                                            # {stat_box.count}
                                        </div>
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    )
                })}
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        activeStateGeoid : state.stormEvents.activeStateGeoid,
        activeStateAbbrev : state.stormEvents.activeStateAbbrev,
        graph: state.graph,
        hazards: get(state.graph, 'riskIndex.hazards.value', [])
    };
};
const mapDispatchToProps = {
    setActiveAmount
};

export default connect(mapStateToProps,mapDispatchToProps)(reduxFalcor(FemaDisastersHMAMitigatedProjectsTotalsStatBoxes))
