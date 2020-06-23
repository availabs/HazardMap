import React, { Component } from 'react';
import { connect } from 'react-redux';
import { reduxFalcor} from "utils/redux-falcor";
import {falcorGraph} from "store/falcorGraph";
import { ResponsiveBar } from '@nivo/bar'

var numeral = require('numeral')

class CensusGroupedBarChart extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            value: 2014,
            temp:2014,
            graphData1: [],
            graphData2: [],
            graphData3: [],
            graphData4: []
        }
        this.handleChange = this.handleChange.bind(this)
    }
    handleChange(event) {
        this.setState({value: event.target.value});
    }


    fetchFalcorDeps() {
        let year = [2010,2011,2012,2013,2014,2015,2016]
        let census_var = this.props.censusKey
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
            });
            return falcorGraph.get(['acs',[...this.props.geoid,...this.props.compareGeoid],year,[...census_subvars]],['acs','config'])
    .then(response =>{
            return response
        })
    })

        //return this.props.censusKey.reduce((a, c) => a.then(() => falcorGraph.get(['acs',[...this.props.geoids,...this.props.compareGeoid],year,c],['acs','config'])), Promise.resolve())
        //return this.props.censusKey.reduce((a,c) => a.then(() => falcorGraph.get(['acs',[...this.props.geoids,...this.props.compareGeoid],year,c])),Promise.resolve())
    }


    componentWillMount()
    {
        this.compareData().then(res =>{
            this.setState({
                graphData4 : res
            })
        })

    }

    componentDidUpdate(oldProps){
        if(oldProps.geoid !== this.props.geoid){
            this.compareData().then(res =>{
                this.setState({
                    graphData4: res
                })
            })
        }
    }


    compareData() {
        return new Promise((resolve,reject) => {
            this.fetchFalcorDeps().then(response => {
                let response_countyData = {};
        let response_stateData = {};
        let year = 2014;
        let cenKey_parent = this.props.censusKey;
        let stateData =[];
        let countyData =[];
        let censusConfig ={};
        let compareData = [];
        let geoid = this.props.geoid;
        Object.values(response.json).forEach(function(value,i){
            censusConfig = value['config']
            if (value['36'] !== undefined){
                response_stateData = value['36'][year]
            }
            if(value[geoid] !== undefined){
                response_countyData = value[geoid][year]
            }
        })
        Object.keys(response_stateData).forEach(function(stData,i){
            Object.keys(censusConfig).forEach(function(config,i){
                if (stData.slice(0,-5) === config){
                    Object.values(censusConfig[config].variables).forEach(function(subvar,i){
                        if (stData === subvar.value){
                            if (subvar.name.includes("Total")){
                                stateData.push({
                                    "Total" : response_stateData[stData]
                                })
                            }
                            if(subvar.name.includes("Living with two parent")){
                                stateData.push({
                                    "Living with 2 Parents" : response_stateData[stData]
                                })
                            }
                            if(subvar.name.includes("Living with mother")){
                                stateData.push({
                                    "Living with mother" : response_stateData[stData]
                                })
                            }
                            if (subvar.name.includes("Living with father")){
                                stateData.push({
                                    "Living with father" : response_stateData[stData]
                                })
                            }
                        }
                    })
                }
            })
        })
        var obj1 ={}
        stateData.forEach(function(each_val,i){
            if (obj1[Object.keys(each_val)]){
                obj1[Object.keys(each_val)] += parseFloat(Object.values(each_val));
            }else{
                obj1[Object.keys(each_val)] = parseFloat(Object.values(each_val));
            }
        })

        Object.keys(response_countyData).forEach(function(ctData,i){
            Object.keys(censusConfig).forEach(function(config,i){
                if (ctData.slice(0,-5) === config){
                    Object.values(censusConfig[config].variables).forEach(function(subvar,i){
                        if (ctData === subvar.value){
                            if (subvar.name.includes("Total")){
                                countyData.push({
                                    "Total" : response_countyData[ctData]
                                })
                            }
                            if(subvar.name.includes("Living with two parent")){
                                countyData.push({
                                    "Living with 2 Parents" : response_countyData[ctData]
                                })
                            }
                            if(subvar.name.includes("Living with mother")){
                                countyData.push({
                                    "Living with mother" : response_countyData[ctData]
                                })
                            }
                            if (subvar.name.includes("Living with father")){
                                countyData.push({
                                    "Living with father" : response_countyData[ctData]
                                })
                            }
                        }
                    })
                }
            })
        })
        var obj2 ={}
        countyData.forEach(function(each_val,i){
            if (obj2[Object.keys(each_val)]){
                obj2[Object.keys(each_val)] += parseFloat(Object.values(each_val));
            }else{
                obj2[Object.keys(each_val)] = parseFloat(Object.values(each_val));
            }
        })

        var obj1_percent =[] // state
        obj1_percent.push({
            "Total Living with two parents" : (parseFloat(obj1[Object.keys(obj1)[1]])),
            "Living with two parents": ((parseFloat(obj1[Object.keys(obj1)[1]])/parseFloat(obj1[Object.keys(obj1)[0]]) * 100).toFixed(2)),
            "Total Living with father": (parseFloat(obj1[Object.keys(obj1)[2]])),
            "Living with father" : ((parseFloat(obj1[Object.keys(obj1)[2]])/parseFloat(obj1[Object.keys(obj1)[0]]) * 100).toFixed(2)),
            "Total Living with mother": (parseFloat(obj1[Object.keys(obj1)[3]])),
            "Living with mother" : ((parseFloat(obj1[Object.keys(obj1)[3]])/parseFloat(obj1[Object.keys(obj1)[0]]) * 100).toFixed(2)),
        })

        var obj2_percent = [] // county
        obj2_percent.push({
            "Total Living with two parents": (parseFloat(obj2[Object.keys(obj2)[1]])),
            "Living with two parents" : ((parseFloat(obj2[Object.keys(obj2)[1]])/parseFloat(obj2[Object.keys(obj2)[0]]) * 100).toFixed(2)),
            "Total Living with father": (parseFloat(obj2[Object.keys(obj2)[2]])),
            "Living with father" : ((parseFloat(obj2[Object.keys(obj2)[2]])/parseFloat(obj2[Object.keys(obj2)[0]]) * 100).toFixed(2)),
            "Total Living with mother" : (parseFloat(obj2[Object.keys(obj2)[3]])),
            "Living with mother" : ((parseFloat(obj2[Object.keys(obj2)[3]])/parseFloat(obj2[Object.keys(obj2)[0]]) * 100).toFixed(2))
        })

        Object.values(obj1_percent).forEach(function(obj1,i){
            compareData.push({
                    "Category" : Object.keys(obj1)[1],
                    "Two Parents in Albany County" :  numeral(parseFloat(Object.values(obj1)[0])).format('0.00a'),
                    "county/cousub" : parseFloat(Object.values(obj1)[1]),
                    "countyColor" : '#FF5733',
                    "Two Parents in New York State": numeral(parseFloat(Object.values(obj2_percent[i])[0])).format('0.00a'),
                    "New York state" : parseFloat(Object.values(obj2_percent[i])[1]),
                    "stateColor" : '#C70039'
                },
                {
                    "Category": Object.keys(obj1)[3],
                    "One Parent(father) in Albany County" : numeral(parseFloat(Object.values(obj1)[2])).format('0.0a'),
                    "county/cousub": parseFloat(Object.values(obj1)[3]),
                    "countyColor": '#FF5733',
                    "One Parent(father) in New York State" : numeral(parseFloat(Object.values(obj2_percent[i])[2])).format('0.0a'),
                    "New York state": parseFloat(Object.values(obj2_percent[i])[3]),
                    "stateColor" : '#C70039'
                },
                {
                    "Category": Object.keys(obj1)[5],
                    "One Parent(mother) in Albany County": numeral(parseFloat(Object.values(obj1)[4])).format('0.0a'),
                    "county/cousub": parseFloat(Object.values(obj1)[5]),
                    "countyColor": '#FF5733',
                    "One Parent(mother) in New York State": numeral(parseFloat(Object.values(obj2_percent[i])[4])).format('0.0a'),
                    "New York state": parseFloat(Object.values(obj2_percent[i])[5]),
                    "stateColor": '#C70039'
                }
            )
        })
        resolve(compareData)
    })
    })
    }

    render () {
        const style = {
            height:500
        };
        let colors =[];
        if (this.props.colorRange !== undefined && this.props.colorRange.length >0){
            colors = this.props.colorRange
        }else{
            this.state.graphData4.map(d => colors.push(d.stateColor,d.countyColor))
        }
        if(Object.values(this.props.censusKey).includes('B23008') && Object.values(this.props.compareGeoid).includes('36')){
            return(
                <div style={style}>
                <ResponsiveBar
            data={this.state.graphData4}
            indexBy="Category"
            keys = {["county/cousub","New York state"]}
            margin={{
                "top": 100,
                    "right": 130,
                    "bottom": 170,
                    "left": 60
            }}
            padding={0.1}
            groupMode="grouped"
            colors = {colors}
            colorBy = "id"
            layout = "vertical"
            borderColor="inherit:darker(1.6)"
            enableGridX = {true}
            enableGridY={true}
            axisBottom={{
                "orient": "bottom",
                    "tickSize": 5,
                    "tickPadding": 5,
                    "tickRotation": 0,
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
                    "legend" : "Percentage of Population",
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
            legends={[
                    {
                        "dataFrom": "keys",
                        "anchor": "bottom",
                        "direction": "row",
                        "translateX": 30,
                        "translateY": 65,
                        "itemWidth": 100,
                        "itemHeight": 20,
                        "itemsSpacing": 2,
                        "symbolSize": 20
                    }
                    ]}
            markers={[
                    ]}

            tooltip={({ id, indexValue, value, color,data }) => (
            <div>
            <b><big>{indexValue}</big></b>
            <br/> <br/>
            {id} :{(id.includes('county/cousub')) ? Object.values(data)[4] : Object.values(data)[1]}, {value}%
        </div>
        )}
            />
            </div>
        )
        }

    }


    static defaultProps = {
        censusKey: ['B23008'], //'B19013',,
        geoid: ['36001'],
        compareGeoid: ['36'],
        colorRange: []
    }

}


const mapDispatchToProps = { };

const mapStateToProps = (state,ownProps) => {
    return {
        geoid:ownProps.geoid,
        compareGeoid:ownProps.compareGeoid,
        graph: state.graph // so componentWillReceiveProps will get called.
    };
};
export default connect(mapStateToProps, mapDispatchToProps)(reduxFalcor(CensusGroupedBarChart))
