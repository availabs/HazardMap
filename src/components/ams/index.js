import React from "react"

import AmsComps from "./components"

import amsManager  from "./wrappers/ams-manager"

const AmsManager = ({ children }) => {
  return <div className="max-w-6xl m-auto">{ children }</div>
}
export default {
  ...AmsComps,
  "ams-manager": amsManager(AmsManager)
};
