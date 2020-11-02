import React from "react"

export default Component =>
  class Wrapper extends React.Component {
    static defaultProps = {
      amsAction: "verify-email",
      urlArg: null,
      showInDirectory: false
    }
    state = {
      verified: "waiting"
    }
    MOUNTED = false;
    setState(...args) {
      this.MOUNTED && super.setState(...args);
    }
    componentDidMount() {
      this.MOUNTED = true;
      this.props.verifyEmail(this.props.urlArg)
        .then(({ res, dispatch, sendSystemMessage }) => {
          if (res.error) {
            dispatch(sendSystemMessage(res.error, { type: "Danger", id: "email-verification-failed" }));
            this.setState({ verified: "failed" });
          } else {
            dispatch(sendSystemMessage(res.message, { type: "Info", id: "email-verification-succeeded" }));
            this.setState({ verified: "succeeded" });
          }
        });
    }
    componentWillUnmount() {
      this.MOUNTED = false;
    }
    render() {
      return <Component { ...this.props } { ...this.state }/>;
    }
  }
