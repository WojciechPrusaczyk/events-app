// src/containers/ResetPassword.js
import React, {useEffect, useState} from 'react';
import Header from "../../components/structure/header";
import Footer from "../../components/structure/footer";
import "../../styles/containers/home.scss"
import axios from "axios";
import EventsListSegment from "../../components/EventsListSegment";
import "../../styles/containers/eventsList.scss"
import Loader from "../../components/loader";
import SegmentFormItem from "../../components/SegmentFormItem";
import eventsList from "../eventsList/EventsList";

const Home = ({title = "Eventful"}) => {
    const [eventsList, setEventsList] = useState([]);
    const [isDataLoaded, setDataLoaded] = useState(false);

    const getEvents = () => {
        axios
            .get(`${window.location.protocol}//${window.location.host}/api/get-events-by-keywords/`, {
                userAssociatedEvents: false
            }, {
                withCredentials: true,
            })
            .then((response) => {
                if(response.status === 200 )
                {
                    let responseDataList = [];
                    for (const [key, value] of Object.entries(response.data.categorized_events)) {
                        if (value.length > 0)
                        {
                            responseDataList.push({[key]: value});
                        }
                    }

                    setEventsList(responseDataList);
                    setDataLoaded(true);
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

    let eventsListComponent = null;
    if (isDataLoaded)
    {
        eventsListComponent = eventsList.map((category) => {
            console.log(Object.keys(category), Object.values(category)[0])

            return <EventsListSegment
                        Id={"upcoming-events-list-"+Object.keys(category)}
                        ListTitle={Object.keys(category)[0]}
                        EventsList={Object.values(category)[0]}
                        IsEditList={false}
                    />
        });
    }

    return (
        <div>
            <Header />
            <main>
                {!isDataLoaded && <Loader />}

                {/* Lista wydarzeń */}
                { isDataLoaded && eventsListComponent }
            </main>
            <Footer />
        </div>
    );
};

export default Home;