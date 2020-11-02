import React from "react"

import { Redirect } from "react-router-dom"

import logoutWrapper from "../wrappers/ams-logout"

export default logoutWrapper(({ logout, redirectTo }) => {
  React.useEffect(() => { logout(); }, [logout]);
  return <Redirect to={ redirectTo }/>;
})
