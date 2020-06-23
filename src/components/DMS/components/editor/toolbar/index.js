import React from "react"

import { useTheme } from "components/avl-components/wrappers/with-theme"

const Separator = ({ ...props }) =>
  <div className="border-r border-l mx-2 border-current" style={ { borderColor: "currentColor" } }/>

export default (options = {}) => {
  const {
    position = "top",
    direction = "row"
  } = options;

  const store = {};

  const Toolbar = ({ children }) => {
    const theme = useTheme();
    return (
      <div className={ `absolute ${ position }-0 left-0 w-full p-2 z-10` }>
        <div className={ `flex flex-${ direction } p-1 shadow-md rounded ${ theme.menuBg } w-full` }>
          { children }
        </div>
      </div>
    )
  }

  return {
    initialize: ({ getEditorState, setEditorState, getProps }) => {
      store.getEditorState = getEditorState;
      store.setEditorState = setEditorState;
    },
    Toolbar,
    Separator
  }
}
