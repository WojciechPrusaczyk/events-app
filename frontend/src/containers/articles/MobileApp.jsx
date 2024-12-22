// src/containers/ResetPassword.js
import React, {useEffect, useState} from 'react';
import Header from "../../components/structure/header";
import Footer from "../../components/structure/footer";
import "../../styles/containers/home.scss"
import "../../styles/containers/eventsList.scss"
import MobileAppImage from "../../images/MobileApp.png";
import "../../styles/containers/errorPages.scss"

const MobileApp = ({title = "Eventfull"}) => {

    useEffect(() => {
        document.title = title;
    }, []);

    return (
        <div>
            <Header/>
            <main>
                <div className="error-page-container">
                    <div className="text-section text-black">
                        <h1>Wait patiently!</h1>
                        <p>
                            We're still working on mobile app.<br/>
                            The app is planned to expand current experience much further.<br/>
                            With Many new features like: <br/>
                            <ul>
                                <li><b>Mobile app</b></li>
                                <li>Event's ready to print <b>posters generator</b></li>
                                <li>Notifications system</li>
                                <li><b>Qr code system</b> combined with mobile app and posters</li>
                                <li>Event resources managing</li>
                            </ul>
                        </p>
                        <div className="button-section">
                            <button className="home-button btn" onClick={ () => {
                                window.location.href = `${window.location.protocol}//${window.location.host}`;
                            }}>Home</button>
                        </div>
                    </div>
                    <div className="logo-section">
                        <img src={MobileAppImage} alt="mobile app image"/>
                    </div>
                </div>
            </main>
            <Footer/>
        </div>
    );
};

export default MobileApp;