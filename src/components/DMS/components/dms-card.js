import React from "react"

import { Title } from "./parts"
import { useTheme } from "components/avl-components/wrappers/with-theme"

export default ({ title = "", body = null }) => {
  const theme = useTheme();
  return (
    <div>
      { title ? <Title>{ title }</Title> : null }
      <div className={ `${ theme.lighter } rounded-md px-8 py-4 mb-3 shadow-md` }>
        { body }
      </div>
    </div>
  )
}
