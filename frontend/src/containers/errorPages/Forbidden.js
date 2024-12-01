// src/containers/ResetPassword.js
import React, {useEffect, useState} from 'react';
import Header from "../../components/structure/header";
import Footer from "../../components/structure/footer";
import "../../styles/containers/home.scss"
import "../../styles/containers/eventsList.scss"

const ServerError = ({title = "Eventfull"}) => {

    useEffect(() => {
        document.title = title;
    }, []);

    return (
        <div>
            <Header />
            <main>
                <h1>Error 403</h1>
            </main>
            <Footer />
        </div>
    );
};

export default ServerError;