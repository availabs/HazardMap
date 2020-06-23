import React, { Component } from 'react';
import { connect } from 'react-redux';
import { reduxFalcor} from "utils/redux-falcor";
import { ResponsivePieCanvas } from '@nivo/pie'
import ColorRanges from 'constants/color-ranges'


class CensusPieChart extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            height : [],
            width: [],
            graphData5: []
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
            })

            return this.props.falcor.get(['acs',[...this.props.geoid],[...this.props.year],[...census_subvars]],['acs','config'])
                .then(response=>{
                    return response
            })

        })
    }

    function

    componentDidMount() {

        let width = document.getElementById('root').clientHeight * 0.25
        let height = document.getElementById('root').clientHeight * 0.25

        this.setState({
            height: height,
            width: width
        })

    }

    componentWillMount(){
        this.pieData().then(res=>{
            this.setState({
                graphData5: res
            })
        })
    }

    componentDidUpdate(oldProps)
    {
        if(oldProps.geoid !== this.props.geoid){
            this.pieData().then(res =>{
                this.setState({
                    graphData5 : res
                })
            })
        }

    }

    pieData(){
        return new Promise((resolve,reject) => {
            this.fetchFalcorDeps().then(response =>{
                let census_config = {};
                let responseData_race = {};
                let pieData = [];
                census_config = response.json.acs.config[this.props.censusKey].variables;
                responseData_race = response.json.acs[this.props.geoid][this.props.year];
                let colors = ColorRanges[Object.keys(responseData_race).shift().length+2].filter(d => d.name === 'Set3')[0].colors;
                Object.keys(responseData_race).forEach(function(race_key,i){
                    if (i > 1){
                        if (census_config[i] !== undefined){
                            pieData.push({
                                'id':census_config[i-1].name,
                                'label':census_config[i-1].name,
                                'value':responseData_race[race_key],
                                'color': colors[i-1]
                            })
                        }
                    }
                })
                resolve(pieData)
            })
        })

    }

    render () {
        if (this.props.single === true){
            let colors = [];
            if(this.props.colorRange !== undefined && this.props.colorRange.length > 0){
                colors = this.props.colorRange
            }else{
                colors = this.state.graphData5.map(d => d.color)
            }
            const style={
                height:200,
                display:'flex',
                alignContent: 'center',
                alignItems:'center',
                justifyContent:'flex-start',
            }

            return(
                <div style={style}>
                <ResponsivePieCanvas
            data={this.state.graphData5}
            width={200}
            height={200}
            margin={{
                "top": 0,
                    "right": 10,
                    "bottom": 0,
                    "left": 10
            }}
            pixelRatio={1.2999999523162842}
            sortByValue={false}
            innerRadius={0.6}
            padAngle={0.7}
            cornerRadius={3}
            colors= {colors}
            borderColor="inherit:darker(0.6)"
            radialLabel="value"
            enableRadialLabels ={false}
            radialLabelsSkipAngle={0}
            radialLabelsTextXOffset={6}
            radialLabelsTextColor="#333333"
            radialLabelsLinkOffset={-14}
            radialLabelsLinkDiagonalLength={36}
            radialLabelsLinkHorizontalLength={30}
            radialLabelsLinkStrokeWidth={1}
            radialLabelsLinkColor="inherit"
            slicesLabelsSkipAngle={10}
            enableSlicesLabels={false}
            slicesLabelsTextColor="#333333"
            animate={true}
            motionStiffness={90}
            motionDamping={15}
            defs={[
                    {
                        "id": "dots",
                        "type": "patternDots",
                        "background": "inherit",
                        "color": "rgba(255, 255, 255, 0.3)",
                        "size": 4,
                        "padding": 1,
                        "stagger": true
                    },
            {
                "id": "lines",
                "type": "patternLines",
                "background": "inherit",
                "color": "rgba(255, 255, 255, 0.3)",
                "rotation": -45,
                "lineWidth": 6,
                "spacing": 10
            }
        ]}
            />
            <h5>Racial Population for the year 2017</h5>
            </div>
        )
        }
        else{
            const styles={
                height:200
            }
            let colors=[];
            if(this.props.colorRange !== undefined && this.props.colorRange.length > 0){
                colors = this.props.colorRange
                console.log('in',colors)

            }else{
                colors = this.state.graphData5.map(d => d.color)
            }

            return(
                <div style={styles}>
            <ResponsivePieCanvas
            data={this.state.graphData5}
            width={200}
            height={200}
            margin={{
                "top": 0,
                    "right": 10,
                    "bottom": 0,
                    "left": 10
            }}
            pixelRatio={1.2999999523162842}
            sortByValue={false}
            innerRadius={0.6}
            padAngle={0.7}
            cornerRadius={3}
            colors= {colors}
            borderColor="inherit:darker(0.6)"
            radialLabel="value"
            enableRadialLabels ={false}
            radialLabelsSkipAngle={0}
            radialLabelsTextXOffset={6}
            radialLabelsTextColor="#333333"
            radialLabelsLinkOffset={-14}
            radialLabelsLinkDiagonalLength={36}
            radialLabelsLinkHorizontalLength={30}
            radialLabelsLinkStrokeWidth={1}
            radialLabelsLinkColor="inherit"
            slicesLabelsSkipAngle={10}
            enableSlicesLabels={false}
            slicesLabelsTextColor="#333333"
            animate={true}
            motionStiffness={90}
            motionDamping={15}
            defs={[
                    {
                        "id": "dots",
                        "type": "patternDots",
                        "background": "inherit",
                        "color": "rgba(255, 255, 255, 0.3)",
                        "size": 4,
                        "padding": 1,
                        "stagger": true
                    },
            {
                "id": "lines",
                "type": "patternLines",
                "background": "inherit",
                "color": "rgba(255, 255, 255, 0.3)",
                "rotation": -45,
                "lineWidth": 6,
                "spacing": 10
            }
        ]}
            />
            </div>
        )

        }




    }


    static defaultProps = {
        censusKey: [],
        geoids: [],
        year: ['2016'],
        pieWidth: [],
        pieHeight:[],
        single:false,
        colorRange:[]
    }

}


const mapDispatchToProps = {

};


const mapStateToProps = (state,ownProps) => {
    return {
        geoid : ownProps.geoid,
        graph: state.graph // so componentWillReceiveProps will get called.
    };
};


export default  connect(mapStateToProps,mapDispatchToProps)(reduxFalcor(CensusPieChart))


