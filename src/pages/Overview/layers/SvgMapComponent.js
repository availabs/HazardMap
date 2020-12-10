import React from 'react';
import {connect} from 'react-redux';
import {reduxFalcor} from "@availabs/avl-components/dist/redux-falcor";
import Viewport from "components/mapping/escmap/Viewport"
import {getChildGeo, getGeoMerge, getGeoMesh} from 'store/modules/geo'
import get from "lodash.get";
import SvgMap from "components/mapping/escmap/SvgMap.react"
import Search from "../../home/Search";

class SvgMapComponent extends React.Component{
    constructor(props) {
        super(props);
        this.state = {}

    }
    componentDidMount() {
        Viewport().register(this, this.setState);
    }

    componentWillMount() {
        const activeGeoid = this.props.activeCountyGeoid ?
            this.props.activeCountyGeoid
            :window.location.pathname.split("/")[2]
        this.props.getChildGeo(activeGeoid.slice(0, 2), 'counties');
        this.props.getGeoMesh(activeGeoid.slice(0, 2), 'counties');
        this.props.getGeoMerge(activeGeoid.slice(0, 2), 'counties');
    }

    componentWillUpdate(nextProps,nextState,s){
        if(this.props.activeCountyGeoid !== nextProps.activeCountyGeoid){
            const activeGeoid = nextProps.activeCountyGeoid
            this.props.getChildGeo(activeGeoid.slice(0, 2), 'counties');
            this.props.getGeoMesh(activeGeoid.slice(0, 2), 'counties');
            this.props.getGeoMerge(activeGeoid.slice(0, 2), 'counties');
        }

    }

    componentWillReceiveProps(newProps){
        const activeGeoid = window.location.pathname.split("/")[2]
        let graph = get(this.props.falcorCache,['geo'],null)
        const {geoLevel} = newProps;
        let geojson = null,
            counties = null,
            activeCounty = null;
        if (newProps.geo["merge"] && newProps.geo["merge"][activeGeoid.slice(0, 2)]['counties'].features.length > 0 && graph) {
            switch (geoLevel) {
                case 'counties':
                    geojson = newProps.geo['merge'][activeGeoid.slice(0, 2)]['counties']
                    counties = newProps.geo['mesh'][activeGeoid.slice(0, 2)]['counties']
                    activeCounty = newProps.geo[activeGeoid.slice(0, 2)]['counties'].features
                        .reduce((a, c) => (c.id === activeGeoid) ? c : a, null);
                    break;
                default:
                    break;
            }
            if (!geojson) return;
            Viewport().fitGeojson(geojson)
            this.setState({bounds: geojson, countiesGeojson: counties, activeCountyGeoJson: activeCounty,
                county_name:get(graph,[activeGeoid,'name'],''),
                state_abbr:get(graph,[activeGeoid.slice(0,2),'state_abbr'],'')})
        }

    }
    componentDidUpdate(newProps,prevState,s) {
        if (this.props.activeCountyGeoid !== newProps.activeCountyGeoid) {
            const activeGeoid = this.props.activeCountyGeoid
            let graph = get(this.props.falcorCache,['geo'],null)
            const {geoLevel} = this.props;
            let geojson = null,
                counties = null,
                activeCounty = null;
            if (this.props.geo["merge"] && this.props.geo["merge"][activeGeoid.slice(0, 2)]['counties'].features.length > 0 && graph) {

                switch (geoLevel) {
                    case 'counties':
                        geojson = this.props.geo['merge'][activeGeoid.slice(0, 2)]['counties']
                        counties = this.props.geo['mesh'][activeGeoid.slice(0, 2)]['counties']
                        activeCounty = this.props.geo[activeGeoid.slice(0, 2)]['counties'].features
                            .reduce((a, c) => (c.id === activeGeoid) ? c : a, null);
                        break;
                    default:
                        break;
                }
                if (!geojson) return;
                Viewport().fitGeojson(geojson)
                this.setState({bounds: geojson, countiesGeojson: counties, activeCountyGeoJson: activeCounty,
                    county_name:get(graph,[activeGeoid,'name'],''),
                    state_abbr:get(graph,[activeGeoid.slice(0,2),'state_abbr'],'')})
            }

        }
    }


    generateLayers() {
        //console.log('state',this.state)
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
            <div>
                <div className="max-w-lg h-1/2">
                    <Search page={'overview'}/>
                </div>
                <div style={{height: '100%', width: '100%'}} className="flex justify-center">
                    <div className="text-5xl font-bold px-6 py-14 whitespace-no-wrap">{`${this.state.county_name || ''},
                        ${this.state.state_abbr || ''}`
                    }</div>
                    <SvgMap layers={ this.generateLayers() }
                            height={ this.props.height }
                            viewport={ Viewport() }
                            padding={ 5 }
                            bounds={ this.props.bounds} />
                </div>
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
        activeCountyGeoid : state.overview.activeCountyGeoid,
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
