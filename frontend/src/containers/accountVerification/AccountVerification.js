// src/containers/AccountVerification.js
import React from 'react';
import Header from "../../components/structure/header";
import Footer from "../../components/structure/footer";
import "../../styles/containers/home.scss"
import axios from "axios";
import Cookies from "js-cookie";

const AccountVerification = () => {


    return (
        <div>
            <Header />
            <main>
                <h2>Weryfikacja</h2>
            </main>
            <Footer />
        </div>
    );
};

export default AccountVerification;