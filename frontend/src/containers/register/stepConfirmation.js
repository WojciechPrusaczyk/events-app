import React from 'react';
import PageCounter from "./pageCounter";
import PasswordInput from "../../components/passwordInput";

const StepConfirmation = () => {
    return (
        <div className="form-container-info">
            <h2 className="form-container-info-title">Thank you for registration</h2>
            <h3 className="form-container-info-title">Check your e-mail and activate your account</h3>
            <p>
                <h2><label>Username</label></h2>
                <h3>Every event participant will see this name</h3>
                <input id="username" type="text"/>
            </p>
            <input
                onClick={() => {
                    window.location.href = `${window.location.protocol}//${window.location.host}/`;
                }}
                type="button"
                aria-label="Next"
                title="Next"
                value="Next"
                className="form-container-info-next btn-next"
            />
        </div>
    );
};

export default StepConfirmation;