import React from "react"

import { DmsButton } from "./dms-button"
import Editor from "./editor"
import ImgInput from "./img-input"

import { Button } from "components/avl-components/components/Button"
import { Input, TextArea, ArrayInput, Select } from "components/avl-components/components/Inputs"
import { verifyValue, hasValue } from "components/avl-components/components/Inputs/utils"
import { useTheme } from "components/avl-components/wrappers/with-theme"


import { prettyKey, hasBeenUpdated, getValue } from "../utils"

import get from "lodash.get"

import styled from "styled-components"

const InputRow = ({ att, onChange, domain, ...props }) => {
  const verified = att.required && hasValue(props.value) && verifyValue(props.value, att.type, att.verify);
  return (
    <div className={ `
      my-2 border-l-4 pl-1 ${ !att.required ? "border-transparent" : verified ? "border-green-400" : "border-red-400" }
      ` }>
      <div>
        <label className="block w-full py-1" htmlFor={ `att:${ att.key }` }>
          { att.name || prettyKey(att.key) }
        </label>
      </div>
      <div>
        { /^(.+?)-array$/.test(att.type) && att.domain ?
          <div className="max-w-xl">
            <Select { ...props } id={ `att:${ att.key }` }
              multi={ true } domain={ domain }
              onChange={ v => onChange(v) } searchable={ att.searchable }/>
          </div>
        : /^(.+?)-array$/.test(att.type) ?
          <div className="max-w-xl">
            <ArrayInput id={ `att:${ att.key }` } { ...props }
              type={  att.type.replace("-array", "") }
              onChange={ v => onChange(v) } placeholder={ `Type a value...`}/>
          </div>
        : att.type === "rich-text" ?
          <Editor { ...props } id={ `att:${ att.key }` }
            onChange={ v => onChange(v) }/>
        : att.type === "textarea" ?
            <div className="max-w-xl">
              <TextArea { ...props } id={ `att:${ att.key }` } rows="6"
                onChange={ v => onChange(v) }
                placeholder={ `Type a value...`}/>
            </div>
          : att.type === "img" ?
            <div className="max-w-xl">
              <ImgInput { ...props } id={ `att:${ att.key }` }
                onChange={ v => onChange(v) }/>
            </div>
          : att.domain ?
            <div className="max-w-xl">
              <Select domain={ domain } { ...props }  id={ `att:${ att.key }` }
                onChange={ v => onChange(v) } multi={ false } searchable={ att.searchable }/>
            </div>
          :
            <div className="max-w-xl">
              <Input { ...props } id={ `att:${ att.key }` } type={ att.type }
                min={ att.min } max={ att.max } placeholder={ `Type a value...`}
                onChange={ v => onChange(v) } required={ att.required }/>
            </div>
        }
      </div>
    </div>
  )
}
const BadAttributeRow = ({ format = {}, onDelete, onReassign, ...props }) => {
  const [reassign, setReassign] = React.useState({});
  return (
    <div className="inline-block">
      <div className="rounded border p-3 pt-1 mt-3">
        <InputRow { ...props } disabled={ true }/>
        <Button onClick={ onDelete } className="w-full">
          Remove Attribute
        </Button>
      </div>
      <div className="rounded border p-3 pt-1 mt-3">
        <Select domain={ format.attributes }
          multi={ false }
          searchable={ false }
          onChange={ setReassign }
          accessor={ d => d.key }
          value={ reassign }/>
        <Button disabled={ !reassign.key } className="w-full"
          onClick={ e => onReassign(reassign.key) }>
          Reassign Attribute { reassign.key ? `to ${ reassign.key }` : "" }
        </Button>
      </div>
    </div>
  )
}

export default class DmsCreate extends React.Component {
  static defaultProps = {
    dmsAction: "create"
  }
  INITIALIZED = false
  state = {
    page: 0,
    pages: [[]],
    values: {}
  }
  componentDidMount() {
    this.INITIALIZED = false;
    this.initState();

  }
  componentDidUpdate(oldProps) {
    !this.INITIALIZED && this.initState();
    const attributes = get(this.props, ["format", "attributes"], []);
    if (!this.state.pages[0].length && attributes.length) {
      const pages = attributes.reduce((a, c) => {
        a[a.length - 1].push(c);
        if (c.wizardBreak) {
          a.push([]);
        }
        return a;
      }, [[]])
      this.setState({ pages })
    }
  }
  initState() {
    this.INITIALIZED = this.initDefaults();
  }
  initDefaults() {
    const values = {},
      // attributes = get(this.props, ["format", "attributes"], []);
      attributes = this.state.pages[this.state.page];

    let hasDefaults = false;

    attributes.forEach(att => {
      if (att.default) {
        hasDefaults = true;
        const value = this.getDefaultValue(att);
        hasValue(value) && (values[att.key] = value);
      }
    })
    const hasData = Object.keys(values).length;
    hasData && this.setState(state => ({ values }));
    return hasDefaults ? hasData : true;
  }
  handleChange(key, value) {
    this.setState(({ values }) =>
      ({ values: {
        ...values,
        [key]: value
      } })
    );
  }
  doVerify(attributes) {
    const item = get(this.props, this.props.type, null),
      data = get(item, "data", {});

    // return get(this.props, ["format", "attributes"], [])
    return attributes.filter(att => att.editable !== false)
      .reduce((a, c) => {
        const value = this.state.values[c.key],
          asArray = !Array.isArray(value) ? [value] : value,
          has = hasValue(value);

        if (c.type !== "rich-text") {
          if (!asArray.reduce((a, v) =>
            has ? a && verifyValue(v, c.type, c.verify) : a
          , true)) return false;

          // if (has && (c.type === "number")) {
          //   const { min, max } = c;
          //   if ((min !== undefined) && (+value < min)) return false;
          //   if ((max !== undefined) && (+value > max)) return false;
          // }
        }

        return !c.required ? a : (a && Boolean(value));
      }, hasBeenUpdated(data, this.getValues()))
  }
  verifyAll() {
    return this.doVerify(get(this.props, ["format", "attributes"], []));
  }
  verify() {
    return this.doVerify(this.state.pages[this.state.page]);
  }
  getDefaultValue(att) {
    getValue(att.default, { props: this.props });
  }
  getValues() {
    const values = {
      ...this.state.values
    }
    // const attributes = get(this.props, ["format", "attributes"], []);
    const attributes = this.state.pages[this.state.page];
    attributes.forEach(att => {
      if (!hasValue(values[att.key])) {
        delete values[att.key];
      }
    })
    return values;
  }
  create() {
    const values = this.getValues();
    this.props.interact(`api:create`, null, values);
  }
  getButtonAction(values) {
    return {
      action: "api:create",
      seedProps: () => values
    }
  }
  getDomain(att) {
    if (att.domain) {
      if (typeof att.domain === "string") {
        return getValue(att.domain, { props: this.props }) || [];
      }
      return att.domain;
    }
    return null;
  }
  render() {
    const values = this.getValues(),
      item = get(this.props, this.props.type, null);

    const getValue = key => {
      const value = get(values, key, null);
      return value || "";
    }
    // const attributes = get(this.props, ["format", "attributes"], []),
    const attributes = this.state.pages[this.state.page],
      badAttributes = [];

    // for (const att in this.state.values) {
    //   if (!attributes.some(d => d.key === att) && hasValue(this.state.values[att])) {
    //     badAttributes.push(att);
    //   }
    // }
    return (
      <div className="flex flex-col w-full justify-center">
        { this.state.pages.length < 2 ? null :
          <div className="font-bold text-2xl flex mb-3">
            { this.state.pages.map((page, i) =>
                <StyledBorderDiv key={ i } className={ `${ i <= this.state.page ? "active" : "" }` }
                  active={ i <= this.state.page }
                  current={ i === this.state.page }>
                  <div className="pr-6">
                    { get(page, [0, "wizardPage"], `Page ${ i + 1 }`) }
                  </div>
                </StyledBorderDiv>
              )
            }
          </div>
        }
        <form onSubmit={ e => e.preventDefault() } className="w-full">
          <div className="flex max-w-xl">
            { this.state.pages.length < 2 ? null :
              <Button className="flex-0" disabled={ this.state.page === 0 }
                onClick={ e => this.setState({ page: Math.max(0, this.state.page - 1) }) }>
                back
              </Button>
            }
            <div className="flex-1 flex justify-end">
              { this.state.pages.length < 2 ? null :
                <Button className="flex-0" disabled={ !this.verify() || ((this.state.page + 1) === this.state.pages.length) }
                  onClick={ e => this.setState({ page: this.state.page + 1 }) }>
                  next
                </Button>
              }
            </div>
          </div>
          <div>
            { attributes.map((att, i) =>
                <InputRow key={ att.key } autoFocus={ i === 0 }
                  disabled={ att.editable === false }
                  att={ att } domain={ this.getDomain(att) }
                  value={ getValue(att.key) }
                  onChange={ value => this.handleChange(att.key, value) }/>
              )
            }
          </div>
          { !badAttributes.length ? null :
            <div className="my-4 py-4 border-t-2 border-b-2">
              { badAttributes.map((att, i) =>
                  <BadAttributeRow key={ att }
                    att={ { key: att } }
                    value={ this.state.values[att] }
                    onDelete={ () => this.handleChange(att, null) }
                    onReassign={ to => {
                      this.handleChange(to, this.state.values[att]);
                      this.handleChange(att, null);
                    } }
                    format={ this.props.format }/>
                )
              }
            </div>
          }
          <div className="flex max-w-xl justify-end mt-3">
            <DmsButton className="ml-2 flex-1 max-w-xs" buttonTheme="buttonLargeSuccess"
              disabled={ !this.verifyAll() } type="submit"
              label={ this.props.dmsAction } item={ item }
              action={ this.getButtonAction(values) }/>
          </div>
        </form>
      </div>
    )
  }
}

const BorderDiv = ({ active, current, className, children }) => {
  const theme = useTheme();
  return (
    <div className={ `${ theme.borderInfo } ${ theme.transition } ${ current ? theme.textInfo : active ? theme.text : theme.textLight } ${ className }` }>
      { children }
    </div>
  )
}

const StyledBorderDiv = styled(BorderDiv)`
  &::after {
    content: "";
    display: block;
    width: 0;
    padding-top: 0.0625rem;
    border-bottom: 4px;
    border-style: solid;
    border-color: inherit;
    transition: 0.15s;
  }
  &.active::after {
    width: 100%;
  }
`
