import React from "react"
import { connect } from "react-redux"
import { reduxFalcor} from "utils/redux-falcor";

import * as d3scale from "d3-scale"
import * as d3format from "d3-format"
import * as d3selection from "d3-selection"
import * as d3shape from "d3-shape"

import get from "lodash.get"
import styled from "styled-components"

import Options from '../Options'
import Title from "../ComponentTitle"

import GeoName from '../geoname'
import CensusLabel, { getCensusKeyLabel } from '../CensusLabel'

import { getColorRange } from '../color-ranges'
const DEFAULT_COLORS = getColorRange(12, "Set3")

const d3 = {
  ...d3scale,
  ...d3format,
  ...d3selection,
  ...d3shape
}

const DEFAULT_MARGIN = 10;

class CensusPieGraph extends React.Component {
  static defaultProps = {
    year: 2017,
    years: [2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017],
    marginTop: DEFAULT_MARGIN,
    legendWidth: 250,
    piesPerRow: 2,
    censusKeyLabels: {},
    format: ",d",
    description: [],
    showOptions: true
  }

  container = React.createRef();
  renderArea = React.createRef();

  pieMaker = d3.pie()
    .value(d => d.value)
    .padAngle(0.035)
    .sort(null)
    .sortValues(null);

    state = {
      hoverData: null
    }

  componentDidMount() {
    this.makeSomePie();
  }
  componentDidUpdate(oldProps, oldState) {
    this.makeSomePie();
  }
  makeSomePie() {
    const _svg = this.renderArea.current;
    if (!_svg) return;

    const showDescription = Boolean(this.props.description.length),
      descriptionHeight = showDescription ? (this.props.description.length * 12) : 0;

    const margin = {
      top: this.props.marginTop,
      right: this.props.legendWidth || DEFAULT_MARGIN,
      bottom: DEFAULT_MARGIN + descriptionHeight,
      left: DEFAULT_MARGIN
    }

    const height = _svg.clientHeight - margin.top - margin.bottom,
      width = _svg.clientWidth - margin.left - margin.right;

    const piesPerRow = this.props.piesPerRow,
      numRows = Math.ceil(this.props.pieData.length / piesPerRow);

    const rowData = [];
    for (let i = 0; i < this.props.pieData.length; i += piesPerRow) {
      rowData.push(this.props.pieData.slice(i , i + piesPerRow))
    }

    const getGeoName = geoid =>
      get(this.props.geoGraph, [geoid, "name"], geoid)

    const svg = d3.select(_svg);

    const renderArea = svg.selectAll("g.render-group")
      .data(this.props.pieData.length ? ["render-group"] : [])
      .join("g")
        .attr("class", "render-group")
        .style("transform", `translate(${ margin.left }px, ${ margin.top }px)`);

    const pWidth = width / piesPerRow,
      pHeight = height / numRows;

    const LABEL_HEIGHT = 18;
    const radius = Math.min(pWidth, pHeight) * 0.5 - DEFAULT_MARGIN * 0.5 - LABEL_HEIGHT * 0.5;

    const arc = d3.arc()
      .outerRadius(radius)
      .innerRadius(radius * 0.25)
      .cornerRadius(4);

    const pieMaker = this.pieMaker;

    const mousemove = d => this.setState({ hoverData: d }),
      mouseleave = () => this.setState({ hoverData: null })

    renderArea.selectAll("g.row-group")
      .data(rowData)
      .join("g")
      .attr("class", "row-group")
      .each(function(d, i) {
        const pWidth = width / d.length;

        d3.select(this)
          .style("transform", `translate(${ (width - (pWidth * d.length)) * 0.5 }px, ${ pHeight * i }px)`)
          .selectAll("g.pie-group")
            .data(d => d)
            .join("g")
              .attr("class", "pie-group")
              .style("transform", (d, i) => `translate(${ pWidth * 0.5 + pWidth * i }px, ${ pHeight * 0.5 - LABEL_HEIGHT }px)`)
              .selectAll("path")
                .data(d => pieMaker(d.pie))
                .join(
                  enter => enter.append("path").attr("d", arc),
                  update => update.call(update => update.transition().attr("d", arc)),
                  exit => exit.remove()
                )
                  .on("mousemove", (d, i) => {
                    const pos = d3.mouse(_svg);
                    mousemove({
                      ...d.data,
                      pos,
                      color: DEFAULT_COLORS[i % DEFAULT_COLORS.length]
                    })
                  })
                  .on("mouseleave", mouseleave)
                  .attr("fill", (d, i) => DEFAULT_COLORS[i % DEFAULT_COLORS.length])

        d3.select(this)
          .selectAll("g.pie-group")
          .selectAll("g.title-group")
            .data(d => [d.geoid])
            .join("g")
              .attr("class", "title-group")
              .style("transform", `translate(0px, ${ radius + LABEL_HEIGHT }px)`)
              .selectAll("text")
                .data(d => [d])
                .join("text")
                  .style("text-anchor", "middle")
                  .style("font-size", "1rem")
                  .style("font-family", "sans-serif")
                  .text(d => getGeoName(d))

      })
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
  renderLegend() {
    if (!this.props.legendWidth) return null;

    const showDescription = Boolean(this.props.description.length),
      descriptionHeight = showDescription ? (this.props.description.length * 12 + 10) : 0;

    const margin = {
      top: this.props.marginTop,
      right: this.props.legendWidth || DEFAULT_MARGIN,
      bottom: DEFAULT_MARGIN + descriptionHeight,
      left: DEFAULT_MARGIN
    }

    const getKeyName = key =>
      key in this.props.censusKeyLabels ? this.props.censusKeyLabels[key] :
      getCensusKeyLabel(key, this.props.acsGraph, this.props.removeLeading);

    return (
      <g style={ { transform: `translate(calc(100% - ${ margin.right }px), 0px)` } }>
        {
          this.props.censusKeys.map((k, i) =>
            <g style={ { transform: `translate(10px, ${ i * 19 + 10 }px)` } } key={ i }>
              <rect width="15" height="15" fill={ DEFAULT_COLORS[i % DEFAULT_COLORS.length] }/>
              <text x="19" y="13" fontFamily="sans-serif" fontSize="0.75rem">
                { getKeyName(k) }
              </text>
            </g>
          )
        }
      </g>
    )
  }
  renderDescription() {
    const showDescription = Boolean(this.props.description.length),
      descriptionHeight = this.props.description.length ? (this.props.description.length * 12 + 10) : 0;

    if (!showDescription) return null;

    return (
      <g style={ { transform: `translate(7px, calc(100% - ${ descriptionHeight }px))` } }>
        <rect width={ `calc(100% - 14px)` }
          height={ this.props.description.length * 12 + 5 }
          y={ 0 }
          fill="rgba(0, 0, 0, 0.05)"/>
        {
          this.props.description.map((line, i) =>
            <text key={ i } y={ (i + 1) * 12 } x={ 10 } fontSize="12px" fontFamily="sans-serif">
              { line }
            </text>
          )
        }
      </g>
    )
  }
  processDataForViewing() {
    const keys = ["geoid", "name", "year", "census key", "census label", "value", "moe"]

    const getKeyLabel = key =>
      key in this.props.censusKeyLabels ? this.props.censusKeyLabels[key] :
      getCensusKeyLabel(key, this.props.acsGraph, this.props.removeLeading);

    return {
      data: this.props.pieData.reduce((a, c) => {
        c.pie.forEach(d => {
          const row = {
            geoid: c.geoid,
            name: get(this.props.geoGraph, [c.geoid, "name"], c.geoid),
            year: this.props.year,
            "census key": d.key,
            "census label": getKeyLabel(d.key),
            value: d.value,
            moe: d.moe
          }
          a.push(row)
        })
        return a;
      }, []),
      keys
    }
  }
  render() {
    const format = d3.format(this.props.format);

    const getKeyLabel = key =>
      key in this.props.censusKeyLabels ? this.props.censusKeyLabels[key] :
      getCensusKeyLabel(key, this.props.acsGraph, this.props.removeLeading);

    const {
      key,
      value,
      pos: [x, y],
      color
    } = this.state.hoverData || { pos: [] }

    return (
      <div style={ { width: "100%", height: "100%" } }
        id={ this.props.id }
        ref={ this.container }>
        <div style={ { height: "30px", maxWidth: "calc(100% - 285px)" } }>
          <Title title={ this.props.title }/>
          { !this.props.showOptions ? null :
            <Options tableTitle={ this.props.title }
              processDataForViewing={ this.processDataForViewing.bind(this) }
              width={ this.container.current && this.container.current.clientWidth }
              height={ this.container.current && this.container.current.clientHeight }
              id={ this.props.id }
              layout={ { ...this.props.layout } }
              embedProps={ {
                id: this.props.id,
                year: this.props.year,
                geoids: [...this.props.geoids],
                compareGeoid: this.props.compareGeoid
              } }/>
          }
        </div>
        <div style={ { height: "calc(100% - 30px)", position: "relative" } }>
          <svg ref={ this.renderArea }
            style={ { width: "100%", height: "100%", display: "block" } }>
            { this.renderLegend() }
            { this.renderDescription() }
          </svg>
          {
            !this.state.hoverData ? null :
            <HoverComp style={ { top: `${ y - 15 }px`, left: `${ x + 15 }px` } }>
              <div style={ {
                width: "15px",
                height: "15px",
                backgroundColor: color
              } }/>
              <div style={ {
                height: "15px",
                paddingLeft: "3px",
                display: "flex"
              } }>
                <div style={ { marginBottom: "2px" } }>
                  <b>{ getKeyLabel(key) }</b> { format(value) }
                </div>
              </div>
            </HoverComp>
          }
        </div>
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
          v = +get(state, ["graph", "acs", g, y, c], -666666666),
          regex = /^(.+)E$/,
          M = c.replace(regex, (m, p1) => p1 + "M"),
          moe = +get(state, ["graph", "acs", g, y, M], "unknown");
        if (v !== -666666666) {
          a.push({
            key: c,
            value: v,
            moe
          })
        }
        return a;
      }, [])
    }))

const HoverComp = styled.div`
  position: absolute;
  pointer-events: none;
  padding: 5px 10px;
  background-color: #fff;
  display: flex;
  border-radius: 4px;
  box-shadow: 1px 1px 2px rgba(0, 0, 0, 0.25);
`
