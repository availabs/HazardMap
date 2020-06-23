import React from "react"

import { RouterContext } from "../contexts"

import {
  useRouteMatch, useParams,
  useHistory, useLocation,
  Switch, Route
} from "react-router-dom"

import get from "lodash.get"

const GetParams = ({ Component, ...props }) =>
  <Component { ...props } params={ useParams() }/>;

const ParseItems = ({ Component, ...props}) => {
  const { action, attribute, value } = useParams();

  const id = get(props, "dataItems", []).reduce((a, c) => {
    return get(c, ["data", attribute], null) === value ? c.id : a;
  }, undefined);

  if (!id) return <Component key="no-id" { ...props }/>;

  return <Component { ...props } params={ { action, id } }/>
}

export default (Component, options = {}) => {
  return ({ ...props }) => {
    const { path } = useRouteMatch(),
      alt1 = `${ path }/:action`,
      alt2 = `${ path }/:action/:id`,
      alt3 = `${ path }/:action/:attribute/:value`,
      routerProps = {
        basePath: path,
        useRouter: true,
        location: useLocation(),
        history: useHistory()
      };
    return (
      <RouterContext.Provider value={ routerProps }>
        <Switch>
          <Route exact path={ path }>
            <Component { ...props } { ...routerProps }/>
          </Route>
          <Route exact path={ [alt1, alt2] }>
            <GetParams { ...props } { ...routerProps } Component={ Component }/>
          </Route>
          <Route exact path={ alt3 }>
            <ParseItems { ...props } { ...routerProps } Component={ Component }/>
          </Route>
        </Switch>
      </RouterContext.Provider>
    )
  }
}
