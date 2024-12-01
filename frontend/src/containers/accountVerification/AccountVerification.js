// src/containers/AccountVerification.js
import React, {useEffect} from 'react';
import Header from "../../components/structure/header";
import Footer from "../../components/structure/footer";
import "../../styles/containers/home.scss"
import axios from "axios";
import Cookies from "js-cookie";
import PageCounter from "../register/pageCounter";
import confirmationIcon from "../../images/confirmationIcon.svg";

const AccountVerification = ({title = "Eventfull"}) => {

    useEffect(() => {
        document.title = title;
    }, []);

    return (
      <div>
        <Header />
        <div className="form-container-confirmation" style={{margin: "auto"}}>
            <h2 className="form-page-title">Thank you for joining</h2>
            <h3 className="form-page-title">Email was successfully verified.</h3>
            <p className="form-container-confirmation-icon">
                <img src={confirmationIcon} alt="confirmation icon"/>
            </p>
            <input
                onClick={() => {
                    window.location.href = `${window.location.protocol}//${window.location.host}/login`;
                }}
                type="button"
                aria-label="Log in"
                title="Log in"
                value="Log in"
                className="form-container-confirmation-next btn-next"
            />
        </div>
        <Footer/>
      </div>
    );
};

export default AccountVerification;