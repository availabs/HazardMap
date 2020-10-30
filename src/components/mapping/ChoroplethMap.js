import React, {Component} from 'react';
import MapGL,  {NavigationControl}  from 'react-map-gl';
import DeckGLOverlay from './deckgl-overlay.js';
import deepEqual from 'deep-equal'
import './ChoroplethMap.css'

export default class ChoroplethMap extends Component {
  constructor(props) {
    super(props);
    this.state = {
      viewport: {
        latitude: 42.924,
        longitude: -75.54,
        zoom: 6,
        maxZoom: 16,
        pitch: 45,
        bearing: 0,
        width: 500,
        height: 500
      },
      mapId: this.props.mapId || 'map1',
      data: this.props.data
    };
  }

  componentWillReceiveProps(nextProps) {
    if( !deepEqual(this.props.data, nextProps.data) ) {
      this.setState({data: nextProps.data})
    }
  }

  componentDidMount() {
    window.addEventListener('resize', this._resize.bind(this));
    this._resize();
  }

  _resize() {
    let style = window.getComputedStyle(document.getElementById(this.state.mapId), null)
    this._onViewportChange({
      height:  parseInt(style.getPropertyValue('height'), 10),
      width: parseInt(style.getPropertyValue('width'), 10)
    });
  }

  _onViewportChange(viewport) {
    this.setState({
      viewport: {...this.state.viewport, ...viewport}
    });
  }

  _onHover = event => {
    const {object, x, y } = event;
    this.setState({hoveredFeature: object, x, y, geoid: object ? object.properties.geoid : null});
  };

  _renderTooltip() {
    const {hoveredFeature, x, y} = this.state;
    return hoveredFeature && (
      <div className="mapbox_tooltip" style={{left: x, top: y}}>
        <div>County: {hoveredFeature.properties.geoid}</div>
        <div>Hazard Score: {hoveredFeature.properties.hazard}</div>
      </div>
    );
  }

  

  render() {
    const { viewport } = this.state;
    
    return (
      <div id={this.state.mapId} style={{width: '100%', height: 800}}>
        <MapGL
          {...viewport}
          onViewportChange={this._onViewportChange.bind(this)}
          mapboxApiAccessToken={this.props.mapbox_token}
        >
          <div style={{position: 'absolute', left: 10, top: 10, zIndex:9999999}}>
            <NavigationControl onViewportChange={this._onViewportChange.bind(this)} />
          </div>
          {this.props.layers.map((l,i) => (
            <span key={i}>
              <DeckGLOverlay 
                viewport={viewport} 
                data={l.geo} 
                colorScale={l.colorScale ? l.colorScale.bind(this) : t => [12,12,122,1] }
                elevationScale={l.elevationScale ? l.elevationScale  : t => 0}
                onHover={l.onHover ?  l.onHover.bind(this) : null}
                hoveredFeature={this.state.geoid}
              />
              {l.renderTooltip ? l.renderTooltip.bind(this)() : null}
            </span>
          ))}
          {this.props.infoContainer}
        </MapGL>
      </div>
    );
  }
}