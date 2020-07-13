import React from "react"
import { Link } from "react-router-dom"

import styled, { keyframes } from "styled-components"

import classnames from "classnames"

import Loading from "components/loading/loadingPage"

const ANIMATION_DURATION = 1.0;

const fadeIn = keyframes`
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
`
const fadeOut = keyframes`
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
`
const dropIn = keyframes`
  0% {
    transform: translate(0, -200%);
  }
  100% {
    transform: translate(0, 0);
  }
`
const dropOut = keyframes`
  0% {
    transform: translate(0, 0);
  }
  100% {
    transform: translate(0, -200%);
  }
`

const ModalContainer = styled.div`
  position: fixed!important;
  top: 0px;
  right: 0px;
  bottom: 0px;
  left: 0px;
  z-index: 100000;
  background-color: rgba(0, 0, 0, 0.5);

  display: none;

  &.show {
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: 1;
    animation-name: ${ fadeIn };
    animation-duration ${ ANIMATION_DURATION }s;
  }
  &.hide {
    opacity: 0;
    animation-name: ${ fadeOut };
    animation-duration ${ ANIMATION_DURATION }s;
  }

  div.body {
    position: relative;
    background-color: ${ props => props.theme.sidePanelBg };
    border-radius: 4px;
    padding: 20px;
    animation-name: ${ dropIn };
    animation-duration ${ ANIMATION_DURATION }s;
    transform: translate(0, 0);
  }
  &.hide div.body {
    transform: translate(0, -200%);
    animation-name: ${ dropOut };
    animation-duration ${ ANIMATION_DURATION }s;
  }

  div.body div.content {
    color: ${ props => props.theme.textColorHl };
    margin-bottom: ${ props => props.hasChildren ? 20 : 0 }px;
  }

  div.body div.actions {
    width: 100%;
  }
  div.body div.actions::after {
    content: "";
    clear: both;
    display: table;
  }
  div.body div.actions > button:first-child {
    float: left;
  }
  div.body div.actions > div.user-actions {
    float: right;
    display: inline-block;
  }
  div.body div.actions > div.user-actions > button {
    margin-left: 10px;
  }
  div.body div.actions > div.user-actions > button:first-child {
    margin-left: 20px;
  }
  div.body div.actions > div.user-actions > div.link-container {
    display: inline-block;
  }
  div.body div.actions > div.user-actions > div.link-container.link-disabled {
    cursor: not-allowed;
  }
`

const LoadingContainer = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  z-index: 100;
  display: flex;
  justify-content: center;
  align-items: center;
  background-image: radial-gradient(rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0));
`

class Modal extends React.Component {
  static defaultProps = {
    onHide: () => {},
    show: false,
    actions: [],
    hideOnAction: true,
    closeLabel: "Close",
    persistChildren: true,
    onResolve: null,
    onResolveHide: () => {},
    onReject: null,
    onRejectHide: () => {}
  }
  state = {
    hide: false,
    onResolve: null,
    onReject: null,
    loading: false
  }
  MOUNTED = false;
  componentDidMount() {
    this.MOUNTED = true;
  }
  componentWillUnmount() {
    this.MOUNTED = false;
  }
  setState(...args) {
    this.MOUNTED && super.setState(...args);
  }
  onHide() {
    if (!this.props.onHide) return;

    this.setState({ hide: true });
    setTimeout(
      () => {
        this.props.onHide();
        this.state.onResolve && this.props.onResolveHide(this.state.onResolve);
        this.state.onReject && this.props.onRejectHide(this.state.onReject);
        this.setState({ hide: false, onResolve: null, onReject: null });
      }
    , 500)
  }
  onAction(e, action) {
    this.setState({ loading: true });
    Promise.resolve(action(e))
      .then(res => {
        this.setState({ loading: false });
        if (Boolean(this.props.onResolve)) {
          this.onResolve(res);
        }
        else if (this.props.hideOnAction) {
          this.onHide();
        }
      })
      .catch(e => Boolean(this.props.onReject) && this.onReject(e));
  }
  onResolve(res) {
    this.setState({ onResolve: { res } });
  }
  onReject(error) {
    this.setState({ onReject: { error } });
  }
  render() {
    const { hide } = this.state,
      { show, persistChildren } = this.props;
    return (
      <ModalContainer className={ classnames({ show, hide }) }
        numActions={ this.props.actions.length }
        hasChildren={ Boolean(this.props.children) }>

        { !this.state.loading ? null :
          <LoadingContainer>
            <Loading width="100px" height="100px"/>
          </LoadingContainer>
        }

        <div className="body">
          <div className="content">
            { !show && !persistChildren ? null :
              Boolean(this.state.onResolve) && Boolean(this.props.onResolve) ? <this.props.onResolve { ...this.state.onResolve }/> :
              Boolean(this.state.onReject) && Boolean(this.props.onReject) ? <this.props.onReject { ...this.state.onReject }/> :
              this.props.children
            }
          </div>
          <div className="actions">
            <button className="btn btn-outline-danger"
              onClick={ e => this.onHide() }>
              { this.props.closeLabel }
            </button>
            { !this.props.actions.length || Boolean(this.state.onResolve) || Boolean(this.state.onReject) ? null :
              <div className="user-actions">
                {
                  this.props.actions.map(({ label, action, type="primary", disabled=false, url }, i) =>
                    url === undefined ?
                      <button className={ `btn btn-outline-${ type }` }
                        onClick={ e => this.onAction(e, action) }
                        key={ i }
                        disabled={ disabled }>
                        { label }
                      </button>
                    :
                      <div className={ "link-container" + (disabled ? " link-disabled" : "") }>
                        <Link className={ `btn btn-outline-${ type } ${ disabled ? " disabled" : "" }` }
                          to={ url || "#" }
                          key={ i }>
                          { label }
                        </Link>
                      </div>
                  ) // END this.props.actions.map
                }
              </div>
            }
          </div>
        </div>

      </ModalContainer>
    )
  }
}
export default Modal
