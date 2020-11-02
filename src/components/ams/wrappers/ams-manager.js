import React from "react"

import { PROJECT_NAME } from "config"

import { Link, useLocation } from "react-router-dom"

import Header from "components/avl-components/components/Header/HeaderComponent"
import { useTheme } from "components/avl-components/wrappers/with-theme"

import Container from "../components/components/Container"

import get from "lodash.get"

const NoChild = () => (
  <div className="h-screen flex items-center justify-center">
    <Container>
      <div className="text-lg font-bold">OOPS!!! Something went awry!</div>
      <div className="text-right">
        <Link to="/auth">
          to directory
        </Link>
      </div>
    </Container>
  </div>
);
const NoAuthority = () => (
  <div className="h-screen flex items-center justify-center">
    <Container>
      <div className="text-lg font-bold">OOPS!!! You do not have the authority!</div>
      <div className="text-right">
        <Link to="/auth">
          to directory
        </Link>
      </div>
    </Container>
  </div>
);

const Directory = ({ pathname, children, user, ...props }) => {
  const theme = useTheme();
  return (
    <div className="mt-16">
      <Header title="Directory"/>
      <div className="py-20">
        <div className="inline-block">
          { React.Children.toArray(children)
              .reduce((accum, child) => {
                const showInDirectory = get(child, ["props", "showInDirectory"], true),
                  amsAction = get(child, ["props", "amsAction"]);
                if (amsAction && showInDirectory) {
                  const authLevel = get(child, ["props", "authLevel"], -1);
                  if (user.authLevel >= authLevel) {
                    accum.push(
                      <Link key={ child.props.amsAction }
                        to={ `${ pathname }/${ child.props.amsAction }` }>
                        <div className={ `py-1 px-2 rounded hover:${ theme.accent1 }` }>
                          { child.props.amsAction }
                        </div>
                      </Link>
                    )
                  }
                  else {
                    accum.push(
                      <div key={ child.props.amsAction }
                        className={ `py-1 px-2 cursor-not-allowed line-through rounded hover:${ theme.accent1 }` }>
                        { child.props.amsAction }
                      </div>
                    )
                  }
                }
                else if (!amsAction) {
                  accum.push(child);
                }
                return accum;
              }, [])
          }
        </div>
      </div>
    </div>
  )
}

export default Component => {
  const AmsManager = ({ params = {}, children, ...props }) => {
    const { action } = params,
      location = useLocation(),
      { pathname } = location;

    let requiredAuth = -1;

    let Children = React.Children.toArray(children)
      .filter(({ props }) => !("amsAction" in props) || (props.amsAction === action))
      .map(child => {
        requiredAuth = Math.max(requiredAuth, get(child, ["props", "authLevel"], -1));
        return React.cloneElement(child, { ...props, ...params, location, project: PROJECT_NAME });
      });

    if (!action) {
      Children = [
        ...React.Children.toArray(children)
          .filter(({ props }) => !("amsAction" in props) || (props.amsAction === action)),
        <Directory pathname={ pathname } key="directory" { ...props } { ...params }>
          { children }
        </Directory>
      ];
    }
    else if (!props.user.authed && (requiredAuth > -1)) {
      Children = React.Children.toArray(children)
        .filter(({ props }) => !("amsAction" in props) || (props.amsAction === "login"))
        .map(child => React.cloneElement(child, { ...props, ...params, location, project: PROJECT_NAME }));
    }
    else if (props.user.authed && (props.user.authLevel < requiredAuth)) {
      Children = [
        ...React.Children.toArray(children)
          .filter(({ props }) => !("amsAction" in props))
          .map(child => React.cloneElement(child, { ...props, ...params, location, project: PROJECT_NAME })),
        <NoAuthority key="no-auth"/>
      ];
    }

    if (!Children.length) {
      Children = <NoChild />
    }

    return <Component { ...props } { ...params } project={ PROJECT_NAME }>{ Children }</Component>;
  }
  return AmsManager;
}
