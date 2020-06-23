import React, { useEffect } from "react"

import { connect } from "react-redux"
import { Redirect } from "react-router-dom"

import { logout } from "store/user"

export default {
  path: "/logout",
  exact: true,
  component: connect(null, { logout })(({ logout }) => {
    useEffect(() => { logout(); });
    return <Redirect to="/"/>;
  })

}
