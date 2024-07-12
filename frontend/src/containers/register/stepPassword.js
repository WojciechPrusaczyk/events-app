import React, { useState, useEffect } from 'react';
import PageCounter from "./pageCounter";
import PasswordInput from "../../components/passwordInput";

const StepPassword = ({ nextStep, handleChange, formData, prevStep }) => {
  const [isLengthValid, setIsLengthValid] = useState(false);
  const [hasSpecialChar, setHasSpecialChar] = useState(false);
  const [hasThreeNumbers, setHasThreeNumbers] = useState(false);

  useEffect(() => {
    const password = formData.password;

    setIsLengthValid(password.length >= 8 && password.length <= 32);

    const specialCharRegex = /[$@#&!%?]/;
    setHasSpecialChar(specialCharRegex.test(password));

    const digitRegex = /\d/g;
    const digits = password.match(digitRegex);
    setHasThreeNumbers(digits && digits.length >= 3);
  }, [formData.password]);

  let isPasswordValid = isLengthValid && hasSpecialChar && hasThreeNumbers;

  return (
    <div className="form-container-password">
      <PageCounter page={1} prevStep={prevStep} />
      <h2 className="form-container-password-title">Create password</h2>
      <h3 className="form-container-password-title">1 out of 3 steps</h3>
      <PasswordInput handleChange={handleChange('password')} value={formData.password} />
      <h2>Password must contain at least:</h2>
      <p className="form-container-password-validation">
        <input type="checkbox" disabled checked={isLengthValid} aria-label="between 8 and 32 characters" />
        <label aria-hidden="true">between 8 and 32 characters</label>
      </p>
      <p className="form-container-password-validation">
        <input type="checkbox" disabled checked={hasSpecialChar} aria-label="at least 1 special character ($, @, #, &, !, %, ?)" />
        <label aria-hidden="true">at least 1 special character ($, @, #, &, !, %, ?)</label>
      </p>
      <p className="form-container-password-validation">
        <input type="checkbox" disabled checked={hasThreeNumbers} aria-label="at least 3 numbers" />
        <label aria-hidden="true">at least 3 numbers</label>
      </p>
      <input
        onClick={ () => {
            if (isPasswordValid) nextStep();
        }}
        type="button"
        aria-label="Next"
        title="Next"
        value="Next"
        className="form-container-password-next btn-next"
        disabled={!isPasswordValid}
      />
    </div>
  );
};

export default StepPassword;
