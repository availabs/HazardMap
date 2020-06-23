import React from "react"

export default ({ title }) =>
  Boolean(title) ? <div style={ { padding: '8px 0px 0px 10px', fontSize: "1.2rem" } }>{ title }</div> : null
