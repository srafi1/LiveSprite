import React, { Component } from 'react';
import axios from 'axios';
import Tool from './Tool';
import LayerCard from './LayerCard';
import { SketchPicker } from 'react-color';
import  Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import './Studio.css';
import editIcon from './edit-icon.png';
import eraseIcon from './erase-icon.png';
import generateGIF from '../utilities/gif';

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

  generateViewFromState = () => {
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
    /*
     *console.log('view init');
     *console.log(view);
     */

    let frame = this.state.anim.frames[this.state.activeFrame];
    /*
     *console.log('frame to render');
     *console.log(frame);
     */
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
    /*
     *console.log('view post layers');
     *console.log(view);
     */

    for (let y = 0; y < view.length; y++) {
      for (let x = 0; x < view[y].length; x++) {
        if (view[y][x].visible) {
          //console.log(`Active pixel: ${x} ${y}`);
          view[y][x].colorHex = this.genHex(view[y][x]);
        }
      }
    }
    /*
     *console.log('view post hex');
     *console.log(view);
     */

    return view;
  }

  changeName = () => {
    let newName = prompt('New project name: ');
    if (!newName) {
      return;
    } else if (newName.trim() === '') {
      alert('Cannot use empty name');
      return;
    }
    let newAnim = { ...this.state.anim };
    newAnim.name = newName.trim();
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
    /*
     *console.log('new anim:');
     *console.log(newAnim);
     */
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
    //console.log(`Clicked ${x} ${y}`);
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
    let gif = generateGIF(this.state.anim);
    gif.on('finished', (blob) => {
      let url = URL.createObjectURL(blob);
      this.setState({generatedGifSrc:url});
      // TODO: send gif file to server and save
    });
    gif.render();

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

  frameChange = (value) => {
    this.setState({activeFrame:value});
  }

  addFrame = () => {
    let newFrame = {
      layers: [{
        pixels: [],
        visible: true
      }]
    };
    for (let i = 0; i < 16; i++) {
      let row = [];
      for (let j = 0; j < 16; j++) {
        row.push({
          r: 0,
          g: 0,
          b: 0,
          visible: false
        });
      }
      newFrame.layers[0].pixels.push(row);
    }
    let newAnim = { ...this.state.anim };
    newAnim.frames.push(newFrame);
    this.setState({anim:newAnim, activeFrame:this.state.activeFrame+1});
  }

  deleteFrame = () => {
    if (this.state.anim.frames.length === 1) {
      alert('Must have at least one frame');
      return;
    }
    let newAnim = { ...this.state.anim };
    newAnim.frames.splice(this.state.activeFrame, 1);
    let newFrame = this.state.activeFrame - 1;
    if (newFrame < 0) {
      newFrame = 0;
    }
    this.setState({anim:newAnim, activeFrame:newFrame});
  }

  addLayer = () => {
    let newLayer = {
      pixels: [],
      visible: true
    };
    for (let i = 0; i < 16; i++) {
      let row = [];
      for (let j = 0; j < 16; j++) {
        row.push({
          r: 0,
          g: 0,
          b: 0,
          visible: false
        });
      }
      newLayer.pixels.push(row);
    }
    let newAnim = { ...this.state.anim };
    newAnim.frames[this.state.activeFrame].layers.push(newLayer);
    this.setState({anim:newAnim, activeLayer:this.state.activeLayer+1});
  }

  deleteLayer = () => {
    if (this.state.anim.frames[this.state.activeFrame].layers.length === 1) {
      alert('Must have at least one layer');
      return;
    }
    let newAnim = { ...this.state.anim };
    newAnim.frames[this.state.activeFrame].layers.splice(this.state.activeLayer, 1);
    let newLayer = this.state.activeLayer - 1;
    if (newLayer < 0) {
      newLayer = 0;
    }
    this.setState({anim:newAnim, activeLayer:newLayer});
  }

  toggleVisibility = (i) => () => {
    let newAnim = { ...this.state.anim };
    let visible = newAnim.frames[this.state.activeFrame].layers[i].visible;
    newAnim.frames[this.state.activeFrame].layers[i].visible = !visible;
    this.setState({anim:newAnim});
  }

  changeActiveLayer = (i) => () => {
    this.setState({activeLayer:i});
  }

  moveLayerUp = (i) => (e) => {
    e.stopPropagation();
    if (i === 0) {
      return;
    }
    let newAnim = { ...this.state.anim };
    let tmpLayer = newAnim.frames[this.state.activeFrame].layers[i];
    newAnim.frames[this.state.activeFrame].layers[i] = newAnim.frames[this.state.activeFrame].layers[i-1];
    newAnim.frames[this.state.activeFrame].layers[i-1] = tmpLayer;
    this.setState({anim:newAnim});
  }

  moveLayerDown = (i) => (e) => {
    e.stopPropagation();
    if (i === this.state.anim.frames[this.state.activeFrame].layers.length-1) {
      return;
    }
    let newAnim = { ...this.state.anim };
    let tmpLayer = newAnim.frames[this.state.activeFrame].layers[i];
    newAnim.frames[this.state.activeFrame].layers[i] = newAnim.frames[this.state.activeFrame].layers[i+1];
    newAnim.frames[this.state.activeFrame].layers[i+1] = tmpLayer;
    this.setState({anim:newAnim});
  }

  previewAnim = () => {
    let gif = generateGIF(this.state.anim);
    gif.on('finished', (blob) => {
      let url = URL.createObjectURL(blob);
      this.setState({generatedGifSrc:url, previewGif:true});
    });
    gif.render();
  }

  stopGif = () => {
    this.setState({previewGif:false});
  }

  render = () => {
    if (this.state.loading) {
      return (
        <div>
          <p>Loading animation</p>
        </div>
        );
    } else {
      //console.log(this.state);
      let view = this.generateViewFromState();
      return (
        <div>
          <div>
            <span className="highlight title" onClick={this.changeName}>
              { this.state.anim.name } &nbsp;
              <img className="icon" src={editIcon} alt="edit" />
            </span>
            <button className="button" onClick={this.saveAnim}>Save</button>
            <button className="button" onClick={this.previewAnim}>Preview</button>
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
              <table className="bordered">
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
              <h2>Frame Controller</h2>
              <Slider
                min={0}
                max={this.state.anim.frames.length-1}
                value={this.state.activeFrame}
                onChange={this.frameChange}
              />
              <div className="flex-sides">
                <span>Frame: {this.state.activeFrame+1}</span>
                <span>Total Frames: {this.state.anim.frames.length}</span>
              </div>
              <div className="flex-sides">
                <button className="button" onClick={this.addFrame}>Add Frame</button>
                <button className="button" onClick={this.deleteFrame}>Delete Frame</button>
              </div>
              <h2>Layer Controller</h2>
              { this.state.anim.frames[this.state.activeFrame].layers.map((layer, i) => (
                <LayerCard
                key={i}
                activeLayer={this.state.activeLayer+1}
                layerNum={i+1}
                visible={layer.visible}
                toggleVisibility={this.toggleVisibility(i)}
                changeActiveLayer={this.changeActiveLayer(i)}
                moveLayerUp={this.moveLayerUp(i)}
                moveLayerDown={this.moveLayerDown(i)}
              />
              )) }
              <div className="flex-sides">
                <button className="button" onClick={this.addLayer}>Add Layer</button>
                <button className="button" onClick={this.deleteLayer}>Delete Layer</button>
              </div>
              { this.state.previewGif ? 
              <div>
                <h2>Preview</h2>
                <img className="preview" src={this.state.generatedGifSrc} alt="generated gif" />
                <a className="button" href={this.state.generatedGifSrc} target="_blank" rel="noopener noreferrer">Export</a>
                <button className="button" onClick={this.stopGif}>Stop</button>
              </div> : [] }
            </div>
          </div>
        </div>
        );
}
}
}

export default Studio;
