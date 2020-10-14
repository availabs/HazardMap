import React from 'react';
import { connect } from 'react-redux';
import { reduxFalcor} from "utils/redux-falcor-new";
import {ResponsiveBar} from '@nivo/bar'
import { fnum } from "utils/sheldusUtils"
import hazardcolors from "constants/hazardColors";
import * as d3 from "d3";
const get = require("lodash.get");
var format =  d3.format(".2s")
const fmt = (d) => d < 1000 ? d : format(d)

const hazards = [
    {value:'wind', name:'Wind',total_cost: 0},
    {value:'wildfire', name:'Wildfire',total_cost: 0},
    {value:'tsunami', name:'Tsunami/Seiche',total_cost: 0},
    {value:'tornado', name:'Tornado',total_cost: 0},
    {value:'riverine', name:'Flooding',total_cost: 0},
    {value:'lightning', name:'Lightning',total_cost: 0},
    {value:'landslide', name:'Landslide',total_cost: 0},
    {value:'icestorm', name:'Ice Storm',total_cost: 0},
    {value:'hurricane', name:'Hurricane',total_cost: 0},
    {value:'heatwave', name:'Heat Wave',total_cost: 0},
    {value:'hail', name:'Hail',total_cost: 0},
    {value:'earthquake', name:'Earthquake',total_cost: 0},
    {value:'drought', name:'Drought',total_cost: 0},
    {value:'avalanche', name:'Avalanche',total_cost: 0},
    {value:'coldwave', name:'Coldwave',total_cost: 0},
    {value:'winterweat', name:'Snow Storm',total_cost: 0},
    {value:'volcano', name:'Volcano',total_cost: 0},
    {value:'coastal', name:'Coastal Hazards',total_cost: 0}
]
let years = []
const start_year = 1953
const end_year = 2020
for(let i = start_year; i <= end_year; i++) {
    years.push(i)
}

class FemaDisastersStackedBarGraph extends React.Component{
    constructor(props) {
        super(props);
        this.state={
            isLoading : true
        }
    }

    componentDidUpdate(oldProps){
        if(oldProps.hazard !== this.props.hazard){
            this.fetchFalcorDeps()
        }
    }


    fetchFalcorDeps(){
        this.setState({
            isLoading : true
        });
        return this.props.falcor.get(['fema','disasters','length'])
            .then(response =>{
                let length = get(response.json,['fema','disasters','length'],null)
                if(length){
                    this.props.falcor.get(['fema','disasters','byIndex',[{from:0,to:length-1}],this.props.attributes])
                        .then(response =>{
                            this.setState({
                                isLoading : false
                            })
                            return response
                        })

                }else { return Promise.resolve({}) }
            })
    }

    transformData(){
        let graph = get(this.props.falcorCache,['fema','disasters','byId'],null)
        let graph_data = []

        if(graph) {
            graph_data = years.reduce((a, year) => {
                a.push({
                    'year': year.toString(),
                })
                return a
            }, [])
            graph_data.forEach(d =>{
                hazards.forEach(hazard =>{
                    d[hazard.value] = 0
                })
            })
            graph_data.forEach(d =>{
                hazards.forEach(hazard =>{
                    Object.values(graph).filter(d => d !== '$__path').forEach(item =>{
                        if(item.year && get(item,['year','value'],0).toString() === d.year && get(item,['disaster_type','value'],'') === hazard.value){
                            d[hazard.value] += parseFloat(get(item,['total_cost','value'],0))
                        }
                    })
                })
            })
        }
        return graph_data
    }

    calculateCountDisastersByYear (){
        let graph = get(this.props.falcorCache,['fema','disasters','byId'],null)
        let graph_data = []

        if(graph) {
            graph_data = years.reduce((a, year) => {
                a.push({
                    'year': year.toString(),
                    'count' : 0
                })
                return a
            }, [])
            graph_data.forEach(d =>{
                let count = 0
                Object.values(graph).filter(d => d !== '$__path').forEach(item =>{
                    if(item.year && get(item,['year','value'],0).toString() === d.year){
                        count += 1
                        d['count'] = count.toString()
                    }
                })
            })
        }
        return graph_data
    }

    render(){
        let data = this.props.type === 'disasters' ? this.transformData() : this.calculateCountDisastersByYear()
        if(!this.state.isLoading){
            return(
                <div style={ { width: "100%", height: this.props.height ? this.props.height : "300px" } }>
                    <ResponsiveBar
                        data={data}
                        keys={this.props.type ==='disasters' ? hazards.map(d => d.value) : ['count']}
                        indexBy="year"
                        margin={{ top: 60, right: 80, bottom: 70, left: 80 }}
                        padding={0.2}
                        colors={this.props.type ==='disasters' ? (d) => hazardcolors[d.id] : {"scheme":"nivo"}}
                        groupMode={this.props.type ==='disasters' ? 'stacked' : null}
                        enableLabel={false}
                        enableGridX={false}
                        enableGridY= {false}
                        axisBottom={{
                            tickSize: 5,
                            tickPadding: 5,
                            tickRotation: -60,
                            legend: 'year',
                            legendPosition: 'middle',
                            legendOffset: 45
                        }}
                        axisLeft={{
                            tickSize: 5,
                            tickPadding: 5,
                            tickRotation: 0,
                            legend: this.props.type ==='disasters' ? 'Total Cost $' : 'Total Count #',
                            legendPosition: 'middle',
                            legendOffset: -55,
                            format: v => `${this.props.type ==='disasters' ? fnum(v) : fmt(v)}`
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
                        tooltipFormat={value => `${this.props.type ==='disasters' ? fnum(value) : fmt(value)}`}
                    />
                </div>
            )
        }else{
            return(
                <div style={ { width: "100%", height: this.props.height ? this.props.height : "300px" } }>
                    Loading ...
                </div>
            )
        }


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
export default connect(mapStateToProps, mapDispatchToProps)(reduxFalcor(FemaDisastersStackedBarGraph))

