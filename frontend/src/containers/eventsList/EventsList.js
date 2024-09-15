import React, {Component} from 'react';
import Header from "../../components/structure/header";
import Footer from "../../components/structure/footer";
import GoogleIcon from "../../images/icons/google_color.png"
import FacebookIcon from "../../images/icons/facebook_color.png"
import AppleIcon from "../../images/icons/apple_color.png"
import "../../styles/containers/login.scss"
import axios from "axios";
import PasswordInput from "../../components/passwordInput";
import Cookies from 'js-cookie';
import Loader from "../../components/loader";


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
class EventsList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            eventsList: null,
        };
        this.getEvents = this.getEvents.bind(this);
    }

    componentDidMount() {
        this.getEvents();
    }

    getEvents() {
        axios
            .post(`${window.location.protocol}//${window.location.host}/api/get-events/`, {}, {
                withCredentials: true,
                headers:{
                        'X-CSRFToken': csrfToken,  // Include CSRF token in headers
                    }
            })
            .then((response) => {
                if(response.status === 200 )
                {
                    const prevState = this.state;
                    prevState.eventsList = response.data.events;
                    this.setState(prevState);
                }
                else if(response.status === 204 )
                {
                    const prevState = this.state;
                    prevState.eventsList = [];
                    this.setState(prevState);
                }
            })
    }

    render() {
        let eventsList = null;
        if ( null !== this.state.eventsList && this.state.eventsList.length > 0)
        {
            eventsList = this.state.eventsList.map((event, index) => {
                const imageUrl = event.iconFilename ? `${window.location.protocol}//${window.location.host}/media/images/${event.iconFilename}` : '';
                return <p key={event.id}>
                    <h2>{event.name}</h2>
                    {event.icon && (
                        <img
                            src={imageUrl}
                            alt={`${event.name} image`}
                            style={{width: "150px", height: "auto"}} // Set image dimensions as needed
                        />
                    )}
                    <a href={`${window.location.protocol}//${window.location.host}/edit-event/${event.id}`}>edit
                        event</a>
                </p>
            });
        }

        return (
            <div>
                <Header/>
                <main>
                    {this.state.eventsList === null && <Loader />}
                    {this.state.eventsList === [] && <div className="loader">
                        Found no events associated with you.
                    </div>}
                    { (this.state.eventsList !== null && this.state.eventsList.length > 0) && <div>
                        {eventsList}
                    </div>}
                </main>
                <Footer/>
            </div>
        );
    }
}

export default EventsList;