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
        sidebar={true}
      />
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
  name: 'Home',
  icon: 'HomeOutline',
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
      className: 'h-screen pt-16 w-screen overflow-hidden focus:outline-none'
    },
    children: [
      {
        type: 'div',
        props: {
          className: 'flex flex-col lg:flex-row h-full'
        },
        children: [
          {
            type: 'div',
            props: {
              className: 'flex-1 h-full order-last lg:order-none'
            },
            children: [
              NationalLanding
            ]
          },
          {
            type: 'div',
            props: {
              className: 'h-56 lg:h-auto lg:w-1/6 p-2 lg:min-w-64'
            },
            children: [
              {
                type: 'div',
                props: {
                  className: 'bg-white rounded h-full w-full shadow'
                }
              }
            ]
          }
        ]
      }
    ]

  }
}]