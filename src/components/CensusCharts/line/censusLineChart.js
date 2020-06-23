import React, { Component } from 'react';
import { connect } from 'react-redux';
import { reduxFalcor} from "utils/redux-falcor";
import {falcorGraph} from "store/falcorGraph";
import { ResponsiveLine } from '@nivo/line'
import Options from '../Options'
import Title from "../ComponentTitle"
// import GeoName from '../geoname'
import  { getCensusKeyLabel } from '../CensusLabel'

import get from 'lodash.get'

import { format } from "d3-format"

import { getColorRange } from "../color-ranges"

class CensusLineChart extends Component {

  container = React.createRef();

    fetchFalcorDeps () {
      const geoids = [...this.props.geoids, this.props.compareGeoid].filter(geoid => Boolean(geoid));
        return falcorGraph.get(
            ['acs', geoids,
              this.props.years,
              [...this.props.divisorKeys, ...this.props.censusKeys,
                ...this.props.divisorKeysMoE, ...this.props.censusKeysMoE
              ]
            ],
            ["geo", geoids, "name"],
            ["acs", "meta", [...this.props.censusKeys, ...this.props.divisorKeys], "label"]
        )
        // .then(data =>{
        //     console.log('testing test data', ['acs',this.props.geoid,this.props.years,[...this.props.divisorKeys, ...this.props.censusKeys]], data)
        // })
    }

    processGeoid(geoid) {
      return this.props.censusKeys.map((censusKey,index) => {
          return {
              "id": `${ geoid }-${ censusKey }`,
              geoid,
              censusKey,
              "title": this.props.title,
              "data" : this.props.years.map(year => {
                  let value = get(this.props, `acs[${ geoid }][${ year }][${ censusKey }]`, 0)

                  if(this.props.sumType === 'pct') {
                      const divisor = get(this.props, `acs[${ geoid }][${year}][${this.props.divisorKeys[index]}]`, 1);
                      if ((divisor !== null) && !isNaN(divisor)) {
                        value = value / divisor;
                      }
                  }

                  return {
                      x: +year,
                      y: value
                  }
              }).filter(({ y }) => y !== -666666666)
          }
      })
    }

    lineData () {
        const data = this.processGeoid(this.props.geoids[0]);

        if (this.props.compareGeoid && this.props.showCompare) {
          data.push(...this.processGeoid(this.props.compareGeoid));
        }
        return data;
    }

    getTableData(geoid) {
      const getKeyName = key =>
        key in this.props.censusKeyLabels ? this.props.censusKeyLabels[key] :
        getCensusKeyLabel(key, this.props.acs, this.props.removeLeading);
        //yFormat = format(this.props.yFormat);

      const data = [];
      for (const year of this.props.years) {
        this.props.censusKeys.forEach((key, i) => {
          const row = { geoid, year, "census key": key };
          row.name = get(this.props.geoGraph, [geoid, "name"], geoid);
          row["census label"] = getKeyName(key);
          let value = get(this.props, ['acs', geoid, year, key], 0);

          if (this.props.sumType === 'pct') {
            const divisorKey = this.props.divisorKeys[i],
              divisor = get(this.props, ['acs', geoid, year, divisorKey], 1);
            if ((divisor !== null) && !isNaN(divisor)) {
              value = value / divisor;
            }
            row["divisor key"] = divisorKey;
            row["divisor label"] = getKeyName(divisorKey);
          }
          else {
            const regex = /^(.+)E$/,
              M = key.replace(regex, (m, p1) => p1 + "M");
            row.moe = +get(this.props, ["acs", geoid, year, M], "unknown");
          }
          row.value = value;//yFormat(value);

          data.push(row);
        })
      }
      return data;
    }
    processDataForViewing() {
      const data = this.getTableData(this.props.geoids[0]),
        keys = ["geoid", "name", "year", "census key", "census label"];

      if (this.props.sumType === "pct") {
        keys.push("divisor key", "divisor label");
      }
      keys.push("value");
      if (this.props.sumType !== 'pct') {
        keys.push("moe");
      }

      return {
        data,
        keys
      };
    }

    render () {
        const title = this.props.title,
          yFormat = format(this.props.yFormat),
          getKeyName = key =>
            this.props.divisorKeys.length ? "Value" :
            key in this.props.censusKeyLabels ? this.props.censusKeyLabels[key] :
            getCensusKeyLabel(key, this.props.acs, this.props.removeLeading);

        const lineData = this.lineData();

        const getGeoName = g => get(this.props.geoGraph, [g, "name"], g),
          getCensusLabel = c =>
            c in this.props.censusKeyLabels ?
              this.props.censusKeyLabels[c] :
            getCensusKeyLabel(c, this.props.acs, this.props.removeLeading);

        const getLegendLabel = line =>
          this.props.compareGeoid && this.props.showCompare && this.props.censusKeys.length > 1 ?
            `(${ getGeoName(line.geoid) }) ${ getCensusLabel(line.censusKey) }` :
          (this.props.compareGeoid && this.props.showCompare) || (this.props.showCompare && this.props.censusKeys.length === 1) ?
            getGeoName(line.geoid) :
            getCensusLabel(line.censusKey); // DEFAULT

        // const showLegend = (this.props.showLegend && this.props.showCompare && this.props.compareGeoid) ||
        //   (this.props.showLegend && !this.props.showCompare)
        const showLegend = this.props.showLegend;

        const showDescription = Boolean(this.props.description.length),
          descriptionHeight = this.props.description.length ? (this.props.description.length * 12 + 10) : 0;

        const legendWidth =
          this.props.compareGeoid &&
          this.props.showCompare &&
          this.props.censusKeys.length > 1 ? this.props.legendWidth * 1.5 : this.props.legendWidth

        return(
            <div style={ { width: "100%", height: '100%' } }
              id={ this.props.id }
              ref={ this.container }>
              <div style={ { height: "30px", maxWidth: "calc(100% - 285px)" } }>
                <Title title={ title }/>
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
                      stacked: this.props.stacked,
                      curve: this.props.curve
                    } }/>
                }
              </div>
              <div style={ { height: `calc(100% - 30px)`, position: "relative" } } id={ this.props.id }>
                <ResponsiveLine
                    data={ lineData }
                    margin={{
                            "top": this.props.marginTop,
                          "right": showLegend ? legendWidth : 20,
                            "bottom": 30 + descriptionHeight,
                            "left": this.props.marginLeft
                    }}
                    xScale={{
                        "type": "point"
                    }}
                    yScale={{
                        "type": 'linear',
                            "stacked": this.props.stacked,
                            "min": 'auto',
                            "max": 'auto'
                    }}
                    colors={ this.props.colors }
                    curve={this.props.curve}
                    dotSize={5}
                    dotColor={ { from: "color" } }
                    dotBorderWidth={2}
                    dotBorderColor="#f2f4f8"
                    enableDotLabel={false}
                    layers={ [
                      showLegend ? LegendFactory(lineData, this.props.colors, getLegendLabel) : null,
                      showDescription ? DescriptionFactory(this.props.description) : null,
                      'grid', 'axes', 'lines', 'dots', 'slices'
                    ] }
                    axisLeft={ {
                      format: yFormat
                    } }
                    enableSlices={ "x" }
                    tooltip={ ({ id, data }) =>
                      <div key={ id }>
                        {
                          data.map(({ serie, data }, i) =>
                            <div style={ { display: "flex" } } key={ i }>
                              <div style={ { width: "15px", height: "15px", background: serie.color, margin: "0px 2px" } }/>
                              <div style={ { margin: "0px 2px" } }>{ get(this.props.geoGraph, [serie.geoid, "name"], serie.geoid) },</div>
                              <div style={ { margin: "0px 2px" } }>{ getKeyName(serie.censusKey) }:</div>
                              <div style={ { margin: "0px 2px" } }>{ yFormat(data.y) }</div>
                            </div>
                          )
                        }
                      </div>
                    }/>
                </div>
           </div>
        )
    }

    static defaultProps = {
        censusKeys: [],
        divisorKeys: [],
        censusKeysMoE: [],
        divisorKeysMoE: [],
        geoids: ['36001'],
        colorRange:['#047bf8','#6610f2','#6f42c1','#e83e8c','#e65252','#fd7e14','#fbe4a0','#24b314','#20c997','#5bc0de'],
        years: [2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017],
        curve: 'cardinal',
        title: '',
        stacked: false,
        yFormat: ',d',
        marginLeft: 50,
        marginTop: 30,
        showCompare: true,
        compareGeoid: null,
        censusKeyLabels: {},
        showOptions: true,
        sumType: "sum",
        showLegend: true,
        legendWidth: 250,
        colors: [...getColorRange(12, "Set3").slice(3), ...getColorRange(12, "Set3").slice(0, 3)],
        description: []
    }

}


const mapDispatchToProps = { };

const mapStateToProps = (state, ownProps) => ({
  acs: get(state, `graph.acs`, {}),
  geoGraph: get(state, 'graph.geo', {})
})
export default connect(mapStateToProps, mapDispatchToProps)(reduxFalcor(CensusLineChart))

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

const LegendFactory = (data, colors, getLegendLabel) =>
  graph => (
    <g style={ { transform: `translate(${ graph.width }px, -${ graph.margin.top }px)` } }>
      {
        data.map((d, i) =>
          <g style={ { transform: `translate(10px, ${ i * 19 + 10 }px)` } } key={ i }>
            <rect width="15" height="15" fill={ colors[i] }/>
            <text x="19" y="13" fontFamily="sans-serif" fontSize="0.75rem">
              { getLegendLabel(d) }
            </text>
          </g>
        )
      }
    </g>
  )
