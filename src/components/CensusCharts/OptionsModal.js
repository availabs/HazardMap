import React from "react"
import { connect } from "react-redux"

import * as d3selection from "d3-selection"
import styled from "styled-components"
import { saveSvgAsPng } from "save-svg-as-png"

import AvlModal from "components/AvlStuff/AvlModal"
import AvlTable from "components/AvlStuff/AvlTable"

import {
  setOptionsModalPage,
  closeOptionsModal
} from "store/modules/options"

class OptionsModal extends React.Component {
  getPage() {
    switch (this.props.page) {
      case "view-data":
        return (
          <div style={ { minWidth: "800px", width: "90vw"}}>
            <AvlTable { ...this.props.data } key={ this.props.tableTitle }
              showHelp={ true }
              title={ this.props.tableTitle }/>
          </div>
        )
      case "save-image":
        return <SaveImageTab image={ this.props.image }
                  title={ this.props.tableTitle }/>;
      case "share-embed":
        return <ShareEmbedTab embed={ this.props.embed }
                  layout={ this.props.layout }/>
      default:
        return <NotYetImplemented page={ this.props.page }/>;
    }
  }
  render() {
    return (
      <AvlModal show={ this.props.showModal }
        onHide={ this.props.closeOptionsModal }>
        <div style={ { minWidth: "800px" } }>
          <ModalHeader page={ this.props.page }
            setPage={ this.props.setOptionsModalPage }/>
          <div style={ { maxWidth: "90vw" } }>
            { this.getPage() }
          </div>
        </div>
      </AvlModal>
    )
  }
}
const mapStateToProps = state => ({
  showModal: state.options.showModal,
  page: state.options.page,
  data: state.options.data,
  image: state.options.image,
  embed: state.options.embed,
  layout: state.options.layout,
  tableTitle: state.options.tableTitle,
  saveImage: state.options.saveImage
})
const mapDispatchToProps = {
  setOptionsModalPage,
  closeOptionsModal
}
export default connect(mapStateToProps, mapDispatchToProps)(OptionsModal)

const NotYetImplemented = ({ page }) =>
  <div>
    { page } NOT YET IMPLEMENTED
  </div>

const WIDTH_MULT = 90;
const HEIGHT_MULT = 40;

class ShareEmbedTab extends React.Component {
  makeEmbedUrl() {
    const props = this.props.embed;

    let url = `http://${ window.location.host }/share/embed?`;

    for (const key in props) {
      url += `${ key }=${ JSON.stringify(props[key]) }&`;
    }
    return encodeURI(url.slice(0, url.length - 1));
  }
  makeHTML() {
    const {
      w, h
    } = this.props.layout;
    return `<iframe src="${ this.makeEmbedUrl() }" width="${ w * WIDTH_MULT }" height="${ h * HEIGHT_MULT }" style="border:2px solid #ccc; border-radius: 4px;"/>`;
  }
  makeJSX() {
    const {
      w, h
    } = this.props.layout;
    return `<iframe src="${ this.makeEmbedUrl() }" width="${ w * WIDTH_MULT }" height="${ h * HEIGHT_MULT }" style={ { border: "2px solid #ccc", borderRadius: "4px" } }/>`;
  }
  copyToClipboard(id) {
    document.getElementById(id).select();
    document.execCommand("copy");
  }
  render() {
    return (
      <div style={ { display: "flex", flexWrap: "wrap" } }>
        <div style={ { width: "75%", padding: "4px 2px" } }>
          <input type="text" id="html-iframe"
            onClick={ e => this.copyToClipboard("html-iframe") }
            value={ this.makeHTML() }
            className="form-control"
            style={ { cursor: "pointer" } }
            readOnly/>
        </div>
        <div style={ { width: "25%", padding: "4px 2px", display: "flex", justifyContent: "flex-end" } }>
          <button className="btn btn-primary btn-block"
            onClick={ e => this.copyToClipboard("html-iframe") }>
            <span className="fa fa-copy mr-2"/>Get HTML
          </button>
        </div>
        <div style={ { width: "75%", padding: "4px 2px" } }>
          <input type="text" id="jsx-iframe"
            onClick={ e => this.copyToClipboard("jsx-iframe") }
            value={ this.makeJSX() }
            className="form-control"
            style={ { cursor: "pointer" } }
            readOnly/>
        </div>
        <div style={ { width: "25%", padding: "4px 2px", display: "flex", justifyContent: "flex-end" } }>
          <button className="btn btn-primary btn-block"
            onClick={ e => this.copyToClipboard("jsx-iframe") }>
            <span className="fa fa-copy mr-2"/>Get JSX
          </button>
        </div>
      </div>
    )
  }
}

class SaveImageTab extends React.Component {
  state = {
    fileName: this.props.title
  }
  componentDidUpdate(oldProps) {
    if (this.props.title !== this.state.fileName) {
      this.setState({ fileName: this.props.title })
    }
  }
  onChange(fileName) {
    this.setState({ fileName });
  }
  onSave() {
    if (typeof this.props.image === "function") {
      return this.props.image(`${ this.state.fileName }.png`);
    }
    const svg = d3selection.select(`#${ this.props.image }`).select("svg").node(),
      options={ backgroundColor: "#fff" },
      fileName = `${ this.state.fileName }.png`;
    Boolean(svg) && saveSvgAsPng(svg, fileName, options);
  }
  render() {
    const renderAnchor = (typeof this.props.image === "function");
    return (
      <div style={ { display: "flex" } }>
        <div style={ { width: "75%", padding: "4px 2px" } }>
          <div className="input-group">
            <input type="text" className="form-control"
              onChange={ e => this.onChange(e.target.value) }
              value={ this.state.fileName }/>
            <div className="input-group-append">
              <span className="input-group-text">.png</span>
            </div>
          </div>
        </div>
        <div style={ { width: "25%", padding: "4px 2px", display: "flex" } }>
          { renderAnchor ?
              <a className="btn btn-primary btn-block"
                download={ this.state.fileName }
                href={ this.props.image() }>
                <div style={ { display: "flex", justifyContent: "center", alignItems: "center", height: "100%" } }>
                  <span className="fa fa-download mr-2"/>Save as .png
                </div>
              </a>
            :
              <button className="btn btn-primary btn-block"
                onClick={ e => this.onSave() }>
                <span className="fa fa-download mr-2"/>Save as .png
              </button>
          }
        </div>
      </div>
    )
  }
}

const StyledModalHeader = styled.div`
  display: flex;
  width: 100%;
  margin-bottom: 10px;

  > * {
    padding: 2px 0px;
    padding-right: 20px
    text-align: center;
    width: 33.333%;
    cursor: pointer;
    border-top-right-radius: 4px;
    border-top-left-radius: 4px;
  }
  > *:hover {
    background-color: ${ props => props.theme.panelBackgroundHover };
  }
  > *.active {
    border-bottom: 2px solid currentColor;
  }
  > *:last-child {
    padding-right: 0px;
  }
`
const ModalHeader = ({ page, setPage }) =>
  <StyledModalHeader>
    <div className={ page === "view-data" ? "active" : "" }
      onClick={ e => setPage("view-data") }>
      View Data
    </div>
    <div className={ page === "save-image" ? "active" : "" }
      onClick={ e => setPage("save-image") }>
      Save Image
    </div>
    <div className={ page === "share-embed" ? "active" : "" }
      onClick={ e => setPage("share-embed") }>
      Share Embed
    </div>
  </StyledModalHeader>
