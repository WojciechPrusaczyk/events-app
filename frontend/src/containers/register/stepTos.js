import React from 'react';
import PageCounter from "./pageCounter";

const StepTos = ({ register, handleChange, formData, prevStep }) => {
    let isFormValid = true;
    let errorOccured = "";
    return (
        <div className="form-container-tos">
            <PageCounter page={3} prevStep={prevStep}/>
            <h2 className="form-page-title">Terms of service</h2>
            <h3 className="form-page-title">3 out of 3 steps</h3>
            <p className="form-container-tos-agreement">
                <label className="agreement">
                    I want to recieve news and offers from Eventfull
                    <input className="checkbox" type="checkbox" onChange={ handleChange('acceptedNews') } />
                    <span className="checkmark"></span>
                </label>
            </p>
            <p className="form-container-tos-agreement">
                <label className="agreement">
                    Share my registration details with content providers on Eventfull. This information may be used for marketing purposes.
                    <input className="checkbox" type="checkbox" onChange={ handleChange('acceptedSharingDetails') } />
                    <span className="checkmark"></span>
                </label>
            </p>
            <p id="privacy-policy" className="form-container-tos-agreement">
                <label className="agreement">
                    I accept <a href={`${window.location.protocol}//${window.location.host}/`}>Terms of service</a>
                    <input className="checkbox" type="checkbox" onChange={ handleChange('acceptedTos') } />
                    <span className="checkmark"></span>
                </label>
            </p>
            <p className="form-container-tos-closure">
                To learn more about how Events App collects, uses and shares your personal information, please review
                <a href={`${window.location.protocol}//${window.location.host}/`}>
                    Eventfull’s Privacy Policy.
                </a>
            </p>
            <input
                onClick={ () => {
                    const elem = document.getElementById("privacy-policy");
                    elem.classList.remove("error");

                    if (!formData.acceptedTos) {
                        elem.classList += " error"
                        window.location.href = "#privacy-policy";
                    } else {
                        register();
                    }
                }}
                type="button"
                aria-label="Register"
                title="Register"
                value="Register"
                className="form-container-tos-next btn-next"
                disabled={!isFormValid}
            />
            { (errorOccured !== "") && <p>
                <h2 className="form-container-tos-error">{errorOccured}</h2>
            </p>}
        </div>
    );
};

export default StepTos;
