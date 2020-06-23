import React, { Component } from 'react';
import { connect } from 'react-redux';
import { reduxFalcor} from "utils/redux-falcor";
import {falcorGraph} from "store/falcorGraph";
import { ResponsiveLine } from '@nivo/line'
var numeral = require('numeral')

class CensusStackedLineChart extends React.Component{
    constructor(props) {
        super(props);

        this.state = {
            value: 2014,
            temp:2014,
            graphData7: [],
            graphData8: []
        }
    }

    fetchFalcorDeps() {
        let year = [2010,2011,2012,2013,2014,2015,2016]
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
        this.stackedLineData().then(res =>{
            this.setState({
                graphData7 : res
            })
        })

    }

    componentDidUpdate(oldProps)
    {
        if(oldProps.geoid !== this.props.geoid){
            this.stackedLineData().then(res =>{
                this.setState({
                    graphData7 : res
                })
            })
        }

    }

    stackedLineData(){
        return new Promise((resolve,reject) => {
            this.fetchFalcorDeps().then(response =>{
                let censusConfig = response.json.acs.config[this.props.censusKey].variables;
                let occupiedData =[];
                let vaccantData = [];
                let stackedLineData = [];
                let response_data = response.json.acs[this.props.geoid];
                let years = Object.keys(response_data).filter(d => d !== '$__path')
                Object.keys(response_data).filter(d => d !== '$__path').forEach(function (item,i) {
                    let data = response_data[item]
                    censusConfig.forEach(function(config,j){
                        if (j === 1){
                            occupiedData.push({
                                "x":years[i],
                                "y":parseInt(data[config.value])
                            })
                        }
                        if (j === 2){
                            vaccantData.push({
                                "x":years[i],
                                "y":parseInt(data[config.value])
                            })
                        }
                    })
                });
                stackedLineData.push(
                    {
                        "id":"Occupied",
                        "color":"#44A0C5",
                        "data":occupiedData
                    },

                    {
                        "id":"Vaccant",
                        "color":"#1D1190",
                        "data":vaccantData
                    }
                );
                resolve(stackedLineData)
            })
        })
    }

    render(){
        const style = {
            height:500
        };
        let colors = [];
        if(this.props.colorRange !== undefined && this.props.colorRange.length > 0){
            colors = this.props.colorRange
        }else{
            this.state.graphData7.map(d => colors.push(d.color))
        }
            return(
            <div style={style}>
            <ResponsiveLine
            data={this.state.graphData7}
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
                    "stacked": false,
                    "min": 0,
                    "max": 140000
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
            <h6>
            <b><big>{this.props.geoid}</big></b>
            <br/> <br/>
            Year : {id}
        <br/>
            Vaccant Units : {Object.values(data)[0]['data'].y}
        <br/>
            Occupied Units: {Object.values(data)[1]['data'].y}
        </h6>
        )}
            />
            </div>

        )
    }

    static defaultProps = {
        censusKey: ['B25002'], //'B19013',,
        geoid: ['36001'],
        colorRange:[]
    }
}

const mapDispatchToProps = { };

const mapStateToProps = (state,ownProps) => {
    return {
        geoid:ownProps.geoid,
        graph: state.graph,
        theme: state.user.theme
    };
};
export default connect(mapStateToProps, mapDispatchToProps)(reduxFalcor(CensusStackedLineChart))