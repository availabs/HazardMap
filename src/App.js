import React, { Component } from 'react';
import { connect } from 'react-redux';
// import { Switch } from "react-router"
import { BrowserRouter, Switch, Router} from 'react-router-dom';
import ScrollToTop from 'utils/ScrollToTop'

import Routes from 'Routes';
import Layout from 'components/avl-components/DefaultLayout'

import { auth } from 'store/user';

import { createBrowserHistory } from "history";

const history = createBrowserHistory();

class App extends Component {
  state = {
    isAuthenticating: true
  }
  componentDidMount() {
    this.props.auth();
  }
  componentDidUpdate(prevProps) {
    if (this.state.isAuthenticating && this.props.user.attempts) {
      this.setState({ isAuthenticating: false });
    }
  }

  render() {
    return (
      <BrowserRouter>
        <ScrollToTop />
        
          <Router history={history}>\
          <Switch>
            {Routes.map((route, i) => {
              return (
                <Layout 
                  logo={(<div className='px-12'>HHD</div>)}
                  key={ i }
                  { ...route }
                  authed={ this.props.user.authed }
                  isAuthenticating={ this.state.isAuthenticating }
                  menus={ Routes.filter(r => r.mainNav) }
                  router={ this.props.router }
                  user={ this.props.user }
                />
              );
            })}
            </Switch>

          </Router>
              </BrowserRouter>
    );
  }
}

const mapStateToProps = state => ({ user: state.user });

const mapDispatchToProps = { auth };

export default connect(mapStateToProps, mapDispatchToProps)(App);
