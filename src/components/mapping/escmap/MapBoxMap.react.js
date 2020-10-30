import React from 'react';
import { connect } from 'react-redux';

import {
    map as d3map,
    set as d3set
} from 'd3-collection'

import "./MapTest.css"

import mapboxgl from 'mapbox-gl'
import { MAPBOX_TOKEN } from 'store/config'
mapboxgl.accessToken = MAPBOX_TOKEN

const SOURCES = {
    counties: 'am3081.1ggw4eku',
    cousubs: 'am3081.dlnvkxdi',
    zipcodes: 'am3081.5g46sdxi',
    tracts: 'am3081.92hcxki8',
    states: 'am3081.2l2cma38'
}

let UNIQUE_ID = 0;
const getUniqueId = () => `mapbox-map-${ ++UNIQUE_ID }`

const getPaint = layer => {
    const paint = {};
    switch (layer.type) {
        case 'line':
            paint['line-color'] = '#000';
            paint['line-width'] = layer['line-width'] || 1;
            paint['line-opacity'] = layer['line-opacity'] || 1;
            if (typeof layer['line-color'] === 'string') {
                paint['line-color'] = layer['line-color'];
            }
            else if (layer['line-color']) {
                paint['line-color'] = [
                    "get",
                    ["get", "geoid"],
                    ["lieral", layer['line-color']]
                ]
            }
            return paint;
        case 'fill':
            paint['fill-color'] =
                ['case',
                    ['boolean', false, false],
                    layer.autoHighlightColor || '#c8c8c8',
                    '#f2efe9'
                ];
            paint['fill-opacity'] = layer['fill-opacity'] || 1;
            if (typeof layer['fill-color'] === 'string') {
                paint['fill-color'] =
                    ['case',
                        ['boolean', false, false],
                        layer.autoHighlightColor || '#c8c8c8',
                        layer['fill-color']
                    ]
            }
            else if (layer['fill-color']) {
                paint['fill-color'] =
                    ['case',
                        ['boolean', false, false],
                        layer.autoHighlightColor || '#c8c8c8',
                        ["get",
                            ["get", "geoid"],
                            ["literal", layer['fill-color']]
                        ]
                    ]
            }
            return paint;
    }
}
const getLayerData = layer => {
    const data = {
        id: layer.id,
        type: layer.type,
        source: layer.geoLevel,
        'source-layer': layer.geoLevel,
        paint: getPaint(layer)
    }
    if (layer.geoids) {
        data.filter = ['in', 'geoid', ...layer.geoids];
    }
    return data;
}

class MapBoxMap extends React.Component {
    state = {
        id: getUniqueId(),
        glMap: null
    }
    componentDidMount() {
        const glMap = new mapboxgl.Map({
            container: this.state.id,
            style: this.props.style,
            zoom: this.props.zoom,
            center: this.props.center
        });
        glMap.on('load', e => {
            Object.keys(SOURCES).forEach(geoLevel => {
                glMap.addSource(geoLevel, {
                    type: "vector",
                    url: `mapbox://${ SOURCES[geoLevel] }`
                })
            })
            this.setState({ glMap })
        })
        glMap.on('sourcedata', e => {
            this.forceUpdate();
        })
        if (!this.props.zoomable) {
            glMap.scrollZoom.disable();
            glMap.boxZoom.disable();
            glMap.dragRotate.disable();
            glMap.dragPan.disable();
            glMap.keyboard.disable();
            glMap.doubleClickZoom.disable();
            glMap.touchZoomRotate.disable();
        }
    }
    componentDidUpdate(oldProps) {
        this.updateLayers(oldProps);
    }
    updateLayers(oldProps) {
        const glMap = this.state.glMap;
        if (!glMap) return;

        const oldLayers = d3set();
        oldProps.layers.forEach(({ id }) => {
            oldLayers.add(id);
        })
        const currentLayers = d3map();

        this.props.layers.forEach(layer => {
            if (!glMap.getLayer(layer.id) && glMap.getSource(layer.geoLevel)) {
// console.log('testing', layer, getLayerData(layer))
                glMap.addLayer(getLayerData(layer));
                glMap.on("mousemove", layer.id, e => {
                    const { features, point } = e,
                        { x, y } = point;
                    if (layer.autoHighlight) {
                        // ADD SET FEATURE STATE HERE
                    }
                    if (layer.onHover) {
                        layer.onHover({ object: features && features[0], x, y })
                    }
                })
                glMap.on("mouseout", layer.id, e => {
                    const { features, point } = e,
                        { x, y } = point;
                    if (layer.onHover) {
                        layer.onHover({ object: features && features[0], x, y })
                    }
                })
            }
            oldLayers.remove(layer.id);
            currentLayers.set(layer.id, layer);
        })

        oldLayers.each(id => {
            glMap.removeLayer(id);
        })
        currentLayers.each((layer, id) => {
            if (layer.geoids) {
                glMap.setFilter(id, ['in', 'geoid', ...layer.geoids])
            }
            const paint = getPaint(layer);
            for (const property in paint) {
                glMap.setPaintProperty(id, property, paint[property]);
            }
        })
    }
    render() {
        return (
            <div id={ this.state.id }
                 style={ { height: `${ this.props.height }px` } }>
                { !this.props.hoverData ? null :
                    <MapHover { ...this.props.hoverData }/>
                }
                {
                    this.props.controls.map((control, i) => <MapControl key={ i } { ...control }/>)
                }
            </div>
        )
    }
}

const MapHover = ({ rows, x, y }) => {
    if (!rows || (rows.length === 0)) return null;
    const hasHeader = (rows[0].length === 1) && (rows.length > 1),
        bodyData = rows.slice(hasHeader ? 1 : 0);
    return (
        <div className="map-test-table-div"
             style={ {
                 left: x + 10,
                 top: y + 10 } }>
            <table className="map-test-table">
                { hasHeader ?
                    <thead>
                    <tr>
                        <th colSpan="2">
                            { rows[0] }
                        </th>
                    </tr>
                    </thead>
                    : null
                }
                <tbody>
                {
                    bodyData.map((row, i) =>
                        <tr key={ i }>
                            { row.map((d, ii) => <td key={ i + "-" + ii }>{ d }</td>) }
                        </tr>
                    )
                }
                </tbody>
            </table>
        </div>
    )
}

const MapControl = ({ comp, pos="top-left" }) => {
    return (
        <div className={ "map-test-table-div " + pos }>
            { comp }
        </div>
    )
}

MapBoxMap.defaultProps = {
    style: 'mapbox://styles/am3081/cjo7cnvsd2bsm2rkftn4njgee',
    height: 800,
    layers: [],
    hoverData: null,
    zoom: 6.25,
    center: [-75.250, 42.860],
    zoomable: true
}

export default MapBoxMap