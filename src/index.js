import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

// ReactDOM.render(<App />, document.getElementById('face_detection_app'));

window.runDetection = (callback, showForm = true) => {
  if (!callback) {
    throw new Error('callback argument is required');
  }
  ReactDOM.render(<App callback={callback} showForm={showForm} />, document.getElementById('face_detection_app'));
};

window.stopDetection = () => {
  ReactDOM.render(null, document.getElementById('face_detection_app'));
};

window.runDetection((data) => console.log(data));
