import React from 'react';
import axios from "axios";
import logo from "../../images/logo.png"

const GetUser = (token) => {

    let user = null;
    if (null != token)
    {

        axios
            .get(`${window.location.protocol}//${window.location.host}/api/user?`, {

            })
            .then( result => {
                user = result.data;
                console.log(result.data)
            })
            .catch(err => console.log(err));

    }
    return user;
}

const Header = (props) => {

    let user = GetUser(props.token);
    const company_name = "Eventful";
    const company_logo = logo
    const userNavigation = <div className="header-user">

    </div>;

    return (
        <header className="header">
            <div className="header-logo">
                <img src={company_logo} alt="company logo"/>
            </div>
            <div className="header-name">
                <h1>{company_name}</h1>
            </div>
            { null != user && userNavigation }
        </header>
    );
};

export default Header;