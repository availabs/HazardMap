import React from "react"

import { connect } from "react-redux"

import { updateCache } from "./falcorCache"

import { debounce } from "lodash"

const FalcorContext = React.createContext();

class FalcorProviderBase extends React.Component {
  constructor(...args) {
    super(...args);
    this.debounced = debounce(this.updateCache, 250);
  }
  componentDidMount() {
    this.props.falcor.onChange(this, this.debounced);
  }
  componentWillUnmount() {
    this.props.falcor.remove(this);
  }
  updateCache() {
    this.props.updateCache(this.props.falcor.getCache());
  }
  render() {
    return (
      <FalcorContext.Provider value={ this.props.falcor }>
        { this.props.children }
      </FalcorContext.Provider>
    )
  }
}
export const FalcorProvider = connect(null, { updateCache })(FalcorProviderBase);

const NO_OP = () => {};

export const reduxFalcor = Component => {
  class Wrapper extends React.Component {
    WrappedComponent = React.createRef();
    componentDidMount() {
      this.fetchFalcorDeps();
    }
    componentDidUpdate(oldProps) {
      if (oldProps.falcorCache !== this.props.falcorCache) {
        this.fetchFalcorDeps();
      }
    }
    fetchFalcorDeps() {
      const { current } = this.WrappedComponent;
      if (!current) return;

      if (typeof current.fetchFalcorDeps === "function") {
        current.fetchFalcorDeps().then(NO_OP);
      }
    }
    render() {
      return (
        <FalcorContext.Consumer>
          { falcor =>
              <Component ref={ this.WrappedComponent }
                { ...this.props } falcor={ falcor }/>
          }
        </FalcorContext.Consumer>
      )
    }
  }
  const mapStateToProps = state => ({ falcorCache: state.falcorCache });
  return connect(mapStateToProps, null)(Wrapper);
}
