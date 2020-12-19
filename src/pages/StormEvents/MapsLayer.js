import React from "react"
import MapLayer from "components/AvlMap/MapLayer"
import {MapSources,MapStyles} from './components/mapLayers'
import get from "lodash.get"
import hazardcolors from "../../constants/hazardColors";
import * as d3scale from 'd3-scale'
import { extent } from "d3-array"
import config from './components/config'
import { fnum } from "utils/sheldusUtils"
import * as d3 from "d3";
var _ = require('lodash')
var format =  d3.format("~s")
const fmt = (d) => d < 1000 ? d : format(d)

var d3Geo = require('d3-geo')
var R = 6378137.0 // radius of Earth in meters


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
        if(!_.isEqual(oldProps.falcorCache, newProps.falcorCache)){
            this.falcorCache = newProps.falcorCache
            this.doAction(["fetchLayerData"])
        }

    }

    receiveProps(oldProps,newProps){
        if(this.filters.dataType.value !== newProps.dataType){
            this.filters.dataType.value = newProps.dataType
            this.onAdd(this.map)
        }
        /*if(newProps.falcorCache){
            this.falcorCache = newProps.falcorCache
            this.onAdd(this.map)
        }*/
    }

    onAdd(map) {
        this.map = map
        this.onLoadBounds = map.getBounds()
        this.fetchData().then(d => this.render(map,d))
    }

    fetchData() {
        return Promise.resolve({})
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
        let geography = this.filters.fips.value ? this.filters.geography.value : 'counties'
        let fetch_url = this.filters.dataType.value ? geography !== 'zip_codes'  ? config[this.filters.dataType.value].fetch_url : `${config[this.filters.dataType.value].fetch_url}.byZip`: ''
        let graph = this.filters.dataType.value ? get(this.falcorCache,fetch_url,null) : null
        let geo = {}
        //console.log('graph',graph)
        if(graph){
            if(geography !== 'zip_codes'){
                this.filtered_geographies = this.filters.fips.value ? get(this.falcorCache,['geo',this.filters.fips.value,geography,'value'],null) : Object.keys(graph).filter( d=> d!== "")
            }else{
                geo = get(this.falcorCache,['geo'],null)
                this.zip_codes = Object.keys(geo).reduce((a,c) =>{
                    if(this.filtered_geographies && this.filtered_geographies.includes(c)){
                        a.push(...get(geo,[c,'byZip','zip_codes','value'],[]))
                    }
                    return a
                },[])
            }
            let measure =  config[this.filters.dataType.value].measure
            let lossByFilteredGeoids = Object.keys(graph).filter( d=> d!== "").reduce((a,c)=>{
                if(geography !== 'zip_codes' &&  this.filtered_geographies && this.filtered_geographies.includes(c) ){
                    a[c] = this.filters.dataType.value === 'fema' ? get(graph,[c,this.filters.hazard.value,this.filters.year.value,measure,'value'],0)
                        :
                        get(graph,[c,this.filters.hazard.value,this.filters.year.value,measure],0)
                }
                if(geography === 'zip_codes'  && this.zip_codes && this.zip_codes.includes(c)){
                    a[c] = this.filters.dataType.value === 'fema' ? get(graph,[c,this.filters.hazard.value,this.filters.year.value,measure,'value'],0)
                        :
                        get(graph,[c,this.filters.hazard.value,this.filters.year.value,measure],0)
                }
                return a
            },{})
            let range = ["#F1EFEF", ...hazardcolors[this.filters.hazard.value + '_range']]
            this.legend.domain = geography === 'counties' ? config[this.filters.dataType.value].counties_domain :
               config[this.filters.dataType.value].other_domain
            this.legend.range = range
            let colorScale = d3scale.scaleThreshold()
                .domain(this.legend.domain)
                .range(
                    range //["#f2efe9", "#fadaa6", "#f7c475", "#f09a10", "#cf4010"]
                )
            let colors = Object.keys(lossByFilteredGeoids)
                .reduce((a, c) => {
                    a[c] = colorScale(lossByFilteredGeoids[c])
                    return a
                }, {})

            if (geography === "cousubs" && Object.keys(lossByFilteredGeoids).length > 0 && this.filtered_geographies) {
                map.setLayoutProperty('counties', 'visibility', 'none');
                map.setLayoutProperty('tracts', 'visibility', 'none');
                map.setLayoutProperty('zipcodes', 'visibility', 'none');
                map.setLayoutProperty('cousubs', 'visibility', 'visible');
                map.setFilter('cousubs', ["all", ["match", ["get", "geoid"], this.filtered_geographies, true, false]])
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
            if (geography === "tracts" && Object.keys(lossByFilteredGeoids).length > 0 && this.filtered_geographies) {
                map.setLayoutProperty('cousubs', 'visibility', 'none');
                map.setLayoutProperty('counties', 'visibility', 'none');
                map.setLayoutProperty('zipcodes', 'visibility', 'none');
                map.setLayoutProperty('tracts', 'visibility', 'visible');
                map.setFilter('tracts', ["all", ["match", ["get", "geoid"], this.filtered_geographies, true, false]])
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
            if(geography === "zip_codes" && Object.keys(lossByFilteredGeoids).length > 0 && this.zip_codes){
                map.setLayoutProperty('cousubs', 'visibility', 'none');
                map.setLayoutProperty('counties', 'visibility', 'none');
                map.setLayoutProperty('tracts', 'visibility', 'none');
                map.setLayoutProperty('zipcodes', 'visibility', 'visible');
                map.setFilter('zipcodes', ["all", ["match", ["get", "ZCTA5CE10"],[...new Set(this.zip_codes)], true, false]])
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

            if (geography === "counties" && Object.keys(lossByFilteredGeoids).length > 0 && this.filtered_geographies) {
                map.setLayoutProperty('cousubs', 'visibility', 'none');
                map.setLayoutProperty('tracts', 'visibility', 'none');
                map.setLayoutProperty('zipcodes', 'visibility', 'none');
                map.setLayoutProperty('counties', 'visibility', 'visible');
                map.setFilter('counties', ["all", ["match", ["get", "county_fips"], this.filtered_geographies, true, false]])
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

            if (this.filters.fips.value && this.filtered_geographies) {
                let geom = get(this.falcorCache,['geo',this.filters.fips.value,'boundingBox','value'],null)
                let initalBbox = geom ?  geom.slice(4, -1).split(",") : null
                let bbox = initalBbox ? [initalBbox[0].split(" ").map(d => parseFloat(d)),initalBbox[1].split(" ").map(d => parseFloat(d))] : null
                if(bbox){
                    let a = point2Albers(bbox[0][1], bbox[0][0])
                    let b = point2Albers(bbox[1][1], bbox[1][0])
                    map.fitBounds([a,b])
                    map.setFilter("states",["all",
                        ["match", ["get", "state_fips"],[this.filters.fips.value],true,false]
                    ])
                    map.setFilter('counties', ["all", ["match", ["get", "county_fips"],this.filtered_geographies, true, false]])
                }

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
                map.fitBounds(this.onLoadBounds)


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
                let graph = get(this.falcorCache,`${config[this.filters.dataType.value].fetch_url}.${properties.county_fips}.${this.filters.hazard.value}.${this.filters.year.value}`,null)
                return [
                        [   (<div className='text-sm text-bold text-left'>
                            {`${get(properties,'county_name','')},${get(properties,['state_abbrev'])}`}
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
                                    {config[this.filters.dataType.value].popover.map((pop,i) =>{
                                        return (
                                            <tr className="bg-white" key={i}>
                                                <td className="px-6 py-3 whitespace-no-wrap text-xs text-left leading-5 font-medium text-gray-900">
                                                    {pop.name}
                                                </td>
                                                <td className="px-6 py-3 whitespace-no-wrap text-xs leading-5 text-gray-500">
                                                    {this.filters.dataType.value === 'fema' ?
                                                        pop.type === 'fnum' ?
                                                            fnum(get(graph,[pop.value,'value'],'0')) :
                                                            fmt(get(graph,[pop.value,'value'],'0'))
                                                        :
                                                        pop.type === 'fnum' ?
                                                        fnum(get(graph,[pop.value],'0')) :
                                                        fmt(get(graph,[pop.value],'0'))
                                                    }
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
        falcorCache: {},
        filters: {
            'year': {
                type: 'dropdown',
                value: 'allTime',
                domain: [...config['years'], 'allTime']
            },
            'hazard': {
                type: 'dropdown',
                value: 'riverine',
                domain: config['Hazards']
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
        }
    })
