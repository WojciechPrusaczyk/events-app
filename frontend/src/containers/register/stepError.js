import React from 'react';
import PageCounter from "./pageCounter";
import PasswordInput from "../../components/passwordInput";
import confirmationIcon from "../../images/confirmationIcon.svg"

const StepError = () => {
    return (
        <div className="form-container-confirmation">
            <PageCounter page={5} />
            <h2 className="form-page-title">That's embarrassing</h2>
            <h3 className="form-page-title">Something went wrong, error (500) occurred. Try again later.</h3>
            <input
                onClick={() => {
                    window.location.href = `${window.location.protocol}//${window.location.host}/`;
                }}
                type="button"
                aria-label="Go to main page"
                title="Go to main page"
                value="Go to main page"
                className="form-container-confirmation-next btn-next"
            />
        </div>
    );
};

export default StepError;