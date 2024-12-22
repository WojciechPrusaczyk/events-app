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
import {eventsCategories} from "../../components/Helpers";
import {useSearchParams} from "react-router-dom";
import {Helmet} from "react-helmet";

const Home = ({title = "Eventfull"}) => {
    const [eventsList, setEventsList] = useState([]);
    const [isDataLoaded, setDataLoaded] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();

    const getEvents = () => {
        axios
            .get(`${window.location.protocol}//${window.location.host}/api/get-events-by-keywords/`, {
                userAssociatedEvents: false
            }, {
                withCredentials: true,
            })
            .then((response) => {
                if (response.status === 200) {
                    let responseDataList = [];
                    for (const [key, value] of Object.entries(response.data.categorized_events)) {
                        if (value.length > 0) {
                            responseDataList.push({[key]: value});
                        }
                    }

                    setEventsList(responseDataList);
                    setDataLoaded(true);
                } else if (response.status === 204) {
                    setEventsList([]);
                }
            })
    }

    useEffect(() => {
        document.title = title;
        getEvents();
    }, []);

    const categoryParam = searchParams.get("eventCategory");
    let category = null;
    if (undefined !== categoryParam && "" !== categoryParam) {
        eventsCategories.forEach((item) => {
            const key = Object.keys(item)[0];

            if (key == categoryParam) {
                category = categoryParam;
            }
        });
    }

    let eventsListComponent = null;

    if (null != category && isDataLoaded) {
        const result = eventsList.filter(obj => {
            return Object.keys(obj)[0] === category;
        })
        console.log(Object.values(result[0])[0]);
        eventsListComponent = <EventsListSegment
            Id={"upcoming-events-list-" + category}
            ListTitle={category}
            CategoryName={category}
            EventsList={Object.values(result[0])[0]}
            IsEditList={false}
        />
    } else if (isDataLoaded) {
        eventsListComponent = eventsList.map((category) => {

            const categoryName = Object.keys(category)[0];

            return <EventsListSegment
                Id={"upcoming-events-list-" + Object.keys(category)}
                ListTitle={categoryName}
                CategoryName={categoryName}
                EventsList={Object.values(category)[0]}
                IsEditList={false}
            />
        });
    }

    return (
        <div>
            <Helmet>
                <meta charSet="UTF-8"/>
                <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
                <meta name="description"
                      content="Interaktywna aplikacja do tworzenia wydarzeń, która umożliwia szczegółowe opisy, dodawanie harmonogramów, linków do lokalizacji w Google Maps oraz integrację z kalendarzami. Idealne narzędzie do planowania i udostępniania wydarzeń."/>
                <meta name="keywords"
                      content="tworzenie wydarzeń online, interaktywny opis wydarzenia, planowanie wydarzeń, harmonogram wydarzeń, linki do Google Maps, dodawanie wydarzeń do kalendarza, aplikacja do zarządzania wydarzeniami, narzędzie do organizacji wydarzeń, integracja z kalendarzem Google, planowanie imprez i spotkań"/>
                <meta name="author"
                      content="Wojciech Prusaczyk, Adrian Lewandowski, Maciej Bakalarski, Remigiusz Grzemski, Kacper Kokoszko"/>
            </Helmet>
            <Header/>
            <main>
                {!isDataLoaded && <Loader/>}

                {/* Lista wydarzeń */}
                {isDataLoaded && eventsListComponent}
            </main>
            <Footer/>
        </div>
    );
};

export default Home;