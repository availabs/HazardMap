import React from "react"
import DeckGL from 'deck.gl';

import GeojsonLayer from "./GeojsonLayer"
import Viewport from "./Viewport"

let UNIQUE_IDs = 0;
const getUniqueId = () => `deck-gl-map-${ ++UNIQUE_IDs }`;

class SvgMap extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			id: props.id || getUniqueId(),
			viewport: this.props.viewport()
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
		const layers = this.props.layers.map(layer => new GeojsonLayer(layer));
		return (
      		<div id={ this.state.id } style={ { width: '100%', height: `${ this.props.height }px`, position: "relative" } }>
				<DeckGL { ...this.state.viewport }
					layers={ layers }/>
				{
					this.props.controls.map((control, i) => <MapControl key={ i } { ...control }/>)
				}
	          	{ this.props.hoverData ? 
	          		<MapHover { ...this.props.hoverData }/>
	          		: null
	          	}
			</div>
		)
	}
}
SvgMap.defaultProps = {
	layers: [],
	controls: [],
	hoverData: null,
	height: 800,
	viewport: Viewport()
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

export default SvgMap