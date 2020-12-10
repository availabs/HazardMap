import React from 'react';
import { connect } from 'react-redux';
import {reduxFalcor} from "@availabs/avl-components/dist/redux-falcor/index";
import {ResponsiveBar} from '@nivo/bar'
import { fnum } from "utils/sheldusUtils"
import hazardcolors from "constants/hazardColors";
import {stormEventsData} from "../../StormEvents/DataFetching/StormEventsDataFecthing";
import {sbaData} from "../../StormEvents/DataFetching/SBADataFetching";
import {femaDisastersData} from "../../StormEvents/DataFetching/FEMADisastersDataFetching";
const get = require("lodash.get");

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

class StackedBarGraph extends React.Component{
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
        if(oldProps.geoid !== this.props.geoid){
            this.fetchFalcorDeps()
        }
    }

    componentWillUnmount(){
        this.setState = (state,callback)=>{
            return;
        };
    }

    async fetchFalcorDeps(){
        this.setState({
            isLoading : true
        });
        if(this.props.hazard !== null){
            this.hazards = [this.props.hazard]
        }else{
            this.hazards = hazards.reduce((a,c) =>{
                a.push(c.value)
                return a
            },[])
        }
        if(this.props.data.data_type === 'sba'){
            this.data = await sbaData(this.props.data.type,this.props.data.columns,this.props.geoid,'counties',this.hazards,years)
            this.setState({
                isLoading : false
            })

        }if(this.props.data.data_type === 'stormevents'){
            this.data = await stormEventsData(this.props.data.type,this.props.data.columns,this.props.geoid,'counties',this.hazards,years)// "" is for the whole country
            this.setState({
                isLoading : false
            })
        }if(this.props.data.data_type === 'fema'){
            this.data = await femaDisastersData(this.props.data.type,this.props.data.data_columns,this.props.geoid,'counties',this.hazards,years)
            this.setState({
                isLoading : false
            })
        }

    }


    render(){
        let hazard_list = []
        if(this.props.hazard !== null){
           hazard_list = [this.props.hazard]
        }else{
            hazard_list = hazards.reduce((a,c) =>{
                a.push(c.value)
                return a
            },[])
        }

        if(!this.state.isLoading && this.data){
            return(
                <div style={ { width: this.props.width ? this.props.width : '70%', height: this.props.height ? this.props.height : "300px" } }>
                    <ResponsiveBar
                        data={this.data.data}
                        keys={hazard_list}
                        indexBy="year"
                        margin={{ top: 40, right: 70, bottom: 20, left: 10 }}
                        padding={0.1}
                        colors={(d) => hazardcolors[d.id]}
                        enableLabel={false}
                        enableGridX={false}
                        enableGridY= {false}
                        axisTop={null}
                        axisRight={{
                            tickSize: 5,
                            tickPadding: 5,
                            tickRotation: 0,
                            legend: 'Total Damage $',
                            legendPosition: 'middle',
                            legendOffset: 60,
                            format: v => `${fnum(v)}`
                        }}
                        axisBottom={{
                            tickSize: 5,
                            tickPadding: 5,
                            tickRotation: 0,
                            legend: 'year',
                            legendPosition: 'middle',
                            legendOffset: 32
                        }}
                        axisLeft={null}
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
        }else{
            return(
                <div style={ { width: this.props.width ? this.props.width : '100%', height: this.props.height ? this.props.height : "300px" } }>
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
export default connect(mapStateToProps, mapDispatchToProps)(reduxFalcor(StackedBarGraph))

