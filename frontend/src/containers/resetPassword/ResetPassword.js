import React, {useEffect, useState} from 'react';
import Header from "../../components/structure/header";
import Footer from "../../components/structure/footer";
import "../../styles/containers/home.scss";
import "../../styles/containers/newPassword.scss";
import axios from "axios";
import { useParams } from "react-router-dom";

const ResetPassword = ({title = "Eventfull"}) => {

    useEffect(() => {
        document.title = title;
    }, []);


    const { token } = useParams();
    const [newPassword, setNewPassword] = useState("");
    const [newPasswordRepeat, setNewPasswordRepeat] = useState("");
    const [error, setError] = useState("");
    const [isFormSubmitted, setIsFormSubmitted] = useState(false);

    const resetPassword = (event) => {
        event.preventDefault();
        setError("");

        if (newPassword !== newPasswordRepeat) {
            setError("Passwords do not match.");
            return;
        }

        axios
            .post(`${window.location.protocol}//${window.location.host}/api/reset-password/`, {
                password: newPassword,
                token: token
            })
            .then(response => {
                if (response.status === 200) {
                    setIsFormSubmitted(true);
                    setError("");
                } else {
                    setError("Server side error, please try again later.");
                }
            })
            .catch(() => {
                setError("Error occurred, try again later.");
            });
    };

    const NewPasswordForm = (
        <form className="NewPasswordForm">
            <div>
                <h2>Enter your new password</h2>
                <ul>
                    <input
                        type="password"
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="login-form-email"
                        placeholder="New password"
                    />
                    <input
                        type="password"
                        onChange={(e) => setNewPasswordRepeat(e.target.value)}
                        className="login-form-email"
                        placeholder="Repeat new password"
                    />
                    {error && <p><span className="resetError">{error}</span></p>}
                    <input
                        type="submit"
                        onClick={resetPassword}
                        className="form-container-confirmation-next btn-next"
                        value="Reset Password"
                    />
                </ul>
            </div>
        </form>
    );

    const PasswordResetSuccess = (
        <div className="confirmation">
            <h2 className="form-page-title">Password Reset Successful</h2>
            <h3 className="form-page-title">Your password has been successfully reset.</h3>
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
    );

    return (
        <div>
            <Header />
            <main>
                {!isFormSubmitted && NewPasswordForm}
                {isFormSubmitted && PasswordResetSuccess}
            </main>
            <Footer />
        </div>
    );
};

export default ResetPassword;
