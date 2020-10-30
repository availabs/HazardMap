import React, {Component,useState} from 'react';
import {connect} from 'react-redux';
import {reduxFalcor} from "utils/redux-falcor-new";
import Viewport from "components/mapping/escmap/Viewport"
import {getChildGeo, getGeoMerge, getGeoMesh} from 'store/modules/geo'
import get from "lodash.get";
import SvgMap from "components/mapping/escmap/SvgMap.react"

class SvgMapComponent extends React.Component{
    constructor(props) {
        super(props);
        this.state = {}

    }
    componentDidMount() {
        Viewport().register(this, this.setState);
    }

    componentWillMount() {
        const activeGeoid = window.location.pathname.split("/")[2]
        this.props.getChildGeo(activeGeoid.slice(0, 2), 'counties');
        this.props.getGeoMesh(activeGeoid.slice(0, 2), 'counties');
        this.props.getGeoMerge(activeGeoid.slice(0, 2), 'counties');
    }

    componentWillReceiveProps(newProps) {
        const activeGeoid = window.location.pathname.split("/")[2]
        const {geoLevel} = newProps;
        let geojson = null,
            counties = null,
            activeCounty = null;
        if(newProps.geo["merge"][activeGeoid.slice(0, 2)]['counties'].features.length > 0){
            switch (geoLevel) {
                case 'counties':
                    geojson = newProps.geo['merge'][activeGeoid.slice(0, 2)]['counties']
                    counties = newProps.geo['mesh'][activeGeoid.slice(0, 2)]['counties']
                    activeCounty =  newProps.geo[activeGeoid.slice(0, 2)]['counties'].features
                        .reduce((a, c) => (c.id === activeGeoid) ? c : a, null);
                    break;
            }
            if (!geojson) return;
            Viewport().fitGeojson(geojson)
            this.setState({bounds: geojson, countiesGeojson: counties, activeCountyGeoJson: activeCounty})

        }

    }

    generateLayers() {
        return [

            { id: 'state-layer-filled',
                data: this.state.bounds,
                filled: true,
                getFillColor: [242, 239, 233, 255]
            },
            { id: 'counties-layer-stroked',
                data: this.state.countiesGeojson,
                stroked: true,
            },
            { id: 'active-county-layer-filled',
                data: this.state.activeCountyGeoJson,
                filled: true,
                getFillColor: [68, 142, 239, 255]
            }
        ];

    }

    render(){
        return(
            <div style={{height: '100%', width: '20%'}} className="flex justify-center">
                <div className="text-4xl py-14 whitespace-no-wrap">{get(this.props.falcorCache,['geo',window.location.pathname.split("/")[2],'name'],'')}</div>
                <SvgMap layers={ this.generateLayers() }
                        height={ this.props.height }
                        viewport={ Viewport() }
                        padding={ 5 }
                        bounds={ this.props.bounds} />
            </div>
            )

    }

}

SvgMapComponent.defaultProps = {
    yearDelta: 0,
    height: 200,
    dragPan: true,
    scrollZoom: true,
    dragRotate: true,
    padding: null,
    mapLegendLocation: "bottom-left",
    mapLegendSize: "large",
    mapControlsLocation: "top-left",
    hazard: null,
    allTime: false,
    geoLevel: 'counties',
}
const mapStateToProps = (state, ownProps) => {
    return {
        activeStateGeoid : state.stormEvents.activeStateGeoid,
        activeStateAbbrev : state.stormEvents.activeStateAbbrev,
        graph: state.graph,
        hazards: get(state.graph, 'riskIndex.hazards.value', []),
        geo: state.geo
    };
};

const mapDispatchToProps = {
    getChildGeo,
    getGeoMesh,
    getGeoMerge
};

export default connect(mapStateToProps, mapDispatchToProps)(reduxFalcor(SvgMapComponent))