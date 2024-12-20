import React, { useState, useEffect } from 'react';
import GoogleIcon from "../../images/icons/google_color.png";
import FacebookIcon from "../../images/icons/facebook_color.png";
import AppleIcon from "../../images/icons/apple_color.png";
import PageCounter from "./pageCounter";

const StepEmail = ({ nextStep, handleChange, formData }) => {
  const [isEmailValid, setIsEmailValid] = useState(false);

  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setIsEmailValid(emailRegex.test(formData.email));
  }, [formData.email]);

  const handleKeyDown = (e) => {
        if (e.key === 'Enter' && isEmailValid) {
            e.preventDefault();
            nextStep();
        }
    };

  return (
    <div className="form-container-email">
      <PageCounter page={0} />
      <h2 className="form-page-title">Sign in to participate and create events</h2>
      <input
        id="email"
        type="email"
        title="Email address"
        aria-label="Email address"
        className="form-container-email-address"
        placeholder="email@domain.com"
        value={formData.email}
        defaultValue="mail@mail.com"
        onChange={handleChange('email')}
        autoComplete="email"
        onKeyDown={handleKeyDown}
      />
      <button
        onClick={ () => {
            const elem = document.getElementById("email");
            elem.classList.remove("error")

            if (isEmailValid) nextStep();
            else {
                elem.classList += " error"
                window.location.href = "#email";
            }
        }}
        className="form-container-email-submit btn-next"
      >
        Next
      </button>
      <h2 className="form-container-email-breakpoint">Or</h2>
      <a
        href={`${window.location.protocol}//${window.location.host}`}
        className="form-container-email-company"
        aria-label="register with google"
      >
        <img src={GoogleIcon} alt="google icon" />
        <span> Register with Google </span>
      </a>
      <a
        href={`${window.location.protocol}//${window.location.host}`}
        className="form-container-email-company"
        aria-label="register with facebook"
      >
        <img src={FacebookIcon} alt="facebook icon" />
        <span> Register with Facebook </span>
      </a>
      <a
        href={`${window.location.protocol}//${window.location.host}`}
        className="form-container-email-company"
        aria-label="register with apple"
      >
        <img src={AppleIcon} alt="apple icon" />
        <span> Register with Apple </span>
      </a>
      <p className="form-container-email-signIn">
        <span>Already have an account?</span>
        <a href={`${window.location.protocol}//${window.location.host}/login`}>Sign in</a>
      </p>
    </div>
  );
};

export default StepEmail;
