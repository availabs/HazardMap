import React, { Component } from 'react';
import { connect } from 'react-redux';
import { reduxFalcor} from "utils/redux-falcor-new";
import { falcorGraph } from "store/falcorGraphNew"
import {ResponsiveBar} from '@nivo/bar'
import { fnum } from "utils/sheldusUtils"
const get = require("lodash.get");

const fips = ["01","02","04","05","06","08","09","10","11","12","13","15","16","17","18","19","20",
    "21","22","23","24","25","26","27","28","29","30","31","32","33","34","35","36","37","38","39",
    "40","41","42","44","45","46","47","48","49","50","51","53","54","55","56"]
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
let years = []
const start_year = 1996
const end_year = 2019
for(let i = start_year; i <= end_year; i++) {
    years.push(i)
}
class SimpleBarGraph extends React.Component{
    constructor(props) {
        super(props);
        this.state={

        }
    }

    fetchFalcorDeps(){
        return this.props.falcor.get(
            ['geo', fips, 'counties', 'geoid'])
            .then(response =>{
                this.counties = Object.values(response.json.geo)
                    .reduce((out,state) => {
                        if(state.counties){
                            out = [...out,...state.counties]
                        }
                        return out
                    },[])
                this.hazards = hazards.reduce((a,c) =>{
                    a.push(c.value)
                    return a
                },[])
                this.props.falcor.get(['severeWeather',"",this.hazards,years,['total_damage', 'num_episodes']]) // "" is for the whole country
                    .then(response =>{
                        return response
                    })

            })
    }

    transformData(){
        let graph = get(falcorGraph.getCache(),['severeWeather',""],null)
        let graph_data = []
        if(graph) {
            graph_data = years.reduce((a, year) => {
                a.push({
                    'year': year.toString(),
                })
                return a
            }, [])
            Object.keys(graph).forEach(hazard => {
                graph_data.map(item => {
                    item[hazard] = get(graph, [hazard,item.year, "total_damage"], 0)
                })
            })
        }
        return graph_data
    }

    render(){
        let data = this.transformData()
        //style={ { width: "100%", height: "100%" } }
        let hazard_list = hazards.reduce((a,c) =>{
            a.push(c.value)
            return a
        },[])
        return(
            <div style={ { width: "100%", height: this.props.height ? this.props.height : "300px" } }>

                <ResponsiveBar
                    data={data}
                    keys={hazard_list}
                    indexBy="year"
                    margin={{ top: 50, right: 50, bottom: 100, left: 90 }}
                    padding={0.1}
                    colors={{ scheme: 'spectral' }}
                    enableLabel={false}
                    enableGridX={false}
                    enableGridY= {false}
                    axisTop={null}
                    axisRight={null}
                    axisBottom={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        legend: 'year',
                        legendPosition: 'middle',
                        legendOffset: 32
                    }}
                    axisLeft={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        legend: 'Total damage',
                        legendPosition: 'middle',
                        legendOffset: -50,
                        format: v => `${fnum(v)}`
                    }}
                    labelSkipWidth={12}
                    labelSkipHeight={12}
                    /*labelFormat={d=> `${fnum(d)}`}*/
                    /*labelTextColor={{ from: 'color', modifiers: [ [ 'darker', 1.6 ] ] }}*/
                    /*yScale={{
                        type: 'log',
                        base: 10,
                        max: 'auto',
                    }}*/
                    /*legends={[
                        {
                            dataFrom: 'keys',
                            anchor: 'bottom-right',
                            direction: 'row',
                            justify: false,
                            translateX: 120,
                            translateY: 0,
                            itemsSpacing: 2,
                            itemWidth: 100,
                            itemHeight: 20,
                            itemDirection: 'left-to-right',
                            itemOpacity: 0.85,
                            symbolSize: 20,
                            effects: [
                                {
                                    on: 'hover',
                                    style: {
                                        itemOpacity: 1
                                    }
                                }
                            ]
                        }
                    ]}*/
                    animate={true}
                    motionStiffness={90}
                    motionDamping={15}
                    tooltipFormat={value => `${fnum(value)}`}
                    onClick={(e) => {
                        this.props.setYear(e.data.year)
                    }
                    }
                />
            </div>
        )
    }
}

const mapDispatchToProps = { };

const mapStateToProps = (state,ownProps) => {
    return {
        geoid:ownProps.geoid,
        censusKey:ownProps.censusKey,
        graph: state.graph,
        severeWeatherData : get(state.graph,['severeWeather'])
    };
};
export default connect(mapStateToProps, mapDispatchToProps)(reduxFalcor(SimpleBarGraph))

