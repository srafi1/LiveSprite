import React, { Component } from 'react';
import axios from 'axios';
import AnimationCard from './AnimationCard';

class Profile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true
    }
  }

  componentDidMount() {
    axios.get('/api/animations/')
      .then(res => res.data)
      .then(res => {
        console.log(res);
        this.setState({
          loading: false,
          animations: res
        });
      });
  }

  render = () => {
    if (this.state.loading) {
      return (
        <div>
          <h1>Profile</h1>
          <p>Loading</p>
        </div>
        );
    } else {
      return (
        <div>
          <h1>Profile</h1>
          <div className="flex-container">
            { this.state.animations.length > 0 ? 
            this.state.animations.map((anim, i) => <AnimationCard key={i} animId={anim.id} animName={anim.name} />) :
            <p>No animations yet</p> }
          </div>
        </div>
        );
    }
  }
}

export default Profile;
