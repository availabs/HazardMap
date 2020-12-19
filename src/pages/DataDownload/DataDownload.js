import React from "react";
import {connect} from "react-redux";
import {reduxFalcor} from "../../utils/redux-falcor-new";
import get from "lodash.get";
import {setActiveStateGeoid} from "../../store/modules/stormEvents";
import {CSVLink} from "react-csv";
import PromptModal from "./PromptModal";

const _ = require("lodash");
const fips = ["01", "02", "04", "05", "06", "08", "09", "10", "11", "12", "13", "15", "16", "17", "18", "19", "20", "21", "22", "23",
    "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "40", "41", "42", "44", "45", "46",
    "47", "48", "49", "50", "51", "53", "54", "55", "56","72","60","66","78"]
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
];

class DataDownload extends React.Component{
    constructor(props) {
        super(props);
        this.state={
            dataset : 'severeWeather',
            datasets :[{name : 'Severe Weather',value : 'severeWeather'},{name:'SBA',value:'sba'},{name:'FEMA Disasters',value:'fema'}],
            state_fips:null,
            county:'',
            geolevel: 'counties',
            geolevels:[{name : 'County',value : 'counties',disabled:false},{name:'Municipality',value:'cousubs',disabled:true},{name:'Tracts',value:'tracts',disabled:true}],
            geolevels_sba:[{name : 'County',value : 'counties',disabled:false},{name:'Zip Codes',value:'zip_codes',disabled:true}],
            hazard: new Map(),
            user_hazards :[],
            data: [],
            loading:false,
            changed: false

        }
        this.onChange = this.onChange.bind(this)
    }


    onChange(e){
        console.log('---',e.target.id,e.target.value,this.state);
        if(e.target.id === 'hazard'){
            const isChecked = e.target.checked
            let value = e.target.value
            const object  = this.state;
            if(value === 'all'){
                hazards.forEach(hazard =>{
                    this.setState({ hazard: object.hazard.set(hazard.value,isChecked) });
                })
            }else{
                this.setState({ hazard: object.hazard.set(value,isChecked) });
            }
            this.setState({
                user_hazards : Array.from(this.state.hazard, ([hazard, value]) => ({hazard, value}))
                    .reduce((a,c) =>{
                        if(c.value){
                            a.push(c.hazard)
                        }
                        return a
                    },[])
            })
        }else{
            /*if(e.target.id === 'geolevel'){
                console.log('check',e.target)
            }*/
            this.setState({ ...this.state, [e.target.id]: e.target.value });
        }
    }

    componentDidUpdate(prevProps,prevState,snapshot){
        if(this.state.dataset !== prevState.dataset
            || (this.state.state_fips !== prevState.state_fips)
            || (this.state.county !== prevState.county)
            || !_.isEqual(this.state.user_hazards,prevState.user_hazards)
            || this.state.geolevel !== prevState.geolevel
        ){
            this.setState({
                changed: true
            })
            this.fetchFalcorDeps().then(async d =>{
                const res = await this.processData()
                if(res.length >0){
                    this.setState({
                        loading : false,
                        data : res
                    })
                }
            })
        }
        if(this.state.loading){
            this.fetchFalcorDeps().then(async d =>{
                const res = await this.processData()
                if(res.length >0){
                    this.setState({
                        loading : false,
                        data : res,
                        changed:false
                    })
                }
            })
        }
        if(this.state.state_fips !== prevState.state_fips){
            this.setState({
                changed: true
            })
            this.countiesDataDropDown()
        }
    }

    fetchFalcorDeps(){
        const attributes = this.state.dataset === 'severeWeather' ? ['total_damage', 'num_episodes','property_damage','crop_damage','num_episodes','num_events'] :
            this.state.dataset === 'fema' ? [
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
                "total_cost_summaries",
                "total_disasters"
            ] : ['total_loss','loan_total','num_loans']
        return this.props.falcor.get(['geo',fips,'name'])
            .then(response =>{
                if(this.state.state_fips){
                    this.props.falcor.get(['geo',this.state.state_fips,'counties','geoid'])
                        .then(response =>{
                            this.counties = Object.values(response.json.geo)
                                .reduce((out, state) => {
                                    if (state.counties) {
                                        out = [...out, ...state.counties]
                                    }
                                    return out
                                }, [])
                            this.props.falcor.get(['geo',this.state.county !== '' ? this.state.county : this.counties,this.state.geolevel])
                                .then( async response =>{
                                    this.filtered_geo = Object.values(response.json.geo)
                                        .reduce((out, state) => {
                                            if (state[this.state.geolevel]) {
                                                out = [...out, ...state[this.state.geolevel]]
                                            }
                                            return out
                                        }, [])

                                    await this.props.falcor.get(['geo',this.filtered_geo,'name'])
                                    if(this.filtered_geo.length > 0 && this.state.dataset!== 'sba' && this.state.user_hazards.length && this.state.geolevel !== 'zip_codes'){
                                        let dataset =  this.state.dataset === 'fema' ? ['fema','disasters'] : [this.state.dataset]
                                            let chunks = _.chunk(this.filtered_geo,20)
                                            let disaster_requests = []
                                            chunks.forEach(chunk =>{
                                                disaster_requests.push([...dataset,chunk,this.state.user_hazards,[{
                                                    from: 1996,
                                                    to: 2019
                                                }], attributes])
                                            })
                                            return disaster_requests.reduce((a, c, cI) => a.then(() => {
                                                this.props.falcor.get(c)
                                                    .then(response =>{
                                                        return response
                                                    })
                                            }), Promise.resolve())
                                                .then(response =>{
                                                    return response
                                                })
                                    }
                                    if(this.state.dataset === 'sba' && this.state.user_hazards.length){
                                        if(this.state.geolevel === 'zip_codes' && this.state.county !== "") {
                                            this.props.falcor.get(['geo',this.state.county, 'byZip', ['zip_codes']])
                                                .then(async response =>{
                                                    this.zip_codes = Object.values(response.json.geo).reduce((out, geo) => {
                                                        if (geo.byZip) {
                                                            out = [...out, ...geo.byZip['zip_codes']]
                                                        }
                                                        return out
                                                    }, [])
                                                    return await this.props.falcor.get([this.state.dataset,'all','byZip',this.zip_codes,this.state.user_hazards, [{
                                                        from: 1996,
                                                        to: 2018
                                                    }], attributes])
                                                })
                                        }
                                        else {
                                            let chunks = _.chunk(this.filtered_geo,20),requests = []
                                            chunks.forEach(chunk =>{
                                                requests.push([this.state.dataset, 'all',chunk, this.state.user_hazards, [{
                                                    from: 1996,
                                                    to: 2018
                                                }], attributes])
                                            })
                                            return requests.reduce((a, c, cI) => a.then(() => {
                                                this.props.falcor.get(c)
                                                    .then(response =>{
                                                        return response
                                                    })
                                            }), Promise.resolve())
                                                .then(response =>{
                                                    return response
                                                })
                                        }
                                    }
                                    if(this.state.dataset === 'fema' && this.state.geolevel === 'zip_codes' && this.state.county !== ""){
                                        this.props.falcor.get(['geo',this.state.county, 'byZip', ['zip_codes']])
                                            .then(async response =>{
                                                this.zip_codes = Object.values(response.json.geo).reduce((out, geo) => {
                                                    if (geo.byZip) {
                                                        out = [...out, ...geo.byZip['zip_codes']]
                                                    }
                                                    return out
                                                }, [])
                                                return await this.props.falcor.get(['fema','disasters','byZip',this.zip_codes,this.state.user_hazards, [{
                                                    from: 1996,
                                                    to: 2019
                                                }], attributes])
                                            })
                                    }
                                    return response
                                })
                            return response
                    })
                }
                return response
            })

    }

    statesDataDropDown(){
        let geo = get(this.props.falcorCache,['geo'],{})
        let states_data = []
        Object.keys(geo).filter(d => d !== '$__path')
            .forEach(d=>{
                if(fips.includes(d)){
                    states_data.push({
                        fips:d,
                        name:get(geo,[d,'name'],'')
                    })
                }

            })
        states_data = states_data.sort((a,b) => a.name.localeCompare(b.name))
        return states_data

    }

    countiesDataDropDown(){
        if(this.state.state_fips){
            let counties_data = []
            let counties = get(this.props.falcorCache,['geo'],{})
            Object.keys(counties).forEach(c=>{
                if(c.slice(0,2) === this.state.state_fips && c.length ===5){
                    counties_data.push({
                        value : c,
                        name: counties[c].name || ''
                    })
                }
            })
            counties_data = counties_data.sort((a,b) => a.name.localeCompare(b.name))
            return counties_data
        }
    }

    async processData(){
        let attributes = this.state.dataset === 'severeWeather' ? ['total_damage', 'num_episodes','property_damage','crop_damage','num_episodes','num_events'] :
            this.state.dataset === 'fema' ? [
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
                "total_cost_summaries",
                "total_disasters"
            ] : ['total_loss','loan_total','num_loans']
        let data = []
        let data_set = this.state.geolevel !== 'zip_codes' ?
            this.state.dataset === 'fema' ? `fema.disasters` : this.state.dataset :
            this.state.dataset === 'fema' ? `fema.disasters.byZip` : this.state.dataset
        let user_hazards = this.state.user_hazards
        let falcorCache = await this.props.falcorCache
        if(data_set !== 'sba' && hazards.length ){
            let fetchedData = get(falcorCache,data_set,{})
            Object.keys(fetchedData).filter(d => d!== '$__path').forEach(geo =>{
                user_hazards.forEach(hazard =>{
                    let d = get(fetchedData[geo],[hazard],{})
                    Object.keys(d).filter(d => d!=='$__path').forEach(item =>{

                        data.push(
                            attributes.reduce((a,c) =>{
                                a[c]= this.state.dataset === 'fema' ? get(fetchedData[geo], [hazard, item,c,'value'], 0):get(fetchedData[geo], [hazard, item,c], 0)
                                a['name'] = get(falcorCache,['geo',geo,'name'],'')
                                a['year'] = item
                                a['hazard'] = hazards.reduce((a,c) =>{
                                    if(c.value === hazard){
                                        a = c.name
                                    }
                                    return a
                                },'')
                                return a
                            },{})
                        )
                    })
                })
            })
        }
        if(data_set === 'sba' && hazards.length){
            let fetchedData = this.state.geolevel === 'zip_codes' ?
                get(falcorCache,[data_set,'all','byZip'],{}) :
                get(falcorCache,[data_set,'all'],{})
            Object.keys(fetchedData).filter(d => d!== '$__path').forEach(geo =>{
                user_hazards.forEach(hazard =>{
                    let d = get(fetchedData[geo],[hazard],{})
                    Object.keys(d).filter(d => d!=='$__path').forEach(item =>{
                        data.push(
                            attributes.reduce((a,c) =>{
                                a[c]= get(fetchedData[geo], [hazard, item,c], 0)
                                a['name'] = get(falcorCache,['geo',geo,'name'],geo)
                                a['year'] = item
                                a['hazard'] = hazards.reduce((a,c) =>{
                                    if(c.value === hazard){
                                        a = c.name
                                    }
                                    return a
                                },'')
                                return a
                            },{})
                        )
                    })
                })
            })

        }

        return data
    }

    downloadHandler(e){
        e.preventDefault();
        this.setState({
            loading: true
        })
    }


    render(){
        let states_data = this.statesDataDropDown() || []
        let counties_data = this.countiesDataDropDown() || []
        return (
            <form>
                <div className="w-full max-w-full ">
                    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                        <div>
                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                                Data Download
                            </h3>
                        </div>
                        <div className="mt-6 grid grid-cols-1 row-gap-6 col-gap-4 sm:grid-cols-6">
                            <div className="sm:col-span-6">
                                <label htmlFor="username" className="block text-sm font-medium leading-5 text-gray-700 flex-initial">
                                    Data Set <span className="text-red-600">*</span>
                                </label>
                                <div className="mt-1 flex rounded-md shadow-sm">
                                    <select
                                        className="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                        onChange={this.onChange.bind(this)}
                                        value = {this.state.dataset}
                                        id = 'dataset'
                                        required
                                    >
                                        {this.state.datasets.map((item,i) =>{
                                            return(
                                                <option key={i} value={item.value}>{item.name}</option>
                                            )
                                        })}
                                    </select>
                                </div>
                                <div className="text-red-600 text-xs">{this.state.dataset === "" ? 'Please select a dataset' :null}</div>
                            </div>
                            <div className="sm:col-span-6">
                                <label htmlFor="username" className="block text-sm font-medium leading-5 text-gray-700 flex-initial">
                                    State <span className="text-red-600">*</span>
                                </label>
                                <div className="mt-1 flex rounded-md shadow-sm">
                                    <select
                                        className="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                        onChange={this.onChange.bind(this)}
                                        value = {this.state.state_fips}
                                        id = 'state_fips'
                                    >
                                        <option key={0} value={""}>---Select a state---</option>
                                        {states_data.length > 0 ?states_data.map((item,i) =>{
                                            return(
                                                <option key={i+1} value={item.fips}>{item.name}</option>
                                            )
                                        })
                                        :
                                            null
                                        }
                                    </select>
                                </div>
                                <div className="text-red-600 text-xs">{!this.state.state_fips  ? 'Please select a State' :null}</div>
                            </div>
                            <div className="sm:col-span-6">
                                <label htmlFor="county" className="block text-sm font-medium leading-5 text-gray-700">
                                    County
                                </label>
                                <div className="mt-1 flex rounded-md shadow-sm">
                                    <select
                                        className="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                        onChange={this.onChange.bind(this)}
                                        value = {this.state.county}
                                        id = 'county'
                                    >
                                        <option key={0} value={""}>---Select all Counties---</option>
                                        {counties_data.length > 0 ? counties_data.map((item, i) => {
                                                return (
                                                    <option key={i + 1} value={item.value}>{item.name}</option>
                                                )
                                            })
                                            :
                                            null
                                        }
                                    </select>
                                </div>
                            </div>
                            <div className="sm:col-span-6">
                                <label htmlFor="username" className="block text-sm font-medium leading-5 text-gray-700 flex-initial">
                                    Geo Level
                                    <span className="text-red-600">
                                        *
                                    </span>
                                    <span style={{'float': 'right'}}
                                    >
                                        <PromptModal prompt={'Please select a county in order to enable the sub geolevels'} id={'geo_level'}/>
                                        </span>

                                </label>
                                <div className="mt-1 flex rounded-md shadow-sm">
                                    <select
                                        className="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                        onChange={this.onChange.bind(this)}
                                        value = {this.state.geolevel}
                                        id = 'geolevel'
                                        placeholder="Geo Level"
                                        required
                                    >
                                        <option key={0} value={""}>---Select a GeoLevel---</option>
                                        {this.state.dataset === 'severeWeather' ? this.state.geolevels.map((item,i) =>{
                                                return(
                                                    <option key={i+1} value={item.value}
                                                            disabled={item.value ==='counties' && this.state.county === "" ? false : this.state.county === "" }>
                                                        {item.name}
                                                    </option>
                                                )
                                            })
                                            :
                                            this.state.geolevels_sba.map((item,i) =>{
                                                return(
                                                    <option key={i+1}
                                                            value={item.value}
                                                            disabled={item.value ==='counties' && this.state.county === "" ? false : this.state.county === "" }
                                                    >{item.name}</option>
                                                )
                                            })
                                        }
                                    </select>
                                </div>
                                <div className="text-red-600 text-xs">{this.state.geolevel === "" ? 'Please select a Geolevel' :null}</div>
                            </div>
                            <div className="sm:col-span-6">
                                <div className="mt-6 ">
                                    <fieldset>
                                        <div className="relative flex items-start">
                                            <div className="flex items-center h-5">
                                                <legend className="text-base font-medium text-gray-900 flex-initial">
                                                    Hazards <span className="text-red-600">*</span>
                                                </legend>
                                                <input id="hazard" type="checkbox"
                                                       name={'all'}
                                                       value={'all'}
                                                       className="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out ml-2"
                                                       onChange={this.onChange.bind(this)}
                                                       checked={this.state.hazard.get(...hazards.map(d => d.value === true ? d.value: false))}
                                                ></input>
                                            </div>
                                            <div className="ml-3 text-sm leading-5">
                                                <label htmlFor="comments"
                                                       className="font-medium text-gray-700">Select All</label>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4">
                                            {hazards.map((hazard,i) =>{
                                                return (
                                                    <div className="mt-4" key={i}>
                                                        <div className="relative flex items-start">
                                                            <div className="flex items-center h-5">
                                                                <input id="hazard" type="checkbox"
                                                                       name={hazard.name}
                                                                       value={hazard.value}
                                                                       className="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                                                                       onChange={this.onChange.bind(this)}
                                                                       checked={this.state.hazard.get(hazard.value)}
                                                                ></input>
                                                            </div>
                                                            <div className="ml-3 text-sm leading-5">
                                                                <label htmlFor="comments"
                                                                       className="font-medium text-gray-700">{hazard.name}</label>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            }) }
                                        </div>
                                        <div className="text-red-600 text-xs">{this.state.hazard.size === 0 ? 'Please select at least one hazard' :null}</div>
                                    </fieldset>
                                </div>
                            </div>
                            <div className="sm:col-span-2">
                                <div className="flex justify">
                                    {_.isEmpty(this.state.data)  || this.state.changed ?
                                        <button
                                            onClick={this.downloadHandler.bind(this)}
                                            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center">

                                            <svg className="fill-current w-4 h-4 mr-2"
                                                 xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                                <path d="M13 8V2H7v6H2l8 8 8-8h-5zM0 18h20v2H0v-2z"/>
                                            </svg>
                                            <span>Export Data</span>
                                        </button>
                                        :
                                        <button
                                            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center">
                                            <svg className="fill-current w-4 h-4 mr-2"
                                                 xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                                <path d="M13 8V2H7v6H2l8 8 8-8h-5zM0 18h20v2H0v-2z"/>
                                            </svg>
                                            <CSVLink
                                                style={{width:'100%'}}
                                                data={this.state.data}
                                                filename={`${this.state.state_fips && this.state.state_fips !== ""  ? this.props.geoData[this.state.state_fips].name : ''}_${this.state.dataset}_${this.state.county!== "" ? this.props.geoData[this.state.county].name : 'all'}_${this.state.geolevel}.csv`}>
                                                Download CSV
                                            </CSVLink>
                                        </button>
                                    }

                                </div>
                                {this.state.loading ? 'Fetching Data ...' : null}
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        )
    }
}

const mapStateToProps = (state, ownProps) => {
    return {
        falcorCache: state.falcorCache,
        activeStateGeoid : state.stormEvents.activeStateGeoid,
        activeStateAbbrev : state.stormEvents.activeStateAbbrev,
        graph: state.graph,
        hazards: get(state.graph, 'riskIndex.hazards.value', []),
        geoData : get(state.falcorCache,'geo',{})
    };
};
const mapDispatchToProps = {
    setActiveStateGeoid
};

export default connect(mapStateToProps, mapDispatchToProps)(reduxFalcor(DataDownload))
