import React from 'react';
import PageCounter from "./pageCounter";

const StepInfo = ({ nextStep, handleChange, formData, prevStep }) => {

    const pageNumber = 2;
    return (
        <div className="form-container-info">
            <PageCounter page={pageNumber} prevStep={prevStep} />
            <p>
                <h2 className="form-container-info-title">Tell about yourself</h2>
                <h3 className="form-container-info-title">2 out of 3 steps</h3>
            </p>
            <p>
              <input type="text" title="Username" aria-label="Username" className="form-container-info-username" />
            </p>
            <p>
              <input onClick={nextStep} type="button" aria-label="Next" title="Next" value="Next"
                     className="form-container-password-next"/>
            </p>
        </div>
    );
};

export default StepInfo;
