import React from 'react';
import ReactMapGL from 'react-map-gl';
import DeckGL from 'deck.gl';

import { MAPBOX_TOKEN } from 'store/config'

import GeojsonLayer from "./GeojsonLayer"
import Viewport from "./Viewport"

import "./MapTest.css"

let UNIQUE_IDs = 0;
const getUniqueId = () => `react-map-gl-${ ++UNIQUE_IDs }`;

class MapTest extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			viewport: this.props.viewport(),
			id: props.id || getUniqueId()
		}

		this._onViewportChange = this._onViewportChange.bind(this);
		this._resize = this._resize.bind(this);
	}

  	componentDidMount() {
    	window.addEventListener('resize', this._resize);
		this.props.viewport.register(this, this.setState);
    	this._resize();
  	}
  	componentWillUnmount() {
    	window.removeEventListener('resize', this._resize);
    	this.props.viewport.unregister(this);
  	}

  	_resize() {
    	let style = window.getComputedStyle(document.getElementById(this.state.id), null);
    	this._onViewportChange({
      		height: parseInt(style.getPropertyValue('height'), 10),
      		width: parseInt(style.getPropertyValue('width'), 10)
    	})
  	}
  	_onViewportChange(viewport) {
  		this.props.viewport.onViewportChange(viewport);
  	}

	render() {
		const viewport = this.state.viewport,
			layers = this.props.layers.map(layer => new GeojsonLayer(layer));
    	return (
      		<div id={ this.state.id } style={ { width: '100%', height: `${ this.props.height }px` } }>
				<ReactMapGL { ...viewport }
					mapStyle={ this.props.style }
		          	onViewportChange={ this._onViewportChange }
		          	mapboxApiAccessToken={ this.props.mapboxApiAccessToken }
		          	dragPan={ this.props.dragPan }
		          	scrollZoom={ this.props.scrollZoom }
		          	dragRotate={ this.props.dragRotate }>

		          	<DeckGL { ...viewport }
		          		layers={ layers }/>

		          	{ this.props.hoverData ? 
		          		<MapTestHover { ...this.props.hoverData }/>
		          		: null
		          	}
		          	{
		          		this.props.controls.map((control, i) => <MapTestControl key={ i } { ...control }/>)
		          	}

				</ReactMapGL>
			</div>
		)
	}
}

MapTest.defaultProps = {
	mapboxApiAccessToken: MAPBOX_TOKEN,
	layers: [],
	viewport: Viewport(),
	hoverData: null,
	controls: [],
	height: 800,
	dragPan: true,
	scrollZoom: true,
	dragRotate: true
}

const MapTestHover = ({ rows, x, y }) => {
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

const MapTestControl = ({ comp, pos="top-left" }) => {
	return (
		<div className={ "map-test-table-div " + pos }>
			{ comp }
		</div>
	)
}

export default MapTest;