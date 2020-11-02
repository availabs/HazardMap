import React from "react"

export default Component =>
  class RsetWrapper extends React.Component {
    static defaultProps = {
      amsAction: "reset-password"
    }
    state = {
      email: "",
      verify: ""
    }
    handleSubmit(e) {
      e.preventDefault();
      this.setState({ email: "", verify: "" });
      this.props.resetPassword(this.state.email);
    }
    render() {
      const { email, verify } = this.state,
        canSubmit = email && verify && (email === verify);
      return (
        <Component { ...this.props } { ...this.state }
          handleSubmit={ e => this.handleSubmit(e) }
          update={ u => this.setState(u) }
          canSubmit={ canSubmit }/>
      );
    }
  }
