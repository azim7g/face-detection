import React from 'react';
import { withStyles } from '@material-ui/core/styles';

import Layout from './components/common/Layout';
import PassData from './components/PassData';
import OpenCVFaceDetector from './components/OpenCVFaceDetector';
import axios from 'axios';
import { routes } from './routes';

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
});

const PASS_INPUT = 'pass_data_input';
const FACE_DETECTION = 'face_recognition';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      step: PASS_INPUT,
      loading: false,
      auth_result: null,
      pass_data: '',
      birth_date: new Date().toISOString().split('T')[0],
    };
  }

  authenticate = async (photo) => {
    const token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2MzEyNzQyNjIsInN1YiI6IntcImNsaWVudF9pZFwiOiBcInJlYWN0X2FwcC16ZU5NdjdBeHlaVURvOVlCM0NYV1VqU0JaYnNqdXJSMzRnVk5vbFVMXCIsIFwidXNlcl9pZFwiOiAxNCwgXCJzY29wZXNcIjogXCJhZGRyZXNzLGNvbnRhY3RzLGRvY19kYXRhLGNvbW1vbl9kYXRhXCIsIFwiYWNjZXNzX3Rva2VuXCI6IHRydWV9In0.VWHOnm9Q1OvpTPfpeTv1LaTZZdO9Att8AA4G5m5cyVE`;

    const { data } = await axios({
      url: routes.authRequestTask(),
      method: 'post',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: {
        pass_data: this.state.pass_data,
        birth_date: this.state.birth_date,
        photo_from_camera: {
          front: photo,
        },
        agreed_on_terms: true,
        client_id: 'react_app-zeNMv7AxyZUDo9YB3CXWUjSBZbsjurR34gVNolUL',
        device: 'string',
      },
    });

    const response = await axios({
      url: routes.authRequestStatus(),
      method: 'post',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        job_id: data.job_id,
      },
    });
  };

  setPassData = (data) => {
    this.setState({
      ...data,
      step: FACE_DETECTION,
    });
  };

  render() {
    const { loading, auth_result, step } = this.state;
    return (
      <Layout>
        {step === PASS_INPUT && <PassData setPassData={this.setPassData} />}

        {step === FACE_DETECTION && (
          <OpenCVFaceDetector postData={this.authenticate} result={auth_result} loading={loading} />
        )}
      </Layout>
    );
  }
}

export default withStyles(styles)(App);
