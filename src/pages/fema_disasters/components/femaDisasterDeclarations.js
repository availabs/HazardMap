import React from 'react';
import {connect} from 'react-redux';
import {reduxFalcor} from "utils/redux-falcor-new";
import get from 'lodash.get';
import Table from "components/avl-components/components/Table";
import Header from "components/avl-components/components/Header/Header";
import FemaDisastersIATotalsStatBoxes from "./FemaDisastersIATotalsStatBoxes";
import FemaDisastersTotalsEventsLayer from '../layers/femaDisastersTotalsEventsLayer'
import FemaDisastersPATotalsStatBoxes from "./FemaDisastersPATotalsStatBoxes";
import FemaDisastersHMAMitigatedPropertiesTotalsStatBoxes from "./femaDisastersHMAMitigatedPropertiesStatBoxes";
import FemaDisastersHMAMitigatedProjectsTotalsStatBoxes from "./femaDisastersHMAMitigatedProjectsStatBoxes";
import {fnum} from "../../../utils/sheldusUtils";
import * as d3 from "d3";
import AvlMap from "../../../components/AvlMap";
import {shmp} from 'pages/components/shmp-theme.js'
var format =  d3.format("~s")
var _ = require("lodash")
const fmt = (d) => d < 1000 ? d : format(d)


const tableCols = [
    {
        Header: 'Disaster Number',
        accessor: 'disaster_number',
    },
    {
        Header: 'Designated Area',
        accessor: 'designated_area',
        disableFilters: true
    },
    {
        Header: 'Declaration Title',
        accessor: 'declaration_title',
        disableFilters: true
    },
    {
        Header: 'Declaration Request Number',
        accessor: 'declaration_request_number',
        disableFilters: true
    },
    {
        Header : 'State',
        accessor: 'state',
    },
    {
        Header : 'Declaration Type',
        accessor: 'declaration_type',
        disableFilters: true
    },
    {
        Header:'Declaration Date',
        accessor:'declaration_date',
        disableFilters: true
    }
];

const attributes=['disaster_number','designated_area','declaration_title','declaration_request_number','state','declaration_type','declaration_date']
let stat_boxes = [
    {name:'# IA Approved',value:'total_number_ia_approved',amount:0},
    {name:'$ IHP Approved',value:'total_amount_ihp_approved',amount:0},
    {name:'$ ONA Approved',value:'total_amount_ona_approved',amount:0},
    {name:'$ Obligated PA',value:'total_obligated_amount_pa',amount:0},
    {name:'$ Obligated CAT AB',value:'total_obligated_amount_cat_ab',amount:0},
    {name:'$ Obligate CAT C2G',value:'total_obligated_amount_cat_c2g',amount:0},
    {name:'$ Obligated HMGP',value:'total_obligated_amount_hmgp',amount:0},
    {name:'Total Funds',value:'total_funds'}
];
let total_funds = 0

class FemaDisasterDeclarations extends React.Component{
    FemaDisastersTotalsEventsLayer = FemaDisastersTotalsEventsLayer({active:true})
    constructor(props) {
        super(props);
        this.state ={

        }
    }


    componentDidMount(){

    }

    fetchFalcorDeps(){
        let disaster_number = window.location.pathname.split("/")[3]

        return this.props.falcor.get(['fema','disasters',[disaster_number],'declarations','length'])
            .then(response =>{
                let length = get(response.json,['fema','disasters',disaster_number,'declarations','length'],null)
                if(length){

                    this.props.falcor.get(['fema','disasters',disaster_number,'declarations','byIndex',[{from:0,to:length-1}],attributes],
                        ['fema','disasters','byId',disaster_number,stat_boxes.map(d => d.value)])
                        .then(response =>{
                            return response
                        })
                } else { return Promise.resolve({}) }
            })
    }

    processData(){
        if(Object.keys(this.props.falcorCache).length > 0){
            let graph = get(this.props.falcorCache,['fema','disasters','declarations','byId'],{})
            let data = [];
            let disaster_number = window.location.pathname.split("/")[3]
            Object.keys(graph).filter(d => d!=='$__path').forEach(item =>{
                if(graph[item]['disaster_number'].value.toString() === disaster_number.toString()){
                    data.push(
                        attributes.reduce((out,attribute) =>{
                            if(graph[item][attribute]){
                                out[attribute] =  attribute.includes('date') || attribute.includes('last_refresh') ?
                                    new Date(graph[item][attribute].value).toLocaleDateString('en-US') :
                                    attribute.includes('number')
                                    ? graph[item][attribute].value  :fnum(graph[item][attribute].value) || '$0'
                            }
                            return out
                        },{}))
                }
            })
            let femaDisasterData = get(this.props.falcorCache,['fema','disasters','byId',window.location.pathname.split("/")[3]],null)
            if(femaDisasterData){
                stat_boxes.forEach(d =>{
                    if(d && d.value !== 'total_funds' && femaDisasterData[d.value]){
                        d.amount  = parseFloat(femaDisasterData[d.value].value) || 0
                    }
                })
                total_funds = stat_boxes.reduce((a,c) =>{
                    if(c.value !== 'total_funds'){
                        a += c.amount
                    }
                    return a
                },0)
            }
            return data
        }
    }

    render(){
        let data = this.processData()
        return (
            <div className="w-full overflow-auto pt-8 focus:outline-none h-screen">
                <div className="container max-w-7xl mx-auto">
                    <h1>{data && data.length > 0? `${_.uniq(_.map(data, 'declaration_title')).join(",")} - ${_.uniq(_.map(data, 'state')).join(",")}` : 'Loading'}</h1>
                    <div className="mt-5 grid grid-cols-8 gap-5 sm:grid-cols-8 py-5">
                        {stat_boxes.map((stat_box,i) =>{
                            return(
                                <div className="bg-white overflow-hidden shadow rounded-lg"  key={i}>
                                    <div className="px-4 py-5 sm:p-6">
                                        <dl>
                                            <dt className="text-sm leading-5 font-medium text-gray-500 break-words">
                                                {stat_box.name}
                                            </dt>
                                            <dd className="mt-1 text-3xl leading-9 font-semibold text-gray-900">
                                                {
                                                    stat_box.value !== 'total_funds' ?
                                                        stat_box.value.includes('number') ?
                                                            fmt(stat_box.amount) :
                                                            fnum(stat_box.amount):
                                                        fnum(total_funds)
                                                }
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                    <div>
                        {data && data.length > 0 ?
                            <Table
                                defaultPageSize={10}
                                showPagination={false}
                                columns={tableCols}
                                data={data}
                                initialPageSize={10}
                                minRows={data.length}
                                sortBy={'declaration_date'}
                                sortOrder={'desc'}
                            />
                            :
                            <div>
                                Loading ....
                            </div>
                        }
                    </div>
                    <div>
                        <Header title={'Individual And Households Programs Valid Registration'}/>
                        <FemaDisastersIATotalsStatBoxes
                            disaster_number={[window.location.pathname.split("/")[3]]}
                        />
                    </div>
                    <div>
                        <Header title={'Public Assistance Funded Projects Details v1'}/>
                        <FemaDisastersPATotalsStatBoxes
                            disaster_number={[window.location.pathname.split("/")[3]]}
                        />
                    </div>
                    <div>
                        <Header title={'Hazard Mitigation Assistance Mitigated Properties v2'}/>
                        <FemaDisastersHMAMitigatedPropertiesTotalsStatBoxes
                            disaster_number={[window.location.pathname.split("/")[3]]}
                        />
                    </div>
                    <div>
                        <Header title={'Hazard Mitigation Assistance Mitigated Projects v2'}/>
                        <FemaDisastersHMAMitigatedProjectsTotalsStatBoxes
                            disaster_number={[window.location.pathname.split("/")[3]]}
                        />
                    </div>
                </div>
                <AvlMap
                    layers={[
                        this.FemaDisastersTotalsEventsLayer
                    ]}
                    height={'100%'}
                    center={[0, 0]}
                    zoom={4}
                    year={2018}
                    //hazards={this.props.hazards}
                    fips={''}
                    styles={[
                        {name: 'Blank', style: 'mapbox://styles/am3081/ckaml4r1e1uip1ipgtx5vm9zk'}
                    ]}
                    sidebar={false}
                    attributes={false}
                    layerProps={{
                        [this.FemaDisastersTotalsEventsLayer.name]: {
                            disaster_number: window.location.pathname.split("/")[3],
                            active_amount : this.props.activeAmount ? this.props.activeAmount : 'ihp_amount',
                        }
                    }}
                />
            </div>


        )
    }
}

const mapStateToProps = (state) => {
    return {
        activeAmount:state.femaDisasterDeclarations.activeAmount,
        activeStateGeoid : state.stormEvents.activeStateGeoid,
        activeStateAbbrev : state.stormEvents.activeStateAbbrev,
        graph: state.graph,
        hazards: get(state.graph, 'riskIndex.hazards.value', [])
    };
};
const mapDispatchToProps = {
};


export default [
    {
        path: '/fema_disasters/disaster/:disasterId',
        mainNav: false,
        exact: false,
        name: 'Disaster Declaration',
       
        layoutSettings: {
            fixed: true,
            maxWidth: '',//'max-w-7xl',
            headerBar: false,
            nav: 'top',
            theme: shmp,
        },
        component: connect(mapStateToProps,mapDispatchToProps)(reduxFalcor(FemaDisasterDeclarations))
            
    }

]
