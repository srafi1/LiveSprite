import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import mario from './mario-pixel.png';

class Home extends Component {
  render() {
    return (
      <div>
        <h1>Live Sprite</h1>
        <img src={mario} alt="mario" />
        <p>Animate pixel art</p>
        <Link to="/login" className="button">Get Started</Link>
      </div>
    );
  }
}

export default Home;
