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
    const unwantedSpecialCharRegex = /[\^*()\-+={}[\]:;"'<>,.\/|\\]/;
    if (unwantedSpecialCharRegex.test(password))
    {
        setHasSpecialChar(false);
    }
    else if (specialCharRegex.test(password))
    {
        setHasSpecialChar(true);
    }
    else {
        setHasSpecialChar(false);
    }

    const digitRegex = /\d/g;
    const digits = password.match(digitRegex);
    setHasThreeNumbers(digits && digits.length >= 3);
  }, [formData.password]);

  let isPasswordValid = isLengthValid && hasSpecialChar && hasThreeNumbers;

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && isPasswordValid) {
            e.preventDefault();
            nextStep();
        }
    };

  return (
    <div className="form-container-password">
      <PageCounter page={1} prevStep={prevStep} />
      <h2 className="form-page-title">Create password</h2>
      <h3 className="form-page-title">1 out of 3 steps</h3>
      <PasswordInput handleChange={handleChange('password')} value={formData.password} onEnterDown={handleKeyDown} />
      <h2>Password must contain at least:</h2>
        <p className="form-container-password-validation">
            <label className="checkbox-container">
                between 8 and 32 characters
                <input className="checkbox" type="checkbox" disabled checked={isLengthValid}/>
                <span className="checkmark"></span>
            </label>
        </p>
        <p className="form-container-password-validation">
            <label className="checkbox-container">
                at least 1 special character ($, @, #, &, !, %, ?)
                <input className="checkbox" type="checkbox" disabled checked={hasSpecialChar}/>
                <span className="checkmark"></span>
            </label>
        </p>
        <p className="form-container-password-validation">
            <label className="checkbox-container">
                at least 3 numbers
                <input className="checkbox" type="checkbox" disabled checked={hasThreeNumbers} />
                <span className="checkmark"></span>
          </label>
      </p>
        <input
            onClick={() => {
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
