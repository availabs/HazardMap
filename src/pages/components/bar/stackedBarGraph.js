import React from 'react';
import { connect } from 'react-redux';
import config from '../../StormEvents/components/config'
import {reduxFalcor} from "../../../utils/redux-falcor-new";
import {ResponsiveBar} from '@nivo/bar'
import { fnum } from "utils/sheldusUtils"
import hazardcolors from "constants/hazardColors";
import {stormEventsData} from "../../StormEvents/DataFetching/StormEventsDataFecthing";
import {sbaData} from "../../StormEvents/DataFetching/SBADataFetching";
import {femaDisastersData} from "../../StormEvents/DataFetching/FEMADisastersDataFetching";
const get = require("lodash.get");

class StackedBarGraph extends React.Component{

    componentDidUpdate(oldProps){
        if(oldProps.hazard !== this.props.hazard){
            this.fetchFalcorDeps()
        }
        if(oldProps.geoid !== this.props.geoid){
            this.fetchFalcorDeps()
        }
        if(oldProps.data_type !== this.props.data_type){
            this.fetchFalcorDeps()
        }
    }

    fetchFalcorDeps(){
        switch (this.props.data_type) {
            case 'sba':
                return sbaData(this.props.type,config[this.props.data_type].data_columns,this.props.geoid,'counties',this.props.hazard,config.years)
            case 'stormevents':
                return stormEventsData(this.props.type,config[this.props.data_type].data_columns,this.props.geoid,'counties',this.props.hazard,config.years)// "" is for the whole country
            case 'fema':
                return femaDisastersData(this.props.type,config[this.props.data_type].data_columns,this.props.geoid,'counties',this.props.hazard,config.years)
            default:
                return Promise.resolve({})
        }

    }

    processData(){
        const graph = this.props.geoid ? get(this.props.falcorCache,`${config[this.props.data_type].fetch_url}.${this.props.geoid}`,null) :
            get(this.props.falcorCache,`${config[this.props.data_type].fetch_url}.[""]`,null)
        let data = []
        data = config.years.reduce((a, year) => {
            a.push({
                'year': year.toString(),
            })
            return a
        }, [])
        if(graph){
            data.forEach(d => {
                d[this.props.hazard] = get(graph, [this.props.hazard,d.year,config[this.props.data_type].graph_column], 0)
            })
        }
        return data
    }

    processFemaData(){
        let femaData = []
        const graph = this.props.geoid ? get(this.props.falcorCache,`${config[this.props.data_type].fetch_url}`,null) :
            get(this.props.falcorCache,`${config[this.props.data_type].fetch_url}.[""]`,null)
        femaData = config['years'].reduce((a, year) => {
            a.push({
                'year': year.toString(),
            })
            return a
        }, [])
        if(graph){
            if(this.props.geoid){
                femaData.map(d => {
                    let total_cost = 0
                    Object.keys(graph).filter(d => d!== '$__path').forEach(item =>{

                        if(item.length === 5){
                            total_cost += get(graph[item],[this.props.hazard,d.year,'total_cost','value'],0)
                        }

                    })
                    return d[this.props.hazard] = total_cost
                })
            }else{
                femaData.map(d => {
                    let total_cost = 0
                    Object.keys(graph).filter(d => d!== '$__path').forEach(item =>{
                        total_cost += get(graph[item],[d.year,'total_cost','value'],0)
                    })
                    return d[this.props.hazard] = total_cost
                })
            }
        }
        return femaData
    }


    render(){
        if(get(this.props.falcorCache,`${config[this.props.data_type].fetch_url}`,false)){
            return(
                <div style={ { width: this.props.width ? this.props.width : '70%', height: this.props.height ? this.props.height : "300px" } }>
                    <ResponsiveBar
                        data={this.props.data_type !== 'fema' ? this.processData() : this.processFemaData() }
                        keys={[this.props.hazard]}
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
                        labelFormat={d=> `${fnum(d)}`}
                        labelTextColor={{ from: 'color', modifiers: [ [ 'darker', 1.6 ] ] }}
                        yScale={{
                            type: 'log',
                            base: 10,
                            max: 'auto',
                        }}
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
        falcorCache: state.falcorCache,
        geoid:ownProps.geoid,
    };
};
export default connect(mapStateToProps, mapDispatchToProps)(reduxFalcor(StackedBarGraph))

