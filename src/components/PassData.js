import { Button, TextField } from '@material-ui/core';
import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import InputMask from 'react-input-mask';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

const schema = yup.object().shape({
  pass_data: yup
    .string()
    .required('Введите серию и номер паспорта или ПИНФЛ')
    .matches(
      /(^[3456](\d?){13}$)|(^([A-Za-z]{2})(\d?){7}$)|(^[3456A-Za-z]$)/,
      'Введите правильный формат паспорта или ПИНФЛ'
    ),
  birth_date: yup
    .string()
    .required('Введите дату рождения')
    .matches(/^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-\d{4}$/, 'Введите правильную дату рождения: (дд.мм.19xx/20xx)'),
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

  const onSubmit = (formValues) => {
    let result = {};

    if (Number.isInteger(+formValues.pass_data[0])) {
      result.pinfl = formValues.pass_data;
    } else {
      result.pass_data = formValues.pass_data.toUpperCase();
    }

    result.birth_date = formValues.birth_date.split('-').reverse().join('-');

    setPassData(result);
  };

  return (
    <div className="auth_box auth_box_change">
      <div className="auth_tab">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="w-100 text-left d-flex justify-content-center mb-4">
            <Controller
              name="pass_data"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  error={!!errors.pass_data}
                  helperText={errors.pass_data?.message}
                  label="Серия, номер паспорта или ПИНФЛ "
                  variant="outlined"
                  inputProps={{ style: { fontSize: 18, textTransform: 'uppercase' } }}
                  placeholder="AA1234567 | PinFl"
                />
              )}
            />
          </div>

          <div className="m-auto">
            <Controller
              name="birth_date"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <InputMask mask="99-99-9999" disabled={false} maskChar="" {...field}>
                  {(inputProps) => (
                    <TextField
                      {...inputProps}
                      variant="outlined"
                      label="Дата рождения"
                      error={!!errors.birth_date}
                      helperText={errors?.birth_date?.message}
                      placeholder="дд-мм-гггг"
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
