import React from "react"

import { Link } from "react-router-dom"

import { Button } from "components/avl-components/components/Button"
import { Input } from "components/avl-components/components/Inputs"

import Container from "./components/Container"

import loginWrapper from "../wrappers/ams-login"

export default loginWrapper(({ email, password, update, canSubmit, handleSubmit }) => {
  return (
    <div className="h-screen flex items-center justify-center">
      <Container title="Login">
        <form onSubmit={ handleSubmit }>
          <div className="my-2">
            <label htmlFor="email" className="block font-bold">Email</label>
            <Input type="email" id="email" required autoFocus value={ email }
              onChange={ v => update({ email: v }) }/>
          </div>
          <div className="my-2">
            <label htmlFor="password" className="block font-bold">Password</label>
            <Input type="password" id="password" required value={ password }
              onChange={ v => update({ password: v }) }/>
          </div>
          <div className="my-2">
            <Button disabled={ !canSubmit } type="submit"
              buttonTheme="buttonPrimaryLargeBlock">
              login
            </Button>
          </div>
        </form>
        <div className="text-sm flex">
          <div className="flex-1">
            <Link to="/auth/signup">
              signup!
            </Link>
          </div>
          <div className="flex-0">
            <Link to="/auth/reset-password">
              forgot password?
            </Link>
          </div>
        </div>
      </Container>
    </div>
  )
})
