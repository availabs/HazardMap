import React, { Component } from 'react';
import { connect } from 'react-redux';
import { reduxFalcor} from "utils/redux-falcor";

import Geoname from "../geoname"

import get from 'lodash.get'
// import styled from "styled-components"

// const YearDiv = styled.div`
//   position: ${ props => props.position === "block" ? "static" : "absolute" };
//   text-align: ${ props => props.position === "block" ? "center" : "left" };
//   bottom: ${ props => props.position.includes("bottom") ? "10px" : "auto" };
//   left: ${ props => props.position.includes("left") ? "20px" : "auto" };
//   right: ${ props => props.position.includes("right") ? "20px" : "auto" };
// `

class CensusStatBox extends Component {
    fetchFalcorDeps(){
        return this.props.falcor.get(
          ['acs',
            [...this.props.geoids,
              this.props.compareGeoid
            ].filter(Boolean),
            this.props.years,
            [...this.props.censusKeys, ...this.props.divisorKeys]
          ]
        )//.then(res => console.log("RES:", res))
    }

    calculateValues(geoids){
      const getValue = (g, y, c) => {
        const v = get(this.props.graph, ["acs", g, y, c], -666666666);
        return v === -666666666 ? 0 : v;
      }

      let value = geoids.reduce((a, c) =>
        a + this.props.censusKeys.reduce((aa, cc) =>
          aa + getValue(c, this.props.year, cc)
        , 0)
      , 0)

        // let value = geoids
        //     .map(geoid => get(this.props.graph, `acs.${geoid}.${this.props.year}.${this.props.censusKey}`, 0))
        //     .reduce((a,b) => a + b )

        if(this.props.sumType === 'avg') {
            value /= geoids.length
        } else if (this.props.sumType === 'pct') {
            // let divisorValue = geoids
            // .map(geoid => get(this.props.graph, `acs.${geoid}.${this.props.year}.${this.props.divisorKey}`, 0))
            // .reduce((a,b) => a + b )
              let divisorValue = geoids.reduce((a, c) =>
                a + this.props.divisorKeys.reduce((aa, cc) =>
                  aa + getValue(c, this.props.year, cc)
                , 0)
              , 0)

            // console.log('calculateValues', value, divisorValue, value / divisorValue * 100)
            value /= divisorValue
            value *= 100
        }

        // console.log('got the value', value)
        if(!value) {
            return {value: '', change: ''}
        }

        let change = 0
        // console.log('compareYear', this.props.compareYear)

        if(this.props.compareYear) {
          let compareValue = geoids.reduce((a, c) =>
            a + this.props.censusKeys.reduce((aa, cc) =>
              aa + getValue(c, this.props.compareYear, cc)
            , 0)
          , 0)
            // let compareValue = geoids
            //     .map(geoid => get(this.props.graph, `acs.${geoid}.${this.props.compareYear}.${this.props.censusKey}`, 0))
            //     .reduce((a,b) => a + b )

            if (this.props.sumType === 'pct') {
                // let divisorValue = geoids
                //   .map(geoid => get(this.props.graph, `acs.${geoid}.${this.props.year}.${this.props.divisorKey}`, 0))
                //   .reduce((a,b) => a + b )
                  let divisorValue = geoids.reduce((a, c) =>
                    a + this.props.divisorKeys.reduce((aa, cc) =>
                      aa + getValue(c, this.props.year, cc)
                    , 0)
                  , 0)

                // console.log('calculateValues', value, divisorValue, value / divisorValue * 100)
                compareValue /= divisorValue
                compareValue *= 100
            }



            change = (((value - compareValue) / compareValue) * 100)
            // console.log('comparevalue', this.props.compareYear)

            change = isNaN(change) ? '' : change.toFixed(2)
        }

        return {
            value,
            change
        }
    }

    renderStuff(geoids) {
        let { value, change } = this.calculateValues(geoids),
          growthColors = [this.props.increaseColor, this.props.decreaseColor];
        this.props.invertColors && growthColors.reverse();
        if (!this.props.showColors) {
          growthColors = ["currentColor", "currentColor"];
        }

        const growthColor = change ? growthColors[change >= 0 ? 0 : 1] : "currentColor";
      return (
        <div style={ { color: growthColor } }>
          <div style={ {
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-end"
          } }>
            { this.props.compareGeoid &&
              <div style={ { marginRight: "10px", marginBottom: "6px" } }>
                <Geoname geoids={ geoids }/>
              </div>
            }
            <div className='value'
              style={ {
                display: 'block',
                fontSize: this.props.compareGeoid ? "2rem" : null
              } }>
              { value && this.props.valuePrefix }
              { value ? value.toLocaleString('en-us',{maximumFractionDigits: this.props.maximumFractionDigits}) : "No Data" }
              { value && this.props.valueSuffix }
            </div>
          </div>
          { this.props.compareYear && change &&
            <div style={ { textAlign: 'center', marginTop: "-10px" } }>
                { Math.abs(change)}% {change >= 0 ? 'Growth' : 'Decline' }
            </div>
           }
        </div>
      )
    }

    render(){
// console.log("GEOIDS:", this.props.geoids)
        return(
          <div style={ { height: "100%", position: "relative" } }>
            <div className='el-tablo'
              style={ {
                padding: "10px",
                position: "relative"
              } }>
              <div className='title' style={{fontSize: '1.2em', textAlign: 'center'}}>
                  {this.props.title}
              </div>
              <div>
                { this.renderStuff(this.props.geoids) }
                {
                  !this.props.compareGeoid ? null :
                  this.renderStuff([this.props.compareGeoid])
                }
              </div>
            </div>
            { this.props.compareYear && (this.props.yearPosition !== "none") &&
              <div position={ this.props.yearPosition }>
                 <b>{ this.props.year }</b> vs <b>{ this.props.compareYear }</b>
              </div>
            }
          </div>
        )

    }

    static defaultProps = {
        censusKeys: [],
        geoids: [],
        compareGeoid: null,
        years: [2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018],
        year:'2017',
        compareYear: null,
        maximumFractionDigits: 0,
        divisorKeys: [],
        yearPosition: "bottom-left",
        increaseColor: "#090",
        decreaseColor: "#900",
        invertColors: false,
        showColors: true
    }
}

const mapDispatchToProps = { };

const mapStateToProps = (state) => {
    return {
        graph: state.graph // so componentWillReceiveProps will get called.
    };
};
export default connect(mapStateToProps, mapDispatchToProps)(reduxFalcor(CensusStatBox))
