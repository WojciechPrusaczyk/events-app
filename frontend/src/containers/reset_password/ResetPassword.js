// src/containers/ResetPassword.js
import React from 'react';
import Header from "../../components/structure/header";
import Footer from "../../components/structure/footer";
import "../../styles/containers/home.scss"
import axios from "axios";
import {useParams} from "react-router-dom";


const ResetPassword = () => {
    const {token } =  useParams();
    let new_password;
    let new_password_repeat;

    const resetPassword = (new_password) => {
       axios
          .post(`${window.location.protocol}//${window.location.host}/api/reset-password/`, {
              password: new_password,
              token: token
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
                <h2>Nowe hasło</h2>
                <ul>
                    <input type="password" onChange={(e) => {
                        new_password = e.target.value;
                    }}/>
                    <input type="password" onChange={(e) => {
                        new_password_repeat = e.target.value;
                    }}/>
                    <input type="button" onClick={() => {
                        resetPassword(new_password);
                    }}/>
                </ul>
            </main>
            <Footer/>
        </div>
    );
};

export default ResetPassword;