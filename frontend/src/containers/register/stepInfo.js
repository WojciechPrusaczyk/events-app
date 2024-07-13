import React from 'react';
import PageCounter from "./pageCounter";
import PasswordInput from "../../components/passwordInput";
import DatePicker from "../../components/datePicker";

const StepInfo = ({ nextStep, handleChange, formData, prevStep }) => {
    let isFormValid = true;
    return (
        <div className="form-container-info">
            <PageCounter page={2} prevStep={prevStep}/>
            <h2 className="form-page-title">Tell about yourself</h2>
            <h3 className="form-page-title">2 out of 3 steps</h3>
            <p>
                <h2 className="form-container-info-h2"><label>Username</label></h2>
                <h3 className="form-container-info-h3">Every event participant will see this name</h3>
                <input className="form-container-info-username" id="username" type="text" aria-label="username" />
            </p>
            <p>
                <h2 className="form-container-info-h2"><label>Date of birth</label></h2>
                <h3 className="form-container-info-h3">You need to be at least 13 years old</h3>
                <DatePicker handleChange={handleChange('dateOfBirth')}/>
            </p>
            <p>
                <h2 className="form-container-info-h2"><label>Gender</label></h2>
                <h3 className="form-container-info-h3">Helps to personalize events feed</h3>
                <label className="radio-container">
                    Male
                    <input name="gender" className="radio" type="radio"/>
                    <span className="checkmark"></span>
                </label>
                <label className="radio-container">
                    Female
                    <input name="gender" className="radio" type="radio"/>
                    <span className="checkmark"></span>
                </label>
                <label className="radio-container">
                    Other
                    <input name="gender" className="radio" type="radio"/>
                    <span className="checkmark"></span>
                </label>
                <label className="radio-container">
                    I don't want to say
                    <input name="gender" className="radio" type="radio"/>
                    <span className="checkmark"></span>
                </label>
            </p>

            <input
                onClick={() => {
                    if (isFormValid) nextStep();
                }}
                type="button"
                aria-label="Next"
                title="Next"
                value="Next"
                className="form-container-info-next btn-next"
                disabled={!isFormValid}
            />
        </div>
    );
};

export default StepInfo;
