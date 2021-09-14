import React from 'react';
import { withStyles } from '@material-ui/core/styles';

import Layout from './components/common/Layout';
import PassData from './components/PassData';
import SignIn from './components/SignIn';
import OpenCVFaceDetector from './components/OpenCVFaceDetector';
import axios from 'axios';
import { routes } from './routes';
import Swal from 'sweetalert2';

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

const SIGN_IN = 'sign_in';
const PASS_INPUT = 'pass_data_input';
const FACE_DETECTION = 'face_recognition';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.timerId = null;
    this.state = {
      step: sessionStorage.getItem('token') ? PASS_INPUT : SIGN_IN,
      loading: false,
      auth_result: null,
      pass_data: '',
      birth_date: new Date().toISOString().split('T')[0],
      token: sessionStorage.getItem('token'),
    };
  }

  authRequestStatus = async (job_id) => {
    try {
      const response = await axios({
        url: routes.authRequestStatus(),
        method: 'post',
        headers: {
          Authorization: `Bearer ${this.state.token}`,
        },
        params: {
          job_id,
        },
      });

      if (response.status === 202) {
        setTimeout(() => {
          this.authRequestStatus(job_id);
        }, 1500);
      }

      if (response.status === 200) {
        this.setState({ loading: false });
        const data = response.data;
        const user = data.profile?.common_data;
        const isSuccess = data.result_code === 1;
        Swal.fire({
          icon: isSuccess ? 'success' : 'error',
          title: isSuccess ? `${user.last_name} ${user.first_name} ${user.middle_name}` : data.result_note,
          text: isSuccess ? data.result_note : '',
        });
      }
    } catch (e) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Something went wrong!',
      });
    }
  };

  authenticate = async (photo) => {
    this.setState({ loading: true });

    try {
      const { data } = await axios({
        url: routes.authRequestTask(),
        method: 'post',
        headers: {
          Authorization: `Bearer ${this.state.token}`,
        },
        data: {
          pass_data: this.state.pass_data,
          birth_date: this.state.birth_date,
          photo_from_camera: {
            front: photo.replace('png', 'jpeg'),
          },
          agreed_on_terms: true,
          client_id: 'react_app-zeNMv7AxyZUDo9YB3CXWUjSBZbsjurR34gVNolUL',
          device: 'string',
        },
      });

      this.authRequestStatus(data.job_id);
    } catch (e) {
      this.setState({ loading: false });

      if (e && e.response && e.response.status === 422) {
        const html = e.response.data.detail.map((err) => err.msg + '<br/>').join('');
        Swal.fire({
          icon: 'error',
          title: '422 Validation Error',
          html: html,
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Something went wrong!',
        });
      }
    }
  };

  setPassData = (data) => {
    this.setState({
      ...data,
      step: FACE_DETECTION,
    });
  };

  setToken = (token) => {
    this.setState({
      token,
      step: PASS_INPUT,
    });
  };

  goBack = () => {
    this.setState({
      step: PASS_INPUT,
    });
  };
  render() {
    const { loading, auth_result, step } = this.state;
    return (
      <Layout>
        {step === SIGN_IN && <SignIn setToken={this.setToken} />}
        {step === PASS_INPUT && <PassData setPassData={this.setPassData} />}

        {step === FACE_DETECTION && (
          <OpenCVFaceDetector
            postData={this.authenticate}
            result={auth_result}
            loading={loading}
            setLoading={(loadingState) => this.setState({ loading: loadingState })}
            goBack={() => this.setState({ step: PASS_INPUT })}
          />
        )}
      </Layout>
    );
  }
}

export default withStyles(styles)(App);
