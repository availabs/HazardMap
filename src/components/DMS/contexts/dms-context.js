import React, { useContext } from "react"

const noop = () => {};

const DmsContext = React.createContext({
  app: "unknown",
  type: "unknown",
  dataItems: [],
  item: null,
  dmsAction: "unknown",
  interact: noop,
  makeInteraction: noop,
  makeOnClick: noop
});

export const useDms = () => useContext(DmsContext);

export default DmsContext
