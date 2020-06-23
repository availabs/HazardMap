import React from "react"

import { Button } from "components/avl-components/components/Button"
import { DmsButton } from "./dms-button"

import get from "lodash.get"

import { prettyKey, makeFilter, getValue, getFormat, processAction, useDmsColumns } from "../utils"
import { useMakeOnClick } from "../wrappers/dms-provider"
import { useTheme } from "components/avl-components/wrappers/with-theme"

const getPageSpread = (page, maxPage) => {
	let low = page - 2,
		high = page + 2;

	if (low < 0) {
		high += -low;
		low = 0;
	}
	if (high > maxPage) {
		low -= (high - maxPage);
		high = maxPage;
	}
  const spread = [];
  for (let i = Math.max(0, low); i <= Math.min(maxPage, high); ++i) {
    spread.push(i);
  }
  return spread;
}

const DmsList = ({ sortBy, sortOrder, transform, columns, ...props }) => {
	const [attributes, actions] = useDmsColumns(columns);

  const [{ sort }, setSort] = React.useState({});
  React.useEffect(() => {
    const dir = sortOrder === "desc" ? -1 : 1;
    let _transform = transform;
    if (!_transform && (sortBy === "updated_at")) {
      _transform = v => new Date(v).valueOf();
    }
    else if (!_transform) {
      _transform = v => v;
    }
    const sort = (a, b) => {
      const av = _transform(get(a, sortBy)),
        bv = _transform(get(b, sortBy));
      return (av < bv ? -1 : bv < av ? 1 : 0) * dir;
    }
    setSort({ sort });
  }, [sortBy, sortOrder, transform]);

  const filter = makeFilter(props);
  let dataItems = (filter ? props.dataItems.filter(filter) : props.dataItems)

  const [page, setPage] = React.useState(0);
	const { rowsPerPage } = props,
		maxPage = Math.max(Math.ceil(dataItems.length / rowsPerPage) - 1, 0),
		length = dataItems.length,
	  actualPage = Math.min(maxPage, page);

  dataItems = dataItems.sort(sort).slice(actualPage * rowsPerPage, actualPage * rowsPerPage + rowsPerPage);

  const getAttributeName = att => {
    att = att.split(/[:.]/).pop();
    const name = get(props, ["format", "attributes"], [])
      .reduce((a, c) => c.key === att ? (c.name || prettyKey(c.key)) : a, att);
    return name === att ? prettyKey(att) : name;
  };

  return !dataItems.length ? null : (
    <table className="w-full text-left">
      <thead>
        { maxPage === 0 ? null :
          <tr>
            <td colSpan={ attributes.length + actions.length }>
              <div className="w-full flex flex-row">
								<DmsListInfo>
                    <span className="mr-1 font-bold">Page:</span> { actualPage + 1 } of { maxPage + 1 }
                    <div className="mx-3 font-bold">|</div>
                    <span className="mr-1 font-bold">Items:</span> { actualPage * rowsPerPage + 1 }&nbsp;-&nbsp;
                    { Math.min(length, actualPage * rowsPerPage + rowsPerPage) } of { length }
                </DmsListInfo>
                <div className="flex justify-end flex-1">
          				<Button onClick={ () => setPage(0) }
                    buttonTheme="textbuttonSmall"
          					disabled={ actualPage === 0 }>
										{ "<<" }
          				</Button>
          				<Button onClick={ () => setPage(page - 1) }
                    buttonTheme="textbuttonSmall"
          					disabled={ actualPage === 0 }>
										{ "<" }
          				</Button>
          				{
          					getPageSpread(actualPage, maxPage)
          						.map(p =>
          							<Button key={ p }
                          buttonTheme={
                            p === actualPage ? "textbuttonLarge" : "textbuttonSmall"
                          }
          								onClick={ () => setPage(p) }>
          								{ p + 1 }
          							</Button>
          						)
          				}
          				<Button onClick={ () => setPage(page + 1) }
                    buttonTheme="textbuttonSmall"
          					disabled={ actualPage === maxPage }>
                    { ">" }
          				</Button>
          				<Button onClick={ () => setPage(maxPage) }
                    buttonTheme="textbuttonSmall"
          					disabled={ actualPage === maxPage }>
                    { ">>" }
          				</Button>
                </div>
              </div>
            </td>
          </tr>
        }
        <tr>
          { attributes.map(({ source }) =>
              <th key={ source } className="px-3 border-b-2">
                { getAttributeName(source) }
              </th>
            )
          }
          { actions.length ? <th className="border-b-2" colSpan={ actions.length }/> : null }
        </tr>
      </thead>
      <tbody>
        { dataItems.map(d =>
            <DmsListRow action="dms:view" item={ d } key={ d.id } striped={ props.striped }>
              { attributes
                  .map(({ source, format }) => ({ format, ...getValue(source, { self: d }, { preserveKeys: true }) }))
                  .map(({ key, value, format }, i) =>
                    <td key={ key } className="py-1 px-3 first:pl-4 first:rounded-l-md">
                      { format(value) }
                    </td>
                  )
              }
              { actions.map(a =>
                  <td key={ a.action } className="text-right p-1 last:pr-4 last:rounded-r-md">
                    <div className="flex items-center justify-end">
                      <DmsButton action={ a } item={ d }/>
                    </div>
                  </td>
                )
              }
            </DmsListRow>
          )
        }
      </tbody>
    </table>
  )
}
const DmsListInfo = ({ children }) => {
  const theme = useTheme();
  return (
		<div className={ `${ theme.textInfo } flex-1 flex flex-row` }>
      { children }
    </div>
  )
}
const DmsListRow = ({ children, action, item, striped, ...props }) => {
  const rowTheme = striped ? "tableRowStriped" : "tableRow";
  return (
    <tr onClick={ useMakeOnClick(action, item, props) }
      className={ `${ useTheme()[rowTheme] } cursor-pointer` }>
      { children }
    </tr>
  )
}
DmsList.defaultProps = {
  dmsAction: "list",
  dataItems: [],
  columns: [],
  format: {},
  filter: false,
  sortBy: "updated_at",
  sortOrder: "desc",
  transform: null,
  rowsPerPage: 10,
  striped: false
}
export default DmsList;
