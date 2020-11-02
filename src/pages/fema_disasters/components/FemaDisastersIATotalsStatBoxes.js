import React from 'react';
import {connect} from 'react-redux';
import {reduxFalcor} from "utils/redux-falcor-new";
import get from 'lodash.get';
import {setActiveAmount} from "../../../store/modules/femaDisasterDeclarations";
import {fnum} from "../../../utils/sheldusUtils";



const IA_ATTRIBUTES = [
    'ihp_amount',
    'ihp_count',
    'ha_amount',
    'ha_count',
    'fip_amount',
    'fip_count',
    'on_a_amount',
    'on_a_count',
    'rental_assistance_amount',
    'rental_assistance_count',
    'repair_amount',
    'repair_count',
    'replacement_amount',
    'replacement_count',
    'personal_property_amount',
    'personal_property_count',
    'roof_damage_amount',
    'roof_damage_count',
    'foundation_damage_amount',
    'foundation_damage_count',
    'flood_damage_amount',
    'flood_damage_count'
];

let stat_boxes = [
    {name:'$ IHP Amount',value:'ihp_amount',amount:0,count:0},
    {name:'$ HA Amount',value:'ha_amount',amount:0,count:0},
    {name:'$ FIP Amount',value:'fip_amount',amount:0,count:0},
    {name:'$ ON A Amount',value:'on_a_amount',amount:0,count:0},
    {name:'$ Rental Assistance Amount',value:'rental_assistance_amount',amount:0,count:0},
    {name:'$ Repair Amount',value:'repair_amount',amount:0,count:0},
    {name:'$ Replacement Amount',value:'replacement_amount',amount:0,count:0},
    {name:'$ Personal Property Amount',value:'personal_property_amount',amount:0,count:0},
    {name:'$ Roof Damage Amount',value:'roof_damage_amount',amount:0,count:0},
    {name: '$ Foundation Damage Amount',value:'foundation_damage_amount',amount:0,count:0},
    {name:'$ Flood Damage Amount',value:'flood_damage_amount',amount:0,count:0}
];

class FemaDisastersIATotalsStatBoxes extends React.Component{

    fetchFalcorDeps(){
        return this.props.falcor.get(['fema','disasters','byId',this.props.disaster_number,'ia_totals',IA_ATTRIBUTES])
            .then(response =>{
                return response
            })
    }

    processData(){
        let graph = get(this.props.falcorCache,['fema','disasters','byId',this.props.disaster_number,'ia_totals'],null)
        if(graph){
            Object.keys(graph).forEach(item =>{
                stat_boxes.forEach(d =>{

                    if(d.value === item && item.includes("amount")){
                        d.amount = graph[item].value || 0
                    }
                    if(item.includes("count") && d.value.split("_amount")[0]+"_count" === item){
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

export default connect(mapStateToProps,mapDispatchToProps)(reduxFalcor(FemaDisastersIATotalsStatBoxes))
