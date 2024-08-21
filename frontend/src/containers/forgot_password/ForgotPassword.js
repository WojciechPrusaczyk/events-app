// src/containers/ResetPassword.js
import React from 'react';
import Header from "../../components/structure/header";
import Footer from "../../components/structure/footer";
import "../../styles/containers/home.scss"
import axios from "axios";
import Cookies from "js-cookie";

const ForgotPassword = () => {

    let tempMail;

   const forgotPassword = (email) => {
       axios
          .post(`${window.location.protocol}//${window.location.host}/api/forgot_password/`, {
              email: email,
          }).then(response => {
          console.log(response)
          })
          .catch(error => {
          console.log(error);
          })

   }

    return (
        <div>
            <Header />
            <main>
                <h2>zapomniałeś hasła</h2>
                <ul>
                    <input type="email" onChange={ (e) => {
                        tempMail = e.target.value;
                    }}/>
                    <input type="button" onClick={ () => {
                        forgotPassword(tempMail);
                    }}/>
                </ul>
            </main>
            <Footer />
        </div>
    );
};

export default ForgotPassword;