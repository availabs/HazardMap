import React  from 'react';
import {connect} from 'react-redux';
import {reduxFalcor} from "utils/redux-falcor-new";
import get from 'lodash.get';
import config from './components/config'
import {withRouter} from "react-router";
import {stormEventsData} from "./DataFetching/StormEventsDataFecthing";
import {sbaData} from "./DataFetching/SBADataFetching";
import {femaDisastersData} from "./DataFetching/FEMADisastersDataFetching";
import Legend from "./components/Legend";
import hazardcolors from "../../constants/hazardColors";
import {fnumClean} from "../../utils/sheldusUtils";
import StackedBarGraph from "../components/bar/stackedBarGraph";
import SlideOver from "./components/SlideOver";
import HazardListTable from "../components/listTable/hazardListTable";
import MapsLayerFactory from "./MapsLayer";
import AvlMap from "../../components/AvlMap";



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
                domain: [...config['years'], 'allTime'],
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

    componentDidUpdate(oldProps,oldState){
        if(this.state.hazard !== oldState.hazard){
            this.fetchFalcorDeps()
        }
        if(this.state.fips_value !== oldState.fips_value){
            this.fetchFalcorDeps()
        }
        if(this.state.year !== oldState.year){
            this.fetchFalcorDeps()
        }
        if(this.props.match.params.datatype !== oldProps.match.params.datatype){
            this.fetchFalcorDeps()
        }
        if(this.state.geography_filter !== oldState.geography_filter){
            this.fetchFalcorDeps()
        }
    }

    fetchFalcorDeps(){
        switch (this.props.match.params.datatype) {
            case 'sba':
                return sbaData('map',config[this.props.match.params.datatype].data_columns,this.state.fips_value,this.state.geography_filter,this.state.hazard,this.state.year)
            case 'stormevents':
                return stormEventsData('map',config[this.props.match.params.datatype].data_columns,this.state.fips_value,this.state.geography_filter,this.state.hazard,this.state.year)// "" is for the whole country
            case 'fema':
                return femaDisastersData('map',config[this.props.match.params.datatype].data_columns,this.state.fips_value,this.state.geography_filter,this.state.hazard,this.state.year)
            default:
                return Promise.resolve({})
        }


    }

    processFipsDomain(){
        const geoFipsData = get(this.props.falcorCache,['geo'],null)
        let domain = []
        if(geoFipsData){
            domain = Object.keys(geoFipsData).filter(d => d!=='$__path')
                .reduce((out, state) => {
                    if(config.fips.includes(state)){
                        out.push({
                            'fips':state,
                            'name': geoFipsData[state].name || ''
                        })
                    }
                    return out
                }, [])
        }

        return domain
    }

    render() {

        return (
            <div className='flex flex-col lg:flex-row h-screen box-border w-full -mt-4 fixed overflow-hidden'>
                <div className='flex-auto h-full order-last lg:order-none'>
                    <div className='h-full'>
                        <div className="mx-auto h-8 w-2/6 pt-20 z-90">
                            <Legend
                                title = {`Losses in each County from ${config['Hazards'].filter(d => d.value === this.state.hazard)[0].name}, ${this.state.year.replace('allTime', '1996-2019')}`}
                                type = {"threshold"}
                                range= {["#F1EFEF",...hazardcolors[this.state.hazard + '_range']]}
                                domain = {this.state.geography === 'counties' ? config[this.props.match.params.datatype].counties_domain : config[this.props.match.params.datatype].other_domain}
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
                                        dataType : this.props.match.params.datatype,
                                        falcorCache: this.props.falcorCache
                                    }
                                }}
                            />
                        <div className='absolute bottom-20 h-40 z-30 md:w-full md:px-12'>
                            <div className="text-xs absolute pt-8">Click on a bar to filter the data by year</div>
                            <StackedBarGraph
                                height={200}
                                type={'graph'}
                                data_type={this.props.match.params.datatype}
                                setYear={this.setYear.bind(this)}
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
                        {this.processFipsDomain() ? <div className="relative">
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
                                {this.processFipsDomain() ? this.processFipsDomain().map((d,i) =>{
                                    return(
                                        <option value={d.fips} key={i}>
                                            {d.name}
                                        </option>
                                    )
                                }):null}
                            </select>
                        </div> : null}

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
                        type={'table'}
                        data_type={this.props.match.params.datatype}
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
        falcorCache: state.falcorCache,
    };
};
const mapDispatchToProps = {

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
            nav: 'top'
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
            headerBar: true,
            nav: 'top'
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
            headerBar: true,
            nav: 'top'
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
            headerBar: true,
            nav: 'top'
        }
    }

    ]

