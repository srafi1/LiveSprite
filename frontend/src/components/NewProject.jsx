import React, { Component } from 'react';
import axios from 'axios';
import { Redirect } from 'react-router-dom';
import generateGIF from '../utilities/gif';

class NewProject extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true
    }
  }

  componentDidMount() {
    // anim -> frames[] -> layers[] -> pixel[16][16] -> {visible, r, g, b}
    let anim = {
      name: 'New Project',
      frames: [{
        layers: [{
          visible: true,
          pixels: []
        }]
      }]
    };
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
      anim.frames[0].layers[0].pixels.push(row);
    }
    anim.fps = 1;

    axios.post('/api/new', anim)
      .then(res => res.data)
      .then(res => {
        this.setState({loading:false});
        if (res.success) {
          this.setState({animIdTemp:res.anim_id});
        } else {
          this.setState({error:res.warning});
        }
      })
      .then(() => {
        let gif = generateGIF(anim);
        gif.on('finished', (blob) => {
          let url = URL.createObjectURL(blob);
          this.setState({generatedGifSrc:url});
          var formData = new FormData();
          formData.append("image", blob);
          console.log(this.state.animIdTemp);
          axios.post(`/api/gif/animation/${this.state.animIdTemp}`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          })
            .then (res => this.setState({animId:this.state.animIdTemp}));
        });
        gif.render();
      })
  }

  render = () => {
    if (this.state.loading) {
      return <p>Creating new project...</p>;
    } else if (this.state.animId) {
      return <Redirect to={`/studio/${this.state.animId}`} />;
    } else if (this.state.error) {
      return <p className="error">{ this.state.error }</p>;
    } else {
      return <p className="error">Unknown error</p>;
    }
  }
}

export default NewProject;

/*
 *class NewProject extends Component {
 *  constructor(props) {
 *    super(props);
 *    this.state = {
 *      errors: []
 *    }
 *  }
 *
 *  inputChanged = (e) => {
 *    let newState = {};
 *    newState[e.target.name] = e.target.value;
 *    this.setState(newState);
 *  }
 *
 *  validInput = (s) => {
 *    return s && s !== '';
 *  }
 *
 *  submitHandler = (e) => {
 *    e.preventDefault();
 *    if (this.validInput(this.state.name) &&
 *      this.validInput(this.state.width) &&
 *      this.validInput(this.state.height)) {
 *      this.setState({errors:[]});
 *      let uid = getUserId();
 *      let params = {
 *        user_id: uid,
 *        name: this.state.name,
 *        width: this.state.width,
 *        height: this.state.height
 *      }
 *      axios.get('/api/new', {params:params})
 *        .then(res => res.data)
 *        .then(res => {
 *          if (res.success) {
 *            window.location = `/studio/${res.anim_id}`;
 *          } else {
 *            this.setState({errors:[res.warning]})
 *          }
 *        });
 *    } else {
 *      let errors = [];
 *      if (!this.validInput(this.state.name)) {
 *        errors.push('Name is required');
 *      }
 *      if (!this.validInput(this.state.width)) {
 *        errors.push('Width is required');
 *      }
 *      if (!this.validInput(this.state.height)) {
 *        errors.push('Height is required');
 *      }
 *      this.setState({errors:errors});
 *    }
 *  }
 *
 *  render = () => {
 *    return (
 *      <div className="centered">
 *        <div>
 *          <form onSubmit={this.submitHandler}>
 *            <table>
 *              <thead>
 *                <tr>
 *                  <td></td>
 *                  <td>
 *                    <h1>Create new project</h1>
 *                  </td>
 *                </tr>
 *              </thead>
 *              <tbody>
 *                <tr>
 *                  <td></td>
 *                  <td>{ this.state.errors.map((error, i) => <p key={i} className="error">{error}</p>) }</td>
 *                </tr>
 *                <tr>
 *                  <td>Name: </td>
 *                  <td>
 *                    <input type="text" name="name" onChange={this.inputChanged} />
 *                  </td>
 *                </tr>
 *                <tr>
 *                  <td>Width (pixels): </td>
 *                  <td>
 *                    <input type="number" name="width" onChange={this.inputChanged} />
 *                  </td>
 *                </tr>
 *                <tr>
 *                  <td>Height (pixels): </td>
 *                  <td>
 *                    <input type="number" name="height" onChange={this.inputChanged} />
 *                  </td>
 *                </tr>
 *                <tr>
 *                  <td></td>
 *                  <td>
 *                    <input className="button" type="submit" value="Submit" />
 *                  </td>
 *                </tr>
 *              </tbody>
 *            </table>
 *          </form>
 *        </div>
 *      </div>
 *      );
 *}
 *}
 *
 *export default NewProject;
 */
