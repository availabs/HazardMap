import React from "react"
import MapLayer from "components/AvlMap/MapLayer"
import {MapSources,MapStyles} from './components/mapLayers'
import {falcorGraph} from "store/falcorGraphNew"
import get from "lodash.get"
import hazardcolors from "../../constants/hazardColors";
import * as d3scale from 'd3-scale'
import * as d3 from 'd3'
import { fnum, /*fnumClean*/} from "utils/sheldusUtils"
import { extent } from "d3-array"
import * as turf from '@turf/turf'
// import { connect } from 'react-redux';
import {reduxFalcor} from "utils/redux-falcor-new";
import {setActiveStateGeoid} from "store/modules/stormEvents";


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


    onPropsChange(oldProps, newProps) {

        if (this.filters.year.value !== newProps.year) {
            this.filters.year.value = newProps.year ?
                [newProps.year] : newProps.year ? newProps.year : null
            console.log('map year update',newProps.year)
            this.doAction(["fetchLayerData"]);
        }
        if (oldProps.hazard !== newProps.hazard) {
            hazard = newProps.hazard
            this.filters.hazard.value = newProps.hazard || 'riverine'
            console.log('map hazard update',newProps.hazard)
            this.doAction(["fetchLayerData"]);
        }
        if(oldProps.fips !== newProps.fips){
            state_fips = newProps.fips
            console.log('map fips update',newProps.fips)
            this.doAction(["fetchLayerData"]);
        }
        if(oldProps.geography !== newProps.geography){
            this.filters.geography.value = newProps.geography
            console.log('map fips update',newProps.geography)
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
                if(this.filtered_geographies.length){
                    falcorGraph.get(['geo',this.filtered_geographies,['name']])
                }
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
                    falcorGraph.get(
                        ['severeWeather', this.filtered_geographies, this.filters.hazard.value, this.filters.year.value, ['total_damage', 'num_episodes','property_damage','crop_damage',
                            'num_episodes','num_events','state','state_fips','injuries', 'fatalities']],

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
        //let lossDomain = Object.values(lossByFilteredGeoids).sort((a, b) => a - b)

        // let domain = [0, d3.quantile(lossDomain, 0), d3.quantile(lossDomain, 0.25), d3.quantile(lossDomain, 0.5),
        //     d3.quantile(lossDomain, 0.75), d3.quantile(lossDomain, 1)]
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
                //this.infoBoxes.overview.show = true
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
        popover: {
            layers: ['counties','state'],
            pinned:false,
            dataFunc: function (d) {
                const {properties} = d
                let graph = falcorGraph.getCache()
                return [
                    [   (<div className='text-sm text-bold text-left'>
                        {`${get(graph,['geo',d.properties.county_fips,'name'],'')},${get(properties,['state_abbrev'],'')}`}
                        </div>)
                    ],
                    [   (<div className='text-xs text-gray-500 text-left'>
                        {this.filters.year.value.toString().replace('allTime','1996-2019')}
                        </div>)
                    ],
                    [
                        (
                            <table className="min-w-full divide-y divide-gray-200">
                                <tbody className="bg-white divide-y divide-gray-200">
                                <tr className="bg-white">
                                    <td className="px-6 py-3 whitespace-no-wrap text-xs text-left leading-5 font-medium text-gray-900">
                                        Property Damage
                                    </td>
                                    <td className="px-6 py-3 whitespace-no-wrap text-xs leading-5 text-gray-500">
                                        {fnum(get(graph,['severeWeather',d.properties.county_fips,this.filters.hazard.value,this.filters.year.value,'property_damage'],'0'))}
                                    </td>
                                </tr>
                                <tr className="bg-gray-50">
                                    <td className="px-6 py-3 whitespace-no-wrap text-xs text-left leading-5 font-medium text-gray-900">
                                        Crop Damage
                                    </td>
                                    <td className="px-6 py-3 whitespace-no-wrap text-xs leading-5 text-gray-500">
                                        {fnum(get(graph,['severeWeather',d.properties.county_fips,this.filters.hazard.value,this.filters.year.value,'crop_damage'],'0'))}
                                    </td>
                                </tr>
                                <tr className="bg-white">
                                    <td className="px-6 py-3 whitespace-no-wrap text-xs text-left leading-5 font-medium text-gray-900">
                                        Injuries
                                    </td>
                                    <td className="px-6 py-3 whitespace-no-wrap text-xs leading-5 text-gray-500">
                                        {fmt(get(graph,['severeWeather',d.properties.county_fips,this.filters.hazard.value,this.filters.year.value,'injuries'],'0'))}
                                    </td>
                                </tr>
                                <tr className="bg-gray-50">
                                    <td className="px-6 py-3 whitespace-no-wrap text-xs text-left leading-5 font-medium text-gray-900">
                                        Fatalities
                                    </td>
                                    <td className="px-6 py-3 whitespace-no-wrap text-xs leading-5 text-gray-500">
                                        {fmt(get(graph,['severeWeather',d.properties.county_fips,this.filters.hazard.value,this.filters.year.value,'fatalities'],'0'))}
                                    </td>
                                </tr>
                                </tbody>
                            </table>

                        )
                    ]
                ]
            }
        },
        onHover: {
            layers: ['counties'],
            dataFunc: function(d) {
                let map = this.map
                map.on('mousemove', 'county-boundaries', () =>{
                    map.setPaintProperty(
                        'county-boundaries',
                        'line-color',
                        ["case",
                            ["==", ['get', 'county_fips'], d[0].properties.county_fips || null],
                            'rgba(0,0,0,100)',
                            'rgba(0,0,0,0)'
                        ]
                    );
                })
                map.on('mouseleave', 'county-boundaries', () => {
                    map.setPaintProperty(
                        'county-boundaries',
                        'line-color',
                        'rgba(0,0,0,0)'
                    );
                })
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
        sources: MapSources,
        layers: MapStyles,
    
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
       
        // infoBoxes:{
        //     overview:{
        //         title:"",
        //         comp:(props)  =>{
        //             return (
        //                 <ControlBase
        //                     layer={props}
        //                     state_fips = {props.layer.state_fips}
        //                     state_name = {props.layer.state_name}
        //                 />
        //             )
        //         },
        //         show:true
        //     }
        // },
        state_fips: null,
        state_name : null,

    })


