import React, { Component } from 'react';
import axios from 'axios';
import { SketchPicker } from 'react-color';
import './Studio.css';
import editIcon from './edit-icon.png';

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
      const layer = frame.layers[i].pixels;
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
    this.setState({anim:{name:newName}});
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
    //this.state.anim.frames[activeFrame].layers[activeLayer].pixels[y][x] = newCell;
    let newAnim = { ...this.state.anim };
    newAnim.frames[activeFrame].layers[activeLayer].pixels[y][x] = newCell;
    this.setState({anim:newAnim});
  }

  cellClick = (e) => {
    const x = parseInt(e.target.getAttribute('x'));
    const y = parseInt(e.target.getAttribute('y'));
    this.fillCell(x, y);
  }

  cellMouseOver = (e) => {
    if (e.buttons) {
      const x = parseInt(e.target.getAttribute('x'));
      const y = parseInt(e.target.getAttribute('y'));
      this.fillCell(x, y);
    }
  }

  colorChange = (color) => {
    this.setState({color:color.rgb});
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
            <h1 className="highlight" onClick={this.changeName}>{ this.state.anim.name } <img className="icon" src={editIcon} alt="edit" /></h1>
          </div>
          <div className="flex-container">
            <div className="panel">
              <h2>Drawing tools</h2>
              <SketchPicker 
                color={this.state.color}
                onChangeComplete={this.colorChange}
              />
            </div>
            <div className="view">
              <table>
                <tbody>
                  { view.map((row, y) => 
                  <tr key={y}>
                    { row.map((cell, x) => 
                    <td 
                      className="cell bordered" 
                      key={x} 
                      x={x}
                      y={y}
                      style={{backgroundColor:cell.colorHex}}
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
