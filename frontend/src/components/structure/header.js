import React, {useEffect, useState} from 'react';
import axios from "axios";
import logo from "../../images/logo.png";
import userIcon from "../../images/icons/userIcon.svg";
import addIcon from "../../images/icons/addIcon.svg";
import listIcon from "../../images/icons/listIcon.svg";
import notificationIcon from "../../images/icons/notificationIcon.svg";
import { ReactComponent as ConfirmIcon } from "../../images/icons/confirmIcon.svg";
import { ReactComponent as CloseIcon } from "../../images/icons/closeIcon.svg";
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
    const [user, setUser] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [notificationsShown, showNotifications] = useState(false);
    const [isLoadingNotifications, setIsLoadingNotifications] = useState(true);

    const GetNotifications = async () => {
        axios
            .post(`${window.location.protocol}//${window.location.host}/api/get-notifications`, {
                username: Cookies.get('username')
            },{ withCredentials: true })
            .then(result => {
                if (result.status === 200) {
                    setNotifications(result.data.notifications);
                    setIsLoadingNotifications(false);
                }
            })
            .catch(err => {
                console.log(err);
                setIsLoadingNotifications(false);
            });
    }

    const AcceptUser = async (userId, eventId, accepted) => {
        axios
            .post(`${window.location.protocol}//${window.location.host}/api/accept-user`, {
                    userId: userId,
                    eventId: eventId,
                    accepted: accepted,
                }, { withCredentials: true })
            .then(response => {
                GetNotifications();
                return response.status === 200;
            })
            .catch(err => {
                console.log(err);
                return false;
            });
    }

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

        if ( notifications.length === 0 )
        {
            GetNotifications();
        }

    }, []);

    const company_name = "Eventfull";
    const company_logo = logo;

    let notificationsList =  notifications.map((entity) => {
        return <li className={"notificationsList-item"}>
            <span className={"notificationsList-item-text"}
                  title={`User ${entity.user_name} is asking for acceptation to ${entity.event_name}.`} >
                    User <b>{entity.user_name}</b> is asking for acceptation to <b>{entity.event_name}.</b>
            </span>
            <button className={"notificationsList-item-btn accept"} onClick={() => {
                setIsLoadingNotifications(true);
                const isRequestSuccessfull = AcceptUser(entity.user_id, entity.event_id, true);

                if (isRequestSuccessfull) {
                    GetNotifications();
                }
            }} title={"Accept"}>
                <ConfirmIcon className="notificationsList-item-btn-icon accept" />
            </button>
            <button className={"notificationsList-item-btn refuse"} onClick={() => {
                setIsLoadingNotifications(true);
                const isRequestSuccessfull = AcceptUser(entity.user_id, entity.event_id, false);

                if (isRequestSuccessfull) {
                    GetNotifications();
                }
            }} title={"Refuse"}>
                <CloseIcon className="notificationsList-item-btn-icon refuse" />
            </button>
        </li>
    });

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
        <button aria-label="add new event" className={`header-user-button${(notificationsList.length > 0)?" ping":""}`} onClick={ () => {
                setIsLoadingNotifications(true);
                GetNotifications();
                showNotifications(!notificationsShown);
            }}>
            {(notificationsList.length > 0) && <div className={"ping-mark"}></div>}
            <img src={notificationIcon} alt="show notifications" aria-hidden={true}/>
        </button>
        { notificationsShown &&
            <div id={"notifications"}>
                {((notificationsList.length > 0) && !isLoadingNotifications) &&
                    <ul className={"notificationsList"}>
                        {notificationsList}
                    </ul>
                }
                {(!(notificationsList.length > 0) && !isLoadingNotifications) &&
                    <div className={"notificationsDiv"}>No notifications found.</div>
                }
                {isLoadingNotifications &&
                    <div className={"notificationsDiv"}>Loading...</div>
                }
            </div>
        }
        <button aria-label="user settings" className="header-user-button" onClick={(e) => {
            Logout();
        }}>
            <img src={userIcon} alt="user settings" aria-hidden={true}/>
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
