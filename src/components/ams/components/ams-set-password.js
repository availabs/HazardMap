import React from "react"

import { Button } from "components/avl-components/components/Button"
import { Input } from "components/avl-components/components/Inputs"

import Container from "./components/Container"

import wrapper from "../wrappers/ams-set-password"

export default wrapper(({ password, verify, update, canSubmit, handleSubmit }) =>
  <div className="h-screen flex items-center justify-center">
    <Container title="Set Password">
      <form onSubmit={ handleSubmit }>
        <div className="my-2">
          <label htmlFor="password" className="block font-bold">New Password</label>
          <Input type="password" id="password" value={ password } autoFocus
            onChange={ v => update({ password: v }) }/>
        </div>
        <div className="my-2">
          <label htmlFor="verify" className="block font-bold">Verify Password</label>
          <Input type="password" id="verify" value={ verify }
            onChange={ v => update({ verify: v }) }/>
        </div>
        <div className="my-2">
          <Button type="submit" buttonTheme="buttonLargePrimaryBlock"
            disabled={ !canSubmit }>
            update
          </Button>
        </div>
      </form>
    </Container>
  </div>
)
