import React from "react"
import { connect } from 'react-redux';
import { reduxFalcor} from "utils/redux-falcor";
import get from 'lodash.get'

class CensusLabel extends React.Component {
  static defaultProps = {
    censusKeys: [],
    removeLeading: 0
  }
  fetchFalcorDeps() {
    return this.props.falcor.get(
      ["acs", "meta", this.props.censusKeys, "label"]
    );
  }
  render() {
    return (
      <>
        { this.props.censusNames
            .map(name => {
              let split = name.split("!!");
              if (split.length > this.props.removeLeading) {
                split = split.slice(this.props.removeLeading);
              }
              return split.join(", ")
            })
            .join(", ")
        }
      </>
    )
  }
}

export const getCensusKeyLabel = (key, acsGraph, removeLeading = 0) => {
  const name = get(acsGraph, ["meta", key, "label"], key);
  if (typeof name !== "string") return key;

  let split = name.split("!!");
  if (split.length > removeLeading) {
    split = split.slice(removeLeading);
  }
  return split.join(", ")
}

const mapStateToProps = (state, props) => ({
  censusNames: getCensusNames(state, props)
})

const getCensusNames = (state, props) =>
  get(props, "censusKeys", [])
    .map(key => get(state, ["graph", "acs", "meta", key, "label"], key))

export default connect(mapStateToProps, null)(reduxFalcor(CensusLabel));
