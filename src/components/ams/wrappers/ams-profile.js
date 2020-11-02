import React from "react"

export default Component =>
  class Wrapper extends React.Component {
    static defaultProps = {
      amsAction: "profile"
    }
    render() {
      return <Component { ...this.props }/>;
    }
  }
