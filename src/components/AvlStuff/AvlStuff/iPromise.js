import React from "react"

let UNIQUE_ID = 0;

class PromiseComponent extends React.Component {
  static defaultProps = {
    promise: Promise.resolve("No Data!!!")
  }
  state = {
    data: "Loading..."
  }
  MOUNTED = false;
  componentDidMount() {
    this.MOUNTED = true;
    Promise.resolve(this.props.promise)
      .then(data => this.MOUNTED && this.setState({ data }));
  }
  componentWillUnmount() {
    this.MOUNTED = false;
  }
  render() {
    return (
      <div>{ this.state.data }</div>
    )
  }
}
export const iPromise = (promise, id = ++UNIQUE_ID) => {
  return <PromiseComponent key={ id } promise={ promise } id={ id }/>
}
