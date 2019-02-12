import React, { Component } from 'react';
import { EditorState, convertToRaw } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import draftToHtml from 'draftjs-to-html';
//import htmlToDraft from 'html-to-draftjs';
import './App.css';
import '../node_modules/react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { withAuthenticator } from 'aws-amplify-react'
import { Storage } from 'aws-amplify'

class App extends Component {
  state = {
    editorState: EditorState.createEmpty(),
  }

  onEditorStateChange: Function = (editorState) => {
    this.setState({
      editorState,
    });
  };

  addToStorage = () => {
    const { editorState } = this.state;
    Storage.put('dynamic/article_title', draftToHtml(convertToRaw(editorState.getCurrentContent())))
    .then (result => {
      console.log('result: ', result)
    })
    .catch(err => console.log('error: ', err));
  }

  readFromStorage = () => {
    Storage.get('dynamic/article_title')
      .then(data => console.log('data from S3: ', data))
      .catch(err => console.log('error'))
  }

  onChange(e) {
      const file = e.target.files[0];
      Storage.put('example.png', file, {
          contentType: 'image/png'
      })
      .then (result => console.log(result))
      .catch(err => console.log(err));
  }

  render() {
    const { editorState } = this.state;
    return (
    <>
      <div className="App">
        <div className="container">
          <h1>Post a comment</h1>
          <Editor
            editorState={editorState}
            wrapperClassName="demo-wrapper"
            editorClassName="demo-editor"
            onEditorStateChange={this.onEditorStateChange}
          />
          <textarea
            disabled
            value={draftToHtml(convertToRaw(editorState.getCurrentContent()))}
          />
          <button onClick={this.addToStorage}>Add To Storage</button>
          <button onClick={this.readFromStorage}> Preview </button>
        </div>
      </div>
      <div className="container section">
        <h1>Post a picture</h1>
        <input
          type="file" accept='image/png'
          onChange={(e) => this.onChange(e)}
        />
      </div>
    </>

    );
  }
}


export default withAuthenticator(App, { includeGreetings: true })