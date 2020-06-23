import React, { useEffect, useContext } from "react"

import { DmsContext } from "../contexts"
import { mapDataToProps as doMapDataToProps, getValue } from "../utils"

// import get from "lodash.get"

const createElements = ({ data, ...rest }, interact) =>
  data.map((d, i) =>
    <rest.type key={ d.key } { ...d.props }
      onClick={ !d.interact.length ? null :
        e => interact(...d.interact)
      }>
      { d.value }
    </rest.type>
  )

export default (Component, options = {}) => {
  const {
    mapDataToProps = {},
    interactOnMount
  } = options;

  return ({ ...props }) => {
    const dmsProps = useContext(DmsContext),
      { interact } = dmsProps,
      newProps = { ...props, ...dmsProps };

    let defaultAction = getValue(interactOnMount, { props: newProps });

    useEffect(() => {
      if (defaultAction) {
        if (Array.isArray(defaultAction)) {
          interact(...defaultAction);
        }
        else {
          interact(defaultAction);
        }
      }
    }, [interact, defaultAction]);

    const handleData = data => {
      if (Array.isArray(data)) {
        return data.map(handleData);
      }
      if (typeof data === "function") {
        return data(createElements, newProps.interact);
      }
      return data;
    }

    const mapped = doMapDataToProps(mapDataToProps, { props: newProps })

    for (const key in mapped) {
      const data = mapped[key];
      newProps[key] = handleData(data);
    }
    return <Component { ...newProps }/>
  }
}
