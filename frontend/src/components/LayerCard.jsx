import React, { Component } from 'react';
import './LayerCard.css';
import viewIcon from './view.png';
import noViewIcon from './no-view.png';

class LayerCard extends Component {
  render = () => {
    let classes = 'layer-card';
    if (this.props.activeLayer === this.props.layerNum) {
      classes += ' active';
    }
    return (
      <div 
        className={classes} 
        onClick={this.props.changeActiveLayer} 
        key={this.props.layerNum}
      >
        <img 
          className="icon" src={this.props.visible ? viewIcon : noViewIcon} 
          alt="view icon" 
          onClick={this.props.toggleVisibility}
        />
        <span>Layer {this.props.layerNum}</span>
      </div>
      );
  }
}

export default LayerCard;
