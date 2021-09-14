import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';
import { Backdrop, CircularProgress } from '@material-ui/core';

// The code is based on: https://github.com/toxtli/lightweight-webcam-javascript-face-detection

const styles = (theme) => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
  paperNoPaddingAround: {
    padding: theme.spacing(2, 1),
  },
  inivisible: {
    display: 'none',
  },
});

class OpenCVFaceDetector extends Component {
  constructor(props) {
    super(props);
    this.outputCanvasId = `canvas-output-${props.deviceId || 'smt'}`;
    this.videoContainerId = `video-capture-${props.deviceId || 'smt'}`;
    this.containerId = `${props.deviceId || 'smt'}-mode-container`;
    this.state = { send: false };
    this.cv = null;
    // globals
    this.stats = null;
    this.stream = null;
    this.faceClassifier = null;
    // video specific globals
    this.video = null;
    // canvas specific globals
    this.canvasInput = null;
    this.canvasInputCtx = null;
    this.canvasOutput = null;
    this.canvasOutputCtx = null;
    // timestamps to remove requestAnimationFrame callbacks when needed
    this.timer1 = null;
    this.timer2 = null;
    // whether streaming video from the camera.
    this.streaming = false;
    // last time the data has been sent to server

    this.face_coords = null;
  }

  componentDidMount() {
    // console.log('Starting processing for deviceID', this.props.deviceId);
    this.startProcessing();
  }

  componentWillUnmount() {
    this.stopCamera();
  }

  decideOnResults = (faceMats) => {
    if (!this.state.send) return;

    if (!faceMats.length) return this.setState({ send: false });

    const face_cropped = this.cropFace();

    // we'll assume that there's only one face
    this.props.postData(face_cropped.toDataURL());
    this.setState({ send: false });
  };

  cropFace = (face) => {
    if (this.face_coords.length > 1) return null;
    let { height, width, x, y } = this.face_coords[0];

    x *= 0.7;
    y *= 0.7;
    height = 1.5 * height;
    width = 1.5 * width;

    // console.log('>> coords', x, y, width, height, this.face_coords[0]);

    var faceCropped = this.canvasInputCtx.getImageData(x, y, width, height);

    // create faceCanvas
    let faceCanvas = document.createElement('canvas');
    faceCanvas.width = width;
    faceCanvas.height = height;
    var faceCtx = faceCanvas.getContext('2d');
    faceCtx.rect(0, 0, faceCanvas.width, faceCanvas.height);
    faceCtx.putImageData(faceCropped, 0, 0);

    console.log(faceCanvas.toDataURL());

    return faceCanvas;
  };

  startProcessing = () => {
    this.props.setLoading(true);
    this.cv = window.cv;
    this.video = document.getElementById(this.videoContainerId);
    this.canvasOutput = document.getElementById(this.outputCanvasId);
    this.canvasOutputCtx = this.canvasOutput.getContext('2d');

    this.initUI();
    this.startCamera();
  };

  startVideoProcessing = () => {
    if (!this.streaming) {
      console.warn('Please startup your webcam');
      return;
    }
    this.stopVideoProcessing();
    this.canvasInput = document.createElement('canvas');
    this.canvasInput.width = this.video.videoWidth;
    this.canvasInput.height = this.video.videoHeight;
    this.canvasInputCtx = this.canvasInput.getContext('2d');

    const canvasBuffer = document.createElement('canvas');
    canvasBuffer.width = this.video.videoWidth;
    canvasBuffer.height = this.video.videoHeight;

    this.faceClassifier = new this.cv.CascadeClassifier();
    this.faceClassifier.load('haarcascade_frontalface_default.xml');

    cancelAnimationFrame(this.timer1);
    this.timer1 = requestAnimationFrame(this.processVideo);
  };

  processVideo = () => {
    let srcMat = new this.cv.Mat(this.video.videoHeight, this.video.videoWidth, this.cv.CV_8UC4);
    let grayMat = new this.cv.Mat(this.video.videoHeight, this.video.videoWidth, this.cv.CV_8UC1);
    this.stats.begin();
    this.canvasInputCtx.drawImage(this.video, 0, 0, this.video.videoWidth, this.video.videoHeight);
    let imageData = this.canvasInputCtx.getImageData(0, 0, this.video.videoWidth, this.video.videoHeight);
    srcMat.data.set(imageData.data);
    this.cv.cvtColor(srcMat, grayMat, this.cv.COLOR_RGBA2GRAY);
    let faces = [];
    let faceMats = [];
    let size;
    let faceVect = new this.cv.RectVector();
    let faceMat = new this.cv.Mat();

    this.cv.pyrDown(grayMat, faceMat);
    this.cv.pyrDown(faceMat, faceMat);
    size = faceMat.size();

    this.faceClassifier.detectMultiScale(faceMat, faceVect);

    const cb = (_currentFace) =>
      faces.forEach((_face) => {
        if (_face.width < _currentFace.width) {
          faces = [];
        }
      });

    for (let i = 0; i < faceVect.size(); i++) {
      let face = faceVect.get(i);
      cb(face);
      faces.push(new this.cv.Rect(face.x, face.y, face.width, face.height));
      faceMats.push(faceMat.roi(face));

      if (faces.length > 1) {
        faces.length = 1;
      }
    }
    faceMat.delete();
    faceVect.delete();

    this.canvasOutputCtx.drawImage(this.canvasInput, 0, 0, this.video.videoWidth, this.video.videoHeight);
    this.drawResults(this.canvasOutputCtx, faces, 'aqua', size);
    this.stats.end();
    this.decideOnResults(faceMats);
    srcMat.delete();
    grayMat.delete();
    cancelAnimationFrame(this.timer2);
    this.timer2 = requestAnimationFrame(this.processVideo);
  };

  drawResults = (ctx, results, color, size) => {
    this.face_coords = results;
    // console.log(">> drawResults, results:", results, size, this.video.videoWidth, this.video.videoHeight);
    for (let i = 0; i < results.length; ++i) {
      let rect = results[i];
      let xRatio = this.video.videoWidth / size.width;
      let yRatio = this.video.videoHeight / size.height;
      ctx.lineWidth = 3;
      ctx.strokeStyle = color;
      ctx.strokeRect(rect.x * xRatio, rect.y * yRatio, rect.width * xRatio, rect.height * yRatio);
      this.face_coords[i] = {
        x: rect.x * xRatio,
        y: rect.y * yRatio,
        width: rect.width * xRatio,
        height: rect.height * yRatio,
      };
      // ctx.fillStyle = 'yellow';
      // ctx.font = '18pt sans-serif';
      // ctx.fillText('Face!', rect.x * xRatio, rect.y * yRatio);
    }
  };

  stopVideoProcessing = () => {
    // some logic
  };

  stopCamera = () => {
    if (!this.streaming) return;
    this.stopVideoProcessing();
    document
      .getElementById(this.outputCanvasId)
      .getContext('2d')
      .clearRect(0, 0, this.video.videoWidth, this.video.videoHeight);
    this.video.pause();
    this.video.srcObject = null;
    this.stream.getVideoTracks()[0].stop();
    this.streaming = false;
    cancelAnimationFrame(this.timer1);
    cancelAnimationFrame(this.timer2);
  };

  initUI = () => {
    this.stats = new window.Stats();
    this.stats.showPanel(0);
    document.getElementById(this.containerId).appendChild(this.stats.dom);
  };

  startCamera = () => {
    if (this.streaming) return;
    let videoConstraints = true;
    if (this.props.deviceId) {
      videoConstraints = { deviceId: { exact: this.props.deviceId } };
    }

    navigator.mediaDevices
      .getUserMedia({
        video: videoConstraints,
        audio: false,
      })
      .then((s) => {
        this.stream = s;
        this.video.srcObject = s;
        this.video.play();
        console.log('started camera ');
        this.props.setLoading(false);
      })
      .catch(function (err) {
        console.log('An error occured! ', err);
      });

    this.video.addEventListener(
      'canplay',
      (ev) => {
        if (!this.streaming) {
          this.canvasOutput.width = this.video.videoWidth;
          this.canvasOutput.height = this.video.videoHeight;
          this.streaming = true;
        }
        this.startVideoProcessing();
      },
      false
    );
  };

  render() {
    const { classes, loading, goBack } = this.props;
    return (
      <div className="auth_box auth_box_change" style={{ minWidth: 650 }}>
        <div className="auth_tab">
          <Grid container spacing={1} justify="center">
            <Paper className={classes.paperNoPaddingAround} elevation={0} variant="outlined" square>
              <div id={this.containerId}>
                <canvas className="center-block" id={this.outputCanvasId} style={{ width: '100%' }}></canvas>
              </div>
              <div className={classes.inivisible}>
                <video id={this.videoContainerId} className="hidden">
                  <track kind="captions" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </Paper>
            <Backdrop
              style={{
                zIndex: 100,
                color: '#fff',
              }}
              open={loading}>
              <CircularProgress color="inherit" />
            </Backdrop>
            <Button
              variant="contained"
              color="primary"
              onClick={() => this.setState({ send: true })}
              style={{ outline: 'none' }}>
              Detect
            </Button>
          </Grid>
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(OpenCVFaceDetector);
