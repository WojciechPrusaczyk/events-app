import React, { useEffect, useState } from 'react';
import Header from "../../components/structure/header";
import Footer from "../../components/structure/footer";
import "../../styles/containers/home.scss";
import axios from "axios";
import "../../styles/containers/event.scss";
import {useNavigate, useParams} from "react-router-dom";
import {formatDateForInput, formatTimeForInput} from "../../components/Helpers";
import DataLoader from "../../components/loader";
import EventHeader from "../../components/EventPage/EventHeader";
import Countdown from "../../components/EventPage/Countdown";

const Event = ({title = "Eventful"}) => {
    const navigate = useNavigate();
    const { eventToken } = useParams();
    const [eventData, setEventData] = useState({});
    const [segmentsList, setSegmentsList] = useState([]);

    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const [calendarConfig, setCalendarConfig] = useState({});

    useEffect(() => {
        document.title = title;
        getEvent();
    }, []);

    const getEvent = () => {
        axios
            .post(`${window.location.protocol}//${window.location.host}/api/get-event/`, {
                token: eventToken
            }, {
                withCredentials: true
            })
            .then((response) => {
                if (response.status === 200) {
                    const data = response.data.detail;
                    setEventData({
                        name: data.name,
                        description: (data.description != "")?JSON.parse(data.description):"",
                        rules: (data.rules != "")?JSON.parse(data.rules):"",
                        startDate: formatDateForInput(data.starttime),
                        startTime: formatTimeForInput(data.starttime),
                        endDate: formatDateForInput(data.endtime),
                        endTime: formatTimeForInput(data.endtime),
                        supervisor: data.supervisor,
                        isActive: data.isactive,
                        isPublic: data.ispublic,
                        joinApproval: data.joinapproval,
                        image: data.iconFilename,
                        joinCode: data.joinCode,
                        location: data.location,
                    })

                    document.title = "Eventful: "+data.name;

                    setCalendarConfig({
                        name: data.name,
                        startDate: formatDateForInput(data.starttime),
                        startTime: formatTimeForInput(data.starttime),
                        endDate: formatDateForInput(data.endtime),
                        endTime: formatTimeForInput(data.endtime),
                        options: ["Google", "iCal", "Apple", "MicrosoftTeams", "Outlook.com"],
                        organizer: `${data.supervisor.username}|${data.supervisor.email}`,
                        timezone: "Europe/Warsaw",
                        location: `https://maps.google.com/?q=${data.location.latitude},${data.location.longitude}`
                    });

                    setSegmentsList(data.segments);
                    setIsDataLoaded(true);
                }
            });
    }


    return (
        <div>
            <Header />
            <main>
                {!isDataLoaded && <DataLoader />}
                {isDataLoaded && <div>
                    <EventHeader
                        title={eventData.name}
                        supervisor={eventData.supervisor.username}
                        calendarConfig={calendarConfig}
                        iconFilename={eventData.image}
                        location={eventData.location}
                        startDate={eventData.startDate}
                        startTime={eventData.startTime}
                        endDate={eventData.endDate}
                        endTime={eventData.endTime}
                    />
                    <div className={"event-timers"}>
                        <Countdown id={"event-timer-start"} className={"event-timers-start"} title={"start countdown"} countDownTo={`${eventData.startDate}T${eventData.startTime}`}/>
                        <Countdown id={"event-timer-end"} className={"event-timers-end"} title={"end countdown"} countDownTo={`${eventData.endDate}T${eventData.endTime}`}/>
                    </div>
                </div> }

            </main>
            <Footer />
        </div>
    );
};

export default Event;
