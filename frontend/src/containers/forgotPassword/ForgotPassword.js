// src/containers/ResetPassword.js
import React, {useEffect, useState} from 'react';
import Header from "../../components/structure/header";
import Footer from "../../components/structure/footer";
import "../../styles/containers/passwordReset.scss"
import axios from "axios";
import Cookies from "js-cookie";
import PageCounter from "../register/pageCounter";
import confirmationIcon from "../../images/confirmationIcon.svg";


const ForgotPassword = ({title = "Eventful"}) => {

    useEffect(() => {
        document.title = title;
    }, []);

    const validateEmail = (email) => {
        console.log(email);
        var re = /\S+@\S+.\S+/;
        return re.test(email);
    };

    let tempMail;
    const [isFormSubmited, setisFormSubmited] = useState(false);
    const [error, setError] = useState("");
    const forgotPassword = (event, email) => {
        setError("")
        event.preventDefault();
        console.log(validateEmail(tempMail));
        if (validateEmail(tempMail)) {
            axios
                .post(
                    `${window.location.protocol}//${window.location.host}/api/forgot-password/`, {
                        email: tempMail
                    })
                .then(response => {

                    if (response.status == 200) {
                        setisFormSubmited(true);
                        // TODO: upewnić się że działa wiadomość w przyapdku sukcesu - działa
                        setError("");
                    } else {
                        // TODO: wyświetlić komunikat o błędzie wyświetlić czerwony tekst pod inputem
                        //  z wiadomością o treści "Wystąpił błąd po stronie serwera, spróbuj ponownie później.
                        setError("Server side error, please try again later.");
                    }
                })
                .catch(error => {
                    setError("Error occurred, try again later.");
                })
        } else {
            setError("Invalid email provided.")
        }


    }
    const PasswordRecoveryForm = <form className="passwordResetForm form-container-email">
        <p>
            <h2>Password recovery</h2>
        </p>
        <p>
            <label htmlFor="email">
                Enter your mail address to recover your account.
            </label>
            <input type="email" title="Enter your email address" onChange={(e) => {
                tempMail = e.target.value;
            }}
                   aria-label="Email address"
                   className="login-form-email"
                   placeholder="Email address"
            />
        </p>
        {(error !== "") && <p><span className="resetError"> {error} </span></p>}
        <p>
            <input type="submit" aria-label="Submit" title="Submit" value="Submit"
                   className="login-form-submit" onClick={(event) => {
                forgotPassword(event, tempMail);
            }}/>
        </p>
    </form>
    const MailSended = <div className="confirmation">
        <h2 className="form-page-title">Reset mail sended</h2>
        <h3 className="form-page-title">We have sent you an email with the password reset link.</h3>
        <h3 className="form-page-title">Click on the link to reset your password.</h3>
        <p className="form-container-confirmation-icon">
            <img src={confirmationIcon} alt="confirmation icon"/>
        </p>
        <input
            onClick={() => {
                window.location.href = `${window.location.protocol}//${window.location.host}`;
            }}
            type="button"
            aria-label="Go to the main page"
            title="Go to the main page"
            value="Go to the main page"
            className="form-container-confirmation-next btn-next"
        />
    </div>


    return (
        <div>
            <Header/>
            <main>
                {!isFormSubmited && PasswordRecoveryForm}
                {isFormSubmited && MailSended}
            </main>
            <Footer/>
        </div>
    );
};

export default ForgotPassword;