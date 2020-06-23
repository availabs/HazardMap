import React from "react"

import { DmsButton } from "../components/dms-button"

import get from "lodash.get"

import { prettyKey, getValue } from "../utils"

const SEED_PROPS = () => ({});

const ViewItem = ({ value, type }) =>
  type !== "img" ? <div>{ value }</div> :
  <div>
    <img src={ value } style={ { maxHeight: "16rem" } } alt=""/>
  </div>

const ViewRow = ({ name, children }) =>
  <div className="grid grid-cols-4 my-2">
    <div className="col-span-1 font-bold">{ name }</div>
    <div className="col-span-3">
      { children }
    </div>
  </div>

export default (Component, options = {}) => {
  return class Wrapper extends React.Component {
    static defaultProps = {
      dmsAction: "view",
      actions: [],
      interact: () => {},
      mapDataToProps: {},
      seedProps: props => ({})
    }
    renderChildren() {
      const { seedProps = SEED_PROPS, ...props } = this.props;
      return React.Children.map(this.props.children, child =>
        React.cloneElement(child, { ...props, ...seedProps(props) })
      )
    }
    renderItem({ value, key }, item) {
      let { format } = this.props,
        attributes = get(format, "attributes", []),
        attribute = attributes.reduce((a, c) => c.key === key ? c: a, {}),
        name = attribute.name || prettyKey(key),
        type = attribute.type;

      if (!value) return null;

      if (key === "updated_at") {
        value = (new Date(value)).toLocaleString();
      }
      else if (/-array$/.test(type)) {
        value = value.map((v, i) => <ViewItem key={ i } type={ type } value={ v }/>)
      }
      else {
        value = <ViewItem type={ type } value={ value }/>
      }

      return (
        <ViewRow key={ key } name={ name }>
          { value }
        </ViewRow>
      );
    }
    renderRow(objectArg, sources) {
      const {
        value,
        key,
        source
      } = objectArg;

      if (source === "item") {
        return this.renderItem(objectArg, sources.item);
      }
      return (
        <ViewRow key={ key } name={ key }>
          { value }
        </ViewRow>
      );
    }
    getActionGroups(actions, key) {
      const item = get(this, ["props", this.props.type], null);
      if (!Array.isArray(actions)) {
        return (
          <DmsButton key={ get(actions, "action", actions) }
            item={ item } action={ actions } props={ this.props }/>
        )
      }
      return (
        <div className="btn-group-horizontal" key={ key }>
          { actions.map((a, i) => this.getActionGroups(a, i)) }
        </div>
      )
    }
    render() {
      const {
        actions, //interact,
        type, //format,
        mapDataToProps
      } = { ...this.props, ...options };

      const item = get(this, ["props", type], null);

      if (!item) return null;

      const sources = { item, props: this.props },
        props = {};

      for (const key in mapDataToProps) {
        const path = mapDataToProps[key];

        if (typeof mapDataToProps[key] === "string") {
          props[key] = getValue(path, sources);
        }
        else {
          const directives = { preserveSource: true },
            mapped = path.map(p => getValue(p, sources, directives));
          props[key] = mapped.map(v => this.renderRow(v, sources));
        }
      }

      return (
        <div>
          <Component { ...props } { ...this.props }/>
          { !actions.length ? null :
            <div className="action-container my-3">
              { this.getActionGroups(actions) }
            </div>
          }
          <div>{ this.renderChildren() }</div>
        </div>

      )
    }
  }
}
