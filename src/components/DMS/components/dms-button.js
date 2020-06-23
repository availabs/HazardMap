import React, { useState, useEffect } from "react"

import {  ButtonContext } from "../contexts"

import { useMakeInteraction } from "../wrappers/dms-provider"

import { Button, LinkButton } from "components/avl-components/components/Button"

import get from "lodash.get"

const cleanAction = action =>
  action.replace(/^(dms|api):(.+)$/, (m, c1, c2) => c2);

const DEFAULT_BUTTON_THEMES = {
  // create: "button",
  // back: "button",
  // edit: "button",
  delete: "buttonDanger",
  // cancel: "button"
}

const getButtonTheme = (theme, themes, action)=> {
  action = cleanAction(action);
  return theme || get(themes, action, get(DEFAULT_BUTTON_THEMES, action, "button"));
}

export const ActionButton = ({ action, label, buttonTheme, ...props }) => {
  label = label || cleanAction(action);
  return (
    <ButtonContext.Consumer>
      { ({ buttonThemes }) =>
        <Button { ...props } buttonTheme={ getButtonTheme(buttonTheme, buttonThemes, action) }>
          { label }
        </Button>
      }
    </ButtonContext.Consumer>
  )
}

export const ActionLink = ({ action, label, buttonTheme, ...props }) => {
  label = label || cleanAction(action);
  return (
    <ButtonContext.Consumer>
      { ({ buttonThemes }) =>
        <LinkButton { ...props } buttonTheme={ getButtonTheme(buttonTheme, buttonThemes, action) }>
          { label  }
        </LinkButton>
      }
    </ButtonContext.Consumer>
  )
}

const OpenConfirm = ({ Button, interaction, ...props }) => {
  const OpenedAndWating = ({ setOpen }) => {
    const [waiting, setWaiting] = useState(true);
    useEffect(() => {
      const timeout = waiting && setTimeout(setWaiting, 2000, false);
      return () => clearTimeout(timeout);
    }, [waiting])
    return (
      <div className="btn-group-horizontal">
        <Button waiting={ waiting }/>
        <ActionButton { ...props } action="cancel"
          buttonTheme="buttonInfo"
          onClick={ e => {
            e.stopPropagation();
            setOpen(false);
          } }/>
      </div>
    )
  }
  const [openConfirm, setOpen] = useState(false);
  return openConfirm ? <OpenedAndWating setOpen={ setOpen }/> :
    <ActionButton { ...props } { ...interaction }
      onClick={ e => { e.stopPropagation(); setOpen(true); } }/>
}

export const DmsButton = ({ action, item, props = {}, disabled = false, ...others }) => {
  const { type, showConfirm, ...interaction } = useMakeInteraction(action, item, props);

  const RenderButton = ({ waiting }) => {
    switch (type) {
      case "link":
        return <ActionLink { ...interaction } { ...others }
          disabled={ waiting || disabled }/>
      default:
        return <ActionButton { ...interaction } { ...others }
          disabled={ waiting || disabled } type={ type }/>
    }
  }

  if (showConfirm) {
    return <OpenConfirm Button={ RenderButton }
              interaction={ interaction } { ...others }/>
  }
  return <RenderButton />;
}
