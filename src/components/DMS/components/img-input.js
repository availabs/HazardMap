import React from "react"

import get from "lodash.get"

export default class ImgInput extends React.Component {
  state = {
    value: "",
    draggingOver: false,
    message: ""
  }
  dragOver(e) {
    this.stopIt(e);

    this.setState(state => ({ draggingOver: true }));
  }
  onDragExit(e) {
    this.stopIt(e);

    this.setState(state => ({ draggingOver: false }));
  }
  stopIt(e) {
    e.preventDefault();
    e.stopPropagation();
  }
  async dropIt(e) {
    e.preventDefault();
    e.stopPropagation();

    this.setState({ draggingOver: false });

    await this.loadImage(get(e, ["dataTransfer", "files", 0], null));
  }
  async handleChange(e) {
    e.preventDefault();
    e.stopPropagation();

    await this.loadImage(get(e, ["target", "files", 0], null));
  }
  async loadImage(file) {
    if (!file) return;
    if (!/^image[/]/.test(file.type)) {
      this.setState({ message: "File was not an image." });
      this.props.onChange(null);
      return;
    }
    if (file.size > 250000) {
      this.setState({ message: "File was too large." });
      this.props.onChange(null);
      return;
    }

    this.setState({ message: "" });

    const reader = new FileReader();
    reader.readAsDataURL(file);

    const result = await new Promise(resolve => {
      reader.addEventListener("load", (...args) => {
        resolve(reader.result);
      })
    })
    this.props.onChange(result);
  }
  removeImage(e) {
    e.preventDefault();
    e.stopPropagation();

    this.setState({ message: "" });
    this.props.onChange(null);
  }
  render() {
    const { value } = this.props;

    return (
      <div className={ `
          w-full h-64 border-2 rounded p-2 border-dashed
          flex items-center justify-center relative
          ${ this.state.draggingOver ? "border-gray-500" : "" }
          hoverable
        ` }
        onDragOver={ e => this.dragOver(e) }
        onDragLeave={ e => this.onDragExit(e) }
        onDrop={ e => this.dropIt(e) }>

        { value ?
            <img src={ value } alt={ value  }className="max-w-full max-h-full"/>
          : this.state.draggingOver ?
            <span className="far fa-image fa-9x pointer-events-none opacity-50"/>
          :
            <div className="flex flex-col items-center">
              <div>
                <label className={ null }
                  htmlFor={ this.props.id }>Select an image file...</label>
                <input className="py-1 px-2 w-full rounded hidden" id={ this.props.id }
                  type="file" accept="image/*" placeholder="..."
                  onChange={ e => this.handleChange(e) }/>
              </div>
              <div>...or drag and drop.</div>
              <div>{ this.state.message }</div>
            </div>
        }
        { !value ? null :
          <div className={ `
              absolute right-2 top-2 z-10
              rounded bg-red-500 p-1
              cursor-pointer
              show-on-hover
            ` }
            onClick={ e => this.removeImage(e) }>
            <svg width="20" height="20">
              <line x2="20" y2="20" style={ { stroke: "#fff", strokeWidth: 4 } }/>
              <line y1="20" x2="20" style={ { stroke: "#fff", strokeWidth: 4 } }/>
            </svg>
          </div>
        }
      </div>
    )
  }
}
