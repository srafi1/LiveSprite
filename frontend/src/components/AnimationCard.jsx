import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import './AnimationCard.css';

class AnimationCard extends Component {
  render = () => {
    return (
      <div className="animation-card">
        <p>{ this.props.animName }</p>
        <Link className="button" to={`/studio/${this.props.animId}`}>Edit</Link>
      </div>
    );
  }
}

AnimationCard.propTypes = {
  animName: PropTypes.string,
  animId: PropTypes.number
}

export default AnimationCard;
