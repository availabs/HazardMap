import React, { Component } from 'react';
import { connect } from 'react-redux';
import { reduxFalcor} from "utils/redux-falcor";
import {falcorGraph} from "store/falcorGraph";
import {ResponsiveBar} from '@nivo/bar'
import ColorRanges from 'constants/color-ranges'
var numeral = require('numeral')

class CensusBarChart extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            value: 2014,
            temp:2014,
            graphData2: [],
            graphData10: [],
            graphData11:[],
            graphData12:[],
            graphData13:[],
            height:0,
            width:0
        }
        this.handleChange = this.handleChange.bind(this)
    }
    handleChange(event) {
        this.setState({value: event.target.value});
    }
    fetchFalcorDeps() {
        let census_var = this.props.censusKey;
        let censusConfig ={};
        let census_subvars = [];
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
            return falcorGraph.get(['acs',[...this.props.geoid],[...this.props.year],[...census_subvars]],['acs','config'])
    .then(response =>{
            return response
        })
    })

    }



    componentWillMount()
    {

        this.languageData().then(res =>{
            this.setState({
                graphData2 : res
            })
        })

        this.familyData().then(res =>{
            this.setState({
                graphData10: res
            })
        })

        this.educationData().then(res =>{
            this.setState({
                graphData11:res
            })
        })

        this.housingData().then(res =>{
            this.setState({
                graphData12:res
            })
        })

    }

    componentDidUpdate(oldProps,oldState){
        if(oldProps.geoid !== this.props.geoid){
            this.languageData().then(res =>{
                this.setState({
                    graphData2 : res
                })
            })

            this.familyData().then(res =>{
                this.setState({
                    graphData10: res
                })
            })

            this.educationData().then(res =>{
                this.setState({
                    graphData11:res
                })
            })

            this.housingData().then(res =>{
                this.setState({
                    graphData12:res
                })
            })

        }
    }


    languageData(){
        return new Promise((resolve,reject) => {
            this.fetchFalcorDeps().then(response => {
                let langData_vw = []; //Speak English very well
                let langData_nvw = [];// Speak English less than very well
                let langData = [];
                let censusConfig = response.json.acs.config[this.props.censusKey].variables;
                let responseData_language = response.json.acs[this.props.geoid][this.props.year]
                Object.keys(responseData_language).forEach(function (language, i) {
                    censusConfig.forEach(function (subvar) {
                        if (language === subvar.value) {
                            if (subvar.name.includes('Speak English very well')) {
                                langData_vw.push({
                                    "language": subvar.name.split('Speak')[0],
                                    "Speakers": responseData_language[language]
                                })
                            }
                            else if (subvar.name.includes('Speak English Less than very well')) {
                                langData_nvw.push({
                                    "language": subvar.name.split('Speak')[0],
                                    "Speakers": responseData_language[language]
                                })
                            }
                        }
                    })

                })


                let subvarColors = ['#C01616', '#091860', '#E0E540', '#C15E0A', '#074F28', '#564B8E', '#287F2C', '#1AA3CB', '#790576',
                    '#F7C9B9', '#F4F3AF', '#C2ECF3', '#F4AD4D', '#2AF70E', '#D8AFE7', '#88DE73', '#718CD1', '#EA6A7D',
                    '#C01616', '#091860', '#E0E540', '#C15E0A', '#074F28', '#564B8E', '#287F2C'
                ]

                Object.values(langData_nvw).forEach(function (nvw, i) {
                        langData.push({
                            "language": nvw.language,
                            "Speakers": parseFloat(nvw.Speakers) + parseFloat(langData_vw[i].Speakers),
                            "Percent": parseFloat((parseFloat(nvw.Speakers) / (parseFloat(langData_vw[i].Speakers) + parseFloat(nvw.Speakers)) * 100).toFixed(2)),
                            "language_color": subvarColors[i]
                        })

                })
                langData.sort(function (a, b) {
                    var a1 = parseFloat(a.Percent)
                    var b1 = parseFloat(b.Percent)
                    return b1 - a1
                })
                resolve(langData)
            })
        })


    }

    familyData(){
        return new Promise((resolve,reject) => {
            this.fetchFalcorDeps().then(response =>{
                let responseData_family =response.json.acs[this.props.geoid][this.props.year];
                let censusConfig = response.json.acs.config[this.props.censusKey].variables;
                let familyData = [];
                let colors = ['#C01616','#091860','#E0E540','#C15E0A','#074F28','#564B8E','#287F2C']
                Object.keys(responseData_family).filter(d => d !== '$__path').forEach(function(item){
                    censusConfig.forEach(function(config,j){
                        if ( j !== 0){
                            if (responseData_family[config.value] < 0){
                                familyData.push({
                                    "family":config.name,
                                    "familyIncome":Math.abs(responseData_family[config.value])/1000,
                                    "color": colors[j]
                                })
                            }
                            else{
                                familyData.push({
                                    "family":config.name,
                                    "familyIncome":responseData_family[config.value],
                                    "color": colors[j]
                                })
                            }
                        }
                    })

                })

                resolve(familyData)
            })
        })
    }

    educationData(){
        return new Promise((resolve,reject) => {
            this.fetchFalcorDeps().then(response =>{
                let response_educationData = response.json.acs[this.props.geoid][this.props.year];
                let censusConfig = response.json.acs.config[this.props.censusKey].variables;
                let educationData = [];
                //let colors = ColorRanges[Object.keys(response_educationData).shift().length].filter(d => d.name === 'Set2')[0].colors;
                let colors = ["#66c2a5", "#fc8d62", "#8da0cb", "#e78ac3", "#a6d854", "#ffd92f", "#e5c494", "#b3b3b3",
                              '#C01616','#091860','#E0E540','#C15E0A','#074F28','#564B8E','#287F2C',
                    '#F7C9B9', '#F4F3AF', '#C2ECF3', '#F4AD4D', '#2AF70E', '#D8AFE7', '#88DE73', '#718CD1', '#EA6A7D','#1AA3CB'

                ]
                    censusConfig.forEach(function(config,j){
                        if ( j !== 0){
                            if (response_educationData[config.value] < 0){
                                educationData.push({
                                    "education":config.name,
                                    "number":Math.abs(response_educationData[config.value])/1000,
                                    "color": colors[j]
                                })
                            }
                            else{
                                educationData.push({
                                    "education":config.name,
                                    "number":response_educationData[config.value],
                                    "color": colors[j]
                                })
                            }
                        }
                    })
                resolve(educationData)
            })
        })
    }
    housingData(){
        return new Promise((resolve,reject) => {
            this.fetchFalcorDeps().then(response =>{
            if(this.props.housingUnitsMortgageCosts){
                let response_data = response.json.acs[this.props.geoid][this.props.year];
                let censusConfig = response.json.acs.config[this.props.censusKey].variables;
                let housingData = [];
                let colors = ["#66c2a5", "#fc8d62", "#8da0cb", "#e78ac3", "#a6d854", "#ffd92f", "#e5c494", "#b3b3b3",
                    '#C01616','#091860','#E0E540','#C15E0A','#074F28','#564B8E','#287F2C',
                    '#F7C9B9', '#F4F3AF', '#C2ECF3', '#F4AD4D', '#2AF70E', '#D8AFE7', '#88DE73', '#718CD1', '#EA6A7D','#1AA3CB'

                ]
                censusConfig.forEach(function(config,j){
                    if (j > 1 && j <19){
                        //if(response_data[config.value] >0){
                            housingData.push({
                                "housingStatus":config.name,
                                "cost":response_data[config.value],
                                "color": colors[j]
                            })
                        //}
                    }
                })
                resolve(housingData)
            }
                if(this.props.housingUnitsNoMortgageCosts){
                    let response_data = response.json.acs[this.props.geoid][this.props.year];
                    let censusConfig = response.json.acs.config[this.props.censusKey].variables;
                    let housingData = [];
                    let colors = ["#66c2a5", "#fc8d62", "#8da0cb", "#e78ac3", "#a6d854", "#ffd92f", "#e5c494", "#b3b3b3",
                        '#C01616','#091860','#E0E540','#C15E0A','#074F28','#564B8E','#287F2C',
                        '#F7C9B9', '#F4F3AF', '#C2ECF3', '#F4AD4D', '#2AF70E', '#D8AFE7', '#88DE73', '#718CD1', '#EA6A7D','#1AA3CB'

                    ]

                    censusConfig.forEach(function(config,j){
                        if (j > 19){
                            //if(response_data[config.value] >0){
                            housingData.push({
                                "housingStatus":config.name,
                                "cost":response_data[config.value],
                                "color": colors[j-14]
                            })
                            //}
                        }
                    })
                    resolve(housingData)
                }
        })
    })
    }


    render () {
        const style = {
            height:500
        };

        if(this.props.language){
            let colors = [];
            if (this.props.colorRange !== undefined && this.props.colorRange.length >0){
                colors = this.props.colorRange;
            }else{
                colors =  this.state.graphData2.map(d => d.language_color);
            }
        return(
            <div style={style}>
            <ResponsiveBar
            data={this.state.graphData2}
            indexBy="language"
            keys = {["Percent"]}
            margin={{
                "top": 100,
                    "right": 130,
                    "bottom": 170,
                    "left": 60
            }}
            padding={0.3}
            colors = {colors}
            colorBy = "index"
            layout = "vertical"
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
            {['Total Speakers']} : {data.Speakers}
        <br/>
            {id} Speaking English less than very well: {value}%
        </div>
        )}
            />
            </div>
        )
        }
        if(this.props.familyIncome === true){
            let colors = [];
            if (this.props.colorRange !== undefined && this.props.colorRange.length >0){
                colors = this.props.colorRange;
            }else{
                colors =  this.state.graphData10.map(d => d.color);
            }
            return(
                <div style={style}>
                <ResponsiveBar
            data={this.state.graphData10}
            indexBy="family"
            keys = {["familyIncome"]}
            margin={{
                "top": 100,
                    "right": 130,
                    "bottom": 170,
                    "left": 60
            }}
            minValue={0}
            maxValue={200000}
            padding={0.5}
            colors = {colors}
            colorBy = "index"
            layout = "vertical"
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
                    "legend" : "Median Income by Family Size",
                    format: v => `${v}`
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
            {['Family Size']} : {data.family}
        <br/>
            Median Income by Family Size: ${value}
        </div>
        )}
            />
            </div>
        )
        }
        if(this.props.educationalAttainment){
            let colors = [];
            if (this.props.colorRange !== undefined && this.props.colorRange.length >0){
                colors = this.props.colorRange;
            }else{
                colors =  this.state.graphData11.map(d => d.color);
            }
            return(
                <div style={style}>
                <ResponsiveBar
            data={this.state.graphData11}
            indexBy="education"
            keys = {["number"]}
            margin={{
                "top": 100,
                    "right": 130,
                    "bottom": 170,
                    "left": 60
            }}
            minValue={5}
            maxValue={50000}
            padding={0.5}
            colors = {colors}
            colorBy = "index"
            layout = "vertical"
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
                    "legend" : "Population 25 Years and Over",
                    format: v => `${v}`
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
            <text>
            <b><big>{indexValue}</big></b>
            <br/> <br/>
            {['Education']} : {data.education}
        <br/>
            Number: {value}
                </text>
        )}
            />
            </div>
        )
        }
        if(this.props.housingUnitsMortgageCosts){
            let colors = [];
            if (this.props.colorRange !== undefined && this.props.colorRange.length >0){
                colors = this.props.colorRange;
            }else{
                colors =  this.state.graphData12.map(d => d.color);
            }
            return(
                <div style={style}>
                <ResponsiveBar
            data={this.state.graphData12}
            indexBy="housingStatus"
            keys = {["cost"]}
            margin={{
                "top": 100,
                    "right": 130,
                    "bottom": 170,
                    "left": 60
            }}
            minValue={0}
            maxValue={15000}
            padding={0.5}
            colors ={colors}
            colorBy = "index"
            layout = "vertical"
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
                    "legend" : "Number of Owner Occupied Housing units with Mortgage",
                    format: v => `${v}`
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
            <text>
            <b><big>{indexValue}</big></b>
            <br/> <br/>
            {['Cost']} : {data.housingStatus}
        <br/>
            Number: {value}
        </text>
        )}
            />
            </div>
            )
        }

        if(this.props.housingUnitsNoMortgageCosts){
            let colors = [];
            if (this.props.colorRange !== undefined && this.props.colorRange.length >0){
                colors = this.props.colorRange;
            }else{
                colors =  this.state.graphData12.map(d => d.color);
            }
            return(
                <div style={style}>
                <ResponsiveBar
            data={this.state.graphData12}
            indexBy="housingStatus"
            keys = {["cost"]}
            margin={{
                "top": 100,
                    "right": 130,
                    "bottom": 170,
                    "left": 60
            }}
            minValue={0}
            maxValue={7000}
            padding={0.5}
            colors ={colors}
            colorBy = "index"
            layout = "vertical"
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
                    "legend" : "Number of Owner Occupied Housing units without Mortgage",
                    format: v => `${v}`
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
                {['Cost']} : {data.housingStatus}
            <br/>
                Number: {value}
            </div>
        )}
            />
            </div>
        )
        }



    }


    static defaultProps = {
        year: ['2015'],
        censusKey: [],
        geoid: [],
        language:false,
        familyIncome: false,
        educationalAttainment:false,
        housingUnitsMortgageCosts:false,
        housingUnitsNoMortgageCosts:false,
        colorRange:[]
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
