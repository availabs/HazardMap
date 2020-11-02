import React from "react"

import { Button } from "components/avl-components/components/Button"
import { Input } from "components/avl-components/components/Inputs"

import Container from "./components/Container"

import wrapper from "../wrappers/ams-accept-invite"

export default wrapper(({ password, verify, update, canSubmit, handleSubmit }) =>
  <div className="h-screen flex items-center justify-center">
    <Container title="Accept Invite">
      <form onSubmit={ handleSubmit }>
        <div className="my-2">
          <label htmlFor="password" className="block font-bold">Password</label>
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
            accept
          </Button>
        </div>
      </form>
    </Container>
  </div>
)
