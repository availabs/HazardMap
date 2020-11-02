import React from "react"

import { Link } from "react-router-dom"

import { Button } from "components/avl-components/components/Button"
import { Input } from "components/avl-components/components/Inputs"

import Container from "./components/Container"

import signupWrapper from "../wrappers/ams-signup"

export default signupWrapper(({ email, verify, update, canSubmit, handleSubmit }) =>
  <div className="h-screen flex items-center justify-center">
    <Container title="Signup">
      <form onSubmit={ handleSubmit }>
        <div className="my-2">
          <label htmlFor="email" className="block font-bold">Email</label>
          <Input type="email" id="email" required autoFocus value={ email }
            onChange={ v => update({ email: v }) }/>
        </div>
        <div className="my-2">
          <label htmlFor="verify" className="block font-bold">Verify Email</label>
          <Input type="email" id="verify" required value={ verify }
            onChange={ v => update({ verify: v }) }/>
        </div>
        <div className="my-2">
          <Button disabled={ !canSubmit } type="submit"
            buttonTheme="buttonPrimaryLargeBlock">
            signup
          </Button>
        </div>
      </form>
      <div className="text-sm flex">
        <div className="flex-1">
          <Link to="/auth/login">
            login
          </Link>
        </div>
      </div>
    </Container>
  </div>
)
