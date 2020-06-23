import React, { Component } from 'react';
import { connect } from 'react-redux';
import { reduxFalcor} from "utils/redux-falcor";
import CensusPieChart from "./censusPieChart"
class CensusPieCompare extends React.Component {
    constructor(props) {
        super(props);

    }

    render () {
        let countyNames=['Albany ','Rensselaer ','Schenectady ','Saratoga ','Greene ','Columbia ','Washington ','Warren ']
        let colors= this.props.colorRange;
        return(
        <div style={{display:'flex', justifyContent: 'space-evenly',flexWrap: 'wrap',flexDirection:'row',alignContent:'center'}}>
            {this.props.geoid.map(function(county,index){
            return (
                <div style={{width: '25%' }}>
                <h5>{countyNames[index]} County</h5>
                <CensusPieChart geoid={[county]} censusKey={['B02001']} pieWidth={200} pieHeight={200} colorRange={colors}/>
                </div>
            )
                })
            }
        </div>

    )
    }

    static defaultProps = {
        censusKey: [],
        geoids: [],
        year: ['2016'],
        colorRange:[]
    }

}


const mapDispatchToProps = { };

const mapStateToProps = (state,ownProps) => {

    return {
        geoid: ownProps.geoid,
        graph: state.graph // so componentWillReceiveProps will get called.
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(reduxFalcor(CensusPieCompare))

