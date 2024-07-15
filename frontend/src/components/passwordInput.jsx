import React, { useState } from 'react';
import eyeIconShow from '../images/icons/eye_icon.svg';
import eyeIconHide from '../images/icons/eye_icon_2.svg';

const PasswordInput = ({ handleChange, value }) => {
  const [passwordShown, setPasswordShown] = useState(false);

  const togglePasswordVisibility = () => {
    setPasswordShown(!passwordShown);
  };

  return (
    <div className="password-wrapper">
      <input
        type={passwordShown ? 'text' : 'password'}
        title="Password"
        aria-label="Password"
        className="password-wrapper-password"
        placeholder="Password"
        value={value}
        onChange={ (elem) => handleChange(elem) }
      />
      <div className="password-icon" onClick={togglePasswordVisibility}>
        {passwordShown ? (
          <img className="password-icon-image" src={eyeIconHide} alt="hide password" />
        ) : (
          <img className="password-icon-image" src={eyeIconShow} alt="show password" />
        )}
      </div>
    </div>
  );
};

export default PasswordInput;
