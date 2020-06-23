import React, { Component } from 'react';
import { connect } from 'react-redux';
import { reduxFalcor} from "utils/redux-falcor";

import get from 'lodash.get'

import styled from "styled-components";

import { fnum } from "utils/sheldusUtils"

import COLOR_RANGES from "constants/color-ranges"



let GraphListItem =  styled.li`
	display: flex;
    flex-flow: row nowrap;
    cursor: pointer;
    align-items: center;
    justify-content: flex-start;
    margin-bottom: .59975em;
    color: #5c6587;
    transition: all 80ms linear;
`

let GraphIcon = styled.i`
	margin-right: .8em;
    color: ${props => props.color || '#5c6587'};
    font-size: 35px;
    height: 40px;
    transition: all 80ms linear;
    flex: 0 0 40px;
`

let BarContainer = styled.div`
	display: flex;
    flex-flow: column nowrap;
    flex: 1 0 auto;
    max-width: calc(100% - (40px + 1.333em));
`
let GraphLabel = styled.div`
	display: flex;
    flex-flow: row nowrap;
    justify-content: space-between;
    align-items: center;
`
let NameLabel = styled.span`
	font-size: .6667em;
    font-weight: 900;
    line-height: 1.25;
    letter-spacing: .1em;
    text-transform: uppercase;
    font-weight: 500;
`

let NumberLabel = styled.span`
	font-feature-settings: "tnum";
    text-align: right;
    font-size: .6667em;
    font-weight: 900;
    line-height: 1.25;
    letter-spacing: .1em;
    text-transform: uppercase;
    font-weight: 500;
`

let Bar = styled.div`
	position: relative;
    margin-top: .25em;
    width: 100%;
    height: .5em;
    border-radius: .25em;
    background-color: rgba(92,101,135,.6);
`
let BarValue = styled.div`
	height: .5em;
    border-radius: .25em;
	width: ${props => props.width || 0}%;
    left: ${props => props.left || 0}%;
    background-color: ${props => props.color || 'rgb(39, 216, 136)'};
`

class CensusDomGraph extends React.Component{
    constructor(props) {
        super(props);

        this.state={
            graphData6: []
        }

    }


    fetchFalcorDeps() {
        let censusConfig ={};
        let census_subvars = [];
        let censusKey = this.props.censusKey;
        return this.props.falcor.get(['acs','config']).then(res => {

            Object.values(res.json.acs).forEach( (config, i) =>{
                censusConfig = config
            });

            Object.keys(censusConfig).forEach(function (censvar, i) {
                if (censusKey.includes(censvar)) {
                    Object.values(censusConfig[censvar].variables).forEach(function (subvar, i) {
                        census_subvars.push(subvar.value)
                    })
                }
            });
            return this.props.falcor.get(['acs',[...this.props.geoid],[...this.props.year],[...census_subvars]],['acs','config'])
                .then(response=>{
                    return response
                })

        })
    }

    componentWillMount(){
        this.domData().then(res=>{
            this.setState({
                graphData6 : res
            })
        })
    }
    domData(){
        return new Promise((resolve,reject) => {
            this.fetchFalcorDeps().then(response =>{
                let data =[];
                let finalDomData = {}
                let censusConfig = response.json.acs.config[this.props.censusKey].variables;
                if (this.props.geoid.length === 1){
                    let domData = response.json.acs[this.props.geoid][this.props.year];
                    let colors = COLOR_RANGES[Object.keys(domData).shift().length+2].filter(d => d.name === 'Set3')[0].colors
                    Object.keys(domData).forEach(function(dom,i){
                        if(i > 1){
                            data.push({
                                'name' : censusConfig[i-1].name,
                                'value': domData[dom],
                                'color': colors[i-1]
                            })
                        }
                    });
                    resolve(data)
                }

                else{
                    let domData = [];
                    let year = this.props.year;
                    this.props.geoid.forEach(function(geoid){
                        domData.push(response.json.acs[geoid][year]);
                    });
                    finalDomData = domData.reduce((a,b) =>{
                        for (let k in b){
                            if (b.hasOwnProperty(k)){
                                a[k] = (a[k] || 0) + b[k];
                            }
                        }
                        return a
                    });
                    let colors = COLOR_RANGES[Object.keys(finalDomData).shift().length+2].filter(d => d.name === 'Set3')[0].colors;
                    Object.keys(finalDomData).forEach(function(finalDom,i){
                        if( i > 1){
                            if (censusConfig[i] !== undefined){
                                data.push({
                                    'name': censusConfig[i-1].name,
                                    'value': finalDomData[finalDom],
                                    'color': colors[i-1]
                                })
                            }
                        }
                    });
                    resolve(data)
                }
            })
        })



    }

    renderCensusSelector(data) {
        try {
            data = this.state.graphData6;
            let totalPopulation = [];
            data.forEach(function(value){
                totalPopulation.push(value.value)
            });
            let barTotal = totalPopulation.reduce((a,c) => a+c);
            data.sort((a, b) => (a.value < b.value) ? 1 : -1);
            return data.map(bar =>{
            const name = bar.name;
                return (
                    <GraphListItem>
                        <BarContainer onClick={this.props.onClick.bind(this,bar.name)}>
                            <GraphLabel>
                                <NameLabel>
                                    {name}
                                </NameLabel>
                                <NumberLabel>
                                    { fnum(bar.value) }
                                </NumberLabel>
                            </GraphLabel>
                        <Bar>
                            <BarValue width={((bar.value / barTotal) * 100)} color={bar.color}/>
                        </Bar>
                        </BarContainer>
                    </GraphListItem>
            )
             })

        } catch (e) {
            return "Loading..."


        }

    }

    render() {
        let calculatedData = this.domData()
        return (
            <div>
            <ul style={{paddingLeft: 50, paddingRight: '2em'}}>
                { this.renderCensusSelector(calculatedData) }
            </ul>
            </div>
        )
    }

    static defaultProps = {
        censusKey: [],
        geoids: [],
        year: ['2016'],
        data: [],
        colorRange:[],
        onClick: () => {}
    }

}

const mapDispatchToProps = { };

const mapStateToProps = (state,ownProps) => {
    return {
        geoid: ownProps.geoid,
        graph: state.graph // so componentWillReceiveProps will get called.
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(reduxFalcor(CensusDomGraph))
