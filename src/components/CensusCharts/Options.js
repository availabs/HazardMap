import React from 'react';
import { connect } from "react-redux"


import {
  openOptionsModal
} from "./options.store"


class Options extends React.Component {
  static defaultProps = {
    processDataForViewing: () => [],
    tableTitle: "",
    layout: {},
    saveImage: null
  }
  openModal(page) {
    this.props.openOptionsModal(page, this.props.tableTitle, {
      data: this.props.processDataForViewing(),
      image: this.props.saveImage || this.props.id,
      embed: { ...this.props.embedProps },
      layout: this.props.layout
    })
  }

  render () {
    return (
     <div className="os-tabs-controls"
      style={ {
        position: 'absolute',
        top: "3px", right: "10px",
        zIndex: 999, margin: 0,
        cursor: "pointer"
      } }>
       <ul className="nav nav-tabs smaller">
          <li className="nav-item" style={ { margin: 0 } }>
            <button className="nav-link" onClick={ e => this.openModal("view-data") }>View Data</button>
          </li>
          <li className="nav-item" style={ { margin: 0 } }>
            <button className="nav-link"  onClick={ e => this.openModal("save-image") }>Save Image</button>
          </li>
          <li className="nav-item" style={ { margin: 0 } }>
            <button className="nav-link"  onClick={ e => this.openModal("share-embed") }>Share Embed</button>
          </li>
       </ul>
    </div>
    );
  }
}
const mapStateToProps = state => ({

})
const mapDispatchToProps = {
  openOptionsModal
}
export default connect(mapStateToProps, mapDispatchToProps)(Options)
