import React from 'react';
import GoogleIcon from "../../images/icons/google_color.png";
import FacebookIcon from "../../images/icons/facebook_color.png";
import AppleIcon from "../../images/icons/apple_color.png";
import PageCounter from "./pageCounter";

const StepEmail = ({ nextStep, handleChange, formData }) => {

    const pageNumber = 0;

    return (
      <div className="form-container-email">
          <PageCounter page={pageNumber} />
          <p>
              <h2 className="form-container-email-title">Sign in to participate in events</h2>
          </p>
          <p>
              <input type="email" title="Email address"
                     aria-label="Email address" className="form-container-email-address"
                     placeholder="email@domain.com"/>
          </p>
          <button onClick={nextStep} className="form-container-email-submit">Next</button>
          <p>
              <h3 className="form-container-email-breakpoint">Or</h3>
          </p>
          <p>
              <a href={`${window.location.protocol}//${window.location.host}`} className="form-container-email-company" aria-label="register with google">
                  <img src={GoogleIcon} alt="google icon"/>
                  <span> Register with Google </span>
              </a>
          </p>
          <p>
              <a href={`${window.location.protocol}//${window.location.host}`} className="form-container-email-company" aria-label="register with facebook">
                  <img src={FacebookIcon} alt="facebook icon"/>
                  <span> Register with Facebook </span>
              </a>
          </p>
          <p>
              <a href={`${window.location.protocol}//${window.location.host}`} className="form-container-email-company" aria-label="register with apple">
                  <img src={AppleIcon} alt="apple icon"/>
                  <span> Register with Apple </span>
              </a>
          </p>
          <p className="form-container-email-signIn">
              <span>Already have an account?</span>
              <a href={`${window.location.protocol}//${window.location.host}/register`}>Sign in</a>
          </p>
      </div>
    );
};

export default StepEmail;
