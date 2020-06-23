import React from "react"

import get from "lodash.get"
import * as d3format from "d3-format"
import moment from "moment"

import { hasValue } from "components/avl-components/components/Inputs/utils"

export const getFormat = format => {
  if (/^date:/.test(format)) {
    return value => moment(value).format(format.replace(/^date:/, ""));
  }
  return format ? d3format.format(format) : d => d;
}

export const useDmsColumns = columns => {
  const [Columns, setColumns] = React.useState([[], []]);

  React.useEffect(() => {
    const temp = columns.map(att => {
      if (typeof att === "string") {
        if (/^(dms|api):(.+)$/.test(att)) {
          att = { action: att };
        }
        else {
          att = { source: att };
        }
      }
      if (att.action) {
        return processAction(att);
      }
      if (att.source && !/^self|item|props:/.test(att.source)) {
        att.source = `self:data.${ att.source }`;
      }
      return { ...att,
        key: att.source.split(/[:.]/).pop(),
        format: getFormat(att.format)
      };
    })
    setColumns(
      temp.reduce((a, c) => {
        const [atts, acts] = a;
        if (c.source) {
          atts.push(c);
        }
        else {
          acts.push(c);
        }
        return a;
      }, [[], []])
    );
  }, [columns]);

  return Columns;
}

export const compareActions = (action1 = "", action2 = "") =>
  action1.replace(/^dms:/, "") === action2.replace(/^dms:/, "")

export const processAction = arg => {
  let response = {
    action: "unknown",
    seedProps: () => null,
    showConfirm: false,
    label: null,
    buttonTheme: null
  };
  if (typeof arg === "string") {
    response.action = arg;
  }
  else {
    response = { ...response, ...arg };
  }
  return response;
}

export const capitalize = string =>
  string.toLowerCase().split("")
    .map((c, i) => i === 0 ? c.toUpperCase() : c).join("");
export const prettyKey = key =>
  key.replace(/(?<!^)(?=[A-Z])/g, " ")
    .replace(/[_-]/g, " ")
    .split(" ").map(capitalize).join(" ");

export const ITEM_REGEX = /^item:(.+)$/;
export const PROPS_REGEX = /^props:(.+)$/;
const SELF_REGEX = /^self:(.+)$/;

export const hasBeenUpdated = (base, data) => {
  const checked = [];
  for (const key in base) {
    checked.push(key);
    const baseHasValue = hasValue(base[key]),
      dataHasValue = hasValue(data[key]);
    if (baseHasValue && dataHasValue) {
      if (base[key] !== data[key]) return true;
    }
    if (baseHasValue ^ dataHasValue) return true;
  }
  for (const key in data) {
    if (checked.includes(key)) continue;
    if (hasValue(data[key])) return true;
  }
  return false;
}

export const dmsIsNum = value => {
  if ((value === "") ||
      (value === null) ||
      isNaN(value)) {
    return false
  }
  return true
}

export const makeFilter = (filter, sources) => {
  if (!sources) {
    sources = { props: filter }
    filter = get(sources, ["props", "filter"]);
  }
  if (!sources.item) {
    sources.item = get(sources, ["props", "item"], null);
  }

  if (!filter) return false;

  if (typeof filter === "function") return filter;

  let { args, comparator } = filter;

  args = args.map(arg => {
    if (typeof arg === "string") {
      if (ITEM_REGEX.test(arg)) {
        arg = arg.slice(5);
        const path = arg.split(".");
        return {
          value: get(sources, ["item", ...path], arg)
        }
      }
      if (SELF_REGEX.test(arg)) {
        return {
          path: arg.slice(5)
        }
      }
      if (PROPS_REGEX.test(arg)) {
        arg = arg.slice(6);
        const path = arg.split(".");
        return {
          value: get(sources, ["props", ...path], arg)
        }
      }
    }
    return { type: "value", value: arg };
  })

  return d =>
    comparator(
      ...args.map(({ path, value }) => {
        return value || get(d, path)
      })
    );
}

export const checkAuth = (rules, action, props, item) => {
  const rule = get(rules, action.replace(/^(dms|api):(.+)$/, (m, c1, c2) => c2), null);

  if (!rule) return true;

  let { args, comparator } = rule;

  args = args.map(a => {
    if (typeof a === "string") {
      if (a.includes("props:")) {
        return get(props, a.slice(6));
      }
      if (a.includes("item:")) {
        return get(item, a.slice(5));
      }
    }
    return a;
  })
  return comparator(...args);
}

const OPS = [
  ">>>", "==>", "-->", "->", "==", ">", "<", ">=", "<="
]

const getCompare = arg => {
  switch (arg) {
    case "==":
      return (a, b) => a === b;
    case ">":
      return (a, b) => a > b;
    case "<":
      return (a, b) => a < b;
    case ">=":
      return (a, b) => a >= b;
    case "<=":
      return (a, b) => a <= b;
    default:
      return (a, b) => a === b;
  }
}

const applyOp = (op, args, source, func) => {
  switch (op) {
    case ">>>":
      func(args[0]);
      return source.map(d => get(d, ...args, null));
    case "==>":
      return source.filter(d => getCompare(args[1])(get(d, args[0], null), args[2]))
    case "-->":
      return source.reduce((a, c) => getCompare(args[1])(get(c, args[0], null), args[2]) ? c : a, null)
    case "==":
      return getCompare(op)(args[0], source);
    default:
      return source;
  }
}
const getArgs = (op, split) => {
  const { length } = split;
  switch (op) {
    case ">>>":
    case "==":
      return split.splice(length - 2, length);
    case "==>":
    case "-->":
      return split.splice(length - 3, length);
    default:
      return [];
  }
}
const reduceSplit = (split, source, func) => {
  if (!split.length) return source;

  const path = split.pop();
  if (OPS.includes(path)) {
    const args = getArgs(path, split).reverse();
    return reduceSplit(split, applyOp(path, args, source, func), func);
  }
  func(path);
  return reduceSplit(split, get(source, path, null), func);
}

const getValueFromPath = (pathArg, sources, directives = {}, _default = null) => {
  if (typeof pathArg !== "string") return _default || pathArg;

  const {
    preserveKeys,
    preservePath,
    preserveSource
  } = directives;

  const REGEX = /^(item|props|self):(.+)$/;

  let key = null, path = null, source = null;

  const removeSource = p => p.replace(REGEX, (m, c1, c2) => c2),
    setPreserve = d => {
      key = removeSource(d).split(".").pop();
      path = removeSource(d);
      if (source) return;
      source = d.replace(REGEX, (m, c1, c2) => c1);
    }

  const split = pathArg.toString().split(new RegExp(`(${ OPS.join("|") })`))
    .reduce((a, c) => {
      const match = REGEX.exec(c);
      if (match) {
        const [, from, p] = match,
          source = get(sources, from, null);
        setPreserve(c);
        return [...a, get(source, p, null)];
      }
      return [...a, c];
    }, []).reverse();

  const value = reduceSplit(split, split.pop(), setPreserve);

  if (preserveKeys) {
    return { key, value };
  }
  else if (preservePath) {
    return { key, path, value };
  }
  else if (preserveSource) {
    return { key, path, source, value };
  }
  return value;
}

export const getValue = (arg, sources, directives) => {
  if (!arg) return null;

  if (!sources.item) {
    sources.item = get(sources, ["props", "item"], null);
  }

  if (typeof arg !== "object") {
    if (typeof arg === "string") {
      arg = arg.replace(/^(from:)/, "props:");
    }
    arg = { path: arg }
  }
  let {
    path,
    filter,
    sortBy,
    props = {},
    type,
    key,
    value,
    interact = []
  } = arg;

  let data = getValueFromPath(path, sources, directives);

  if (type) {
    if (!Array.isArray(data)) {
      data = [data];
    }
    filter = makeFilter(filter, sources);
    if (filter) {
      data = data.filter(filter);
    }
    if (sortBy) {
      data.sort((a, b) => {
        const av = get(a, sortBy, a),
          bv = get(b, sortBy, b);
        return av < bv ? -1 : bv < av ? 1 : 0;
      })
    }

    if (!Array.isArray(interact)) {
      interact = [interact];
    }

    const args = ({
      data: data.map((d, i) => ({
        key: getValueFromPath(key, { self: d, ...sources }, directives, `key-${ i }`),
        value: getValueFromPath(value, { self: d, ...sources }, directives, d),
        interact: interact.map(a => getValueFromPath(a, { self: d, ...sources }, directives)),
        props: mapDataToProps(props, { self: d, ...sources }, directives)
      })),
      type
    })
    return (func, interact) => func(args, interact);
  }
  return data;
}

export const mapDataToProps = (map, sources = {}, _directives = {}) => {
  if (!sources.item) {
    sources.item = get(sources, ["props", "item"], null);
  }

  const directiveKeys = Object.keys(map).filter(k => /^\$.+$/.test(k)),
    directives = { ..._directives };
  for (const k of directiveKeys) {
    directives[k.slice(1)] = map[k];
    delete map[k];
  }

  const mappedProps = {};

  for (const key in map) {
    const path = map[key],
      children = key === "children",
      DIRECTIVES = children ? {} : directives;

    let savedChildren = [];
    if (children) {
      savedChildren = React.Children.toArray(get(sources, ["props", "children"], null));
    }

    let result;
    if (Array.isArray(path)) {
      result = path.map(p => getValue(p, sources, DIRECTIVES));
    }
    else if (typeof path === "object") {
      const args = path.args.map(arg => getValueFromPath(arg, sources, DIRECTIVES));
      result = path.func(...args);
    }
    else if (typeof path === "function") {
      result = path(sources);
    }
    else {
      result = getValue(path, sources, DIRECTIVES);
    }

    if (children) {
      if (Array.isArray(result)) {
        result = [...result, ...savedChildren];
      }
      else {
        result = [result, ...savedChildren];
      }
    }
    mappedProps[key] = result;

  }
  return mappedProps;
}
