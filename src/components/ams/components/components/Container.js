import React from "react"

export default ({ title, children }) =>
  <div className="flex justify-center">
    <div className="m-auto inline-block rounded px-20 py-10 shadow-xl">
      { !title ? null : <div className="text-3xl font-bold">{ title }</div> }
      <div>
        { children }
      </div>
    </div>
  </div>
