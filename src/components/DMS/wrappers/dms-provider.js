import React, { useContext } from "react"

import { AuthContext, ButtonContext, DmsContext, RouterContext } from "../contexts"
import { checkAuth, processAction } from "../utils"

import get from "lodash.get"

const getItem = (id, props) => {
  return (props.dataItems || []).reduce((a, c) => c.id === id ? c : a, null);
}

const normalizeArgs = (dmsAction, item, props, ...rest) => {
  let itemId = null;
  if (typeof item === "object") {
    itemId = get(item, "id", null);
  }
  else {
    itemId = item;
    item = getItem(itemId, props);
  }
  return [
    processAction(dmsAction),
    item,
    itemId,
    props,
    props.interact,
    ...rest
  ]
}
const makeInteraction = (...args) => {
  const [
    { action, seedProps, ...rest },
    item, itemId,
    props,
    interact
  ] = normalizeArgs(...args);

  const { authRules, useRouter, basePath, location, history } = props,

    hasAuth = checkAuth(authRules, action, props, item);

  if (useRouter && hasAuth) {
    const { push } = history,
      { pathname } = location,
      state = get(location, "state", null) || [],
      length = state.length;

    return /^(dms:)*back$/.test(action) ?
      { type: "link",
        key: action,
        action, ...rest,
        to: {
          pathname: get(state, [length - 1], basePath),
          state: state.slice(0, length - 1)
        }
      }
      : /^(dms:)*home$/.test(action) ?
        { type: "link",
          key: action,
          action, ...rest,
          to: {
            pathname: basePath,
            state: []
          }
        }
      : /^api:/.test(action) ?
        { tpye: "button",
          key: action,
          action, ...rest,
          onClick: e => {
            e.stopPropagation();
            return Promise.resolve(interact(action, itemId, seedProps(props)))
              .then(() => push({
                pathname: get(state, [length - 1], basePath),
                state: state.slice(0, length - 1)
              }))
          }
        }
      : { type: "link",
          key: action,
          action, ...rest,
          to: {
            pathname: itemId ? `${ basePath }/${ action }/${ itemId }` : `${ basePath }/${ action }`,
            state: [...state, pathname]
          }
        }
  }
  return {
    type: "button",
    key: action,
    action, ...rest,
    onClick: e => {
      e.stopPropagation();
      if (!hasAuth) return Promise.resolve();
      return Promise.resolve(interact(action, itemId, seedProps(props)))
        .then(() => /^api:/.test(action) && interact("dms:back"));
    }
  }
}
export const useMakeInteraction = (dmsAction, item, props) => {
  props = {
    ...props,
    ...useContext(DmsContext),
    ...useContext(AuthContext),
    ...useContext(RouterContext)
  }
  return makeInteraction(dmsAction, item, props)
}

const makeOnClick = (...args) => {
  const [
    { action, seedProps },
    item, itemId,
    props,
    interact
  ] = normalizeArgs(...args);

  const { authRules, useRouter, basePath, location, history } = props,

    hasAuth = checkAuth(authRules, action, props, item);

  if (useRouter && hasAuth) {
    const { push } = history,
      { pathname } = location,
      state = get(location, "state", null) || [],
      length = state.length;

    return /^(dms:)*back$/.test(action) ?
      (e => {
        e.stopPropagation();
        push({
          pathname: get(state, [length - 1], basePath),
          state: state.slice(0, length - 1)
        });
      })
      : /^(dms:)*home$/.test(action) ?
        (e => {
          e.stopPropagation();
          push({
            pathname: basePath,
            state: []
          });
        })
      : /^api:/.test(action) ?
        (e => {
          e.stopPropagation();
          return Promise.resolve(interact(action, itemId, seedProps(props)))
            .then(() => push({
              pathname: get(state, [length - 1], basePath),
              state: state.slice(0, length - 1)
            }))
        })
      : (e => {
          e.stopPropagation();
          push({
            pathname: itemId ? `${ basePath }/${ action }/${ itemId }` : `${ basePath }/${ action }`,
            state: [...state, pathname]
          })
        })
  }
  return (
    e => {
      e.stopPropagation();
      if (!hasAuth) return Promise.resolve();
      return Promise.resolve(interact(action, itemId, seedProps(props)))
        .then(() => /^api:/.test(action) && interact("dms:back"));
    }
  )
}
export const useMakeOnClick = (dmsAction, item, props) => {
  props = {
    ...props,
    ...useContext(DmsContext),
    ...useContext(AuthContext),
    ...useContext(RouterContext)
  }
  return makeOnClick(dmsAction, item, props)
}

export default (Component, options = {}) => {
  const {
    // format,
    authRules = {},
    buttonThemes = {},
    setDefaultTo = false
  } = options;

  class Wrapper extends React.Component {
    static defaultProps = {
      showHome: true,
      defaultAction: "list",
      dataItems: [],
      app: "app-name",
      type: "format-type",
      format: null,
      authRules,
      buttonColors: {},
      apiInteract: () => Promise.resolve()
    }
    constructor(...args) {
      super(...args);

      this.state = {
        stack: [{
          dmsAction: this.props.defaultAction,
          id: null,
          props: null
        }],
        initialized: false
      }
      this.interact = this.interact.bind(this);
      this.makeInteraction = this.makeInteraction.bind(this);
      this.makeOnClick = this.makeOnClick.bind(this);
    }

    componentDidMount() {
      const { action, id } = get(this.props, "params", {});
      if (action) {
        this.interact(action, id, null);
      }
    }
    componentDidUpdate() {
      if ((setDefaultTo !== false) && !this.state.item && this.props.dataItems.length) {
        this.interact("click", this.props.dataItems[setDefaultTo].id)
      }
    }

    getItem(id) {
      return getItem(id, this.props);
    }

    makeOnClick(dmsAction, item, props) {
      return makeOnClick(dmsAction, item, { ...this.props, ...props, interact: this.interact })
    }
    makeInteraction(dmsAction, item, props) {
      return makeInteraction(dmsAction, item, { ...this.props, ...props, interact: this.interact });
    }

    interact(dmsAction, id, props) {
      if (arguments.length === 1) {
        id = dmsAction;
        dmsAction = "click";
      }

      const hasAuth = checkAuth(this.props.authRules, dmsAction, this.props, this.getItem(id));
      if (!hasAuth) return;

      if (/^(dms:)*back$/.test(dmsAction)) {
        this.popAction();
      }
      else if (/^(dms:)*home$/.test(dmsAction)) {
        this.clearStack();
      }
      else if (/^api:/.test(dmsAction)) {
        return this.props.apiInteract(dmsAction, id, props);
      }
      else {
        this.pushAction(dmsAction, id, props);
      }
    }

    pushAction(dmsAction, id, props) {
      const stack = this.props.useRouter ?
        this.state.stack.slice(0, 1) : [...this.state.stack];

      stack.push({ dmsAction, id, props });
      if (stack.length > 100) {
        stack.splice(1, 1);
      }
      this.setState({ stack });
    }
    popAction() {
      if (this.state.stack.length > 1) {
        const stack = [...this.state.stack];
        stack.pop();
        this.setState({ stack });
      }
    }
    clearStack() {
      const stack = [...this.state.stack].slice(0, 1);
      this.setState({ stack });
    }
    getTop() {
      const { stack } = this.state;
      return stack[stack.length - 1];
    }

    getDmsProps() {
      const { app, type, dataItems } = this.props,
        { id, ...top } = this.getTop(),
        item = this.getItem(id);

      return {
        interact: this.interact,
        makeInteraction: this.makeInteraction,
        makeOnClick: this.makeOnClick,
        stack: this.state.stack,
        app,
        type,
        dataItems,
        top,
        [type]: item,
        item
      }
    }
    render() {
      const { authRules, user } = this.props,
        dmsProps = this.getDmsProps();
      return (
        <DmsContext.Provider value={ dmsProps }>
          <AuthContext.Provider value={ { authRules, user } }>
            <ButtonContext.Provider value={ {buttonThemes} }>
              <Component { ...dmsProps } { ...this.props }/>
            </ButtonContext.Provider>
          </AuthContext.Provider>
        </DmsContext.Provider>
      )
    }
  }
  return Wrapper;
}
