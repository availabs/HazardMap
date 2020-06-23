import React, { Component } from 'react';
import { connect } from 'react-redux';
import { reduxFalcor} from "utils/redux-falcor";
import {falcorGraph} from "store/falcorGraph";
import { ResponsiveLine } from '@nivo/line'
import ColorRanges from 'constants/color-ranges'

class CensusMultiStackedLineChart extends React.Component{
    constructor(props) {
        super(props);

        this.state = {
            value: 2014,
            temp:2014,
            graphData8: []
        }
    }

    fetchFalcorDeps() {
        let year = [2012,2013,2014,2015,2016]
        let census_var = this.props.censusKey;
        let censusConfig ={}
        let census_subvars = []
        return falcorGraph.get(['acs','config'])
            .then(res=> {
                Object.values(res.json.acs).forEach(function (config, i) {
                    censusConfig = config
                })

                Object.keys(censusConfig).forEach(function (censvar, i) {
                    if (census_var.includes(censvar)) {
                        Object.values(censusConfig[censvar].variables).forEach(function (subvar, i) {
                            census_subvars.push(subvar.value)
                        })
                    }
                })
                return falcorGraph.get(['acs',[...this.props.geoid],year,[...census_subvars]],['acs','config'])
                    .then(response =>{
                        return response
                    })
            })
    }

    componentWillMount(){
        this.multiStackedLineData().then(res =>{
            this.setState({
                graphData8: res
            })
        })
    }

    componentDidUpdate(oldProps)
    {
        if(oldProps.geoid !== this.props.geoid){
            this.multiStackedLineData().then(res =>{
                this.setState({
                    graphData8: res
                })
            })
        }

    }

    multiStackedLineData(){
        return new Promise((resolve,reject) => {
            this.fetchFalcorDeps().then(response =>{
                if (this.props.education){
                    let censusConfig = response.json.acs.config[this.props.censusKey].variables;
                    let response_data = response.json.acs[this.props.geoid];
                    let years = Object.keys(response_data).filter(d => d !== '$__path');
                    let data = [];
                    let multiStackedLineData = [];
                    let colors = ColorRanges[Object.keys(response_data).length+4].filter(d => d.name === 'Set3')[0].colors;
                    for(var k =0; k<=censusConfig.length-1;k++){
                        data.push([])
                    }
                    Object.keys(response_data).filter(d => d !== '$__path').forEach(function (item,i) {
                        let testData = response_data[item]
                        censusConfig.forEach(function(config,j){
                            if(j > 15){
                                data[j].push({
                                    "x":years[i],
                                    "y":parseInt(testData[config.value])
                                })
                            }
                        })
                    });
                    censusConfig.forEach(function(census,l){
                        if(l>15){
                            multiStackedLineData.push(
                                {
                                    "id":census.name,
                                    "colors":colors[l-15],
                                    "data":data[l]
                                }
                            )
                        }

                    });
                    resolve(multiStackedLineData)
                }
                if(this.props.VacantHousing){
                    let censusConfig = response.json.acs.config[this.props.censusKey].variables;
                    let response_data = response.json.acs[this.props.geoid];
                    let years = Object.keys(response_data).filter(d => d !== '$__path');
                    let data = [];
                    let multiStackedLineData = [];
                    let colors = ColorRanges[Object.keys(response_data).length+4].filter(d => d.name === 'Set3')[0].colors;
                    for(var k =0; k<=censusConfig.length-1;k++){
                        data.push([])
                    }
                    Object.keys(response_data).filter(d => d !== '$__path').forEach(function (item,i) {
                        let testData = response_data[item]
                        censusConfig.forEach(function(config,j){
                            if(j > 0){
                                data[j].push({
                                    "x":years[i],
                                    "y":parseInt(testData[config.value])
                                })
                            }
                        })
                    });
                    censusConfig.forEach(function(census,l){
                        if(l>0){
                            multiStackedLineData.push(
                                {
                                    "id":census.name,
                                    "colors":colors[l],
                                    "data":data[l]
                                }
                            )
                        }

                    });
                    resolve(multiStackedLineData)
                }

            })

        })
    }

    render(){
        const style = {
            height:500
        };
        if(this.props.education){
            let colors =[];
            if(this.props.colorRange !== undefined && this.props.colorRange.length >0){
                colors = this.props.colorRange
            }else{
                colors = this.state.graphData8.map( d => d.colors)
            }
            return(
                <div style={style}>
                <ResponsiveLine
            data={this.state.graphData8}
            margin={{
                "top": 30,
                    "right": 150,
                    "bottom": 60,
                    "left": 140
            }}
            xScale={{
                "type": "point"
            }}
            yScale={{
                "type": 'linear',
                    "stacked": true,
                    "min": 'auto',
                    "max": 'auto'
            }}
            curve='linear'
            colors={colors}
            axisTop={null}
            axisRight={null}
            axisBottom={{
                "orient": "bottom",
                    "tickSize": 5,
                    "tickPadding": 5,
                    "tickRotation": 0,
                    "legend": "Educational Attainment",
                    "legendOffset": 36,
                    "legendPosition": "center"
            }}
            axisLeft={{
                "orient": "left",
                    "tickSize": 5,
                    "tickPadding": 5,
                    "tickRotation": 0,
                    "legend": "Number",
                    "legendOffset": -60,
                    "legendPosition": "center"
            }}
            dotSize={5}
            dotColor="inherit:darker(0.3)"
            dotBorderWidth={2}
            dotBorderColor="#ffffff"
            enableDotLabel={false}
            dotLabel="y"
            dotLabelYOffset={-12}
            animate={true}
            enableGridX={true}
            enableGridY={true}
            enableArea={false}
            areaOpacity={0.35}
            motionStiffness={90}
            motionDamping={15}
            legends={[
                    {
                        "anchor": "bottom-right",
                        "direction": "column",
                        "justify": false,
                        "translateX": 100,
                        "translateY": 0,
                        "itemsSpacing": 0,
                        "itemDirection": "left-to-right",
                        "itemWidth": 80,
                        "itemHeight": 20,
                        "itemOpacity": 0.75,
                        "symbolSize": 12,
                        "symbolShape": "circle",
                        "symbolBorderColor": "rgba(0, 0, 0, .5)",
                        "effects": [
                            {
                                "on": "hover",
                                "style": {
                                    "itemBackground": "rgba(0, 0, 0, .03)",
                                    "itemOpacity": 1
                                }
                            }
                        ]
                    }
                    ]}
            tooltip={({ id, indexValue, value, color,data }) => (
            <text>
            <b><big>{this.props.geoid}</big></b>
            <br/> <br/>
            Year : {id}
        <br/>
            Regular High School diploma: {Object.values(data)[0]['data'].y}
        <br/>
            GED or alternative credential: {Object.values(data)[1]['data'].y}
        <br/>
            Some college less than 1 year: {Object.values(data)[2]['data'].y}
        <br/>
            Some college,1 or more years,no degree :{Object.values(data)[3]['data'].y}
        <br/>
            Associate degree: {Object.values(data)[4]['data'].y}
        <br/>
            Bachelor degree: {Object.values(data)[5]['data'].y}
        <br/>
            Master degree: {Object.values(data)[6]['data'].y}
        <br/>
            Professional degree: {Object.values(data)[7]['data'].y}
        <br/>
            Doctorate degree: {Object.values(data)[8]['data'].y}
        </text>
        )}
            />
            </div>

        )
        }
        if(this.props.VacantHousing){
            let colors =[];
            if(this.props.colorRange !== undefined && this.props.colorRange.length >0){
                colors = this.props.colorRange
            }else{
                colors = this.state.graphData8.map( d => d.colors)
            }
            return(
                <div style={style}>
                <ResponsiveLine
            data={this.state.graphData8}
            margin={{
                "top": 30,
                    "right": 150,
                    "bottom": 60,
                    "left": 140
            }}
            xScale={{
                "type": "point"
            }}
            yScale={{
                "type": 'linear',
                    "stacked": true,
                    "min": 'auto',
                    "max": 'auto'
            }}
            curve='linear'
            colors={colors}
            axisTop={null}
            axisRight={null}
           
            dotSize={5}
            dotColor="inherit:darker(0.3)"
            dotBorderWidth={2}
            dotBorderColor="#ffffff"
            enableDotLabel={false}
            dotLabel="y"
            dotLabelYOffset={-12}
            animate={true}
            enableGridX={true}
            enableGridY={true}
            enableArea={false}
            areaOpacity={0.35}
            motionStiffness={90}
            motionDamping={15}
            theme={this.props.theme}
            legends={[
                    {
                        "anchor": "bottom-right",
                        "direction": "column",
                        "justify": false,
                        "translateX": 100,
                        "translateY": 0,
                        "itemsSpacing": 0,
                        "itemDirection": "left-to-right",
                        "itemWidth": 80,
                        "itemHeight": 20,
                        "itemOpacity": 0.75,
                        "symbolSize": 12,
                        "symbolShape": "circle",
                        "symbolBorderColor": "rgba(0, 0, 0, .5)",
                        "effects": [
                            {
                                "on": "hover",
                                "style": {
                                    "itemBackground": "rgba(0, 0, 0, .03)",
                                    "itemOpacity": 1
                                }
                            }
                        ]
                    }
                    ]}
            tooltip={({ id, indexValue, value, color,data }) => (
            <text>
            <b><big>{this.props.geoid}</big></b>
            <br/> <br/>
            Year : {id}
        <br/>
            For Rent: {Object.values(data)[0]['data'].y}
        <br/>
            Rented,not occupied: {Object.values(data)[1]['data'].y}
        <br/>
            For sale only: {Object.values(data)[2]['data'].y}
        <br/>
            Sold,not occupied :{Object.values(data)[3]['data'].y}
        <br/>
            For seasonal, recreational, or occasional use: {Object.values(data)[4]['data'].y}
        <br/>
            For migrant workers: {Object.values(data)[5]['data'].y}
        <br/>
            Other Vaccant: {Object.values(data)[6]['data'].y}
        </text>
        )}
            />
            </div>

        )
        }

    }

    static defaultProps = {
        censusKey: ['B15003'],
        geoid: ['36001'],
        VacantHousing:false,
        education:false,
        colorRange:[]
    }
}

const mapDispatchToProps = { };

const mapStateToProps = (state,ownProps) => {
    return {
        geoid:ownProps.geoid,
        theme: state.user.theme,
        graph: state.graph // so componentWillReceiveProps will get called.
    };
};
export default connect(mapStateToProps, mapDispatchToProps)(reduxFalcor(CensusMultiStackedLineChart))

/*

 */