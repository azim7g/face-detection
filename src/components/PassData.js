import { Button, TextField } from '@material-ui/core';
import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import InputMask from 'react-input-mask';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import FormHelperText from '@material-ui/core/FormHelperText';

const schema = yup.object().shape({
  passSeria: yup
    .string()
    .required('Введите серию паспорта')
    .max(2, 'Количество символов не должно быть больше 2')
    .matches(/^([^0-9]*)$/, 'Серия не должна содержать цифр'),

  passNum: yup.string().required('Введите номер паспорта').min(7, 'Количество символов не должно быть меньше 7'),
  birth_date: yup
    .string()
    .required('Введите дату рождения')
    .matches(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/, 'Введите правильную дату рождения: (дд.мм.19xx/20xx)'),
});

const PassData = ({ setPassData }) => {
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    mode: 'all',
    resolver: yupResolver(schema),
  });
  const onSubmit = (data) => {
    const result = {
      birth_date: data.birth_date,
      pass_data: data.passSeria.toUpperCase().concat(data.passNum),
    };
    setPassData(result);
  };
  return (
    <div className="auth_box auth_box_change">
      <div className="auth_tab">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="w-100 text-left d-flex justify-content-center">
            <Controller
              render={({ field }) => (
                <TextField
                  {...field}
                  error={!!errors.passSeria}
                  // helperText={errors?.passSeria?.message}
                  label="Серия"
                  variant="outlined"
                  inputProps={{ style: { fontSize: 18, textTransform: 'uppercase' } }}
                  placeholder="AB"
                  style={{ width: '25%' }}
                />
              )}
              name="passSeria"
              control={control}
              defaultValue=""
            />

            <Controller
              name="passNum"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <InputMask mask="9999999" maskChar="" {...field}>
                  {(inputProps) => (
                    <TextField
                      {...inputProps}
                      variant="outlined"
                      label="Номер"
                      error={!!errors.passNum}
                      placeholder="1234567"
                      inputProps={{ style: { fontSize: 18 } }}
                      style={{ width: '65%' }}
                    />
                  )}
                </InputMask>
              )}
            />
          </div>

          <FormHelperText className="mb-4 w-75 pl-4 text-danger">
            {errors?.passSeria?.message || errors?.passNum?.message}
          </FormHelperText>

          <div style={{ width: '90%' }} className="m-auto">
            <Controller
              name="birth_date"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <InputMask mask="9999-99-99" disabled={false} maskChar="" {...field}>
                  {(inputProps) => (
                    <TextField
                      {...inputProps}
                      variant="outlined"
                      label="Дата рождения"
                      error={!!errors.birth_date}
                      helperText={errors?.birth_date?.message}
                      placeholder="гггг-мм-дд"
                      inputProps={{ style: { fontSize: 18 } }}
                      fullWidth
                    />
                  )}
                </InputMask>
              )}
            />
          </div>
          <Button variant="contained" color="primary" className="mt-4" type="submit">
            {' '}
            Далее
          </Button>
        </form>
      </div>
    </div>
  );
};

export default PassData;
