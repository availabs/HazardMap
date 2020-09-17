import React from "react"
import MapLayer from "components/AvlMap/MapLayer"
import {falcorGraph} from "store/falcorGraphNew"
import get from "lodash.get"
import * as d3scale from 'd3-scale'
import * as d3 from 'd3'
import { fnum } from "utils/sheldusUtils"
import { extent } from "d3-array"


var format =  d3.format("~s")
const fmt = (d) => d < 1000 ? d : format(d)
const fips = ["01", "02", "04", "05", "06", "08", "09", "10", "11", "12", "13", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "40", "41", "42", "44", "45", "46", "47", "48", "49", "50", "51", "53", "54", "55", "56"]
let disaster_number = null
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
class FemaDisastersIATotalsEventsLayer extends MapLayer {
    receiveProps(oldProps, newProps) {
        disaster_number = newProps.disaster_number
        if (disaster_number !== newProps.disaster_number) {
            disaster_number = newProps.disaster_number
        }
        if(oldProps.active_ia_amount !== newProps.active_ia_amount){
            this.filters.amount.value = newProps.active_ia_amount ?
                newProps.active_ia_amount : newProps.active_ia_amount ? newProps.active_ia_amount : null;
        }
    }

    onPropsChange(oldProps, newProps) {
        disaster_number = newProps.disaster_number
        if(disaster_number !== newProps.disaster_number){
            disaster_number = newProps.disaster_number
            this.doAction(["fetchLayerData"]);
        }
        if(oldProps.active_ia_amount !== newProps.active_ia_amount){
            this.filters.amount.value = newProps.active_ia_amount ?
                newProps.active_ia_amount: newProps.active_ia_amount ? newProps.active_ia_amount : null;
            this.doAction(["fetchLayerData"]);
        }

    }


    onAdd(map) {
        this.map = map
        falcorGraph.get(
            ['geo',fips, 'counties', 'geoid']
        )
            .then(response => {
                this.filtered_geographies = Object.values(response.json.geo)
                    .reduce((out, state) => {
                        if (state.counties) {
                            out = [...out, ...state.counties]
                        }
                        return out
                    }, [])
                // onLoadBounds = map.getBounds()
                this.fetchData().then(d => this.render(this.map))
            })


    }

    fetchData(){
        if(disaster_number){
            return falcorGraph.get(
                ['fema','disasters','byId',disaster_number,'ia','zipCodes']
            )
                .then(response => {
                    this.zip_codes = get(response.json,['fema','disasters','byId',disaster_number,'ia','zipCodes'],[])
                    falcorGraph.get(['fema','disasters','byId',disaster_number,'ia','byZip',this.zip_codes,IA_ATTRIBUTES])
                        .then(response =>{
                            this.render(this.map)
                            return response
                        })
                })
        }

    }

    getColorScale(domain) {
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

    render(map){
        let data = get(falcorGraph.getCache(),['fema','disasters','byId',disaster_number,'ia','byZip'],{})
        if(Object.keys(data).length > 0 && this.zip_codes){
            let filteredData = Object.keys(data).reduce((a,c) =>{
                if(this.zip_codes){
                    this.zip_codes.filter(d => d!== '$__path').forEach(zip_code =>{
                        if(zip_code === c && get(data, [c,this.filters.amount.value,'value'], false)){
                            a[c] = get(data, [c,this.filters.amount.value,'value'], false)
                        }
                    })
                }
                return a
            },{})
            let amountDomain = Object.values(filteredData).sort((a, b) => a - b)
            let domain = [0, d3.quantile(amountDomain, 0), d3.quantile(amountDomain, 0.25), d3.quantile(amountDomain, 0.5),
                d3.quantile(amountDomain, 0.75), d3.quantile(amountDomain, 1)]
            let range = ["#f2efe9", "#fadaa6", "#f7c475", "#f09a10", "#cf4010"]

            this.legend.domain = domain
            this.legend.range = range

            let colorScale = d3scale.scaleThreshold()
                .domain(domain)
                .range(
                    range //["#f2efe9", "#fadaa6", "#f7c475", "#f09a10", "#cf4010"]
                )
            let colors = Object.keys(filteredData)
                .reduce((a, c) => {
                    a[c] = colorScale(filteredData[c])
                    return a
                }, {})
            map.setLayoutProperty('zipcodes', 'visibility', 'visible');
            map.setFilter('zipcodes', [
                "all",
                [
                    "match",
                    ["get", "ZCTA5CE10"],
                    [...new Set(this.zip_codes)],
                    true,
                    false
                ]
            ])
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


    }
}

export default (props = {}) =>
    new FemaDisastersIATotalsEventsLayer("FEMA Disasters IA Events", {
        ...props,
        selectedStations: new Map(),
        stationFeatures: [],
        popover: {
            layers: ["zipcodes"],
            pinned:false,
            dataFunc: function (d) {
                console.log('d',d)
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
                id:'albersusa_zip_codes',
                source:{
                    "url":"mapbox://am3081.4jgx8fkw",
                    "type":"vector"
                }
            }
        ],
        filters: {
            'disaster_number': {
                type: 'dropdown',
                value: [],
                domain: []
            },
            'amount':{
                type:'dropdown',
                value : 'ihp_amount',
                domain:[]
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
                "id": "zipcodes",
                "type": "fill",
                "source": "albersusa_zip_codes",
                "source-layer": "albersusa_zip_codes",
                "filter": ["match", ["get", "type"],["ZCTA5CE10"],true, false],
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

    })