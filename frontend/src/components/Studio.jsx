import React, { Component } from 'react';
import axios from 'axios';

class Studio extends Component {
  render = () => {
    return (
      <div>
        <h1>Editing { this.props.match.params.id }</h1>
      </div>
    );
  }
}

export default Studio;
