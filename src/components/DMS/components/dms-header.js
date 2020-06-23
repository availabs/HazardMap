import React from "react"

import { useTheme } from "components/avl-components/wrappers/with-theme"
import { useDms } from "../contexts/dms-context"

import { DmsButton } from "./dms-button"
import { processAction } from "../utils"

export default ({ title, showHome = true, dmsActions = [], ...props }) => {
  const { stack, top, item } = useDms(),
    { dmsAction } = top;

  if (stack.length > 1) {
    dmsActions.unshift("dms:back")
  }
  if ((stack.length > 1) && showHome) {
     dmsActions.unshift("dms:home")
  }
  if (dmsAction === "list") {
    dmsActions.unshift("dms:create")
  }
  const theme = useTheme();
  return (
    <div className={ `fixed pr-8 top-0 md:ml-${ theme.sidebarW } left-0 right-0 py-3 z-50 ${ theme.headerBg } ` }
      style={ { boxShadow: "0px 6px 3px -3px rgba(0, 0, 0, 0.25)" } }>
      <div className="absolute top-0 text-4xl font-bold w-full pointer-events-none ml-8">
        { title || `${ props.app } Manager` }
      </div>
      <div className="w-full flex flex-row justify-end">
        { dmsActions.map(processAction)
          .map(a => <DmsButton className="ml-2"
            action={ a } item={ item } key={ a.action }/>
          )
        }
      </div>
    </div>
  )
}
