import React, { useState, useEffect } from 'react';
import PageCounter from "./pageCounter";
import DatePicker from "../../components/datePicker";

const StepInfo = ({ nextStep, handleChange, formData, prevStep, validateUsername }) => {
    const [isUsernameFree, setIsUsernameFree] = useState(true);
    const [isUsernameValid, setIsUsernameValid] = useState(false);
    const [isDateOfBirthValid, setIsDateOfBirthValid] = useState(false);
    const [isGenderValid, setIsGenderValid] = useState(false);
    const [isNameValid, setIsNameValid] = useState(false);
    const [isSurnameValid, setIsSurnameValid] = useState(false);

    const checkUsername = async (username) => {
        const usernameFree = await validateUsername(username);
        setIsUsernameFree(usernameFree);
    };

    const handleUsernameChange = (e) => {
        const username = e.target.value;
        handleChange('username')(e);
        checkUsername(username);
    };

    const validateForm = (data) => {
        setIsUsernameValid(data.username && data.username.length > 3 && data.username.length < 64);
        setIsDateOfBirthValid(data.dateOfBirth && new Date().getFullYear() - new Date(data.dateOfBirth).getFullYear() >= 13);
        setIsGenderValid(data.gender != "");
        setIsNameValid(data.name.length >= 3);
        setIsSurnameValid(data.surname.length >= 3);
    };

    useEffect(() => {
        validateForm(formData);
    }, [formData, isUsernameFree]);

    return (
        <div className="form-container-info">
            <PageCounter page={2} prevStep={prevStep}/>
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
                    onChange={handleUsernameChange}
                    autoComplete="username"
                />
                {!isUsernameFree &&
                <p id="errors" className="form-container-info-errors">
                    Username already exists
                </p>}
                {!(formData.username.length > 3) &&
                <p id="errors" className="form-container-info-errors">
                    Username too short
                </p>}
                {!(formData.username.length < 64) &&
                <p id="errors" className="form-container-info-errors">
                    Username too long
                </p>}
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
                <h2 className="form-container-info-h2"><label htmlFor="name">Name</label></h2>
                <h3 className="form-container-info-h3">Helps to identify you among participants</h3>
                <input
                    className="form-container-info-name"
                    id="name"
                    type="text"
                    aria-label="name"
                    value={formData.name || ""}
                    onChange={(e) => handleChange('name')(e)}
                />
            </div>
            <div>
                <h2 className="form-container-info-h2"><label htmlFor="surname">Surname</label></h2>
                <input
                    className="form-container-info-surname"
                    id="surname"
                    type="text"
                    aria-label="surname"
                    value={formData.surname || ""}
                    onChange={(e) => handleChange('surname')(e)}
                />
            </div>
            <div id="gender">
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
                    if (isUsernameValid && isDateOfBirthValid && isGenderValid && isUsernameFree && isSurnameValid && isNameValid) nextStep();
                    else {
                        const usernameElem = document.getElementById("username");
                        const birthElem = document.getElementById("dateOfBirth");
                        const genderElem = document.getElementById("gender");
                        const nameElem = document.getElementById("name");
                        const surnameElem = document.getElementById("surname");

                        usernameElem.classList.remove("error");
                        birthElem.classList.remove("error");
                        genderElem.classList.remove("error");
                        nameElem.classList.remove("error");
                        surnameElem.classList.remove("error");

                        if (!isGenderValid)
                        {
                            genderElem.classList += " error"
                            window.location.href = "#gender";
                        }
                        if (!isSurnameValid)
                        {
                            surnameElem.classList += " error"
                            window.location.href = "#surname";
                        }
                        if (!isNameValid)
                        {
                            nameElem.classList += " error"
                            window.location.href = "#name";
                        }
                        if (!isDateOfBirthValid)
                        {
                            birthElem.classList += " error"
                            window.location.href = "#dateOfBirth";
                        }
                        if (!isUsernameValid)
                        {
                            usernameElem.classList += " error"
                            window.location.href = "#username";
                        }
                    }
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

export default StepInfo;