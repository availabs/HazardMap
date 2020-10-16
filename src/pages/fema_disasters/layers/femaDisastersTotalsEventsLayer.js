import React from "react"
import MapLayer from "components/AvlMap/MapLayer"
import {falcorGraph} from "store/falcorGraphNew"
import get from "lodash.get"
import * as d3scale from 'd3-scale'
import * as d3 from 'd3'
import { fnum } from "utils/sheldusUtils"
import { extent } from "d3-array"
const fips = ["01", "02", "04", "05", "06", "08", "09", "10", "11", "12", "13", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "40", "41", "42", "44", "45", "46", "47", "48", "49", "50", "51", "53", "54", "55", "56"]

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
const PA_ATTRIBUTES = [
    'project_amount',
    'project_amount_count',
    'federal_share_obligated',
    'federal_share_obligated_count',
    'total_obligated',
    'total_obligated_count',

]
const HMA_MITIGATED_PROPERTIES_ATTRIBUTES = [
    'actual_amount_paid',
    'number_of_properties'
]


let stat_boxes = [
    {name:'IHP Amount',value:'ihp_amount',amount:0,count:0},
    {name:'HA Amount',value:'ha_amount',amount:0,count:0},
    {name:'FIP Amount',value:'fip_amount',amount:0,count:0},
    {name:'ON A Amount',value:'on_a_amount',amount:0,count:0},
    {name:'Rental Assistance Amount',value:'rental_assistance_amount',amount:0,count:0},
    {name:'Repair Amount',value:'repair_amount',amount:0,count:0},
    {name:'Replacement Amount',value:'replacement_amount',amount:0,count:0},
    {name:'Personal Property Amount',value:'personal_property_amount',amount:0,count:0},
    {name:'Roof Damage Amount',value:'roof_damage_amount',amount:0,count:0},
    {name: 'Foundation Damage Amount',value:'foundation_damage_amount',amount:0,count:0},
    {name:'Flood Damage Amount',value:'flood_damage_amount',amount:0,count:0},
    {name:'$ Project Amount',value:'project_amount',amount:0,count:0},
    {name:'$ Federal Share Obligated Amount',value:'federal_share_obligated',amount:0,count:0},
    {name:'$ Total Obligated Amount',value:'total_obligated',amount:0,count:0},
    {name:'$ Actual Amount Paid',value:'actual_amount_paid',amount:0,count:0},
];
class FemaDisastersTotalsEventsLayer extends MapLayer {
    receiveProps(oldProps, newProps) {

        if (this.filters.disaster_number.value !== newProps.disaster_number) {
            this.filters.disaster_number.value = newProps.disaster_number
        }
        if(oldProps.active_amount !== newProps.active_amount){
            this.filters.amount.value = newProps.active_amount ?
                newProps.active_amount : newProps.active_amount ? newProps.active_amount : null;
        }

    }

    onPropsChange(oldProps, newProps) {

        if(this.filters.disaster_number.value !== newProps.disaster_number){
            this.filters.disaster_number.value = newProps.disaster_number
            this.doAction(["fetchLayerData"]);
        }
        if(oldProps.active_amount !== newProps.active_amount){
            this.filters.amount.value = newProps.active_amount ?
                newProps.active_amount : newProps.active_amount ? newProps.active_amount : null;
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
        let amount = this.filters.amount.value
        if(IA_ATTRIBUTES.includes(amount)){
            return falcorGraph.get(
                ['fema','disasters','byId',this.filters.disaster_number.value,'ia','zipCodes'],

            )
                .then(response => {
                    this.zip_codes = get(response.json,['fema','disasters','byId',this.filters.disaster_number.value,'ia','zipCodes'],[]).filter(d => d !== null)
                    if(this.zip_codes.length > 0){
                        return falcorGraph.get(['fema','disasters','byId',this.filters.disaster_number.value,'ia','byZip',this.zip_codes,IA_ATTRIBUTES])
                            .then(response =>{
                                this.render(this.map)
                            })
                    }

                })
        }
        if(PA_ATTRIBUTES.includes(amount)){
            return falcorGraph.get(
                ['fema','disasters','byId',this.filters.disaster_number.value,'pa','zipCodes'],

            )
                .then(response => {
                    this.zip_codes = get(response.json,['fema','disasters','byId',this.filters.disaster_number.value,'pa','zipCodes'],[]).filter(d => d !== null)
                    if(this.zip_codes.length > 0){
                        return falcorGraph.get(['fema','disasters','byId',this.filters.disaster_number.value,'pa','byZip',this.zip_codes,PA_ATTRIBUTES])
                            .then(response =>{
                                this.render(this.map)
                            })
                    }

                })
        }
        if(HMA_MITIGATED_PROPERTIES_ATTRIBUTES.includes(amount)){
            return falcorGraph.get(
                ['fema','disasters','byId',this.filters.disaster_number.value,'hma_mitigated_properties','zipCodes'],

            )
                .then(response => {
                    this.zip_codes = get(response.json,['fema','disasters','byId',this.filters.disaster_number.value,'hma_mitigated_properties','zipCodes'],[]).filter(d => d !== null)
                    if(this.zip_codes.length > 0){
                        return falcorGraph.get(['fema','disasters','byId',this.filters.disaster_number.value,'hma_mitigated_properties','byZip',this.zip_codes,HMA_MITIGATED_PROPERTIES_ATTRIBUTES])
                            .then(response =>{
                                this.render(this.map)
                            })
                    }

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
        let data = IA_ATTRIBUTES.includes(this.filters.amount.value) ?
            get(falcorGraph.getCache(),['fema','disasters','byId',this.filters.disaster_number.value,'ia','byZip'],{})
            : PA_ATTRIBUTES.includes(this.filters.amount.value) ?
            get(falcorGraph.getCache(),['fema','disasters','byId',this.filters.disaster_number.value,'pa','byZip'],{})
                :
            get(falcorGraph.getCache(),['fema','disasters','byId',this.filters.disaster_number.value,'hma_mitigated_properties','byZip'],{})
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
            console.log('colors',colors)
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
    new FemaDisastersTotalsEventsLayer("FEMA Disasters IA Events", {
        ...props,
        selectedStations: new Map(),
        stationFeatures: [],
        popover: {
            layers: ["zipcodes"],
            pinned:false,
            dataFunc: function (d) {
                return [
                    [   (<div className='text-lg text-bold bg-white'>
                        ZIP - {d.properties["ZCTA5CE10"]}
                    </div>)
                    ],
                    [   (<div className='text-sm bg-white'>
                        {stat_boxes.reduce((a,c)=>{
                            if(c.value === this.filters.amount.value){
                                a = c.name
                            }
                            return a
                        },'')} -
                        {   IA_ATTRIBUTES.includes(this.filters.amount.value) ?
                            fnum(get(falcorGraph.getCache(),['fema','disasters','byId',this.filters.disaster_number.value,'ia','byZip',d.properties["ZCTA5CE10"],this.filters.amount.value,'value'],0))
                            : PA_ATTRIBUTES.includes(this.filters.amount.value) ?
                            fnum(get(falcorGraph.getCache(),['fema','disasters','byId',this.filters.disaster_number.value,'pa','byZip',d.properties["ZCTA5CE10"],this.filters.amount.value,'value'],0))
                            :
                                fnum(get(falcorGraph.getCache(),['fema','disasters','byId',this.filters.disaster_number.value,'hma_mitigated_properties','byZip',d.properties["ZCTA5CE10"],this.filters.amount.value,'value'],0))
                        }

                    </div>)
                    ],
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
                value: window.location.pathname.split("/")[3],
                domain: []
            },
            'amount':{
                type:'dropdown',
                value : 'ihp_amount',
                domain:[]
            },

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
