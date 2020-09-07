import React from "react"
import MapLayer from "components/AvlMap/MapLayer"
import {falcorGraph} from "store/falcorGraphNew"
import get from "lodash.get"
import store from "store"
import hazardcolors from "../../constants/hazardColors";
import * as d3scale from 'd3-scale'
import * as d3 from 'd3'
import { fnum } from "utils/sheldusUtils"
import { extent } from "d3-array"
import * as turf from '@turf/turf'
import { connect } from 'react-redux';
import {reduxFalcor} from "utils/redux-falcor-new";
import {setActiveStateGeoid} from "store/stormEvents";

var _ = require("lodash")
var format =  d3.format("~s")
const fmt = (d) => d < 1000 ? d : format(d)
const fips = ["01", "02", "04", "05", "06", "08", "09", "10", "11", "12", "13", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "40", "41", "42", "44", "45", "46", "47", "48", "49", "50", "51", "53", "54", "55", "56"]
const hazards = [
    {value: 'wind', name: 'Wind'},
    {value: 'wildfire', name: 'Wildfire'},
    {value: 'tsunami', name: 'Tsunami/Seiche'},
    {value: 'tornado', name: 'Tornado'},
    {value: 'riverine', name: 'Flooding'},
    {value: 'lightning', name: 'Lightning'},
    {value: 'landslide', name: 'Landslide'},
    {value: 'icestorm', name: 'Ice Storm'},
    {value: 'hurricane', name: 'Hurricane'},
    {value: 'heatwave', name: 'Heat Wave'},
    {value: 'hail', name: 'Hail'},
    {value: 'earthquake', name: 'Earthquake'},
    {value: 'drought', name: 'Drought'},
    {value: 'avalanche', name: 'Avalanche'},
    {value: 'coldwave', name: 'Coldwave'},
    {value: 'winterweat', name: 'Snow Storm'},
    {value: 'volcano', name: 'Volcano'},
    {value: 'coastal', name: 'Coastal Hazards'}
]

const start_year = 1996
const end_year = 2019
let years = []
for (let i = start_year; i <= end_year; i++) {
    years.push(i)
}
let hazard = null
let state_fips = null
let onLoadBounds = {}
class StormEventsLayer extends MapLayer {
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


    fetchData() {
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
                    console.log('filtered',this.filtered_geographies)
                    falcorGraph.get(
                        ['severeWeather', this.filtered_geographies, this.filters.hazard.value, this.filters.year.value, ['total_damage', 'num_episodes','property_damage','crop_damage','num_episodes','num_events','state','state_fips']],

                    ).then(response =>{
                        this.render(this.map)
                    })
                }
            })


    }

    getColorScale(domain) {
        this.legend.range = hazardcolors[this.filters.hazard.value + "_range"]
        switch (this.legend.type) {
            case "quantile":
                return d3scale.scaleQuantile()
                    .domain(domain)
                    .range(this.legend.range);
            case "quantize":
                this.legend.domain = extent(domain)
                return d3scale.scaleQuantize()
                    .domain(domain)
                    .range(this.legend.range);
            case "threshold": {
                this.legend.domain = domain
                return d3scale.scaleThreshold()
                    .domain(domain)
                    .range(this.legend.range)
            }
            default:
                this.layer.forceUpdate()
                return d3scale.scaleQuantile()
                    .domain(domain)
                    .range(this.legend.range);
        }
        

    }


    render(map) {
        let data = falcorGraph.getCache()
        let hazard = this.filters.hazard.value
        let year = this.filters.year.value
        let measure = 'total_damage'
        let sw = get(data, 'severeWeather', {})
        let geography = state_fips && !state_fips.includes("") ? this.filters.geography.value : 'counties'
        let lossByFilteredGeoids = Object.keys(sw)
            .reduce((a,c) =>{
                if(this.filtered_geographies){
                    this.filtered_geographies.filter(d => d !== '$__path').forEach(geo =>{
                        if(geo === c && get(sw[c], `${hazard}.${year}.${measure}`, false)){
                            a[c] = get(sw[c], `${hazard}.${year}.${measure}`, false)
                        }
                    })
                }
                return a
            },{})
        let lossDomain = Object.values(lossByFilteredGeoids).sort((a, b) => a - b)

        let domain = [0, d3.quantile(lossDomain, 0), d3.quantile(lossDomain, 0.25), d3.quantile(lossDomain, 0.5),
            d3.quantile(lossDomain, 0.75), d3.quantile(lossDomain, 1)]

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
        if(geography === "cousubs" && Object.keys(lossByFilteredGeoids).length > 0){
            map.setLayoutProperty('counties', 'visibility', 'none');
            map.setLayoutProperty('tracts', 'visibility', 'none');
            map.setLayoutProperty('cousubs', 'visibility', 'visible');
            map.setFilter('cousubs', ["all", ["match", ["get", "geoid"],this.filtered_geographies, true, false]])
            map.setPaintProperty(
                'cousubs',
                'fill-color',
                ['case',
                    ["has", ["to-string", ["get", 'geoid']], ["literal", colors]],
                    ["get", ["to-string", ["get", 'geoid']], ["literal", colors]],
                    "hsl(0, 3%, 94%)"
                ]
            )
        }
        if(geography === "tracts" && Object.keys(lossByFilteredGeoids).length > 0){
            map.setLayoutProperty('cousubs', 'visibility', 'none');
            map.setLayoutProperty('counties', 'visibility', 'none');
            map.setLayoutProperty('tracts', 'visibility', 'visible');
            map.setFilter('tracts', ["all", ["match", ["get", "geoid"],this.filtered_geographies, true, false]])
            map.setPaintProperty(
                'tracts',
                'fill-color',
                ['case',
                    ["has", ["to-string", ["get", 'geoid']], ["literal", colors]],
                    ["get", ["to-string", ["get", 'geoid']], ["literal", colors]],
                    "hsl(0, 3%, 94%)"
                ]
            )
        }
        if(geography === "counties" && Object.keys(lossByFilteredGeoids).length > 0){
            map.setLayoutProperty('cousubs', 'visibility', 'none');
            map.setLayoutProperty('tracts', 'visibility', 'none');
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
                window.history.pushState({state: '2'}, "state", `/stormevents/state/${state_fips}`);
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
            map.setLayoutProperty('cousubs', 'visibility', 'none');
            map.setLayoutProperty('tracts', 'visibility', 'none');
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
    new StormEventsLayer("Storm Events", {
        ...props,
        selectedStations: new Map(),
        stationFeatures: [],
        popover: {
            layers: ["states","counties","cousubs","tracts"],
            pinned:false,
            dataFunc: function (d) {
                const {properties} = d
                let fips = ''
                let fips_name = ''
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
                if(fips){
                    falcorGraph.get(['severeWeather',fips,this.filters.hazard.value, this.filters.year.value, ['total_damage', 'num_episodes','property_damage','fatalities']],
                            ['geo',fips,'name']
                        )
                        .then(response =>{
                            return response
                        })
                }


                return [
                    [   (<div className='text-lg text-bold bg-white'>
                        {fips_name !== '' ? fips_name : get(falcorGraph.getCache(),['geo',fips,'name'],'')} - {this.filters.year.value}
                        </div>)
                    ],
                    [   (<div className='text-sm bg-white'>
                        Total Damage : {fnum(get(falcorGraph.getCache(),['severeWeather',fips,this.filters.hazard.value,this.filters.year.value,'total_damage'],0))}
                        </div>)
                    ],
                    [
                        (<div className='text-sm bg-white'>
                        Property Damage : {fnum(get(falcorGraph.getCache(),['severeWeather',fips,this.filters.hazard.value,this.filters.year.value,'property_damage'],0))}
                        </div>)
                    ],
                    [
                        (<div className='text-sm bg-white'>
                            # Episodes : {fmt(get(falcorGraph.getCache(),['severeWeather',fips,this.filters.hazard.value,this.filters.year.value,'num_episodes'],0))}
                        </div>)
                    ],
                    [
                    (<div className='text-sm bg-white'>
                        # Deaths : {fmt(get(falcorGraph.getCache(),['severeWeather',fips,this.filters.hazard.value,this.filters.year.value,'fatalities'],0))}
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
            format: fnum
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
                domain: [...years, 'allTime']
            },
            'hazard': {
                type: 'dropdown',
                value: 'riverine',
                domain: hazards
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
                "id": "cousubs",
                "type": "fill",
                "source": "albersusa_cousubs",
                "source-layer": "albersusa_cousubs",
                "filter": ["match", ["get", "type"],["geoid"],true, false],
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
                "id": "tracts",
                "type": "fill",
                "source": "albersusa_tracts",
                "source-layer": "albersusa_tracts",
                "filter": ["match", ["get", "type"],["geoid"],true, false],
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
