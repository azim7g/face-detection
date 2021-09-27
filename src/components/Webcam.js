import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';
import { Backdrop, CircularProgress } from '@material-ui/core';
import { useRef } from 'react';
import Video from 'react-webcam';

function Webcam({ loading, postData }) {
  const webcamref = useRef(null);

  const takePhoto = () => {
    const screenshot = webcamref.current.getScreenshot();
    console.log(screenshot);
    postData(screenshot);
  };

  return (
    <div className="auth_box auth_box_change" style={{ minWidth: 650 }}>
      <div className="auth_tab">
        <Grid container spacing={1} justify="center">
          <Paper elevation={0} variant="outlined" square>
            <Video ref={webcamref} />
          </Paper>
          <Backdrop
            style={{
              zIndex: 100,
              color: '#fff',
            }}
            open={loading}>
            <CircularProgress color="inherit" />
          </Backdrop>
          <Button variant="contained" color="primary" onClick={takePhoto} style={{ marginTop: 10 }}>
            Detect
          </Button>
        </Grid>
      </div>
    </div>
  );
}

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

export default withStyles(styles)(Webcam);
