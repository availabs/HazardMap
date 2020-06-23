import React from "react"

import get from "lodash.get"

export const Title = ({ children, ...props }) =>
  <div className={ `
      font-bold mb-1
      ${ props.large ? "text-3xl" : "text-xl" }
      ${ get(props, "className", "") }
    ` }>
    { children }
  </div>
