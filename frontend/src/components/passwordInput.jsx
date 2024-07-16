import React, { useState } from 'react';
import eyeIconShow from '../images/icons/eye_icon.svg';
import eyeIconHide from '../images/icons/eye_icon_2.svg';

const PasswordInput = ({ handleChange, value, onEnterDown }) => {
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
        onChange={handleChange}
        onKeyDown={ () => {
            if (undefined !== onEnterDown )onEnterDown();
        }}
      />
      <div
        className="password-icon"
        onClick={togglePasswordVisibility}
        tabIndex={0}
        role="button"
        aria-label={passwordShown ? "Hide password" : "Show password"}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            togglePasswordVisibility();
          }
        }}
      >
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
