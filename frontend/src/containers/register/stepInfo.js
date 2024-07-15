import React, { useState, useEffect } from 'react';
import PageCounter from "./pageCounter";
import DatePicker from "../../components/datePicker";

const StepInfo = ({ nextStep, handleChange, formData, prevStep }) => {
    const [isFormValid, setIsFormValid] = useState(false);

    useEffect(() => {
        const isUsernameValid = formData.username && formData.username.length > 2;
        const isDateOfBirthValid = formData.dateOfBirth && new Date().getFullYear() - new Date(formData.dateOfBirth).getFullYear() >= 13;
        const isGenderValid = formData.gender;

        setIsFormValid(isUsernameValid && isDateOfBirthValid && isGenderValid);
    }, [formData]);

    return (
        <div className="form-container-info">
            <PageCounter page={2} prevStep={prevStep} />
            <h2 className="form-page-title">Tell about yourself</h2>
            <h3 className="form-page-title">2 out of 3 steps</h3>
            <div>
                <h2 className="form-container-info-h2"><label htmlFor="username">Username</label></h2>
                <h3 className="form-container-info-h3">Every event participant will see this name</h3>
                <input
                    className="form-container-info-username"
                    id="username"
                    type="text"
                    aria-label="username"
                    value={formData.username || ""}
                    onChange={(e) => handleChange('username')(e)}
                />
            </div>
            <div>
                <h2 className="form-container-info-h2"><label htmlFor="dateOfBirth">Date of birth</label></h2>
                <h3 className="form-container-info-h3">You need to be at least 13 years old</h3>
                <DatePicker
                    id="dateOfBirth"
                    handleChange={(e) => handleChange('dateOfBirth')(e)}
                    dateValue={formData.dateOfBirth}
                />
            </div>
            <div>
                <h2 className="form-container-info-h2">Gender</h2>
                <h3 className="form-container-info-h3">Helps to personalize events feed</h3>
                <label className="radio-container">
                    Male
                    <input
                        name="gender"
                        className="radio"
                        type="radio"
                        value="male"
                        checked={formData.gender === 'male'}
                        onChange={(e) => handleChange('gender')(e)}
                    />
                    <span className="checkmark"></span>
                </label>
                <label className="radio-container">
                    Female
                    <input
                        name="gender"
                        className="radio"
                        type="radio"
                        value="female"
                        checked={formData.gender === 'female'}
                        onChange={(e) => handleChange('gender')(e)}
                    />
                    <span className="checkmark"></span>
                </label>
                <label className="radio-container">
                    Other
                    <input
                        name="gender"
                        className="radio"
                        type="radio"
                        value="other"
                        checked={formData.gender === 'other'}
                        onChange={(e) => handleChange('gender')(e)}
                    />
                    <span className="checkmark"></span>
                </label>
                <label className="radio-container">
                    I don't want to say
                    <input
                        name="gender"
                        className="radio"
                        type="radio"
                        value="no-answer"
                        checked={formData.gender === 'no-answer'}
                        onChange={(e) => handleChange('gender')(e)}
                    />
                    <span className="checkmark"></span>
                </label>
            </div>
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
