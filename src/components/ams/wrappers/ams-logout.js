import React from "react"

export default Component =>
  class LogoutWrapper extends React.Component {
    static defaultProps = {
      amsAction: "logout",
      redirectTo: "/",
      authLevel: 0
    }
    render() {
      return <Component { ...this.props }/>;
    }
  }
