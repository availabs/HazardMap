import React from "react"

import * as d3 from "d3-selection"
import * as d3color from "d3-color"
import * as d3geo from "d3-geo"
// import * as d3projection from "d3-geo-projection";

import Viewport from "./Viewport"

let UNIQUE_IDs = 0;
const getUniqueId = () => `svg-map-${ ++UNIQUE_IDs }`;

class SvgMap extends React.Component {
	constructor(props) {
		super(props);

		const projection = d3geo.geoMercator()
		this.state = {
			projection,
			path: d3geo.geoPath(projection),
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

	getPath(data, {
			stroked=true,
			lineWidthMinPixels=1,
			filled=false,
			getLineColor=[0, 0, 0, 255],
			getFillColor=[225, 225, 225, 255],
			onHover=null,
			onClick=null,
			key=null
		}, i) {
		let lineColor = getLineColor,
			fillColor = getFillColor;
		if (typeof getLineColor === "function") {
			lineColor = getLineColor(data);
		}
		if (typeof getFillColor === "function") {
			fillColor = getFillColor(data);
		}
		lineColor = d3color.color(
			`rgba(
				${lineColor[0]},
				${lineColor[1]},
				${lineColor[2]},
				${lineColor[3]/255}
			)`
		)
		fillColor = d3color.color(
			`rgba(
				${fillColor[0]},
				${fillColor[1]},
				${fillColor[2]},
				${fillColor[3]/255}
			)`
		)
		let onMouseOver = null,
			onMouseOut = null;
		if (onHover) {
			onMouseOver = e => {
				const x = e.clientX,
					y = e.clientY;
				onHover({ object: data, x, y });
			}
			onMouseOut = e => {
				const x = e.clientX,
					y = e.clientY;
				onHover({ object: null, x, y });
			}
		}
		return <path d={ this.state.path(data) }
					key={ key ? key(data) : i }
					onMouseOver={ onMouseOver }
					onMouseOut={ onMouseOut }
					stroke={ stroked ? lineColor.toString() : "none" }
					fill={ filled ? fillColor.toString() : "none" }
					strokeWidth={ lineWidthMinPixels }/>
	}
	getLayerPaths({ data, key, ...rest }) {
		if (data && data.type === "FeatureCollection") {
			return data.features.map((feature, i) =>
				this.getPath(feature, rest, i)
			);
		}
		return this.getPath(data, rest);
	}
	componentDidUpdate() {
		// const {
		// 	path
		// } = this.state;
		// const {
		// 	layers
		// } = this.props;
		// let groups = d3.select("#" + this.state.id + "-svg")
		// 	.selectAll("g")
		// 	.data(layers, layer => layer.id);

		// groups.enter()
		// 	.append("g")
		// 	.merge(groups)
		// 		.attr("id", layer => layer.id)
		// 		.attr("pointer-events", layer => layer.pickable ? "auto" : "none")
		// 		.each(SvgLayer(path));
		// groups.exit()
		// 	.remove();
	}
	render() {
		const {
			projection,
			path,
			viewport
		} = this.state;
		const {
			width,
			height,
			longitude,
			latitude
		} = viewport;
		const {
			bounds,
			padding,

			layers,
			controls
		} = this.props;

		if (!bounds && layers.length && isValidGeojson(layers[0].data)) {
			projection.fitExtent(
				[[padding, padding], [width-padding, height-padding]],
				layers[0].data
			)
		}
		else if (bounds) {
			projection.fitExtent(
				[[padding, padding], [width-padding, height-padding]],
				bounds
			)
		}
		else {
			projection.center([longitude, latitude])
				.translate([width * 0.5, height * 0.5])
				.scale(4000)
		}

		return (
      		<div id={ this.state.id } style={ { width: '100%', height: `${ this.props.height }px`, position: "relative" } }>
				<div style={ { position: "absolute", height: 'fit-content' } }>
					<span style={{float: 'right'}}>
						{
							controls.map((control, i) => <MapControl key={ i } { ...control }/>)
						}
						{ this.props.hoverData ?
							<MapHover { ...this.props.hoverData }/>
							: null
						}
					</span>
					<svg id={ this.state.id + "-svg" }
						style={ {
							width: `${ width }px`,
							height: `${ height }px`,
						} }>
						{
							
							layers.map(layer =>
								<g id={ layer.id } key={ layer.id }>
									{ this.getLayerPaths(layer) }
								</g>
							)
							
						}
					</svg>
				</div>
			</div>
		)
	}
}
SvgMap.defaultProps = {
	layers: [],
	controls: [],
	padding: 20,
	height: 800,
	viewport: Viewport(),
	hoverData: null
}

const SvgLayer = path => {
	function svgLayer({ data, key, ...rest }, i) {
		let paths = d3.select(this)
			.selectAll("path")
			.data((data.type === "FeatureCollection") ? data.features : [data],
				(d, i) => key ? key(d) : i)

		paths.enter()
			.append("path")
			.merge(paths)
				.attr("d", path)
				.attr("fill", svgLayer.getFill.bind(null, rest))
				.attr("stroke", svgLayer.getStroke.bind(null, rest))
				.on("mousemove", svgLayer.mousemove.bind(null, rest))
				.on("mouseout", svgLayer.mouseout.bind(null, rest));
		paths.exit()
			.remove();
	}
	svgLayer.mousemove = ({ onHover }, data) => {
		if (!onHover) return null;
		const event = d3.event,
			x = event.clientX,
			y = event.clientY;
		onHover({ object: data, x, y })
	}
	svgLayer.mouseout = ({ onHover }, data) => {
		if (!onHover) return null;
		const event = d3.event,
			x = event.clientX,
			y = event.clientY;
		onHover({ object: null, x, y })
	}
	svgLayer.getFill = ({ filled=false, getFillColor=[225, 225, 225, 255] }, data) => {
		if (!filled) return "none";

		let fillColor = getFillColor;
		if (typeof getFillColor === "function") {
			fillColor = getFillColor(data);
		}
		fillColor = d3color.color(
			`rgba(
				${ fillColor[0] },
				${ fillColor[1] },
				${ fillColor[2] },
				${ fillColor[3] / 255 }
			)`
		)
		return fillColor.toString();
	}
	svgLayer.getStroke = ({ stroked=true, getLineColor=[0, 0, 0, 255] }, data) => {
		if (!stroked) return "none";

		let lineColor = getLineColor;
		if (typeof getLineColor === "function") {
			lineColor = getLineColor(data);
		}
		lineColor = d3color.color(
			`rgba(
				${ lineColor[0] },
				${ lineColor[1] },
				${ lineColor[2] },
				${ lineColor[3] / 255 }
			)`
		)
		return lineColor.toString();
	}
	return svgLayer;
}

const MapHover = ({ rows, x, y }) => {
	if (!rows || (rows.length === 0)) return null;
	const hasHeader = (rows[0].length === 1) && (rows.length > 1),
		bodyData = rows.slice(hasHeader ? 1 : 0);
	return (
		<div className="map-test-table-div"
			style={ {
				position: "fixed",
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

const isValidGeojson = geojson => {
	if (!geojson) return false
	if (geojson.type == "FeatureCollection") {
		return geojson.features.length;
	}
	else if (geojson.type == "Feature") {
		return geojson.geometry.coordinates.length;
	}
	else if ("coordinates" in geojson) {
		return geojson.coordinates.length;
	}
	return false;
}

export default SvgMap