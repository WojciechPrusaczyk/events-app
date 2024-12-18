// src/containers/ResetPassword.js
import React, {useEffect, useState} from 'react';
import Header from "../../components/structure/header";
import Footer from "../../components/structure/footer";
import "../../styles/containers/home.scss"
import "../../styles/containers/eventsList.scss"
import ludzik from "../../images/errorBoiBackground.png";
import "../../styles/containers/errorPages.scss"


const NotFound = ({title = "Eventfull: 404 NotFound"}) => {

    useEffect(() => {
        document.title = title;
    }, []);


    return (
        <div>
            <Header/>
            <main>
                <div className="error-page-container">
                    <div className="text-section">
                        <h1>Oops! Page not found</h1>
                        <h2>
                            It seems like the page you're looking for doesn't exist. <br/>
                        </h2>
                        <h3>
                            Don't worry, just go back to the homepage.
                        </h3>
                        <div className="button-section">
                            <button className="home-button btn" type="submit">Home</button>
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

export default NotFound;