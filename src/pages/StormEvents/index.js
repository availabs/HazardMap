import React from 'react';
import { connect } from 'react-redux';
import { reduxFalcor } from 'utils/redux-falcor'
import get from 'lodash.get'

import AvlMap from "components/AvlMap"

import StoemEventsLayerFactory from "./StormEventsLayer"

class NationalLanding extends React.Component {
  StormEventsLayer = StoemEventsLayerFactory({ active: true });
  
  fetchFalcorDeps () {
    return this.props.falcor.get(['riskIndex','hazards'])
  }

  render() {
    return (
      <div style={{height: '100%'}}>
        <AvlMap
          layers={[
            this.StormEventsLayer
          ]}
          height={'100%'}
          center={[0,0]}
          zoom={4}
          year={2018}
          hazards={this.props.hazards}
          fips={''}
          styles={[
            { name: 'Blank', style: 'mapbox://styles/am3081/ck80d5hds0r9y1ip3cs3aplld'}
          ]}
          sidebar={false}
          attributes={false}
        />
      </div>
    )
  }
}

const mapStateToProps = (state,ownProps) => {
  return {
    graph: state.graph,
    hazards: get(state.graph, 'riskIndex.hazards.value', [])
  };
};

const mapDispatchToProps = {};

export default
[{
  path: '/',
  mainNav: true,
  exact: true,
  name: 'Storm Events',
  layoutSettings: {
    fixed: true,
    maxWidth: '',//'max-w-7xl',
    headerBar: false,
    nav: 'top',
    theme: 'flat'
    
  },
  component: {
    type: 'div',
    props: {
      className: 'w-full overflow-hidden pt-16 focus:outline-none',
      style:{height: 'calc(100vh - 1rem)'}
    },
    children: [
      {
        type: 'div',
        props: {
          className: 'flex flex-col lg:flex-row h-full box-border'
        },
        children: [
          {
            type: 'div',
            props: {
              className: 'flex-1 h-full order-last lg:order-none overflow-hidden'
            },
            children: [
              NationalLanding
            ]
          },
          {
            type: 'div',
            props: {
              className: 'h-56 lg:h-auto lg:w-1/6 p-2 lg:min-w-64 '
            },
            children: [
              {
                type: 'div',
                props: {
                  className: ' bg-white rounded h-full w-full shadow '
                }
              }
            ]
          }
        ]
      }
    ]

  }
}]