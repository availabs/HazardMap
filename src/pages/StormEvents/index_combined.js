import React,{useState} from 'react';
import {connect} from 'react-redux';
import {reduxFalcor} from "@availabs/avl-components/dist/redux-falcor";
import get from 'lodash.get';
import {setActiveStateGeoid} from "store/modules/stormEvents";
import {shmp} from 'pages/components/shmp-theme.js'
import {withRouter} from "react-router";
import {stormEventsData} from "./DataFetching/StormEventsDataFecthing";
import {sbaData} from "./DataFetching/SBADataFetching";
import {femaDisastersData} from "./DataFetching/FEMADisastersDataFetching";
import Legend from "./components/Legend";
import hazardcolors from "../../constants/hazardColors";
import {fnumClean} from "../../utils/sheldusUtils";
import StackedBarGraph from "../components/bar /stackedBarGraph";
import SlideOver from "./components/SlideOver";
import HazardListTable from "../components/listTable/hazardListTable";
import MapsLayerFactory from "./MapsLayer";
import AvlMap from "../../components/AvlMap";

const fips = ["01", "02", "04", "05", "06", "08", "09", "10", "11", "12", "13", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "40", "41", "42", "44", "45", "46", "47", "48", "49", "50", "51", "53", "54", "55", "56"]
let years = []
const start_year = 1996
const end_year = 2019
for (let i = start_year; i <= end_year; i++) {
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

class NationalLanding extends React.Component {
    MapsLayer = MapsLayerFactory({active: true});
    constructor(props) {
        super(props);
        // Don't call this.setState() here!
        this.state = {
            layer: 'Tracts Layer',
            year: 'allTime',
            hazard: 'riverine',
            select: {
                domain: [...years, 'allTime'],
                value: []
            },
            geography_storm : [{name : 'County',value : 'counties'},{name:'Municipality',value:'cousubs'},{name:'Tracts',value:'tracts'}],
            geography_sba : [{name : 'County',value : 'counties'},{name:'Zip Codes',value:'zip_codes'}],
            geography_filter : 'counties',
            data : [],
            fips_value : null,
            current_fips_name : "us",
            showModal : false,
            isLoading : true
        };
        this.handleChange = this.handleChange.bind(this)
    }

    /*componentDidUpdate(oldState,newState){
        if(oldState.fips_value !== this.state.fips_value){
            this.fetchFalcorDeps()
        }
        if(oldState.year !== this.state.year){
            this.fetchFalcorDeps()
        }
        if(oldState.hazard !== this.state.hazard){
            this.fetchFalcorDeps()
        }
    }*/
    setYear = (year) => {
        if (this.state.year !== year) {
            this.setState({year})
        } else {
            this.setYear('allTime')
        }

    }
    setHazard = (hazard) =>{
        if (this.state.hazard !== hazard) {
            this.setState({hazard})
        }
    }
    setGeography = (e) =>{
        if(this.state.geography_filter !== e.target.value){
            this.setState({ ...this.state, [e.target.id]: e.target.value })
        }
    }

    handleChange(e) {
        this.setState({ year: e })
    }

    async fetchFalcorDeps(){
        let geo_fips = this.state.fips_value ? this.state.fips_value : fips
        let geography = this.state.geography_filter === 'counties' ?  'counties': this.state.geography_filter
        if(this.props.match.params.datatype === 'stormevents'){
            this.data = await stormEventsData('map',['total_damage', 'num_episodes','property_damage','crop_damage','num_episodes','num_events','state','state_fips'],geo_fips,geography,this.state.hazard,this.state.year)
            this.setState({
                isLoading: false
            })
        }
        else if(this.props.match.params.datatype === 'sba'){

            this.data = await sbaData('map',['total_loss','loan_total','num_loans','state_abbrev'],geo_fips,geography,this.state.hazard,this.state.year)
            this.setState({
                isLoading: false
            })
        }
        else if(this.props.match.params.datatype === 'fema') {
            this.data = await femaDisastersData('map',[
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
            ],geo_fips,geography,this.state.hazard,this.state.year)
            this.setState({
                isLoading: false
            })
        }else{
            return Promise.resolve()
        }

        return this.data
    }

    render() {
        return (
            <div className='flex flex-col lg:flex-row h-screen box-border w-full -mt-4 fixed overflow-hidden'>
                <div className='flex-auto h-full order-last lg:order-none'>
                    <div className='h-full'>
                        <div className="mx-auto h-8 w-2/6 pt-20 z-90">
                            <Legend
                                title = {`Losses in each County from ${hazards.filter(d => d.value === this.state.hazard)[0].name}, ${this.state.year.replace('allTime', '1996-2019')}`}
                                type = {"threshold"}
                                range= {["#F1EFEF",...hazardcolors[this.state.hazard + '_range']]}
                                domain = {this.data ? this.data.domain : []}
                                format= {fnumClean}
                            />
                        </div>
                            <AvlMap
                                layers={[
                                    this.MapsLayer
                                ]}
                                height={'90%'}
                                center={[0, 0]}
                                zoom={4}
                                year={2018}
                                fips={''}
                                styles={[
                                    {name: 'Blank', style: 'mapbox://styles/am3081/ckaml4r1e1uip1ipgtx5vm9zk'}
                                ]}
                                sidebar={false}
                                attributes={false}
                                layerProps={{
                                    [this.MapsLayer.name]: {
                                        year: this.state.year,
                                        hazard : this.state.hazard,
                                        fips : this.state.fips_value ? this.state.fips_value : null,
                                        geography : this.state.geography_filter,
                                        dataType : this.props.match.params.datatype
                                    }
                                }}
                            />
                        <div className='absolute bottom-20 h-40 z-30 md:w-full md:px-12'>
                            <div className="text-xs absolute pt-8">Click on a bar to filter the data by year</div>
                            <StackedBarGraph
                                height={200}
                                data={{
                                    type: 'graph',
                                    data_type: this.props.match.params.datatype,
                                    category: this.props.match.params.datatype ==='sba' ? ['all'] : [""],
                                    columns: this.props.match.params.datatype === 'stormevents' ? ['total_damage'] :
                                        this.props.match.params.datatype === 'sba' ? ['total_loss'] : ["total_cost","total_cost_summaries"]
                                    ,
                                    data_columns : [
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
                                    ],
                                    sort: this.props.match.params.datatype !== 'fema' ? 'annualized_damage' : 'total_cost'
                                }}
                                setYear={this.setYear.bind(this)}
                                initialLoad={this.state.initialLoad}
                                hazard={this.state.hazard}
                                geoid={this.state.fips_value? this.state.fips_value : null}
                            />
                        </div>

                    </div>
                </div>
                <SlideOver
                    HeaderTitle={<div>
                        <div>{this.props.match.params.datatype === 'stormevents' ? `Storm Event Losses` : this.props.match.params.datatype === "sba" ? `SBA Loans`: "FEMA Disasters"}</div>
                        <label className="text-sm">Select a State</label>
                        <div className="relative">
                            <select
                                className="rounded-md w-full bg-transparent max-w-md"
                                onChange={(e) =>{
                                    let fips = e.target.value
                                    this.setState({
                                        fips_value: fips === 'National' ? null : fips
                                    })
                                }}
                            >
                                <option value={null}>National</option>
                                {this.data && !this.state.isLoading? this.data.fips_domain.map((d,i) =>{
                                    return(
                                        <option value={d.fips} key={i}>
                                            {d.name}
                                        </option>
                                    )
                                }):null}
                            </select>
                        </div>
                        {this.state.fips_value ?
                            <div>
                                <label className="text-sm">Select a Geography</label>
                                <select
                                    className="rounded-md w-full bg-transparent max-w-md"
                                    onChange={(e) =>{
                                        let filter = e.target.value
                                        this.setState({
                                            geography_filter: filter
                                        })
                                    }}
                                >
                                    { this.props.match.params.datatype === "sba" || this.props.match.params.datatype === "fema"? this.state.geography_sba.map((d,i) =>{
                                        return(
                                            <option value={d.value} key={i}>
                                                {d.name}
                                            </option>
                                        )
                                    }):
                                        this.state.geography_storm.map((d,i) =>{
                                            return(
                                                <option value={d.value} key={i}>
                                                    {d.name}
                                                </option>
                                            )
                                        })
                                    }
                                </select>
                            </div>

                            : null}
                    </div>}
                >
                    <HazardListTable
                        data={
                            {
                                type: 'table',
                                data_type:this.props.match.params.datatype,
                                category: this.props.match.params.datatype ==='sba' ? ['all'] : [""],
                                columns: this.props.match.params.datatype === 'stormevents' ? ['total_damage', 'annualized_damage', 'num_episodes'] :
                                    this.props.match.params.datatype === 'sba' ? ['total_loss', 'loan_total', 'num_loans'] : ["total_cost","total_cost_summaries"]
                                ,
                                data_columns : [
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
                                ],
                                header: this.props.match.params.datatype === 'stormevents' ? ['Damage','Yearly Avg Damage','# Episodes'] :
                                    this.props.match.params.datatype === 'sba' ? ['Total Loss',' $ Loan','# Loans'] : ['$ Total Cost','$ Total Cost Summaries']
                                ,
                                sort: this.props.match.params.datatype === 'stormevents' ? "annualized_damage" : this.props.match.params.datatype === "sba" ? "total_loss": "total_cost"}}
                        geoid={this.state.fips_value ? this.state.fips_value : null}
                        year={this.state.year}
                        setHazard={this.setHazard.bind(this)}
                        activeHazard={this.state.hazard}
                    />
                </SlideOver>
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
    setActiveStateGeoid
};
const ConnectedComponent = connect(mapStateToProps, mapDispatchToProps)(reduxFalcor(NationalLanding))

export default [
    {
        path: '/maps/:datatype',
        mainNav: false,
        exact: false,
        name: 'Maps',
        authed:false,
        component:withRouter(ConnectedComponent),
        layoutSettings: {
            fixed: true,
            maxWidth: '',//'max-w-7xl',
            headerBar: false,
            nav: 'top',
            theme: shmp,
        }
    },{
        path: '/maps/stormevents',
        mainNav: true,
        exact: true,
        name: 'Storm Events',
        authed:false,
        component:withRouter(ConnectedComponent),
        layoutSettings: {
            fixed: true,
            maxWidth: '',//'max-w-7xl',
            headerBar: false,
            nav: 'top',
            theme: shmp,
        }
    },
    {
        path: '/maps/sba',
        mainNav: true,
        exact: true,
        name: 'SBA',
        authed:false,
        component:withRouter(ConnectedComponent),
        layoutSettings: {
            fixed: true,
            maxWidth: '',//'max-w-7xl',
            headerBar: false,
            nav: 'top',
            theme: shmp,
        }
    },
    {
        path: '/maps/fema',
        mainNav: true,
        exact: true,
        name: 'fema',
        authed:false,
        component:withRouter(ConnectedComponent),
        layoutSettings: {
            fixed: true,
            maxWidth: '',//'max-w-7xl',
            headerBar: false,
            nav: 'top',
            theme: shmp,
        }
    }

    ]

