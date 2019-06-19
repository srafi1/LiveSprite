import React, { Component } from 'react';
import './Tool.css';

class Tool extends Component {
  render = () => {
    let classes = 'tool';
    if (this.props.activeTool === this.props.toolName) {
      classes += ' active';
    }
    return (
      <div className={classes} onClick={this.props.onClick} name={this.props.toolName}>
        <img className="icon" src={this.props.icon} alt={this.props.toolName} />
        <span>{this.props.toolName}</span>
      </div>
      );
  }
}

export default Tool;
