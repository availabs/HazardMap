import React from 'react';
import { connect } from 'react-redux';
import { reduxFalcor} from "utils/redux-falcor";

import { ResponsiveBar } from '@nivo/bar'
import { getColorRange } from '../color-ranges'

import Options from '../Options'
import Title from "../ComponentTitle"

// import { scaleOrdinal } from "d3-scale"
import { format } from "d3-format"

import get from "lodash.get"

import GeoName from '../geoname'

const DEFAULT_COLORS = getColorRange(8, "Set2").slice(6)



const Tooltip = ({ color, value, label, geoid }) =>
  <div className='flex'>
    <div style={ { width: "15px", height: "15px", background: color, marginRight: "5px" } }/>
    <div><GeoName geoids={ [geoid] }/></div>
    <div style={ { marginRight: "5px", fontWeight: "bold" } }>{ label }</div>
    <div>{ value }</div>
  </div>

class HorizontalBarChart extends React.Component {
  static defaultProps = {
    years: [2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017],
    year: 2017,
    marginLeft: 100,
    marginTop: 10,
    showOptions: true,
    yFormat: ",d",
    description: [],
    censusKeys: [],
    censusKeysMoE: [],
    showCompareGeoid: true
  }

  container = React.createRef();

  state = {
    year: this.props.years[this.props.years.length - 1]
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
  getBarData() {
    const getValue = (g, y, c) => {
      const v = get(this.props.acsGraph, [g, y, c], -666666666);
      return v === -666666666 ? 0 : v;
    }
    const leftVars = this.props.left.keys,
      rightVars = this.props.right.keys;
    return this.props.labels.map((label, i) => {
      const bar = { label };
      this.props.allGeoids.forEach(geoid => {
        bar[`left-${ geoid }`] = getValue(geoid, this.props.year, leftVars[i]) * -1
        bar[`right-${ geoid }`] = getValue(geoid, this.props.year, rightVars[i])
      })
      return bar;
    })
  }
  getBarDataOld() {
    const leftVars = this.props.left.keys,
      rightVars = this.props.right.keys;
    return this.props.labels.map((label, i) => ({
      label,
      left: get(this.props.acsGraph, [this.props.geoids[0], this.props.year, leftVars[i]], 0) * -1,
      right: get(this.props.acsGraph, [this.props.geoids[0], this.props.year, rightVars[i]], 0)
    }));
  }
  processDataForViewing() {
    const data = [],
      keys = ["geoid", "name", "year", "census key", "census label", "value", "moe"],

      leftKeys = this.props.left.keys,
      leftLabel = this.props.left.key,

      rightKeys = this.props.right.keys,
      rightLabel = this.props.right.key;

    this.props.labels.forEach((label, i) => {
      for (const geoid of this.props.allGeoids) {
        const baseRow = {
          geoid,
          name: get(this.props.geoGraph, [geoid, "name"], geoid),
          year: this.props.year
        }

        const row1 = { ...baseRow };
        row1["census key"] = leftKeys[i];
        row1["census label"] = `${ label }, ${ leftLabel }`;
        row1.value = get(this.props.acsGraph, [geoid, baseRow.year, leftKeys[i]], 0);

        const regex = /^(.+)E$/;

        let M = leftKeys[i].replace(regex, (m, p1) => p1 + "M");
        row1.moe = get(this.props, ["acsGraph", geoid, baseRow.year, M], "unknown");

        data.push(row1);

        const row2 = { ...baseRow };
        row2["census key"] = rightKeys[i];
        row2["census label"] = `${ label }, ${ rightLabel }`;
        row2.value = get(this.props.acsGraph, [geoid, baseRow.year, rightKeys[i]], 0);

        M = rightKeys[i].replace(regex, (m, p1) => p1 + "M");
        row2.moe = get(this.props, ["acsGraph", geoid, baseRow.year, M], "unknown");

        data.push(row2);
      }
    })

    return { data, keys };
  }
  render() {
    const fmt = format(this.props.yFormat);

    const left = get(this.props, ["left", "color"], DEFAULT_COLORS[0]),
      right = get(this.props, ["right", "color"], DEFAULT_COLORS[1]);

    const darken = (color, i) => {
      const r = parseInt(color.slice(1, 3), 16),
        g = parseInt(color.slice(3, 5), 16),
        b = parseInt(color.slice(5), 16);
      return "#" + ("0" + (Math.max(0, r - 32 * i)).toString(16)).slice(-2)
              + ("0" + (Math.max(0, g - 32 * i)).toString(16)).slice(-2)
              + ("0" + (Math.max(0, b - 32 * i)).toString(16)).slice(-2)
    }

    const colors = this.props.allGeoids.reduce((a, c, i) => {
      a[`left-${ c }`] = darken(left, i);
      a[`right-${ c }`] = darken(right, i);
      return a;
    }, { left, right });

    const getColors = id => colors[id];

    const keys = this.props.allGeoids.reduce((a, c) => [...a, `left-${ c }`, `right-${ c }`], [])
      .sort((a, b) => a.includes("left") ? -1 : 1);

    const showDescription = Boolean(this.props.description.length),
      descriptionHeight = this.props.description.length ? (this.props.description.length * 12 + 10) : 0;

    return (
      <div style={ { width: "100%", height: "100%" } }
        id={ this.props.id }
        ref={ this.container }>
        <div style={ { height: "30px" } }>
          <div style={ { maxWidth: this.props.showOptions ? "calc(100% - 285px)" : "100%" } }><Title title={ this.props.title }/></div>
          { !this.props.showOptions ? null :
            <Options tableTitle={ this.props.title }
              processDataForViewing={ this.processDataForViewing.bind(this) }
              width={ this.container.current && this.container.current.clientWidth }
              height={ this.container.current && this.container.current.clientHeight }
              id={ this.props.id }
              layout={ { ...this.props.layout } }
              embedProps={ {
                id: this.props.id,
                geoids: [...this.props.geoids],
                compareGeoid: this.props.compareGeoid,
                showCompareGeoid: this.props.showCompareGeoid,
                year: this.props.year
              } }/>
          }
        </div>
        <div style={ { height: "calc(100% - 30px)" } } id={ this.props.id }>
          <ResponsiveBar data={ this.getBarData() }
            colors={ ({ id }) => getColors(id) }
            indexBy="label"
            keys={ keys }
            margin={ { top: this.props.marginTop + 10,
              right: 20,
              bottom: 30 + descriptionHeight,
              left: this.props.marginLeft
            } }
            layout="horizontal"
            groupMode={ this.props.allGeoids.length > 1 ? "grouped" : "stacked" }
            enableLabel={ true }
            labelFormat={ d => fmt(Math.abs(d)) }
            labelSkipWidth={ 100 }
            labelSkipHeight={ 12 }
            axisBottom={ {
              format: d => fmt(Math.abs(d))
            } }
            layers={ [
              DescriptionFactory(this.props.description),
              'grid', 'axes', 'bars', 'markers', 'annotations',
              StackedLegendFactory(this.props.left, this.props.right, getColors)
            ].slice(showDescription ? 0 : 1) }
            tooltip={ ({ color, indexValue, value, id, ...rest }) => (
                <Tooltip
                  value={ fmt(Math.abs(value)) }
                  color={ color }
                  geoid={ id.split("-")[1] }
                  label={ `${ indexValue }` }/>
              )
            }/>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state, props) => ({
  acsGraph: get(state, ["graph", "acs"], {}),
  geoGraph: get(state, ["graph", "geo"], {}),
  allGeoids: [...props.geoids, get(props, "showCompareGeoid", true) && props.compareGeoid].filter(geoid => Boolean(geoid))
})

export default connect(mapStateToProps, null)(reduxFalcor(HorizontalBarChart));

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

const StackedLegendFactory = (left, right, getColors) =>
  graph => (
    <g style={ { transform: `translate(-${ graph.margin.left }px, -20px)` } }>
      <text y={ 15 } x={ (graph.width + graph.margin.left) * 0.5 - 26 } textAnchor="end" fontSize="1rem" fontFamily="sans-serif">{ left.key }</text>
      <rect y={ 0 } x={ (graph.width + graph.margin.left) * 0.5 - 2 - 20 } fill={ getColors("left") } width="20" height="20"/>
      <rect y={ 0 } x={ (graph.width + graph.margin.left) * 0.5 + 2 } fill={ getColors("right") } width="20" height="20"/>
      <text y={ 15 } x={ (graph.width + graph.margin.left) * 0.5 + 26 } fontSize="1rem" fontFamily="sans-serif">{ right.key }</text>
    </g>
  )
