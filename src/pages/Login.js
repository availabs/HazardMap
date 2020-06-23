import React from "react"

import { connect } from "react-redux"
// import { withRouter } from "react-router"
import { Redirect, withRouter } from "react-router-dom"

import { Button } from "components/avl-components/components/Button"

import { login } from "store/user"

import get from "lodash.get"

class Login extends React.Component {
  state = {
    email: "",
    password: ""
  }
  handleSubmit(e) {
    e.preventDefault();
    this.props.login(this.state);
  }
  render() {
    const { email, password } = this.state,
      disabled = !email || !password,
      from = get(this.props, ["location", "state", "from"], null);

    if (this.props.authed) {
      const { pathname } = this.props.location,
        to = pathname !== from ? from : "/";
      return <Redirect to={ to }/>
    }

    return (
      <div className="flex justify-center items-center flex-col p-40">
        <div className="inline-block rounded px-20 py-10 shadow-lg">
          <div className="text-3xl font-bold">Login</div>
          <div>
            <form onSubmit={ e => this.handleSubmit(e) }>
              <div className="my-2">
                <label htmlFor="email" className="block font-bold">Email</label>
                <input type="email" id="email" required autoFocus
                  className="px-4 py-1 rounded" value={ email }
                  onChange={ e => this.setState({ email: e.target.value }) }/>
              </div>
              <div className="my-2">
                <label htmlFor="email" className="block font-bold">Password</label>
                <input type="password" id="password" required
                  className="px-4 py-1 rounded" value={ password }
                  onChange={ e => this.setState({ password: e.target.value }) }/>
              </div>
              <div className="my-2">
                <Button disabled={ disabled } type="submit"
                  buttonTheme="buttonPrimaryLargeBlock">
                  Login
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => ({
  authed: state.user.authed
})

const Connected = connect(mapStateToProps, { login })(withRouter(Login));

export default {
  path: "/login",
  exact: true,
  component: Connected,
  layoutSettings: {
    fixed: true,
    headerBar: true,
    theme: 'TEST_THEME'
  }
}
