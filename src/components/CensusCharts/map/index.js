import React from "react"
import { Link } from "react-router-dom"

import mapboxgl from "mapbox-gl"

import AvlMap from "AvlMap"
import MapLayer from "AvlMap/MapLayer"
import { register, unregister } from "AvlMap/ReduxMiddleware"

import { UPDATE as REDUX_UPDATE } from 'utils/redux-falcor'

import Title from "../ComponentTitle"
import Options from '../Options'

import deepequal from "deep-equal"
import get from "lodash.get"
import * as d3selection from "d3-selection"
import * as d3scale from "d3-scale"
import { extent } from "d3-array";
import { format as d3format } from "d3-format"

import { fnum, fmoney } from "utils/sheldusUtils"

import { falcorGraph, falcorChunkerNiceWithUpdate } from "store/falcorGraph";

import LightTheme from "components/common/themes/light_new"

import { getColorRange } from "constants/color-ranges"
const NUM_COLORS = 8;
const LEGEND_COLOR_RANGE = getColorRange(NUM_COLORS, "Oranges").slice(0, NUM_COLORS - 1);

// blues = ["#eff3ff", "#c6dbef", "#9ecae1", "#6baed6", "#4292c6", "#2171b5", "#084594"]
const BORDER_COLOR = "#4292c6"
const HOVER_COLOR = "#6baed6";

class CensusMap extends React.Component {
  static defaultProps = {
    showOptions: true,
    censusKeys: [],
    divisorKeys: [],
    year: 2017,
    geoids: [],
    compareGeoid: null,
    format: ",d",
    description: ""
  }
  censusLayer = LayerFactory(this.props);
  processDataForViewing() {
    const cousubs = this.censusLayer.geoids.reduce((a, c) => {
      a.push(...get(this.censusLayer, ["falcorCache", "geo", c, "cousubs", "value"], []));
      return a;
    }, [])
    const bgsInCousubs = cousubs.reduce((a, c) => {
      a[c] = get(this.censusLayer, ["falcorCache", "geo", c, "blockgroup", "value"], []);
      return a;
    }, {})

    const data = this.censusLayer.getGeoids()
      .reduce((a, c) => {
        a.push({
          cousub: Object.keys(bgsInCousubs).reduce((aa, cc) =>
            bgsInCousubs[cc].includes(c) ? get(this.censusLayer, ["falcorCache", "geo", cc, "name"], aa) : aa
          , "Unknown Cousub"),
          county: get(this.censusLayer, ["falcorCache", "geo", c.slice(0, 5), "name"], "Unknown County"),
          blockgroup: c,
          [this.props.title]: get(this.censusLayer, ["geoData", c], "no data")
        })
        return a;
      }, [])

    return { data, keys: ["county", "cousub", "blockgroup", this.props.title] };
  }
  saveImage() {
    const canvas = d3selection.select(`#${ this.props.id } canvas.mapboxgl-canvas`).node(),
      newCanvas = document.createElement("canvas");

    newCanvas.width = canvas.width;
    newCanvas.height = canvas.height;

    const context = newCanvas.getContext("2d")
    context.drawImage(canvas, 0, 0);

    let x = canvas.width - 20 - 360,
      y = 20;

    context.fillStyle = LightTheme.sidePanelBg;
    context.fillRect(x, y, 360, 70);

    x += 10;
    y += 10;

    context.fillStyle = LightTheme.sidePanelHeaderBg;
    context.fillRect(x, y, 340, 50);

    x += 10;
    y += 10;
    const w = 320 / this.censusLayer.legend.range.length;
    this.censusLayer.legend.range.forEach((c, i) => {
      context.fillStyle = c;
      context.fillRect(x + i * w, y, w, 20);
    })

    let scale;

    switch (this.censusLayer.legend.type) {
      case "quantile":
        scale = d3scale.scaleQuantile()
          .domain(this.censusLayer.legend.domain)
          .range(this.censusLayer.legend.range);
        break;
      case "quantize":
        scale = d3scale.scaleQuantize()
          .domain(this.censusLayer.legend.domain)
          .range(this.censusLayer.legend.range);
        break;
    }

    const format = (typeof this.censusLayer.legend.format === "function") ?
      this.censusLayer.legend.format :
      d3format(this.censusLayer.legend.format);

    x += 3;
    y += 33;
    context.fillStyle = LightTheme.textColor;
    context.font = "12px/20px 'Helvetica Neue', Arial, Helvetica, sans-serif";
    context.textAlign = "right";
    this.censusLayer.legend.range.forEach((c, i) => {
      const text = format(scale.invertExtent(c)[1]);
      context.fillText(text, x + w + i * w, y);
    })

    return newCanvas.toDataURL();//canvas.toDataURL();
  }
  render() {
    return (
      <div style={ { width: "100%", height: "100%", overflow: "hidden", borderRadius: "4px" } }>
        <div style={ { height: "30px", maxWidth: "calc(100% - 285px)", marginBottom: "5px" } }>
          <Title title={ this.props.title }/>
          { !this.props.showOptions ? null :
            <Options tableTitle={ this.props.title }
              processDataForViewing={ () => this.processDataForViewing() }
              id={ this.props.id }
              layout={ { ...this.props.layout } }
              saveImage={ fn => this.saveImage(fn) }
              embedProps={ {
                type: this.props.type,
                title: this.props.title,
                geoids: [...this.props.geoids],
                compareGeoid: this.props.compareGeoid,
                censusKeys: [...this.props.censusKeys],
                divisorKeys: [...this.props.divisorKeys],
                format: this.props.format,
                year: this.props.year
              } }/>
          }
        </div>
        <div style={ { height: "calc(100% - 35px)", width: "100%" } }>
          <AvlMap sidebar={ false }
            style={ "mapbox://styles/am3081/ck3971lrq00g71co3ud6ye42i" }
            preserveDrawingBuffer={ true }
            id={ this.props.id }
            layers={ [this.censusLayer] }
            layerProps={ {
              [this.censusLayer.name]: {
                title: this.props.title,
                year: this.props.year,
                geoids: [
                  ...this.props.geoids,
                  this.props.compareGeoid
                ].filter(Boolean)
              }
            } }/>
        </div>
      </div>
    )
  }
}

export default CensusMap

const COUNTIES = [
  '36001', '36083', '36093', '36091',
  '36039','36021','36115','36113'
].sort((a, b) => +a - +b);

class CensusLayer extends MapLayer {
  constructor(options) {
    super("Census Layer", options);

    this.falcorCache = {};
    this.active = true;
    this.showAttributesModal = false;
    this.geolevel = "blockgroup";
    this.zoomToBounds = true;
  }
  onAdd() {
// console.log("ON ADD:", this);
    register(this, REDUX_UPDATE, ["graph"]);

    return this.fetchData();
  }
  onRemove(map) {
    unregister(this);
  }

  receiveMessage(action, data) {
    this.falcorCache = data;
  }

	receiveProps(oldProps, newProps) {
    this.year = newProps.year;
    this.geoids = [...newProps.geoids];
    this.title = newProps.title;
    this.zoomToBounds = this.zoomToBounds || !deepequal(oldProps.geoids, newProps.geoids);
	}

  getGeoids() {
    return this.geoids.reduce((a, c) => {
      a.push(...get(this.falcorCache, ["geo", c, this.geolevel, "value"], []));
      return a;
    }, []);
  }
  resetView() {
    if (!this.map) return false;

    const bounds = this.getBounds();

    if (bounds.isEmpty()) return false;

    const options = {
      padding: {
        top: 50,
        right: 400,
        bottom: 50,
        left: 10
      },
      bearing: 0,
      pitch: 0
    }

    options.offset = [
      (options.padding.left - options.padding.right) * 0.5,
      (options.padding.top - options.padding.bottom) * 0.5
    ];

    const tr = this.map.transform,
      nw = tr.project(bounds.getNorthWest()),
      se = tr.project(bounds.getSouthEast()),
      size = se.sub(nw);

    const scaleX = (tr.width - (options.padding.left + options.padding.right)) / size.x,
      scaleY = (tr.height - (options.padding.top + options.padding.bottom)) / size.y;

    options.center = tr.unproject(nw.add(se).div(2));
    options.zoom = Math.min(tr.scaleZoom(tr.scale * Math.min(scaleX, scaleY)), tr.maxZoom);

    this.map.easeTo(options);

    return true;
  }
  getBounds() {
    const regex = /BOX\((.+)\)/;

    // return this.geoids.reduce((a, c) => {
    return this.getGeoids().reduce((a, c) => {
      const b = get(this.falcorCache, ["geo", c, "boundingBox", "value"], ""),
        match = regex.exec(b);
      if (match) {
        const split = match[1].split(","),
          box = split.map(s => s.split(" "))
        a.extend(box);
      }
      return a;
    }, new mapboxgl.LngLatBounds())
  }
  fetchData() {
    const counties = this.geoids.reduce((a, c) => {
      c.length !== 7 && a.push(c.slice(0, 5));
      return a;
    }, []);

    return falcorChunkerNiceWithUpdate(
      ["geo", counties, "name"],
      ["geo", this.geoids, ["cousubs", this.geolevel, "boundingBox", "name"]]
    )
    .then(() => {
      const cousubs = this.geoids.reduce((a, c) => {
        a.push(...get(this.falcorCache, ["geo", c, "cousubs", "value"], []));
        return a;
      }, [])
      return falcorChunkerNiceWithUpdate(["geo", cousubs, ["name", this.geolevel]])
    })
    .then(() => {
      const subGeoids = this.geoids.reduce((a, c) => {
          a.push(...get(this.falcorCache, ["geo", c, this.geolevel, "value"], []))
          return a;
        }, []);
      return falcorChunkerNiceWithUpdate(
        ["acs", subGeoids, this.year, [...this.censusKeys, ...this.divisorKeys]],
        ["geo", subGeoids, "boundingBox"],
        ["geo", [...new Set(subGeoids.map(geoid => geoid.slice(0, 5)))], "name"]
      )
    })
  }
  render(map) {
    const geoids = this.getGeoids();

    map.setFilter(this.geolevel, ["in", "geoid", ...geoids]);

    const cousubs = this.geoids.reduce((a, c) => {
      if (c.length === 5) {
        const d = get(this.falcorCache, ["geo", c, "cousubs", "value"], []);
        a.push(...d);
      }
      else if (c.length === 10) {
        a.push(c);
      }
      return a;
    }, [])
    if (cousubs.length > 0) {
      map.setFilter("cousubs-symbol", ["in", "geoid", ...cousubs]);
      map.setFilter("cousubs-line", ["in", "geoid", ...cousubs]);
      const nameMap = cousubs.reduce((a, c) => {
        a[c] = get(this.falcorCache, ["geo", c, "name"], `Cousub ${ c }`);
        return a;
      }, {})
      map.setLayoutProperty("cousubs-symbol", "text-field",
        ["get", ["to-string", ["get", "geoid"]], ["literal", nameMap]]
      )
    }
    else {
      map.setFilter("cousubs-symbol", ["in", "geoid", "none"]);
      map.setFilter("cousubs-line", ["in", "geoid", "none"]);
    }

    if ((this.geoids.length === 1) && (this.geoids[0].length === 7)) {
      const geoid = this.geoids[0];
      map.setFilter("places-line", ["in", "geoid", geoid]);
      map.setFilter("places-symbol", ["in", "geoid", geoid]);
      const name = get(this.falcorCache, ["geo", geoid, "name"], "");
      map.setLayoutProperty("places-symbol", "text-field", name);
    }
    else {
      map.setFilter("places-line", ["in", "geoid", "none"]);
      map.setFilter("places-symbol", ["in", "geoid", "none"]);
    }

    this.zoomToBounds && this.resetView() && (this.zoomToBounds = false);

    const valueMap = geoids.reduce((a, c) => {
      let value = this.censusKeys.reduce((aa, cc) => {
        const v = get(this.falcorCache, ["acs", c, this.year, cc], -666666666);
        if (v !== -666666666) {
          aa += v;
        }
        return aa;
      }, 0);
      const divisor = this.divisorKeys.reduce((aa, cc) => {
        const v = get(this.falcorCache, ["acs", c, this.year, cc], -666666666);
// console.log("??????", c, this.year, cc, v)
        if (v != -666666666) {
          aa += v;
        }
        return aa;
      }, 0)
// console.log("DIVISOR:", divisor, this.divisorKeys, this.falcorCache)
      if (divisor !== 0) {
        value /= divisor;
      }
      a[c] = value;
      return a;
    }, {})

    this.geoData = valueMap;

    const values = Object.values(valueMap);
    if (!values.length) return;

    const colorScale = this.getColorScale(values),
      colors = {};
    for (const key in valueMap) {
      colors[key] = colorScale(valueMap[key]);
    }
    geoids.forEach(geoid => {
      colors[geoid] = get(colors, geoid, "#000")
    })

    map.setPaintProperty(this.geolevel, "fill-color",
      ["case",
        ["boolean", ["feature-state", "hover"], false], HOVER_COLOR,
        ["case",
          ["has", ["to-string", ["get", "geoid"]], ["literal", colors]],
          ["get", ["to-string", ["get", "geoid"]], ["literal", colors]],
          "#000"
        ]
      ]
    )
  }
  getColorScale(domain) {
    switch (this.legend.type) {
      case "quantile":
        this.legend.domain = domain;
        return d3scale.scaleQuantile()
          .domain(this.legend.domain)
          .range(this.legend.range);
      case "quantize":
        this.legend.domain = extent(domain)
        return d3scale.scaleQuantize()
          .domain(this.legend.domain)
          .range(this.legend.range);
    }
  }
}

const LayerFactory = props => {
  return new CensusLayer({
    geoids: [
      ...props.geoids,
      props.compareGeoid
    ].filter(Boolean) || [],
    year: props.year || 2017,
    censusKeys: props.censusKeys || [],
    divisorKeys: props.divisorKeys || [],

    legend: {
      type: "quantile",
      domain: [],
      range: LEGEND_COLOR_RANGE,
      format: props.format || fnum
    },

    popover: {
      layers: ["blockgroup"],
      dataFunc: function(topFeature, features) {
        const geoid = get(topFeature, ["properties", "geoid"], null),
          county = geoid.slice(0, 5),
          countyName = get(this.falcorCache, ["geo", county, "name"], ""),
          data = [
            [`${ countyName }${ countyName && " "}Blockgroup`, geoid.slice(5)]
          ],
          value = get(this.geoData, [geoid], null);

        if (value !== null) {
          const format = (typeof this.legend.format === "function") ? this.legend.format : d3format(this.legend.format);
          data.push([this.title, format(value)])
        }
        data.push([<Link to={ `/profile/${ geoid }` }>View Profile</Link>])

        return data;
      }
    },

    mapActions: {
      reset: {
        Icon: () => <span className="fa fa-2x fa-home"/>,
        tooltip: "Reset View",
        action: function() {
          this.resetView();
        }
      }
      // test: {
      //   tooltip: "Test iframe",
      //   Icon: () => <span className="fa fa-2x fa-car"/>,
      //   action: function() {
      //     this.doAction(["toggleModal", "test"]);
      //   }
      // },
    },

    onHover: {
      layers: ["blockgroup"]
    },

    sources: [
      // { id: "counties",
      //   source: {
      //     'type': "vector",
      //     'url': 'mapbox://am3081.a8ndgl5n'
      //   },
      // },
      { id: "cousubs",
        source: {
          'type': "vector",
          'url': 'mapbox://am3081.36lr7sic'
        },
      },
      // { id: "tracts",
      //   source: {
      //     'type': "vector",
      //     'url': 'mapbox://am3081.2x2v9z60'
      //   },
      // },
      {
        id: "blockgroup",
        source: {
            'type': "vector",
            'url': 'mapbox://am3081.52dbm7po'
        }
      },
      {
        id: "places",
        source: {
          type: "vector",
          url: "mapbox://am3081.6u9e7oi9"
        }
      }
    ],

    layers: [
      // { 'id': 'counties',
      //   'source': 'counties',
      //   'source-layer': 'counties',
      //   'type': 'fill',
      //   filter : ['in', 'geoid', 'none']
      // },
      // { 'id': 'tracts',
      //   'source': 'tracts',
      //   'source-layer': 'tracts',
      //   'type': 'fill',
      //   filter : ['in', 'geoid', 'none']
      // },
      {
        id: "blockgroup",
        source: "blockgroup",
        'source-layer': "blockgroups",
        'type': 'fill',
        filter : ['in', 'geoid', 'none']
      },

      { 'id': 'cousubs-line',
        'source': 'cousubs',
        'source-layer': 'cousubs',
        'type': 'line',
        filter : ['in', 'geoid', 'none'],
        paint: {
          "line-color": BORDER_COLOR,
          "line-width": 2
        }
      },
      { 'id': 'cousubs-symbol',
        'source': 'cousubs',
        'source-layer': 'cousubs',
        'type': 'symbol',
        filter : ['in', 'geoid', 'none'],
        layout: {
          "symbol-placement": "point",
          "text-size": 12,
          // "text-allow-overlap": true,
          // "text-ignore-placement": true
        },
        paint: {
          "text-color": "#000"
        }
      },

      { id: 'places-line',
        source: 'places',
        'source-layer': 'places',
        type: 'line',
        filter: ['in', 'geoid', 'none'],
        paint: {
          'line-color': BORDER_COLOR,
          'line-width': 2
        }
      },
      { id: 'places-symbol',
        source: 'places',
        'source-layer': 'places',
        type: 'symbol',
        filter: ['in', 'geoid', 'none'],
        layout: {
          "symbol-placement": "point",
          "text-size": 12,
          // "text-allow-overlap": true,
          // "text-ignore-placement": true
        },
        paint: {
          "text-color": "#000"
        }
      }
    ]
  })
}
