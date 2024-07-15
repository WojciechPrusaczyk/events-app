import React from 'react';
import PageCounter from "./pageCounter";
import PasswordInput from "../../components/passwordInput";
import confirmationIcon from "../../images/confirmationIcon.png"

const StepConfirmation = () => {
    return (
        <div className="form-container-confirmation">
            <PageCounter page={4} />
            <h2 className="form-page-title">Thank you for registration</h2>
            <h3 className="form-page-title">Check your e-mail and activate your account</h3>
            <p className="form-container-confirmation-icon">
                <img src={confirmationIcon} alt="confirmation icon"/>
            </p>
            <input
                onClick={() => {
                    window.location.href = `${window.location.protocol}//${window.location.host}/login`;
                }}
                type="button"
                aria-label="Log in"
                title="Log in"
                value="Log in"
                className="form-container-confirmation-next btn-next"
            />
        </div>
    );
};

export default StepConfirmation;