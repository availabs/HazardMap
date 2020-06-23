import React from "react"
import { connect } from "react-redux"
import { reduxFalcor} from "utils/redux-falcor";

import { ResponsivePie } from '@nivo/pie'

import Options from '../Options'
import Title from "../ComponentTitle"

import { scaleOrdinal } from "d3-scale"
import { format as d3format } from "d3-format"

import get from "lodash.get"
import styled from "styled-components"

import GeoName from 'components/censusCharts/geoname'
import CensusLabel, { getCensusKeyLabel } from 'components/censusCharts/CensusLabel'

import { getColorRange } from 'constants/color-ranges'
const DEFAULT_COLORS = getColorRange(8, "Set2")

class CensusPieGraph extends React.Component {
  static defaultProps = {
    format: ",d"
  }
  fetchFalcorDeps() {
    return this.props.falcor.get(
        ['acs', this.props.allGeoids, this.props.years,
          [...this.props.censusKeys,
            ...this.props.censusKeysMoE]
        ],
        ["geo", this.props.allGeoids, "name"],
        ["acs", "meta", this.props.censusKeys, "label"]
    )
  }
  render() {
    const format = d3format(this.props.format);
    return (
      <div style={ { width: "100%", height: "100%" } }>
        <ResponsivePie data={ this.props.pieData[0].pie }
          margin={ {
            top: 30, bottom: 30
          } }
          enableRadialLabels={ false }
          slicesLabelsSkipAngle={ 25 }
          sliceLabel={ d => format(d.value) }/>
      </div>
    )
  }
}

const mapStateToProps = (state, props) => ({
  pieData: getPieData(state, props),
  acsGraph: get(state, ["graph", "acs"], {}),
  geoGraph: get(state, ["graph", "geo"], {}),
  allGeoids: [...props.geoids, props.compareGeoid].filter(geoid => Boolean(geoid))
})
const mapDispatchToProps = {

}
export default connect(mapStateToProps, mapDispatchToProps)(reduxFalcor(CensusPieGraph))

const getPieData = (state, props) =>
  [...get(props, "geoids", []), props.compareGeoid].filter(Boolean)
    .map(g => ({
      geoid: g,
      pie: get(props, "censusKeys", []).reduce((a, c) => {
        const y = get(props, "year", 2017),
          v = +get(state, ["graph", "acs", g, y, c], -666666666);
        if (v !== -666666666) {
          a.push({
            id: c,
            label: c,
            value: v
          })
        }
        return a;
      }, [])
    }))
