import React, { Component } from 'react';
import { connect } from 'react-redux';
import { reduxFalcor} from "utils/redux-falcor";
import {falcorGraph} from "store/falcorGraph";
import TrackVisibility from 'react-on-screen';

class CensusStatBox extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            graphData9: []
        }
    }
    fetchFalcorDeps(){
        let censusConfig ={};
        let census_subvars = [];
        return falcorGraph.get(['acs','config'])
            .then(res =>{
                censusConfig = res.json.acs.config[this.props.censusKey].variables
                Object.values(censusConfig).forEach(function(config,i){
                    census_subvars.push(config.value)
                })
                return falcorGraph.get(['acs',[...this.props.geoid],this.props.year,[...census_subvars]],['acs','config'])
                    .then(response =>{
                        console.log('got data', response)
                        return response
                    })
            })
    }

    componentWillMount(){
        this.statBoxData().then(res =>{
            this.setState({
                graphData9 : res
            })
        })

    }

    componentDidUpdate(oldProps)
    {
        if(oldProps.geoid !== this.props.geoid){
            this.statBoxData().then(res =>{
                this.setState({
                    graphData9 : res
                })
            })
        }

    }

    statBoxData(){
        return new Promise((resolve,reject) => {
            this.fetchFalcorDeps().then(response =>{
                let census_config = response.json.acs.config[this.props.censusKey].variables;
                let response_data = response.json.acs[this.props.geoid];
                let statData = [];
                let year = Object.keys(response_data).filter(d => d !== '$__path')
                if(this.props.poverty){
                    Object.keys(response_data).filter(d => d !== '$__path').forEach(function(item,i){
                        let data = response_data[item];
                        let value= Object.keys(data).filter(d => d!== '$__path');
                        census_config.forEach(function(config,j){
                            if (j === 0){
                                statData.push({
                                    "title": 'Poverty',
                                    "titleColor":'#000001',
                                    "subTitleColor":'#000001',
                                    "yearColor":'#504F4F',
                                    "valueColor":'#0099ff',
                                    "censusVarName": config.name,
                                    "year": year,
                                    "value": (data[value[0]] / data[value[1]] * 100).toFixed(2) + '%'
                                })
                            }
                        })
                    });
                    resolve(statData)
                }
                else if(this.props.housing){
                    Object.keys(response_data).filter(d => d !== '$__path').forEach(function(item,i){
                        let data = response_data[item];
                        let value= Object.keys(data).filter(d => d!== '$__path');
                        census_config.forEach(function(config,j){
                            if (j === 2){
                                statData.push({
                                    "title":"Housing",
                                    "titleColor":'#000001',
                                    "subTitleColor":'#000001',
                                    "yearColor":'#504F4F',
                                    "valueColor":'#0099ff',
                                    "censusVarName": config.name,
                                    "year": year,
                                    "value": (data[value[2]] / data[value[0]] * 100).toFixed(2) + '%'
                                })
                            }
                        })
                    });
                    resolve(statData)
                }
                else if(this.props.amount){
                    Object.keys(response_data).filter(d => d !== '$__path').forEach(function(item){
                        let data = response_data[item];
                        census_config.forEach(function(config,j){
                            if (j===0){
                                console.log(data[config.value], data, config.value)
                                statData.push({
                                    "title": "Economy",
                                    "titleColor":'#000001',
                                    "subTitleColor":'#000001',
                                    "yearColor":'#504F4F',
                                    "valueColor":'#0099ff',
                                    "censusVarName": config.name,
                                    "year": year,
                                    "value": '$' + (data[config.value].toLocaleString())
                                })
                            }
                        })
                    });
                    resolve(statData)
                }
                else if(this.props.education){
                    Object.keys(response_data).filter(d => d !== '$__path').forEach(function(item){
                        let data = response_data[item];
                        let value= Object.keys(data).filter(d => d!== '$__path');
                            statData.push({
                                "title":"Education",
                                "titleColor":'#000001',
                                "subTitleColor":'#000001',
                                "yearColor":'#504F4F',
                                "valueColor":'#0099ff',
                                "censusVarName": 'HS ED. & Above',
                                "year": year,
                                "value": ((data[value[16]] + data[value[17]] + data[value[18]] + data[[value[19]]] + data[value[20]] + data[value[21]] + data[value[22]] + data[value[23]] + data[value[24]])/ data[value[0]] * 100).toFixed(2) + '%'
                            })
                    })
                    resolve(statData)
                }
                else if(this.props.housingMortgagePercent){
                    Object.keys(response_data).filter(d => d !== '$__path').forEach(function(item){
                        let data = response_data[item];
                        let value= Object.keys(data).filter(d => d!== '$__path');
                        statData.push({
                            "title":"Housing",
                            "titleColor":'#000001',
                            "subTitleColor":'#000001',
                            "yearColor":'#504F4F',
                            "valueColor":'#0099ff',
                            "censusVarName": 'Mortgaged Housing units by Monthly Owner Costs as a Percent(>30%) of Household Income',
                            "year": year,
                            "value": ((data[value[7]] + data[value[8]] + data[value[9]] + data[[value[10]]]) / data[value[1]] * 100).toFixed(2) + '%'
                        })
                    })
                    resolve(statData)
                }
                else if(this.props.housingNoMortgagePercent){
                    Object.keys(response_data).filter(d => d !== '$__path').forEach(function(item){
                        let data = response_data[item];
                        let value= Object.keys(data).filter(d => d!== '$__path');
                        statData.push({
                            "title":"Housing",
                            "titleColor":'#000001',
                            "subTitleColor":'#000001',
                            "yearColor":'#504F4F',
                            "valueColor":'#0099ff',
                            "censusVarName": 'Non Mortgaged Housing units by Monthly Owner Costs as a Percent(>30%) of Household Income',
                            "year": year,
                            "value": ((data[value[18]] + data[value[19]] + data[value[20]] + data[[value[21]]]) / data[value[12]] * 100).toFixed(2) + '%'
                        })
                    })
                    resolve(statData)
                }

                else{
                    Object.keys(response_data).filter(d => d !== '$__path').forEach(function(item,i){
                        let data = response_data[item]
                        census_config.forEach(function(config,j){
                            console.log( data,config.value, data[config.value] )
                                
                            if (j===0){
                                statData.push({
                                    "title":"Demographics",
                                    "titleColor":'#000001',
                                    "subTitleColor":'#000001',
                                    "yearColor":'#504F4F',
                                    "valueColor":'#0099ff',
                                    "censusVarName": config.name,
                                    "year": year,
                                    "value": data[config.value].toLocaleString()
                                })
                            }

                        })
                    });
                    resolve(statData)
                }
            })
        })
    }

    render(){
        let colors = [];
        if (this.props.colorRange !== undefined && this.props.colorRange.length >0){
            colors = this.props.colorRange;
        }else{
            this.state.graphData9.map(d => colors.push(d.titleColor,d.subTitleColor,d.yearColor,d.valueColor));
        }
        return(
            <div>
               
                <div>
                    <span className='title' style={{fontSize: '1.2em'}}> 
                        {this.state.graphData9.map(d => d.censusVarName)}
                    </span>
                    
                </div>
                <div className='value' >{this.state.graphData9.map(d => d.value)}</div>
                <span className='trending'> 
                        {this.state.graphData9.map(d => d.year)} 
                    </span>
            </div>
        )

    }
    static defaultProps = {
        censusKey: ['B01003'], //'B19013',,
        geoid: ['36001'],
        compareGeoid: ['36'],
        year:['2016'],
        isvisible:false,
        amount: false,
        poverty: false,
        housing: false,
        education: false,
        demographics: false,
        housingMortgagePercent:false,
        housingNoMortgagePercent:false,
        colorRange:[]
    }
}

const mapDispatchToProps = { };

const mapStateToProps = (state,ownProps) => {
    return {
        geoid:ownProps.geoid,
        graph: state.graph // so componentWillReceiveProps will get called.
    };
};
export default connect(mapStateToProps, mapDispatchToProps)(reduxFalcor(CensusStatBox))