import React from 'react';
import PageCounter from "./pageCounter";
import PasswordInput from "../../components/passwordInput";

const StepTos = ({ register, handleChange, formData, prevStep }) => {
    let isFormValid = true;
    return (
        <div className="form-container-tos">
            <PageCounter page={3} prevStep={prevStep}/>
            <h2 className="form-page-title">Terms of service</h2>
            <h3 className="form-page-title">3 out of 3 steps</h3>
            <p className="form-container-tos-agreement">
                <label className="agreement">
                    I want to recieve news and offers from Eventful
                    <input className="checkbox" type="checkbox" onChange={ handleChange('acceptedNews') } />
                    <span className="checkmark"></span>
                </label>
            </p>
            <p className="form-container-tos-agreement">
                <label className="agreement">
                    Share my registration details with content providers on Eventful. This information may be used for marketing purposes.
                    <input className="checkbox" type="checkbox" onChange={ handleChange('acceptedSharingDetails') } />
                    <span className="checkmark"></span>
                </label>
            </p>
            <p className="form-container-tos-agreement">
                <label className="agreement">
                    I accept <a href={`${window.location.protocol}//${window.location.host}/`}>Terms of service</a>
                    <input className="checkbox" type="checkbox" onChange={ handleChange('acceptedTos') } />
                    <span className="checkmark"></span>
                </label>
            </p>
            <p className="form-container-tos-closure">
                To learn more about how Events App collects, uses and shares your personal information, please review
                <a href={`${window.location.protocol}//${window.location.host}/`}>
                    Eventful’s Privacy Policy.
                </a>
            </p>
            <input
                onClick={register}
                type="button"
                aria-label="Register"
                title="Register"
                value="Register"
                className="form-container-tos-next btn-next"
                disabled={!isFormValid}
            />
        </div>
    );
};

export default StepTos;
