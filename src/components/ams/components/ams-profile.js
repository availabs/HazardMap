import React from "react"

import { Button } from "components/avl-components/components/Button"
import { Input } from "components/avl-components/components/Inputs"

import Header from "components/avl-components/components/Header/HeaderComponent"

import Container from "./components/Container"

import wrapper from "../wrappers/ams-profile"

const UpdatePassword = ({ updatePassword, ...props }) => {
  const [{
    current,
    password,
    verify
  }, setState] = React.useState({ current: "", password: "", verify: "" });

  const canSubmit = current && password && verify && (password === verify),
    handleSubmit = React.useCallback(e => {
      e.preventDefault();
      updatePassword(current, password);
    }, [current, password, updatePassword]);

  return (
    <Container title="Update Password">
      <form onSubmit={ handleSubmit }>
        <div className="my-2">
          <label htmlFor="current" className="block font-bold">Current Password</label>
          <Input type="password" id="current" value={ current } autoFocus
            onChange={ v => setState({ current: v, password, verify }) }/>
        </div>
        <div className="my-2">
          <label htmlFor="password" className="block font-bold">New Password</label>
          <Input type="password" id="password" value={ password }
            onChange={ v => setState({ current, password: v, verify }) }/>
        </div>
        <div className="my-2">
          <label htmlFor="verify" className="block font-bold">Verify Password</label>
          <Input type="password" id="verify" value={ verify }
            onChange={ v => setState({ current, password, verify: v }) }/>
        </div>
        <div className="my-2">
          <Button type="submit" buttonTheme="buttonLargePrimaryBlock"
            disabled={ !canSubmit }>
            update
          </Button>
        </div>
      </form>
    </Container>
  )
}

export default wrapper(({ user, ...props }) => {
  return (
    <div className="mt-16">
      <Header title="Profile"/>
      <div className="p-20">
        <div className="font-bold text-xl text-center">
          Welcome: { user.email }
        </div>
        <div className="mt-4">
          <UpdatePassword user={ user } { ...props }/>
        </div>
      </div>
    </div>
  )
})
