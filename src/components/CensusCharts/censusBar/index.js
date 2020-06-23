import React, { Component } from 'react';
import { connect } from 'react-redux';
import { reduxFalcor} from "utils/redux-falcor";

import {ResponsiveBar} from '@nivo/bar'
import Options from '../Options'
import GeoName from 'components/censusCharts/geoname'
// var numeral = require('numeral')

import get from "lodash.get"

class CensusBarChart extends React.Component {

   fetchFalcorDeps () {
        return this.props.falcor.get(
            ['acs',this.props.geoid,this.props.years,[...this.props.divisorKeys, ...this.props.censusKeys]]
        ).then(data =>{
            console.log('testing test data', ['acs',this.props.geoid,this.props.years,[...this.props.divisorKeys, ...this.props.censusKeys]], data)
        })
    }

    lineData () {
        console.log('line data', this.props.acs)
        return this.props.censusKeys.map((censusKey,index) => {
            return {
                "id": censusKey,
                "color": this.props.colorRange[index % this.props.colorRange.length],
                "title": this.props.title,
                "data" : this.props.years.map(year => {
                    let value = get(this.props, `acs[${this.props.geoids[0]}][${year}][${censusKey}]`, 0)

                    if(this.props.sumType === 'pct') {
                        let divisor = get(this.props, `acs[${this.props.geoids[0]}][${year}][${this.props.divisorKeys[index]}]`, 1)
                        value /= divisor
                        value *= 100
                    }

                    return {
                        x: +year,
                        y: value
                    }
                })
            }
        })
    }


    render () {
        let title = this.props.title
        let graphData = this.lineData()
        // console.log('test 123', this.props.theme, graphData, this.props.colorRange)
        return(
            <div style={{height: '100%'}}>
                <h6 style={{position: 'absolute', top: 0, left: 0, padding: '8px 12px'}}>{this.props.title}</h6>
                <Options />
                <ResponsiveBar
                    data={graphData}
                    indexBy="language"
                    keys = {["Percent"]}
                    margin={{
                        "top": 100,
                            "right": 130,
                            "bottom": 170,
                            "left": 60
                    }}
                    padding={0.3}
                    colors = {this.props.colorRange}
                    colorBy = "index"
                    layout = {this.props.layout}
                    borderColor="inherit:darker(1.6)"
                    enableGridX = {true}
                    enableGridY={true}
                    axisBottom={{
                        "orient": "bottom",
                            "tickSize": 5,
                            "tickPadding": 5,
                            "tickRotation": -90,
                            "legendPosition": "middle",
                            "legendOffset": 36
                    }}
                    axisLeft={{
                        "orient": "left",
                            "tickSize": 5,
                            "tickPadding": 5,
                            "tickRotation": 0,
                            "legendPosition": "middle",
                            "legendOffset": -50,
                            "legend" : "% of Population Not Speaking English Very Well",
                            format: v => `${v}%`
                    }}
                    labelSkipWidth={12}
                    labelSkipHeight={36}
                    enableLabel = {false}
                    labelTextColor="inherit:darker(1.6)"
                    labelFormat = "0"
                    animate={true}
                    motionStiffness={90}
                    motionDamping={15}
                    tooltip={({ id, indexValue, value, color,data }) => (
                        <div>
                            <b><big>{indexValue}</big></b>
                            <br/> <br/>
                            {['Total Speakers']} :
                            <br/>
                            {id} Value: {value}%
                        </div>
                        )}
                />
            </div>
        )
    }

    static defaultProps = {
        censusKeys: ['B19013_001E'], //'B19013',,
        divisorKeys: [],
        geoids: ['36001'],
        colorRange:['#047bf8','#6610f2','#6f42c1','#e83e8c','#e65252','#fd7e14','#fbe4a0','#24b314','#20c997','#5bc0de'],
        years: [2010,2011,2012,2013,2014,2015,2016],
        title: '',
        stacked: false,
        layout: 'vertical'
    }


}


const mapDispatchToProps = { };

const mapStateToProps = (state,ownProps) => {
    return {
        geoid:ownProps.geoid,
        censusKey:ownProps.censusKey,
        graph: state.graph // so componentWillReceiveProps will get called.
    };
};
export default connect(mapStateToProps, mapDispatchToProps)(reduxFalcor(CensusBarChart))
