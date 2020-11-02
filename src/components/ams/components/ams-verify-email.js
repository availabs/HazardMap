import React from "react"

import Container from "./components/Container"

import wrapper from "../wrappers/ams-verify-email"

export default wrapper(({ verified, ...props }) =>
  <div className="h-screen flex items-center justify-center">
    <Container>
      { verified === "waiting" ? "Verifying Email..." :
        verified === "failed" ? "Email verification failed." :
        "Email verification succeeded."
      }
    </Container>
  </div>
)
