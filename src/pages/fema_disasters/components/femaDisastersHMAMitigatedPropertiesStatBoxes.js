import React from 'react';
import {connect} from 'react-redux';
import {reduxFalcor} from "utils/redux-falcor-new";
import get from 'lodash.get';
import {setActiveAmount} from "../../../store/modules/femaDisasterDeclarations";
import {fnum} from "../../../utils/sheldusUtils";
import * as d3 from "d3";
var format =  d3.format("~s")
const fmt = (d) => d < 1000 ? d : format(d)

const HMA_MITIGATED_PROPERTIES_ATTRIBUTES = [
    'actual_amount_paid',
    'number_of_properties'
]

let stat_boxes = [
    {name:'$ Actual Amount Paid',value:'actual_amount_paid',amount:0,count:0},
];

class FemaDisastersHMAMitigatedPropertiesTotalsStatBoxes extends React.Component{

    fetchFalcorDeps(){
        return this.props.falcor.get(['fema','disasters','byId',this.props.disaster_number,'hma_mitigated_properties_totals',HMA_MITIGATED_PROPERTIES_ATTRIBUTES])
            .then(response =>{
                return response
            })
    }

    processData(){
        let graph = get(this.props.falcorCache,['fema','disasters','byId',this.props.disaster_number,'hma_mitigated_properties_totals'],null)
        if(graph){
            stat_boxes.forEach(d =>{
                d.amount = graph['actual_amount_paid'].value || 0
                d.count = fmt(graph['number_of_properties'].value) || 0
            })
        }
    }

    render(){
        this.processData()
        return(
            <div className="mt-5 grid grid-cols-6 gap-5 sm:grid-cols-6 py-5">
                {stat_boxes.map((stat_box,i) =>{
                    return(
                        <div className="bg-white overflow-hidden shadow rounded-lg cursor-pointer" key={i}  onClick={(e) =>{
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

const mapStateToProps = (state, ownProps) => {
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

export default connect(mapStateToProps,mapDispatchToProps)(reduxFalcor(FemaDisastersHMAMitigatedPropertiesTotalsStatBoxes))
