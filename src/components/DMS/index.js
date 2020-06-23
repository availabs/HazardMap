import React from "react"

import DmsComponents from "./components"

import { DmsButton } from "./components/dms-button"

import { Header } from 'components/avl-components/components'

import get from "lodash.get"

import { checkAuth, compareActions } from "./utils"

import "./styles.css"

class DmsManager extends React.Component {
  static defaultProps = {
    showHome: true,
    defaultAction: "list",
    dataItems: [],
    app: "app-name",
    type: "format-type",
    format: null,
    className: "",
    authRules: {},
    apiInteract: () => Promise.resolve()
  }

  renderChildren(dmsAction, item, props) {
    if (!this.props.format) return <NoFormat />;

    const hasAuth = checkAuth(this.props.authRules, dmsAction, { user: this.props.user }, item);
    if (!hasAuth) return <NoAuth />;

    const child = React.Children.toArray(this.props.children)
      .reduce((a, c) => compareActions(get(c, ["props", "dmsAction"], ""), dmsAction) ? c : a, null);

    if (child === null) return null;

    return React.cloneElement(child,
      { ...props,
        app: this.props.app,
        type: this.props.type,
        format: this.props.format,
        dataItems: this.props.dataItems,
        makeInteraction: this.props.makeInteraction,
        makeOnClick: this.props.makeOnClick,
        interact: this.props.interact,
        [this.props.type]: item
      }
    );

  }

  render() {
    if (!this.props.format) {
      return <div> No Format </div>
    }

    const { showHome, stack, top, item } = this.props,
      { dmsAction, props } = top,
      actions = [];

    if ((stack.length > 1) && showHome) {
       actions.push({
         comp: DmsButton,
         action: "dms:home"
       })
    }
    if (stack.length > 1) {
      actions.push({
        comp: DmsButton,
        action: "dms:back"
      })
    }
    if (dmsAction === "list") {
      actions.push({
        comp: DmsButton,
        action: "dms:create"
      })
    }

    return (
      <div className={ this.props.className }>
        <Header title={ this.props.title || `${ this.props.app } Manager` } actions={ actions }/>
        <main>{ this.renderChildren(dmsAction, item, props) }</main>
      </div>
    )
  }
}

const NoFormat = () => <div large className="p-5">No format supplied!!!</div>;
const NoAuth = () => <div large className="p-5">You do not have authorization for this action!!!</div>;

export default {
  ...DmsComponents,
  "dms-manager": DmsManager
}
