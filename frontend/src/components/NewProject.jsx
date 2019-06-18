import React, { Component } from 'react';
import axios from 'axios';
import { getUserId } from '../utilities/auth';

class NewProject extends Component {
  constructor(props) {
    super(props);
    this.state = {
      errors: []
    }
  }

  inputChanged = (e) => {
    let newState = {};
    newState[e.target.name] = e.target.value;
    this.setState(newState);
  }

  validInput = (s) => {
    return s && s !== '';
  }

  submitHandler = (e) => {
    e.preventDefault();
    if (this.validInput(this.state.name) &&
      this.validInput(this.state.width) &&
      this.validInput(this.state.height)) {
      this.setState({errors:[]});
      let uid = getUserId();
      let params = {
        user_id: uid,
        name: this.state.name,
        width: this.state.width,
        height: this.state.height
      }
      axios.get('/api/new', {params:params})
        .then(res => res.data)
        .then(res => {
          if (res.success) {
            window.location = `/studio/${res.anim_id}`;
          } else {
            this.setState({errors:[res.warning]})
          }
        });
    } else {
      let errors = [];
      if (!this.validInput(this.state.name)) {
        errors.push('Name is required');
      }
      if (!this.validInput(this.state.width)) {
        errors.push('Width is required');
      }
      if (!this.validInput(this.state.height)) {
        errors.push('Height is required');
      }
      this.setState({errors:errors});
    }
  }

  render = () => {
    return (
      <div className="centered">
        <div>
          <form onSubmit={this.submitHandler}>
            <table>
              <thead>
                <tr>
                  <td></td>
                  <td>
                    <h1>Create new project</h1>
                  </td>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td></td>
                  <td>{ this.state.errors.map((error, i) => <p key={i} className="error">{error}</p>) }</td>
                </tr>
                <tr>
                  <td>Name: </td>
                  <td>
                    <input type="text" name="name" onChange={this.inputChanged} />
                  </td>
                </tr>
                <tr>
                  <td>Width (pixels): </td>
                  <td>
                    <input type="number" name="width" onChange={this.inputChanged} />
                  </td>
                </tr>
                <tr>
                  <td>Height (pixels): </td>
                  <td>
                    <input type="number" name="height" onChange={this.inputChanged} />
                  </td>
                </tr>
                <tr>
                  <td></td>
                  <td>
                    <input className="button" type="submit" value="Submit" />
                  </td>
                </tr>
              </tbody>
            </table>
          </form>
        </div>
      </div>
      );
}
}

export default NewProject;
