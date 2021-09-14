import { Button, TextField } from '@material-ui/core';
import axios from 'axios';
import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import Swal from 'sweetalert2';
import { routes } from '../routes';

const PassData = ({ setToken }) => {
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    mode: 'all',
  });

  const onSubmit = async ({ username, password }) => {
    setLoading(true);
    const params = new URLSearchParams();

    params.append('grant_type', 'password');
    params.append('client_id', 'react_app-zeNMv7AxyZUDo9YB3CXWUjSBZbsjurR34gVNolUL');
    params.append('username', username);
    params.append('password', password);

    const config = {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    };

    try {
      const { data } = await axios.post(routes.accessToken(), params, config);
      sessionStorage.setItem('token', data.access_token);
      setToken(data.access_token);
    } catch (e) {
      console.log(e);
      Swal.fire({
        icon: 'error',
        title: 'Bad Request !',
      });
    }
    setLoading(false);
  };

  const [loading, setLoading] = useState(false);
  return (
    <div className="auth_box auth_box_change">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Controller
          render={({ field }) => (
            <TextField
              {...field}
              error={!!errors.username}
              variant="outlined"
              label="Логин"
              placeholder="Логин"
              className="mb-4"
              fullWidth
            />
          )}
          rules={{ required: true }}
          name="username"
          control={control}
          defaultValue=""
        />

        <Controller
          render={({ field }) => (
            <TextField
              {...field}
              error={!!errors.password}
              variant="outlined"
              label="Пароль"
              placeholder="Пароль"
              fullWidth
            />
          )}
          rules={{ required: true }}
          name="password"
          control={control}
          defaultValue=""
        />
        <Button
          variant="contained"
          color="primary"
          className="mt-4"
          type="submit"
          disabled={loading}
          style={{ outline: 'none' }}>
          {loading ? 'Подождите...' : 'Далее'}
        </Button>
      </form>
    </div>
  );
};

export default PassData;
