import React from "react"
import MapLayer from "components/AvlMap/MapLayer"
import {MapSources,MapStyles} from './components/mapLayers'
import {falcorGraph} from "store/falcorGraphNew"
import get from "lodash.get"
import hazardcolors from "../../constants/hazardColors";
import * as d3scale from 'd3-scale'
import { extent } from "d3-array"
import {stormEventsData} from "./DataFetching/StormEventsDataFecthing";
import {sbaData} from "./DataFetching/SBADataFetching";
import {femaDisastersData} from "./DataFetching/FEMADisastersDataFetching";

var d3Geo = require('d3-geo')
var R = 6378137.0 // radius of Earth in meters
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
const projections = {
    'albersUsa': d3Geo.geoAlbersUsa().translate([0, 0]).scale(R),
    'mercator' : d3Geo.geoMercator().translate([0, 0]).scale(R)
}
const point2Albers = (lng, lat) => {
    let data =  projections['mercator'].invert(projections['albersUsa']([lat,lng]))
    let out = data ? data : [0,0]
    return out
}

class MapsLayer extends MapLayer {
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
            this.filters.fips.value = newProps.fips || null
            this.doAction(["fetchLayerData"]);
        }
        if(oldProps.geography !== newProps.geography){
            this.filters.geography.value = newProps.geography
            this.doAction(["fetchLayerData"]);
        }
        if(this.filters.dataType.value !== newProps.dataType){
            this.filters.dataType.value = newProps.dataType
            this.doAction(["fetchLayerData"]);
        }

    }

    receiveProps(oldProps,newProps){
        if(this.filters.dataType.value !== newProps.dataType){
            this.filters.dataType.value = newProps.dataType
            this.onAdd(this.map)
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
                this.onLoadBounds = map.getBounds()
                this.fetchData().then(d => this.render(this.map))
            })

    }

    async fetchData() {
        if (this.filtered_geographies.length === 0) {
            return Promise.resolve()
        }
        if (hazard) {
            this.filters.hazard.value = hazard
        }
        let geo_fips = this.filters.fips.value ? this.filters.fips.value : fips
        let geography = this.filters.geography.value ? this.filters.geography.value : 'counties'
        if(this.filters.dataType.value === 'stormevents'){
            this.data = await stormEventsData('map',['total_damage', 'num_episodes','property_damage','crop_damage','num_episodes','num_events','state','state_fips'],geo_fips,geography,this.filters.hazard.value,this.filters.year.value)
        }
        else if(this.filters.dataType.value === 'sba'){
            this.data = await sbaData('map',['total_loss','loan_total','num_loans','state_abbrev'],geo_fips,geography,this.filters.hazard.value,this.filters.year.value)
        }
        else if(this.filters.dataType.value === 'fema') {
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
            ],geo_fips,geography,this.filters.hazard.value,this.filters.year.value)
        }else{
            return Promise.resolve()
        }
        if(this.filters.fips.value){
            await falcorGraph.get(['geo',this.filters.fips.value,'boundingBox'])
        }
        this.render(this.map,this.data)

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


    render(map,data) {
        if (data) {
            let measure = this.filters.dataType.value === 'stormevents'? 'total_damage': this.filters.dataType.value === 'sba' ? 'total_loss' : 'total_cost'
            let sw = get(data,'data',[])
            let filtered_geographies = get(data,'filtered_geographies')
            let zip_codes = get(data,'zip_codes')
            let geography = this.filters.fips.value ? this.filters.geography.value : 'counties'

            let lossByFilteredGeoids = sw.reduce((a,c)=>{
                if(geography!== 'zip_codes' &&  filtered_geographies.includes(c.geoid) ){
                    a[c.geoid] = c[measure]
                }
                if(geography === 'zip_codes'  && zip_codes.includes(c.geoid)){
                    a[c.geoid] = c[measure]
                }
               return a
            },{})
            let domain = data.domain

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
            if (geography === "cousubs" && Object.keys(lossByFilteredGeoids).length > 0) {
                map.setLayoutProperty('counties', 'visibility', 'none');
                map.setLayoutProperty('tracts', 'visibility', 'none');
                map.setLayoutProperty('zipcodes', 'visibility', 'none');
                map.setLayoutProperty('cousubs', 'visibility', 'visible');
                map.setFilter('cousubs', ["all", ["match", ["get", "geoid"], filtered_geographies, true, false]])
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
            if (geography === "tracts" && Object.keys(lossByFilteredGeoids).length > 0) {
                map.setLayoutProperty('cousubs', 'visibility', 'none');
                map.setLayoutProperty('counties', 'visibility', 'none');
                map.setLayoutProperty('zipcodes', 'visibility', 'none');
                map.setLayoutProperty('tracts', 'visibility', 'visible');
                map.setFilter('tracts', ["all", ["match", ["get", "geoid"], filtered_geographies, true, false]])
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
            if(geography === "zip_codes" && Object.keys(lossByFilteredGeoids).length > 0 && zip_codes){
                map.setLayoutProperty('cousubs', 'visibility', 'none');
                map.setLayoutProperty('counties', 'visibility', 'none');
                map.setLayoutProperty('tracts', 'visibility', 'none');
                map.setLayoutProperty('zipcodes', 'visibility', 'visible');
                map.setFilter('zipcodes', ["all", ["match", ["get", "ZCTA5CE10"],[...new Set(zip_codes)], true, false]])
                map.setPaintProperty(
                    'zipcodes',
                    'fill-color',
                    ['case',
                        ["has", ["to-string", ["get", 'ZCTA5CE10']], ["literal", colors]],
                        ["get", ["to-string", ["get", 'ZCTA5CE10']], ["literal", colors]],
                        "hsl(0, 3%, 94%)"
                    ]
                )
            }

            if (geography === "counties" && Object.keys(lossByFilteredGeoids).length > 0) {
                map.setLayoutProperty('cousubs', 'visibility', 'none');
                map.setLayoutProperty('tracts', 'visibility', 'none');
                map.setLayoutProperty('zipcodes', 'visibility', 'none');
                map.setLayoutProperty('counties', 'visibility', 'visible');
                map.setFilter('counties', ["all", ["match", ["get", "county_fips"], filtered_geographies, true, false]])
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

            if (this.filters.fips.value) {
                let geom = get(falcorGraph.getCache(),['geo',this.filters.fips.value,'boundingBox','value'],null)
                let initalBbox = geom ?  geom.slice(4, -1).split(",") : null
                let bbox = initalBbox ? [initalBbox[0].split(" ").map(d => parseFloat(d)),initalBbox[1].split(" ").map(d => parseFloat(d))] : null
                if(bbox){
                    let a = point2Albers(bbox[0][1], bbox[0][0])
                    let b = point2Albers(bbox[1][1], bbox[1][0])
                    map.fitBounds([a,b])
                }
                map.setFilter("states",["all",
                    ["match", ["get", "state_fips"],[this.filters.fips.value],true,false]
                ])
                map.setFilter('counties', ["all", ["match", ["get", "county_fips"],data.filtered_geographies, true, false]])
                this.forceUpdate()

            }
            else{
                map.setFilter('states',undefined)
                map.setLayoutProperty('cousubs', 'visibility', 'none');
                map.setLayoutProperty('tracts', 'visibility', 'none');
                map.setLayoutProperty('zipcodes', 'visibility', 'none');
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
                if(this.onLoadBounds){
                    map.fitBounds(this.onLoadBounds)
                }

                this.forceUpdate()
            }
        }

    }
}

export default (props = {}) =>
    new MapsLayer("Maps Layer", {
        ...props,
        popover: {
            layers: ['counties','state'],
            pinned:false,
            dataFunc: function (d) {
                const {properties} = d
                let graph = this.data.data.reduce((a,c) =>{
                    if(c.geoid === properties.county_fips){
                        a = c
                    }
                    return a
                },{})
                return [
                        [   (<div className='text-sm text-bold text-left'>
                            {`${get(graph,'county_fips_name','')}`}
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
                                    {this.data.popover.map((pop,i) =>{
                                        return (
                                            <tr className="bg-white" key={i}>
                                                <td className="px-6 py-3 whitespace-no-wrap text-xs text-left leading-5 font-medium text-gray-900">
                                                    {pop.name}
                                                </td>
                                                <td className="px-6 py-3 whitespace-no-wrap text-xs leading-5 text-gray-500">
                                                    {pop.type(get(graph,[pop.value],'0'))}
                                                </td>
                                            </tr>
                                        )
                                    })}
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
            },
            'fips':{
                type:'dropdown',
                value:null,
                domain: []
            },
            'dataType':{
                type:'dropdown',
                value: null,
                domain: []
            }
        },

        // infoBoxes:{
        //     overview.js:{
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
