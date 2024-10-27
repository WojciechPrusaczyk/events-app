// src/containers/ResetPassword.js
import React, {useEffect, useState} from 'react';
import Header from "../../components/structure/header";
import Footer from "../../components/structure/footer";
import "../../styles/containers/home.scss"
import axios from "axios";
import EventsListSegment from "../../components/EventsListSegment";
import "../../styles/containers/eventsList.scss"

const Home = ({title = "Eventful"}) => {
    const [eventsList, setEventsList] = useState([]);

    const getEvents = () => {
        axios
            .get(`${window.location.protocol}//${window.location.host}/api/get-events/`, {
                withCredentials: true,
            })
            .then((response) => {
                if(response.status === 200 )
                {
                    setEventsList(response.data.events);
                }
                else if(response.status === 204 )
                {
                    setEventsList([]);
                }
            })
    }

    useEffect(() => {
        document.title = title;
        getEvents();
    }, []);

    return (
        <div>
            <Header />
            <main>
                <EventsListSegment
                    Id="upcoming-events-list"
                    ListTitle={"All associated events"}
                    EventsList={eventsList}
                    IsEditList={false}
                />
            </main>
            <Footer />
        </div>
    );
};

export default Home;