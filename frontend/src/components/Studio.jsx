import React, { Component } from 'react';
import axios from 'axios';
import Tool from './Tool';
import { SketchPicker } from 'react-color';
import './Studio.css';
import editIcon from './edit-icon.png';
import eraseIcon from './erase-icon.png';

class Studio extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true
    }
  }

  componentDidMount() {
    axios.get(`/api/animation/${this.props.match.params.id}`)
      .then(res => res.data)
      .then(res => {
        this.setState({
          loading: false,
          anim: res.animation,
          activeFrame: 0,
          activeLayer: 0,
          activeTool: 'Pencil',
          color: {
            r: 0,
            g: 0,
            b: 0
          }
        });
      });
  }

  genHex(pixel) {
    const num = pixel.r*16**4 + pixel.g*16**2 + pixel.b;
    let ret = num.toString(16);
    while (ret.length < 6) {
      ret = "0" + ret;
    }
    ret = "#" + ret;
    return ret;
  }

  generateViewFromState = (frame) => {
    let view = [];
    for (let i = 0; i < 16; i++) {
      let row = [];
      for (let j = 0; j < 16; j++) {
        row.push({
          visible: false,
          r: 0,
          g: 0,
          b: 0
        });
      }
      view.push(row);
    }

    if (!frame) {
      frame = this.state.anim.frames[this.state.activeFrame]; 
    }
    for (let i = 0; i < frame.layers.length; i++) {
      let layer = frame.layers[i];
      if (!layer.visible) continue; 
      layer = layer.pixels;
      for (let y = 0; y < layer.length; y++) {
        for (let x = 0; x < layer.length; x++) {
          if (!view[y][x].visible) {
            view[y][x] = layer[y][x];
          }
        }
      }
    }

    for (let y = 0; y < view.length; y++) {
      for (let x = 0; x < view[y].length; x++) {
        if (view[y][x].visible) {
          view[y][x].colorHex = this.genHex(view[y][x]);
        }
      }
    }

    return view;
  }

  changeName = () => {
    let newName = prompt('New project name: ');
    if (newName === '') {
      alert('Cannot use empty name');
      return;
    }
    let newAnim = { ...this.state.anim };
    newAnim.name = newName;
    this.setState({anim:newAnim});
  }

  fillCell = (x, y) => {
    const newCell = {
      r: this.state.color.r,
      g: this.state.color.g,
      b: this.state.color.b,
      visible: true
    };
    const activeFrame = this.state.activeFrame;
    const activeLayer = this.state.activeLayer;
    let newAnim = { ...this.state.anim };
    newAnim.frames[activeFrame].layers[activeLayer].pixels[y][x] = newCell;
    this.setState({anim:newAnim});
  }

  eraseCell = (x, y) => {
    const activeFrame = this.state.activeFrame;
    const activeLayer = this.state.activeLayer;
    let newAnim = { ...this.state.anim };
    newAnim.frames[activeFrame].layers[activeLayer].pixels[y][x].visible = false;
    this.setState({anim:newAnim});
  }

  cellClick = (e) => {
    const x = parseInt(e.target.getAttribute('x'));
    const y = parseInt(e.target.getAttribute('y'));
    switch (this.state.activeTool) {
      case 'Pencil':
        this.fillCell(x, y);
        break;
      case 'Eraser':
        this.eraseCell(x, y);
        break;
      default:
        console.log('No tool selected');
        break;
    }
  }

  cellMouseOver = (e) => {
    if (e.buttons) {
      const x = parseInt(e.target.getAttribute('x'));
      const y = parseInt(e.target.getAttribute('y'));
      switch (this.state.activeTool) {
        case 'Pencil':
          this.fillCell(x, y);
          break;
        case 'Eraser':
          this.eraseCell(x, y);
          break;
        default:
          console.log('No tool selected');
          break;
      }
    }
  }

  colorChange = (color) => {
    this.setState({color:color.rgb});
  }

  saveAnim = () => {
    axios.post(`/api/animation/${this.props.match.params.id}/${this.state.anim.name}`, this.state.anim)
      .then(res => res.data)
      .then(res => {
        this.setState({message:res});
        setTimeout(() => this.setState({message:''}), 2000);
      })
  }

  changeTool = (e) => {
    this.setState({activeTool:e.target.getAttribute("name")});
  }

  clearLayer = () => {
    let frame = this.state.anim.frames[this.state.activeFrame];
    let layer = frame.layers[this.state.activeLayer].pixels;
    for (let y = 0; y < layer.length; y++) {
      for (let x = 0; x < layer.length; x++) {
        this.eraseCell(x, y);
      }
    }
  }

  render = () => {
    if (this.state.loading) {
      return (
        <div>
          <p>Loading animation</p>
        </div>
        );
    } else {
      let view = this.generateViewFromState();
      return (
        <div>
          <div>
            <h1 className="highlight" onClick={this.changeName}>
              { this.state.anim.name }
              <img className="icon" src={editIcon} alt="edit" />
            </h1>
            <button className="button" onClick={this.saveAnim}>Save</button>
            <p>&nbsp;{ this.state.message }</p>
          </div>
          <div className="flex-container">
            <div className="panel">
              <h2>Drawing tools</h2>
              <SketchPicker 
                color={this.state.color}
                onChangeComplete={this.colorChange}
                disableAlpha={true}
              />
              <Tool 
                toolName="Pencil" 
                icon={editIcon} 
                activeTool={this.state.activeTool}
                onClick={this.changeTool}
              />
              <Tool 
                toolName="Eraser" 
                icon={eraseIcon} 
                activeTool={this.state.activeTool}
                onClick={this.changeTool}
              />
              <button className="button" onClick={this.clearLayer}>Clear</button>
            </div>
            <div className="view">
              <table>
                <tbody>
                  { view.map((row, y) => 
                  <tr key={y}>
                    { row.map((cell, x) => 
                    <td 
                      className="cell" 
                      key={x} 
                      x={x}
                      y={y}
                      style={cell.visible ? {backgroundColor:cell.colorHex}: {}}
                      onClick={this.cellClick}
                      onMouseOver={this.cellMouseOver}
                    >
                    </td>
                    ) }
                  </tr>
                  ) }
                </tbody>
              </table>
            </div>
            <div className="panel">
              <h2>Animation Controller</h2>
            </div>
          </div>
        </div>
        );
}
}
}

export default Studio;