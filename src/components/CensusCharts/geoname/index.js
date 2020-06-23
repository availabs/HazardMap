import React from 'react';
import { connect } from 'react-redux';
import { reduxFalcor} from "utils/redux-falcor";
import get from 'lodash.get'

class GeoName extends React.Component{

    fetchFalcorDeps(){
      return this.props.falcor
        .get(['geo', this.props.geoids, 'name'])
    }

    render(){
        // console.log('teest 123', this.props.geo, this.props.geoids[0], get(this.props `geo[${this.props.geoids[0]}].name`, ''), this.props.geo[this.props.geoids[0]]name)
        return(
            <>
              {
                this.props.geoids.map(geoid => get(this.props, `geo[${geoid}].name`, '')
                  .toUpperCase()).join(' ')
              }
            </>
        )

    }

    static defaultProps = {
        geoids: []
    }
}

const mapStateToProps = (state) => {
    return {
        geo: state.graph.geo || {} // so componentWillReceiveProps will get called.
    };
};
export default connect(mapStateToProps, null)(reduxFalcor(GeoName))
