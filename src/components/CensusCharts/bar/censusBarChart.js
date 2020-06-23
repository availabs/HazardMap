import React from 'react';
import { connect } from 'react-redux';
import { reduxFalcor} from "utils/redux-falcor";

import { ResponsiveBar } from '@nivo/bar'
import { getColorRange } from '../color-ranges'

import Options from '../Options'
import Title from "../ComponentTitle"

import { scaleOrdinal } from "d3-scale"
import { format } from "d3-format"

import get from "lodash.get"

//import GeoName from '../geoname'
import  { getCensusKeyLabel } from '../CensusLabel'

const DEFAULT_COLORS = getColorRange(8, "Set2")



const Tooltip = ({ color, value, label, id, removeLeading }) =>
  <div className='flex'>
    <div style={ { width: "15px", height: "15px", background: color, marginRight: "5px" } }/>
    <div>{ id }</div>
    <div style={ { marginRight: "5px", fontWeight: "bold" } }>
      { label }
    </div>
    <div>{ value }</div>
  </div>

class CensusBarChart extends React.Component {

  container = React.createRef();

  fetchFalcorDeps() {
    return this.props.falcor.get(
        ['acs', this.props.allGeoids, this.props.years,
          [...this.props.censusKeys, ...this.props.divisorKeys,
            ...this.props.censusKeysMoE, ...this.props.divisorKeysMoE
          ]
        ],
        ["geo", this.props.allGeoids, "name"],
        ["acs", "meta", [...this.props.censusKeys, ...this.props.divisorKeys], "label"]
    )
  }
  processDataForViewing() {
    const getKeyName = key => key in this.props.censusKeyLabels ?
      this.props.censusKeyLabels[key] :
      getCensusKeyLabel(key, this.props.acsGraph, this.props.removeLeading);

    if (this.props.divisorKeys.length && this.props.groupBy === "geoids") {
      const data = [],
        keys = ["geoid", "name", "year"];

      this.props.censusKeys.forEach((k, i) => {
        keys.push(`census key ${ i + 1 }`, `census label ${ i + 1 }`);
      })

      keys.push("sum")

      this.props.divisorKeys.forEach((k, i) => {
        keys.push(`divisor key ${ i + 1 }`, `divisor label ${ i + 1 }`);
      })

      keys.push("divisor", "value");

      for (const geoid of this.props.allGeoids) {
        const row = { geoid };
        row.name = get(this.props.geoGraph, [geoid, "name"], geoid);
        row.year = get(this.props, "year", 2017);

        this.props.censusKeys.forEach((k, i) => {
          row[`census key ${ i + 1 }`] = k;
          row[`census label ${ i + 1 }`] = getKeyName(k);
        })
        row["sum"] = this.props.censusKeys.reduce((a, c) => {
          const value = get(this.props.acsGraph, [geoid, row.year, c], -666666666)
          if (value !== -666666666) {
            a += value;
          }
          return a;
        }, 0)

        this.props.divisorKeys.forEach((k, i) => {
          row[`divisor key ${ i + 1 }`] = k;
          row[`divisor label ${ i + 1 }`] = getKeyName(k);
        })
        row["divisor"] = this.props.divisorKeys.reduce((a, c) => {
          const value = get(this.props.acsGraph, [geoid, row.year, c], -666666666)
          if (value !== -666666666) {
            a += value;
          }
          return a;
        }, 0)

        row["value"] = row["sum"] / (row["divisor"] === 0 ? 1 : row["divisor"]);

        data.push(row);
      }
      return { data, keys };
    }
    const data = [],
      keys = ["geoid", "name", "year", "census key", "census label", "value", "moe"]

    for (const key of this.props.censusKeys) {
      for (const geoid of this.props.allGeoids) {
        const row = { geoid }
        row.name = get(this.props.geoGraph, [geoid, "name"], geoid);
        row.year = get(this.props, "year", 2017);
        row["census key"] = key;
        row["census label"] = getKeyName(key);
        row.value = (get(this.props.acsGraph, [geoid, row.year, key], -666666666));

        const regex = /^(.+)E$/,
          M = key.replace(regex, (m, p1) => p1 + "M");
        row.moe = get(this.props, ["acsGraph", geoid, row.year, M], "unknown");

        data.push(row);
      }
    }

    return { data, keys };
  }
  render() {
    const colors = scaleOrdinal()
      // .domain(this.props.groupBy === "censusKeys" ? this.props.allGeoids : this.props.divisorKeys.length ? ["value"] : this.props.censusKeys)
      .domain(this.props.allGeoids)
      .range(DEFAULT_COLORS);

    const fmt = format(this.props.yFormat);
    // console.log('data', this.props.barData)
    if (this.props.sorted) {
      this.props.barData.sort((a ,b) => a[this.props.geoids[0]] - b[this.props.geoids[0]]);
    }

    const getIdName = key => this.props.groupBy === "geoids" ?
      (
        this.props.divisorKeys.length ? "Value" :
        key in this.props.censusKeyLabels ?
        this.props.censusKeyLabels[key] :
        getCensusKeyLabel(key, this.props.acsGraph, this.props.removeLeading)
      )
      : get(this.props.geoGraph, [key, "name"], key);

    const getKeyName = key => this.props.groupBy === "censusKeys" ?
      (
        key in this.props.censusKeyLabels ?
        this.props.censusKeyLabels[key] :
        getCensusKeyLabel(key, this.props.acsGraph, this.props.removeLeading)
      )
      : get(this.props.geoGraph, [key, "name"], key);

    const getLabel = key => this.props.groupBy === "censusKeys" ?
      (
        key in this.props.censusKeyLabels ?
        this.props.censusKeyLabels[key] :
        getCensusKeyLabel(key, this.props.acsGraph, this.props.removeLeading)
      )
      // : this.props.divisorKeys.length ? "Value"
      : get(this.props.geoGraph, [key, "name"], key);

    const showLegend = this.props.showLegend &&
      (this.props.groupBy === "censusKeys" && this.props.compareGeoid);

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
          <ResponsiveBar indexBy={ "id" }
            keys={ this.props.groupBy === "censusKeys" ? this.props.allGeoids : this.props.divisorKeys.length ? ["value"] : this.props.censusKeys }
            data={ this.props.barData }
            margin={ {
              right: this.props.marginRight,
              top: showLegend ? (this.props.marginTop + 30) : this.props.marginTop,
              bottom: 30 + descriptionHeight,
              left: this.props.marginLeft } }
            colors={ d => this.props.groupBy === "censusKeys" ? colors(d.id) : colors(d.data.geoid) }
            labelSkipWidth={ 100 }
            labelSkipHeight={ 12 }
            labelFormat={ fmt }
            groupMode={ this.props.groupMode }
            layers={ [
              showDescription ? DescriptionFactory(this.props.description) : null,
              showLegend ? LegendFactory(colors, this.props.allGeoids, getIdName) : null,
              'grid', 'axes', 'bars', 'markers', 'annotations'
            ].filter(Boolean) }
            layout={ this.props.orientation }
            tooltip={ ({ color, indexValue, value, id, ...rest }) => (//console.log("REST:", rest),
                <Tooltip id={ getIdName(id) }
                  value={ fmt(value) }
                  color={ color }
                  label={ getLabel(indexValue) }/>
              )
            }
            axisLeft={ {
              format: this.props.orientation === 'horizontal' ? getKeyName : fmt
            } }
            axisBottom={ {
              format: this.props.orientation === "horizontal" ? fmt : getKeyName
            } }/>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state, props) => ({
  barData: getBarData(state, props),
  acsGraph: get(state, ["graph", "acs"], {}),
  geoGraph: get(state, ["graph", "geo"], {}),
  allGeoids: [...props.geoids, props.compareGeoid].filter(geoid => Boolean(geoid))
})

const getBarData = (state, props) => {
  if (get(props, "groupBy", "censusKeys") === "censusKeys") {
    return groupByCensusKeys(state, props);
  }
  return groupByGeoids(state, props);
}
const groupByCensusKeys = (state, props) =>
  props.censusKeys.reduce((a, c) => {
    console.log('ss',props.geoids)
    a.push(
      [...props.geoids, props.compareGeoid].filter(geoid => Boolean(geoid))
        .reduce((aa, cc, ii) => {
          const year = get(props, "year", 2017),
            value = +get(state, ["graph", "acs", cc, year, c], -666666666);
          if (value !== -666666666) {
            aa[cc] = value;
            ++aa.num;
          }
          return aa;
        }, { id: c, num: 0 })
    );
    return a;
  }, [])
  .filter(d => d.num > 0);
const groupByGeoids = (state, props) =>
  [...props.geoids, props.compareGeoid].filter(geoid => Boolean(geoid))
    .reduce((a, c) => {
      const divisorKeys = get(props, "divisorKeys", []);
      if (divisorKeys.length) {
        const value = props.censusKeys.reduce((aa, cc, ii) => {
          const year = get(props, "year", 2017),
            value = +get(state, ["graph", "acs", c, year, cc], 0);
          if (value !== -666666666) {
            aa += value;
          }
          return aa;
        }, 0)
        const divisor = props.divisorKeys.reduce((aa, cc, ii) => {
          const year = get(props, "year", 2017),
            value = +get(state, ["graph", "acs", c, year, cc], 0);
          if (value !== -666666666) {
            aa += value;
          }
          return aa;
        }, 0)
        a.push({
          id: c,
          value: divisor === 0 ? value : value / divisor,
          num: 1,
          geoid: c
        })
      }
      else {
        a.push(
          props.censusKeys.reduce((aa, cc, ii) => {
            const year = get(props, "year", 2017),
              value = +get(state, ["graph", "acs", c, year, cc], 0);
            if (value !== -666666666) {
              aa[cc] = value;
              ++aa.num;
            }
            return aa;
          }, { id: c, num: 0, geoid: c })
        )
      }
      return a;
    }, [])
    .filter(d => d.num > 0);

const ConnectedBarChar = connect(mapStateToProps, null)(reduxFalcor(CensusBarChart));

ConnectedBarChar.defaultProps = {
  year: 2017,
  years: [2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017],
  geoids: ['36001'],
  allGeoids: ['36001'],
  yFormat: ",d",
  marginLeft: 75,
  marginRight: 20,
  marginTop: 10,
  orientation: 'vertical',
  animation: false,
  groupMode: "grouped",
  groupBy: "censusKeys",
  censusKeys: [],
  divisorKeys: [],
  censusKeysMoE: [],
  divisorKeysMoE: [],
  censusKeyLabels: {},
  showOptions: true,
  sorted: false,
  showLegend: true,
  description: []
}

export default ConnectedBarChar

const DescriptionFactory = lines =>
  graph => (
    <g style={ { transform: `translate(-${ graph.margin.left - 7 }px, ${ graph.height + graph.margin.bottom - lines.length * 12 }px)` } }>
      <rect width={ graph.width + graph.margin.left + graph.margin.right - 14 }
        height={ lines.length * 12 + 5 }
        y={ -12 }
        fill="rgba(0, 0, 0, 0.05)"/>
      {
        lines.map((line, i) =>
          <text key={ i } y={ i * 12 } x={ 10 } fontSize="12px" fontFamily="sans-serif">
            { line }
          </text>
        )
      }
    </g>
  )

const LegendFactory = (colors, keys, getKeyName) =>
  graph => {
    const width = graph.width + graph.margin.left,
      w = width / keys.length;
    return (
      <g style={ { transform: `translate(-${ graph.margin.left }px, -20px)` } }>
        {
          keys.map((k, i) =>
            <g key={ k }>
              { (i % 2) === 1 ? null :
                <rect width="20" height="20" fill={ colors(k) }
                  x={ width * 0.5 - (Math.floor(i * 0.5) * w) - 22 }/>
              }
              <text fontSize="1rem" y="15" fontFamily="sans-serif"
                x={ width * 0.5 - ((Math.floor(i * 0.5) * w) + 26) * (i % 2 === 0 ? 1 : -1) }
                textAnchor={ i % 2 === 0 ? "end" : "start" }>
                { getKeyName(k) }
              </text>
              { (i % 2) === 0 ? null :
                <rect width="20" height="20" fill={ colors(k) }
                  x={ width * 0.5 + (Math.floor(i * 0.5) * w) + 2 }/>
              }
            </g>
          )
        }
      </g>
    )
  }
