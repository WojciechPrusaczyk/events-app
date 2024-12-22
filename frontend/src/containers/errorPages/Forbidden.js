// src/containers/ResetPassword.js
import React, {useEffect, useState} from 'react';
import Header from "../../components/structure/header";
import Footer from "../../components/structure/footer";
import "../../styles/containers/home.scss"
import "../../styles/containers/eventsList.scss"
import ludzik from "../../images/errorBoiBackground.png";
import "../../styles/containers/errorPages.scss"

const ServerError = ({title = "Eventfull"}) => {

    useEffect(() => {
        document.title = title;
    }, []);

    return (
        <div>
            <Header/>
            <main>
                <div className="error-page-container">
                    <div className="text-section">
                        <h1>Oops! Access Forbidden</h1>
                        <h2>
                            It seems like you don't have permission to access this page. <br/>
                        </h2>
                        <h3>
                            Don't worry, just go back to the homepage.
                        </h3>
                        <div className="button-section">
                            <button className="home-button btn" onClick={() => {
                                window.location.href = `${window.location.protocol}//${window.location.host}`;
                            }}>Home
                            </button>
                        </div>
                    </div>
                    <div className="logo-section">
                        <img src={ludzik} alt="ludzik"/>
                    </div>
                </div>
            </main>
            <Footer/>
        </div>
    );
};

export default ServerError;