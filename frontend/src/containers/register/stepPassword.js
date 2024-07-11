import React from 'react';
import PageCounter from "./pageCounter";

const StepPassword = ({ nextStep, handleChange, formData, prevStep }) => {

    const pageNumber = 1;
    return (
        <div className="form-container-password">
            <PageCounter page={pageNumber} prevStep={prevStep} />
            <p>
                <h2 className="form-container-password-title">Create password</h2>
                <h3 className="form-container-password-title">1 out of 3 steps</h3>
            </p>
            <p>
              <input type="password" title="Password" aria-label="Password" className="form-container-password-input"
                     placeholder="Password"/>
            </p>
            <p>
              <input onClick={nextStep} type="button" aria-label="Next" title="Next" value="Next"
                     className="form-container-password-next"/>
            </p>
        </div>
    );
};

export default StepPassword;
