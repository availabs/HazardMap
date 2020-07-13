import React from "react"

import get from "lodash.get"
import styled from "styled-components"

const StyledTab = styled.div`
  display: flex;
  justify-content: center;
  padding: 5px 15px 0px 15px;
  border-bottom: 2px solid ${ props => props.isActive ? "currentColor" : "transparent" };
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s, background-color 0.15s;
  font-size: 1rem;
  border-top-right-radius: 4px;
  border-top-left-radius: 4px;
  background-color: ${ props => props.isActive ? props.theme.inputBgdActive : props.theme.inputBgd };
  :hover {
    color: ${ props => props.theme.textColorHl };
    background-color: ${ props => props.theme.inputBgdHover };
  }
  margin-right: 5px;
  :last-child {
    margin-right: 0px;
  }
`

export const Tab = ({ children }) => children;

export class TabSelector extends React.Component {
  static defaultProps = {
    currentTab: 0,
    minTabWidth: 150
  }
  state = {
    currentTab: this.props.currentTab
  }
  componentDidUpdate(oldProps) {
    if ((oldProps.currentTab !== this.props.currentTab) &&
      (this.state.currentTab !== this.props.currentTab)) {
      this.setState({ currentTab: this.props.currentTab });
    }
  }
  render() {
    const children = React.Children.toArray(this.props.children);
    return (
      <div style={ { width: "100%" } }>
        <div style={ { display: "flex" } }>
          {
            children.map((c, i) =>
              <StyledTab key={ i }
                style={ {
                  minWidth: `${ this.props.minTabWidth }px`
                } }
                onClick={ e => this.setState({ currentTab: i })}
                isActive={ i === this.state.currentTab }>
                { c.props.name || `Tab ${ i }` }
              </StyledTab>
            )
          }
        </div>
        <div style={ { marginTop: "10px" } }>
          { children[this.state.currentTab] }
        </div>
      </div>
    )
  }
}
