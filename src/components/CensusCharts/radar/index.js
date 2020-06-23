import React from "react"
import { connect } from 'react-redux';
import { reduxFalcor} from "utils/redux-falcor";

import { ResponsiveRadar } from '@nivo/radar'

import Options from '../Options'
import Title from "../ComponentTitle"

import { scaleOrdinal } from "d3-scale"
import { format } from "d3-format"
//import * as d3 from "d3-selection"

import get from "lodash.get"
import styled from "styled-components"

import GeoName from '../geoname'
import CensusLabel, { getCensusKeyLabel } from '../CensusLabel'

import { getColorRange } from '../color-ranges'
const COLORS = [...getColorRange(12, "Set3").slice(3), ...getColorRange(12, "Set3").slice(0, 3)]

class RadarGraph extends React.Component {
  static defaultProps = {
    year: 2017,
    years: [2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017],
    format: ",d",
    censusKeys: [],
    censusKeysMoE: [],
    censusKeyLabels: {},
    showOptions: true,
    showLegend: true,
    description: [],
    marginTop: 30,
    legendWidth: 150,
  }

  container = React.createRef();

  fetchFalcorDeps() {
    return this.props.falcor.get(
      ['acs', this.props.allGeoids, this.props.years,
        [...this.props.censusKeys, ...this.props.censusKeysMoE]
      ],
      ["geo", this.props.allGeoids, "name"],
      ["acs", "meta", this.props.censusKeys, "label"]
    )
  }
  processDataForViewing() {
    const getLabel = key =>
      key in this.props.censusKeyLabels ?
      this.props.censusKeyLabels[key] :
      getCensusKeyLabel(key, this.props.acsGraph, this.props.removeLeading);

    const data = [];

    const y = this.props.year;

    this.props.censusKeys.forEach(k => {
      const regex = /^(.+)E$/,
        M = k.replace(regex, (m, p1) => p1 + "M");

      this.props.allGeoids.forEach(g => {
        data.push({
          geoid: g,
          name: get(this.props.geoGraph, [g, "name"], g),
          year: y,
          "census key": k,
          "census label": getLabel(k),
          value: get(this.props.acsGraph, [g, y, k], "unknown"),
          moe: get(this.props.acsGraph, [g, y, M], "unknown")
        })
      })
    })
    return { data,
      keys: ["geoid", "name", "year", "census key", "census label", "value", "moe"]
    };
  }
  componentDidMount() {
    this.renderDescription();
  }
  componentDidUpdate() {
    this.renderDescription();
  }
  renderDescription() {
    const showDescription = Boolean(this.props.description.length),
      descriptionHeight = showDescription ? (this.props.description.length * 12 + 10) : 0;

    if (!showDescription) return;

    if (!this.container.current) return;

    const description = this.props.description;

    // d3.select(this.container.current)
    //   .select("svg")
    //   .selectAll("g.d3.selectdescription-group")
    //   .data([description])
    //     .join("g")
    //       .attr("class", "description-group")
    //       .style("transform", `translate(7px, calc(100% - ${ descriptionHeight }px))`)
    //       .each(function(d) {
    //         d3.select(this)
    //           .selectAll("text")
    //           .data(d)
    //           .join("text")
    //             .attr("font-size", "12px")
    //             .attr("font-family", "sans-serif")
    //             .attr("x", 10)
    //             .attr("y", (d, i) => (i + 1) * 12)
    //             .text(d => d);

    //         d3.select(this)
    //           .selectAll("rect")
    //           .data(["rect"])
    //           .join("rect")
    //             .attr("width", "calc(100% - 14px)")
    //             .attr("height", description.length * 12 + 5)
    //             .attr("fill", "rgba(0, 0, 0, 0.05)")
    //       })
  }
  render() {
    const getLabel = key =>
      key in this.props.censusKeyLabels ?
      this.props.censusKeyLabels[key] :
      getCensusKeyLabel(key, this.props.acsGraph, this.props.removeLeading);

    const showLegend = this.props.allGeoids.length > 1;

    const showDescription = Boolean(this.props.description.length),
      descriptionHeight = showDescription ? (this.props.description.length * 12 + 10) : 0;

    return (
      <div style={ { width: "100%", height: "100%" } }
        id={ this.props.id }
        ref={ this.container }>

        <div style={ { height: "30px" } }>
          <div style={ { maxWidth: this.props.showOptions ? "calc(100% - 285px)" : "100%" } }>
            <Title title={ this.props.title }/>
          </div>
          { !this.props.showOptions ? null :
            <Options tableTitle={ this.props.title }
              processDataForViewing={ this.processDataForViewing.bind(this) }
              id={ this.props.id }
              layout={ { ...this.props.layout } }
              width={ this.container.current && this.container.current.clientWidth }
              height={ this.container.current && this.container.current.clientHeight }
              embedProps={ {
                id: this.props.id,
                year: this.props.year,
                geoids: [...this.props.geoids],
                compareGeoid: this.props.compareGeoid
              } }/>
          }
        </div>
        <div style={ { height: `calc(100% - 30px)`, position: "relative" } }>
          <ResponsiveRadar data={ this.props.radarData }
            indexBy="censusKey"
            keys={ this.props.allGeoids.map(g => get(this.props.geoGraph, [g, "name"], g)) }
            colors={ COLORS.slice(0, this.props.allGeoids.length) }
            gridLabel={
              ({ id, anchor }) => (
                <text textAnchor={ anchor } dy="0.5em"
                  fontSize="0.75rem"
                  fontFamily="sans-serif">
                  { getLabel(id) }
                </text>
              )
            }
            margin={ {
              top: this.props.marginTop,
              bottom: 30 + descriptionHeight,
              right: showLegend ? this.props.legendWidth : 0
            } }

            legends={ [
              {
                anchor: 'top-right',
                direction: 'column',
                translateX: -50,
                translateY: 0,
                itemWidth: this.props.legendWidth,
                itemHeight: 19,
                itemTextColor: '#000',
                symbolSize: 15,
                symbolShape: 'square'
              }
            ].filter(d => showLegend) }/>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state, props) => ({
  radarData: getRadarData(state, props),
  acsGraph: get(state, ["graph", "acs"], {}),
  geoGraph: get(state, ["graph", "geo"], {}),
  allGeoids: [...props.geoids, props.compareGeoid].filter(geoid => Boolean(geoid))
})

export default connect(mapStateToProps, null)(reduxFalcor(RadarGraph));

const getRadarData = (state, props) =>
  get(props, "censusKeys", []).reduce((a, c) => {
    const getLabel = key =>
      get(props, ["censusKeyLabels", key],
        getCensusKeyLabel(key,
                      get(state, ["graph", "acs"], {}),
                      get(props, "removeLeading", 0)
        )
      );
    const y = get(props, "year", 2017);
    const axis = {
      censusKey: getLabel(c)
    };
    [...props.geoids, props.compareGeoid].filter(Boolean)
      .forEach(g => {
        const v = get(state, ["graph", "acs", g, y, c], -666666666);
        axis[get(state, ["graph", "geo", g, "name"], g)] = v === -666666666 ? 0 : v;
      })
    a.push(axis);
    return a;
  }, [])
