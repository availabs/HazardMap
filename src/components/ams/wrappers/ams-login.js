import React from "react"

import { Redirect } from "react-router-dom"

import get from "lodash.get"

export default Component =>
  class LoginWrapper extends React.Component {
    static defaultProps = {
      amsAction: "login",
      redirectTo: "/"
    }
    state = {
      email: "",
      password: ""
    }
    handleSubmit(e) {
      e.preventDefault();
      this.props.login(this.state.email, this.state.password);
    }
    render() {
      const { email, password } = this.state,
        canSubmit = email && password,

        { location, user, redirectTo } = this.props,
        { pathname } = location;

      if (user.authed) {
        const from = get(location, ["state", "from"]),
          to = ((pathname === from) || !from) ? redirectTo : from;
        return <Redirect to={ to }/>
      }
      return (
        <Component { ...this.props } { ...this.state }
          handleSubmit={ e => this.handleSubmit(e) }
          update={ u => this.setState(u) }
          canSubmit={ canSubmit }/>
      );
    }
  }
