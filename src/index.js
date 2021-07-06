import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

// ReactDOM.render(<App />, document.getElementById('root'));

window.runDetection = (callback, showForm = true) => {
  if (!callback) {
    throw new Error('callback argument is required');
  }
  ReactDOM.render(<App callback={callback} showForm={showForm} />, document.getElementById('root'));
};

window.stopDetection = () => {
  ReactDOM.render(null, document.getElementById('root'));
};
