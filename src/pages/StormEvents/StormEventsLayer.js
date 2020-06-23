import React from "react"

import MapLayer from "components/AvlMap/MapLayer"

import { falcorGraph } from "store/falcorGraph"

import get from "lodash.get"
// import styled from "styled-components"
import * as d3scale from 'd3-scale'

const fips = ["01","02","04","05","06","08","09","10","11","12","13","15","16","17","18","19","20","21","22","23","24","25","26","27","28","29","30","31","32","33","34","35","36","37","38","39","40","41","42","44","45","46","47","48","49","50","51","53","54","55","56"]
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

const start_year = 1996
const end_year = 2019
let years = []
for(let i = start_year; i <= end_year; i++) {
  years.push(i)
}


class StormEventsLayer extends MapLayer {
  onAdd(map) {
    this.map = map
    falcorGraph.get(
      ['geo', fips, 'counties', 'geoid']
    )
      .then(response => {
        this.counties = Object.values(response.json.geo)
          .reduce((out,state) => {
            if(state.counties){
              out = [...out,...state.counties]
            }
            return out
          },[])
        this.fetchData()
      })

  }

  fetchData() {
    if(this.counties.length === 0){
      return Promise.resolve() 
    }
    console.time('get severeWeather')
    return falcorGraph.get(
      ['severeWeather',this.counties, [this.filters.hazard.value], this.filters.year.value, ['total_damage', 'num_episodes']]
    ).then(d => {
      console.timeEnd('get severeWeather')
      this.render(this.map)
    })
  }

  
  render(map) {
    console.log('render map', map)
    let data = falcorGraph.getCache()
    let hazard = this.filters.hazard.value
    let year = this.filters.year.value
    let measure = 'total_damage'
    let sw = get(data, 'severeWeather', {})
    let lossByCounty = Object.keys(sw)
      .reduce((a,c) => {
        if(get(sw[c], `${hazard}.${year}.${measure}`, false)){
          a[c] = get(sw[c], `${hazard}.${year}.${measure}`, false)  
        }
        return a
      },{})
    let lossDomain = Object.values(lossByCounty).sort((a,b) => a - b)
    let colorScale = d3scale.scaleQuantile()
      .domain(lossDomain)
      .range(["#f2efe9", "#fadaa6", "#f7c475", "#f09a10", "#cf4010"])

    let colors = Object.keys(lossByCounty)
      .reduce((a,c) => {
        a[c] = colorScale(lossByCounty[c])
        return a
      },{})

     map.setPaintProperty(
          'counties',
          'fill-color',
          ['case',
              ["has", ["to-string", ["get", 'county_fips']], ["literal", colors]],
              ["get", ["to-string", ["get", 'county_fips']], ["literal", colors]],
               "hsl(0, 3%, 94%)"
          ]
      );
    console.log('lossDomain', colors)
  }
}

export default (props = {}) =>
  new StormEventsLayer("Storm Events", {
    ...props,
    selectedStations: new Map(),
    stationFeatures: [],

    onHover: {
      layers: ["counties"]
    },
    popover: {
      layers: ["counties"],
      dataFunc: function({ properties }) {
        return [
          [ (<h4 className='text-sm text-bold'>{properties.county_name}, {properties.state_abbrev}</h4>)],
          [ "geoid", properties.county_fips]
        ]
      }
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
      }
    ],
    filters:{ 
      'year': {
          type: 'dropdown',
          value: 'allTime',
          domain: [...years,'allTime']
      },
      'hazard': {
          type: 'dropdown',
          value: 'riverine',
          domain: hazards
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
                "fill-outline-color":[
                  "case",
                  ["boolean", ["feature-state", "hover"], false],
                  "hsl(0, 4%, 85%)",
                  "hsl(0, 4%, 85%)"
                ], 
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
                "text-font": ["Overpass Mono Bold", "Arial Unicode MS Regular"]
            },
            "paint": {
                "text-color": "hsl(0, 0%, 0%)",
                "text-opacity": ["step", ["zoom"], 1, 6, 0],
                "text-halo-color": "hsl(0, 0%, 100%)",
                "text-halo-width": 1
            }
        }
    ]    
   
  })
