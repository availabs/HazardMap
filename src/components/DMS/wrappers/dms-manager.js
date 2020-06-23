import React from "react"

import { compareActions } from "../utils"

import get from "lodash.get"

export default Component =>
  ({ children, ...props }) => {
    const dmsActions = [];
    children = React.Children.toArray(children)
      .reduce((children, child) => {
        if (compareActions(child.props.dmsAction, props.top.dmsAction)) {

          dmsActions.push(...get(child.props, ["dmsActions"], []));

          children.push(React.cloneElement(child,
            { app: props.app,
              type: props.type,
              format: props.format,
              dataItems: props.dataItems,
              stack: props.stack,
              top: props.top,
              item: props.item,
              makeInteraction: props.makeInteraction,
              makeOnClick: props.makeOnClick,
              interact: props.interact,
              [props.type]: props.item
            }
          ));
        }
        else if (!child.props.dmsAction) {
          children.push(child);
        }
        return children;
      }, [])
      .map(child => {
        if (!compareActions(child.props.dmsAction, props.top.dmsAction)) {
          return React.cloneElement(child,
            { dmsActions,
              app: props.app,
              type: props.type,
              format: props.format,
              dataItems: props.dataItems,
              stack: props.stack,
              top: props.top,
              item: props.item,
              makeInteraction: props.makeInteraction,
              makeOnClick: props.makeOnClick,
              interact: props.interact,
              [props.type]: props.item
            }
          );
        }
        return child;
      })
    return (
      <Component { ...props }>{ children }</Component>
    )
  }
