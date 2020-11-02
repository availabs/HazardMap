import React from "react"

import { connect } from "react-redux"

import * as API from "../api"

export default Component => {
  const AmsRedux = props => <Component { ...props }/>;

  const mapStateToProps = state => ({
      user: state.user,
      groups: state.groups,
      users: state.users,
      requests: state.requests
    });
  return connect(mapStateToProps, { ...API })(AmsRedux);
}
