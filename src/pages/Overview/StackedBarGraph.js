import React from 'react';
import { fnum } from "utils/sheldusUtils"
import hazardcolors from "constants/hazardColors";
import {ResponsiveBar} from "@nivo/bar";

let years = []
const start_year = 1996
const end_year = 2019
for (let i = start_year; i <= end_year; i++) {
    years.push(i)
}


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
class StackedBarGraph extends React.Component {
    render() {
        return (
            <div>
                <div style={ { width: "100%", height: this.props.height ? this.props.height : "300px" } }>
                    <ResponsiveBar
                        data={this.props.data}
                        keys={hazards.map(d => d.value)}
                        indexBy="year"
                        margin={{ top: 60, right: 80, bottom: 70, left: 80 }}
                        padding={0.2}
                        colors={(d) => hazardcolors[d.id]}
                        groupMode={ 'stacked'}
                        enableLabel={false}
                        enableGridX={false}
                        enableGridY= {true}
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
                            legend: 'Total Damage $',
                            legendPosition: 'middle',
                            legendOffset: -55,
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
                    />
                </div>
            </div>
        )
    }
}
/*const mapStateToProps = (state, ownProps) => {
    return {
        activeStateGeoid : state.stormEvents.activeStateGeoid,
        activeStateAbbrev : state.stormEvents.activeStateAbbrev,
        graph: state.graph,
        hazards: get(state.graph, 'riskIndex.hazards.value', [])
    };
};
const mapDispatchToProps = {
    setActiveStateGeoid
};*/
export default StackedBarGraph
