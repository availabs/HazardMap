import React from 'react'

import CensusBarChart from "./bar/censusBarChart.js"
import CensusStackedBarChart from "./bar/censusStackedBarChart.js"
import CensusLineChart from "./line/censusLineChart.js"
// import CensusPieChart from "./pie/CensusPieChart.js"
import CensusStatBox from "./statBox/index.js"
import TextBox from "./TextBox"
// import CensusMap from "./map"
// import CensusRadarGraph from "./radar"

const NA = ({ type, state, routes }) =>
  <div>
  { type } Not Implmented
  <div>state:<br />{ JSON.stringify(state) }</div>
  </div>

const NE = ((props) => (<div>{props.type} Doesn't Exist</div>))

export default {
    CensusBarChart,
    CensusStackedBarChart,
    CensusLineChart,
    // CensusPieChart,
    CensusStatBox,
    TextBox,
    // CensusMap,
    // CensusRadarGraph,
    NE,
    NA
}
