import React from "react"
import MapLayer from "components/AvlMap/MapLayer"
import {falcorGraph} from "store/falcorGraphNew"
import get from "lodash.get"
import hazardcolors from "../../../constants/hazardColors";
import * as d3scale from 'd3-scale'
import * as d3 from 'd3'
import { fnum } from "utils/sheldusUtils"
import * as turf from '@turf/turf'
import { connect } from 'react-redux';
import {reduxFalcor} from "utils/redux-falcor-new";
import {setActiveStateGeoid} from "../../../store/modules/stormEvents";


var format =  d3.format("~s")
const fmt = (d) => d < 1000 ? d : format(d)
const fips = ["01", "02", "04", "05", "06", "08", "09", "10", "11", "12", "13", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "40", "41", "42", "44", "45", "46", "47", "48", "49", "50", "51", "53", "54", "55", "56"]
let onLoadBounds = {}
let hazard = null
let state_fips = null
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

class femaDisastersCombinedTotalCostEventsLayer extends MapLayer {
    receiveProps(oldProps, newProps) {
        if (this.filters.year.value !== newProps.year) {
            this.filters.year.value = newProps.year ?
                [newProps.year] : newProps.year ? newProps.year : null;
        }
        if (oldProps.hazard !== newProps.hazard) {
            hazard = newProps.hazard
            this.filters.hazard.value = newProps.hazard
        }
        if (oldProps.fips !== newProps.fips) {
            state_fips = newProps.fips
        }
        if(oldProps.geography !== newProps.geography){
            this.filters.geography.value = newProps.geography
        }

    }


    onPropsChange(oldProps, newProps) {
        if (this.filters.year.value !== newProps.year) {
            this.filters.year.value = newProps.year ?
                [newProps.year] : newProps.year ? newProps.year : null
            this.doAction(["fetchLayerData"]);
        }
        if (oldProps.hazard !== newProps.hazard) {
            hazard = newProps.hazard
            this.filters.hazard.value = newProps.hazard || 'riverine'
            this.doAction(["fetchLayerData"]);
        }
        if(oldProps.fips !== newProps.fips){
            state_fips = newProps.fips
            this.doAction(["fetchLayerData"]);
        }
        if(oldProps.geography !== newProps.geography){
            this.filters.geography.value = newProps.geography
            this.doAction(["fetchLayerData"]);
        }

    }
    onAdd(map) {
        this.map = map

        falcorGraph.get(
            ['geo', fips,'counties', 'geoid'],
        )
            .then(response => {
                this.filtered_geographies = Object.values(response.json.geo)
                    .reduce((out, state) => {
                        if (state.counties) {
                            out = [...out, ...state.counties]
                        }
                        return out
                    }, [])
                onLoadBounds = map.getBounds()
                this.fetchData().then(d => this.render(this.map))
            })

    }

    fetchData(){
        if (this.filtered_geographies.length === 0) {
            return Promise.resolve()
        }
        if (hazard) {
            this.filters.hazard.value = hazard
        }
        let geo_fips = state_fips && !state_fips.includes("") ? state_fips : fips
        let geography = state_fips && !state_fips.includes("") ? this.filters.geography.value : 'counties'
        return falcorGraph.get(['geo',geo_fips,geography,'geoid'])
            .then(response =>{
                this.filtered_geographies = Object.values(response.json.geo)
                    .reduce((out, state) => {
                        if (state[geography]) {
                            out = [...out, ...state[geography]]
                        }
                        return out
                    }, [])
                if(this.filtered_geographies.length > 0){
                    console.time('response')
                    return falcorGraph.get(['fema','disasters',this.filtered_geographies,this.filters.hazard.value,this.filters.year.value,FEMA_COUNTY_ATTRIBUTES])
                        .then(response =>{
                            console.timeEnd('response')
                            return response
                        })
                }
            })

    }

    render(map){
        let data = get(falcorGraph.getCache(),['fema','disasters'],{})
        let hazard = this.filters.hazard.value
        let year = this.filters.year.value
        let measure = 'total_cost'
        let geography = state_fips && !state_fips.includes("") ? this.filters.geography.value : 'counties'
        let lossByFilteredGeoids = Object.keys(data)
            .reduce((a,c) =>{
                if(this.filtered_geographies){
                    this.filtered_geographies.filter(d => d !== '$__path').forEach(geo =>{
                        if(geo === c && get(data[c], `${hazard}.${year}.${measure}.value`, false)){
                            a[c] = get(data[c], `${hazard}.${year}.${measure}.value`, false)
                        }
                    })
                }
                return a
            },{})
        //let lossDomain = Object.values(lossByFilteredGeoids).sort((a, b) => a - b)

        /*let domain = [0, d3.quantile(lossDomain, 0), d3.quantile(lossDomain, 0.25), d3.quantile(lossDomain, 0.5),
            d3.quantile(lossDomain, 0.75), d3.quantile(lossDomain, 1)]*/
        let domain = [1000000,5000000,10000000,100000000,1000000000,10000000000]

        let range = ["#F1EFEF", ...hazardcolors[this.filters.hazard.value + '_range']]

        this.legend.domain = domain
        this.legend.range = range
        let colorScale = d3scale.scaleThreshold()
            .domain(domain)
            .range(
                range //["#f2efe9", "#fadaa6", "#f7c475", "#f09a10", "#cf4010"]
            )
        let colors = Object.keys(lossByFilteredGeoids)
            .reduce((a, c) => {
                a[c] = colorScale(lossByFilteredGeoids[c])
                return a
            }, {})
        if(geography === "counties" && Object.keys(lossByFilteredGeoids).length > 0){
            /*map.setLayoutProperty('cousubs', 'visibility', 'none');
            map.setLayoutProperty('tracts', 'visibility', 'none');*/
            map.setLayoutProperty('counties', 'visibility', 'visible');
            map.setFilter('counties', ["all", ["match", ["get", "county_fips"],this.filtered_geographies, true, false]])
            map.setPaintProperty(
                'counties',
                'fill-color',
                ['case',
                    ["has", ["to-string", ["get", 'county_fips']], ["literal", colors]],
                    ["get", ["to-string", ["get", 'county_fips']], ["literal", colors]],
                    "hsl(0, 3%, 94%)"
                ]
            )
        }
        map.on('click',(e, layer)=> {
            let relatedFeatures = map.queryRenderedFeatures(e.point, {
                layers: ['states']
            });
            if(relatedFeatures[0]){
                let state_fips = relatedFeatures.reduce((a, c) => {
                    a = c.properties.state_fips

                    return a
                }, '')
                let state_name = relatedFeatures.reduce((a, c) => {
                    a = c.properties.state_name
                    return a
                }, '')
                this.state_fips = state_fips
                this.state_name = state_name
                this.infoBoxes.overview.show = true
                map.setFilter("states",["all",
                    ["match", ["get", "state_fips"],[state_fips],true,false]
                ])
                map.setFilter('counties', ["all", ["match", ["get", "county_fips"],this.filtered_geographies, true, false]])
                map.fitBounds(turf.bbox(relatedFeatures[0].geometry))
                this.forceUpdate()
            }
        })
        if(state_fips && state_fips.includes("")){
            this.state_fips = ""
            this.state_name = ""
            map.setFilter('states',undefined)
            /*map.setLayoutProperty('cousubs', 'visibility', 'none');
            map.setLayoutProperty('tracts', 'visibility', 'none');*/
            map.setLayoutProperty('counties', 'visibility', 'visible');
            map.setPaintProperty(
                'counties',
                'fill-color',
                ['case',
                    ["has", ["to-string", ["get", 'county_fips']], ["literal", colors]],
                    ["get", ["to-string", ["get", 'county_fips']], ["literal", colors]],
                    "hsl(0, 3%, 94%)"
                ]
            );
            map.fitBounds(onLoadBounds)
            this.forceUpdate()
        }
    }
}

export default (props = {}) =>
    new femaDisastersCombinedTotalCostEventsLayer("Fema Disasters Combined Events", {
        ...props,
        selectedStations: new Map(),
        stationFeatures: [],
        popover: {
            layers: ["states","counties"],
            pinned:false,
            dataFunc: function (d) {
                const {properties} = d
                let graph = get(falcorGraph.getCache(),['fema','disasters'],{})
                let fips = null
                let fips_name = ''
                let total_cost = 0
                let total_disasters = 0
                if(state_fips){
                    if(!state_fips.includes("")){
                        if(this.filters.geography.value === 'counties'){
                            fips = properties.county_fips ? properties.county_fips : ''
                            fips_name = properties.county_name ? properties.county_name : ''
                        }else{
                            fips = properties.geoid ? properties.geoid : ''
                            fips_name = ''
                        }
                    }else{
                        fips = properties.state_fips ? properties.state_fips : ''
                        fips_name = properties.state_name ? properties.state_name : ''
                    }
                }else{
                    fips = properties.state_fips ? properties.state_fips : ''
                    fips_name = properties.state_name ? properties.state_name : ''
                }
                if(fips.length > 2){
                    total_cost = Object.keys(graph).reduce((a,c) =>{
                        if(c === fips){
                            a += parseFloat(get(graph,[fips,this.filters.hazard.value,this.filters.year.value,'total_cost','value'],0))
                        }
                        return a
                    },0)
                    total_disasters = Object.keys(graph).reduce((a,c) =>{
                        if(c === fips){
                            a += parseFloat(get(graph,[fips,this.filters.hazard.value,this.filters.year.value,'total_disasters','value'],0))
                        }
                        return a
                    },0)
                }else{
                    total_cost = Object.keys(graph).reduce((a,c) =>{
                        if(c.slice(0,2) === fips){
                            a += parseFloat(get(graph,[c,this.filters.hazard.value,this.filters.year.value,'total_cost','value'],0))
                        }
                        return a
                    },0)
                    total_disasters = Object.keys(graph).reduce((a,c) =>{
                        if(c.slice(0,2) === fips){
                            a += parseFloat(get(graph,[c,this.filters.hazard.value,this.filters.year.value,'total_disasters','value'],0))
                        }
                        return a
                    },0)
                }
                return [
                    [   (<div className='text-lg text-bold bg-white'>
                        {fips_name !== '' ? fips_name : get(falcorGraph.getCache(),['geo',fips,'name'],'')} - {this.filters.year.value}
                        </div>)
                    ],
                    [   (<div className='text-sm bg-white'>
                        $ Total Cost: {fnum(total_cost)}
                        </div>)
                    ],
                    [
                        (<div className='text-sm bg-white'>
                            # Episodes : {fmt(total_disasters)}
                        </div>)
                    ]
                ]
            }
        },
        showAttributesModal: false,
        legend: {
            title: 'Total Damage',
            type: "threshold",
            types: ["threshold", "quantile", "quantize","linear"],
            vertical: false,
            range: [],
            active: false,
            domain: [],

        },
        sources: [
            {
                id: "composite",
                source: {
                    "url": "mapbox://lobenichou.albersusa,lobenichou.albersusa-points",
                    "type": "vector"
                }
            },
            {
                id: "albersusa",
                source: {
                    "url": "mapbox://lobenichou.albersusa",
                    "type": "vector"
                }
            },
            {
                id:'albersusa_cousubs',
                source:{
                    "url":"mapbox://am3081.8xwbxcmy",
                    "type":"vector"
                }
            },
            {
                id:'albersusa_tracts',
                source:{
                    "url":"mapbox://am3081.2n3as7pn",
                    "type":"vector"
                }
            }

        ],
        filters: {
            'year': {
                type: 'dropdown',
                value: 'allTime',
                domain: [ 'allTime']
            },
            'hazard': {
                type: 'dropdown',
                value: 'riverine',
                domain: []
            },
            'geography':{
                type:'dropdown',
                value : 'counties',
                domain : []
            }
        },
        layers: [
            {
                "id": "counties",
                "type": "fill",
                "source": "albersusa",
                "source-layer": "albersusa",
                "filter": ["match", ["get", "type"], ["county"], true, false],
                "layout": {},
                "paint": {
                    "fill-color": "hsl(0, 3%, 94%)",
                    "fill-opacity": [
                        "case",
                        ["boolean", ["feature-state", "hover"], false],
                        0,
                        1
                    ],
                    "fill-outline-color": [
                        "case",
                        ["boolean", ["feature-state", "hover"], false],
                        "hsl(0, 4%, 85%)",
                        "hsl(0, 4%, 85%)"
                    ],
                }
            },
            {
                "id": "states",
                "type": "fill",
                "source": "albersusa",
                "source-layer": "albersusa",
                "filter": ["match", ["get", "type"], ["state"], true, false],
                "layout": {
                },
                "paint": {
                    "fill-color": "rgba(0,0,0,0)",
                }
            },
            {
                "id": "state-boundaries",
                "type": "line",
                "source": "composite",
                "source-layer": "albersusa",
                "filter": ["match", ["get", "type"], ["state"], true, false],
                "layout": {},
                "paint": {"line-color": "hsl(0, 0%, 34%)", "line-width": 0.5}
            },
            {
                "id": "county-points",
                "type": "symbol",
                "source": "composite",
                "source-layer": "albersusa-points",
                "filter": ["match", ["get", "type"], ["county"], true, false],
                "layout": {
                    "text-field": ["to-string", ["get", "county_fips"]],
                    "text-font": ["Overpass Mono Bold", "Arial Unicode MS Regular"],
                    "visibility": "none"
                },
                "paint": {
                    "text-color": "hsl(0, 0%, 100%)",
                    "text-halo-color": "hsl(0, 0%, 6%)",
                    "text-halo-width": 1,
                    "text-opacity": ["step", ["zoom"], 0, 6, 1]
                }
            },
            {
                "id": "state-points",
                "type": "symbol",
                "source": "composite",
                "source-layer": "albersusa-points",
                "filter": ["match", ["get", "type"], ["state"], true, false],
                "layout": {
                    "text-field": ["to-string", ["get", "state_abbrev"]],
                    "text-font": ["Overpass Mono Bold", "Arial Unicode MS Regular"],
                },
                "paint": {
                    "text-color": "hsl(0, 0%, 0%)",
                    "text-opacity": ["step", ["zoom"], 1, 6, 0],
                    "text-halo-color": "hsl(0, 0%, 100%)",
                    "text-halo-width": 1
                }
            }
        ],
        infoBoxes:{
            overview:{
                title:"",
                comp:(props)  =>{
                    return (
                        <ControlBase
                            layer={props}
                            state_fips = {props.layer.state_fips}
                            state_name = {props.layer.state_name}
                        />
                    )
                },
                show:true
            }
        },
        state_fips: null,
        state_name : null,

    })

class NationalLandingControlBase extends React.Component{

    constructor(props) {
        super(props);
        this.state = {
            current_state_name : props.state_name,
            current_state_fips : props.state_fips
        }
    }

    componentDidUpdate(prevProps){
        if(this.props.state_fips !== prevProps.state_fips && this.props.state_name !== prevProps.state_name){
            this.props.setActiveStateGeoid([{state_fips: this.props.state_fips,state_name:this.props.state_name}])
        }


    }

    render(){
        return(
            <div>

            </div>
        )

    }

}

const mapStateToProps = (state, { id }) =>
    ({
        activeStateGeoid : state.stormEvents.activeStateGeoid
    });
const mapDispatchToProps = {
    setActiveStateGeoid,
};

const ControlBase = connect(mapStateToProps, mapDispatchToProps)(reduxFalcor(NationalLandingControlBase))
