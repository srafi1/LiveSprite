import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './AnimationCard.css';

class AnimationCard extends Component {
  deleteAnim = (i) => () => {
    axios.delete(`/api/animation/${i}`)
      .then(() => window.location = '/profile');
  }

  render = () => {
    return (
      <div className="animation-card">
        <p>{ this.props.animName }</p>
        <Link className="button" to={`/studio/${this.props.animId}`}>Edit</Link>
        <button className="button" onClick={this.deleteAnim(this.props.animId)}>Delete</button>
      </div>
    );
  }
}

AnimationCard.propTypes = {
  animName: PropTypes.string,
  animId: PropTypes.number
}

export default AnimationCard;
