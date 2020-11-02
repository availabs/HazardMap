import React, {Component} from 'react';
import DeckGL, {GeoJsonLayer} from 'deck.gl';

const LIGHT_SETTINGS = {
  lightsPosition: [-125, 50.5, 5000, -122.8, 48.5, 8000],
  ambientRatio: 0.2,
  diffuseRatio: 0.5,
  specularRatio: 0.3,
  lightsStrength: [1.0, 0.0, 2.0, 0.0],
  numberOfLights: 2
};

export default class DeckGLOverlay extends Component {
  render() {
    const { viewport, data, colorScale, elevationScale } = this.props;

    if (!data) {
      return null;
    }

    const layer = new GeoJsonLayer({
      id: 'geojson',
      data,
      opacity: 1,
      stroked: true,
      filled: true,
      extruded: true,
      wireframe: true,
      fp64: true,
      getFillColor: f => colorScale(f.properties),
      getElevation: f => {
        // console.log('elevation',elevationScale(f.properties))
        return elevationScale(f.properties)
      },
      getLineColor: f => [0, 0, 0],
      updateTriggers: {
        getFillColor: this.props.hoverFeature
      },
      lightSettings: LIGHT_SETTINGS,
      pickable: Boolean(this.props.onHover),
      onHover: this.props.onHover
    });

    return <DeckGL {...viewport} layers={[layer]} />;
  }
}