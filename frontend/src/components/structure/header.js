import React, {useEffect, useState} from 'react';
import axios from "axios";
import logo from "../../images/logo.png";
import userIcon from "../../images/icons/userIcon.svg";
import addIcon from "../../images/icons/addIcon.svg";
import logout_icon from "../../images/icons/logout_icon.svg";
import listIcon from "../../images/icons/listIcon.svg";
import Cookies from 'js-cookie';

const getCSRFToken = () => {
    let cookieValue = null;
    const cookies = document.cookie.split(';');
    cookies.forEach(cookie => {
        cookie = cookie.trim();
        if (cookie.startsWith('csrftoken=')) {
            cookieValue = cookie.substring('csrftoken='.length, cookie.length);
        }
    });
    return cookieValue;
};
const csrfToken = getCSRFToken(); // Get CSRF token from cookies

const Logout = () => {
    axios
        .post(`${window.location.protocol}//${window.location.host}/api/logout-username/`, {
                username: Cookies.get('username')
            }, {
                headers: {
                    'Authorization': `Bearer ${Cookies.get('token')}`
                }
            })
        .then(response => {
            console.log('User logged out:', response.data);
            Cookies.remove('username');
            window.location.href = '/';

        })
        .catch(err => {
            console.log(err);
        });
}

const CreateEvent = () => {
    axios
        .post(`${window.location.protocol}//${window.location.host}/api/create-event/`, {}, {
            withCredentials: true,
                    headers:{
                        'X-CSRFToken': csrfToken,  // Include CSRF token in headers
                    }
        })
        .then(response => {
            if (response.status === 201 || response.status === 200) {  // Sprawdzanie, czy event został stworzony
                const eventId = response.data.event_id;
                // Przekierowanie do strony edycji wydarzenia
                window.location.href = `${window.location.protocol}//${window.location.host}/edit-event/${eventId}`;
            }
        })
        .catch(error => {
            console.log(error);
        });
}

const Header = (props) => {
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const [user, setUser] = useState(null); // Dodajemy stan użytkownika

    useEffect(() => {
        const checkAuth = async () => {


            axios
                .post(`${window.location.protocol}//${window.location.host}/api/user/`, {
                    username: Cookies.get('username')
                },{
                    withCredentials: true,
                    headers:{
                        'X-CSRFToken': csrfToken,  // Include CSRF token in headers
                    }
                })
                .then(result => {
                    if (result.status === 201) {
                        setIsAuthenticated(true);
                        Cookies.set('username', result.data.user.username)
                    }
                })
                .catch(err => {
                    setIsAuthenticated(false);
                    console.log(err);
                });
        };
        checkAuth();
    }, []);

    const company_name = "Eventful";
    const company_logo = logo;
    const userNavigation = <div className="header-user">
        <button className="header-user-button"
                onClick={() => window.location.href = `${window.location.protocol}//${window.location.host}/join`}>JOIN
        </button>
        <button aria-label="show events list" className="header-user-button" onClick={() => window.location.href = `${window.location.protocol}//${window.location.host}/events-list`}>
            <img src={listIcon} alt="add new event" aria-hidden={true}/>
        </button>
        <button aria-label="add new event" className="header-user-button" onClick={CreateEvent}>
            <img src={addIcon} alt="add new event" aria-hidden={true}/>
        </button>
        <button aria-label="user settings" className="header-user-button" onClick={(e) => {
            Logout();
        }}>
            <img src={logout_icon} alt="user settings" aria-hidden={true}/>
        </button>
    </div>;
    const navigation = <div className="header-user">
        <button className="header-user-button"
                onClick={() => window.location.href = `${window.location.protocol}//${window.location.host}/join`}>JOIN</button>
        <button className="header-user-button" onClick={ () => window.location.href = `${window.location.protocol}//${window.location.host}/register`}> Sign up</button>
        <button className="header-user-button" onClick={ () => window.location.href = `${window.location.protocol}//${window.location.host}/login`}>Log in</button>
    </div>

    return (
        <header className="header">
            <a className="header-logo" href={`${window.location.protocol}//${window.location.host}`}>
                <img src={company_logo} alt="company logo"/>
            </a>
            <div className="header-name">
                <h1>{company_name}</h1>
            </div>
            {isAuthenticated && userNavigation}
            {!isAuthenticated && navigation}
        </header>
    );
};

export default Header;
