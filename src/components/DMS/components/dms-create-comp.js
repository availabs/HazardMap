import React from "react"

import {
  DmsButton
  // getButtonClassName,
} from "./dms-button"
import Editor from "./editor"

import { Content, Button, FormSection, InputContainer } from "components/avl-components/components"
import { Input, TextArea, Select } from "components/avl-components/components/Inputs"
import { ValueContainer, ValueItem } from "components/avl-components/components/Inputs/parts"

import { prettyKey, dmsIsNum, hasBeenUpdated } from "../utils"

import get from "lodash.get"

class ArrayInput extends React.Component {
  state = {
    value: ""
  }
  addToArray() {
    const value = Array.isArray(this.props.value) ? this.props.value : [];
    if (!value.includes(this.state.value)) {
      this.props.onChange([...value, this.state.value]);
    }
    this.setState({ value: "" });
    document.getElementById(`att:${ this.props.att.key }`).focus();
  }
  removeFromArray(v) {
    let value = Array.isArray(this.props.value) ? this.props.value : [];
    if (value.includes(v)) {
      value = value.filter(vv => vv !== v);
    }
    if (value.length === 0) {
      value = null;
    }
    this.props.onChange(value);
  }
  render() {
    const { att, value, children, ...props } = this.props,
      [, type] = /^(.+?)-array$/.exec(att.type);

    return (
      <div className="w-full">
        <div className="flex">
          <Input { ...props } id={ `att:${ att.key }` } type={ type } className="mr-1"
            value={ this.state.value }  min={ att.min } max={ att.max }
            onChange={ e => this.setState({ value: e.target.value }) }
            placeholder={ `Type a value...`}>
            { children }
          </Input>
          <Button onClick={ e => this.addToArray() }
            disabled={ !this.state.value || value.includes(this.state.value) }>
            add
          </Button>
        </div>
        { !value ? null :
          <div className="mt-1 ml-10">
            <ValueContainer className="cursor-default">
              { value.map((v, i) =>
                  <ValueItem key={ v }
                    remove={ e => this.removeFromArray(v) }>
                    { v }
                  </ValueItem>
                )
              }
            </ValueContainer>
          </div>
        }
      </div>
    )
  }
}

class ImgInput extends React.Component {
  state = {
    value: "",
    hovering: false,
    message: ""
  }
  dragEnter(e) {
    this.stopIt(e);

    this.setState({ hovering: true });
  }
  onDragExit(e) {
    this.stopIt(e);

    this.setState({ hovering: false });
  }
  stopIt(e) {
    e.preventDefault();
    e.stopPropagation();
  }
  async dropIt(e) {
    e.preventDefault();
    e.stopPropagation();

    this.setState({ hovering: false });

    await this.loadImage(get(e, ["dataTransfer", "files", 0], null));
  }
  async handleChange(e) {
    e.preventDefault();
    e.stopPropagation();

    await this.loadImage(get(e, ["target", "files", 0], null));
  }
  async loadImage(file) {
    if (!file) return;
    if (!/^image[/]/.test(file.type)) {
      this.setState({ message: "File was not an image." });
      this.props.onChange(null);
      return;
    }
    if (file.size > 250000) {
      this.setState({ message: "File was too large." });
      this.props.onChange(null);
      return;
    }

    this.setState({ message: "" });

    const reader = new FileReader();
    reader.readAsDataURL(file);

    const result = await new Promise(resolve => {
      reader.addEventListener("load", (...args) => {
        resolve(reader.result);
      })
    })
    this.props.onChange(result);
  }
  removeImage(e) {
    e.preventDefault();
    e.stopPropagation();

    this.setState({ message: "" });
    this.props.onChange(null);
  }
  render() {
    const { value } = this.props;

    return (
      <div className={ `
          w-full h-64 border-2 rounded p-2 border-dashed
          flex items-center justify-center relative
          ${ this.state.hovering ? "border-gray-500" : "" }
          has-remove-button
        ` }
        onDragEnter={ e => this.dragEnter(e) }
        onDragLeave={ e => this.onDragExit(e) }
        onDragOver={ e => this.stopIt(e) }
        onDrop={ e => this.dropIt(e) }>

        { value ?
            <img src={ value } alt={ value  }className="max-w-full max-h-full"/>
          :
            <div className="flex flex-col items-center">
              <div>
                <label className={ null }
                  htmlFor={ this.props.id }>Select an image file...</label>
                <input className="py-1 px-2 w-full rounded hidden" id={ this.props.id }
                  type="file" accept="image/*" placeholder="..."
                  onChange={ e => this.handleChange(e) }/>
              </div>
              <div>...or drag and drop.</div>
              <div>{ this.state.message }</div>
            </div>
        }
        { !value ? null :
          <div className={ `
              absolute right-2 top-2 z-10
              rounded bg-red-500 p-1
              cursor-pointer
              remove-button
            ` }
            onClick={ e => this.removeImage(e) }>
            <svg width="20" height="20">
              <line x2="20" y2="20" style={ { stroke: "#fff", strokeWidth: 4 } }/>
              <line y1="20" x2="20" style={ { stroke: "#fff", strokeWidth: 4 } }/>
            </svg>
          </div>
        }
      </div>
    )
  }
}

const InputRow = ({ att, onChange, ...props }) =>
  <div className="my-2">
    <div>
      <label className="block w-full py-1" htmlFor={ `att:${ att.key }` }>
        { att.name || prettyKey(att.key) }
      </label>
    </div>
    <div>
      { /^(.+?)-array$/.test(att.type) && att.domain ?
        <div className="max-w-xl">
          <Select { ...props } id={ `att:${ att.key }` }
            multi={ true } domain={ att.domain }
            onChange={ v => onChange(v) }/>
        </div>
      : /^(.+?)-array$/.test(att.type) ?
        <div className="max-w-xl">
          <ArrayInput { ...props } att={ att } onChange={ v => onChange(v) }/>
        </div>
      : att.type === "rich-text" ?
        <Editor { ...props } id={ `att:${ att.key }` }
          onChnage={ v => onChange(v) }/>
      : att.type === "textarea" ?
          <div className="max-w-xl">
            <TextArea { ...props } id={ `att:${ att.key }` } rows="6"
              onChange={ e => onChange(e.target.value) }
              placeholder={ `Type a value...`}/>
          </div>
        : att.type === "img" ?
          <div className="max-w-xl">
            <ImgInput { ...props } id={ `att:${ att.key }` }
              att={ att } onChange={ v => onChange(v) }/>
          </div>
        : att.domain ?
          <div className="max-w-xl">
            <Select domain={ att.domain } { ...props }  id={ `att:${ att.key }` }
              onChange={ v => onChange(v) } multi={ false }/>
          </div>
        :
          <div className="max-w-xl">
            <Input { ...props } id={ `att:${ att.key }` } type={ att.type }
              min={ att.min } max={ att.max } placeholder={ `Type a value...`}
              onChange={ e => onChange(e.target.value) }/>
          </div>
      }
    </div>
  </div>

export default class DmsCreate extends React.Component {
  static defaultProps = {
    dmsAction: "create"
  }
  state = {}
  handleChange(key, value) {
    this.setState({ [key]: value });
  }
  verify() {
    const item = get(this.props, this.props.type, null),
      data = get(item, "data");

    return get(this.props, ["format", "attributes"], [])
      .filter(att => att.editable !== false)
      .reduce((a, c) => {
        const value = this.state[c.key];

        if ((c.type === "number") && dmsIsNum(value)) {
          if (!/^(-(?=[1-9]|(0[.]0*[1-9]+)))?\d*[.]?\d+/.test(value)) return false;
        }
        else if (c.verify && Boolean(value)) {
          const args = Array.isArray(c.verify) ? c.verify : [c.verify],
            regex = new RegExp(...args);
          if (!regex.test(value)) return false;
        }
        return !c.required ? a : (a && Boolean(value));
      }, hasBeenUpdated(data, this.state))
  }
  getDefaultValue(att) {
    const _default = att.default;

    if (_default.includes("from:")) {
      const path = _default.slice(5);
      return get(this.props, path, null);
    }
    return _default;
  }
  getValues() {
    const values = {
      ...this.state
    }
    let attributes = get(this.props, ["format", "attributes"], [])
    attributes
      .forEach(att => {
        if (("default" in att) && !(att.key in values)) {
          values[att.key] = this.getDefaultValue(att);
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
  render() {
    const values = this.getValues(),
      item = get(this.props, this.props.type, null);

    const getValue = key => {
      const value = get(values, key, null);
      return value || "";
    }

    const attributes = get(this.props, ["format", "attributes"], []);

    return (
      <Content>
        <form onSubmit={ e => e.preventDefault() } className="w-full">
          <FormSection >
              { attributes
                  .map((att, i) =>
                    <InputContainer>
                      <InputRow
                        key={ att.key }
                        autoFocus={ i === 0 }
                        disabled={ att.editable === false }
                        att={ att }
                        value={ getValue(att.key) }
                        onChange={ value => this.handleChange(att.key, value) }
                      />
                    </InputContainer>
                  )
              }
              <div className="flex justify-end max-w-xl">
                <DmsButton
                  className="w-full max-w-xs"
                  buttonTheme="buttonLargeSuccess"
                  disabled={ !this.verify() } type="submit"
                  label={ this.props.dmsAction } item={ item }
                  action={ this.getButtonAction(values) }/>
              </div>

          </FormSection>
        </form>
      </Content>
    )
  }
}
