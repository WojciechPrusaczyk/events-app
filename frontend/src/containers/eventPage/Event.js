import React, { useEffect, useState } from 'react';
import Header from "../../components/structure/header";
import Footer from "../../components/structure/footer";
import "../../styles/containers/home.scss";
import axios from "axios";
import "../../styles/containers/event.scss";
import {useNavigate, useParams} from "react-router-dom";
import {formatDateForInput, formatTimeForInput, getAddressByLaLng} from "../../components/Helpers";
import DataLoader from "../../components/loader";
import EventHeader from "../../components/EventPage/EventHeader";
import Countdown from "../../components/EventPage/Countdown";
import Calendar from "../../components/EventPage/Calendar";
import EventSchedule from "../../components/EventPage/EventSchedule";
import EventDescription from "../../components/EventPage/EventDescription";
import Cookies from "js-cookie";

const Event = ({title = "Eventfull"}) => {
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
                        id: data.id,
                        name: data.name,
                        description: data.description,
                        rules: (data.rules != "" && "null" != data.rules)?data.rules:null,
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

                    document.title = "Eventfull: "+data.name;

                    getAddressByLaLng(data.location.latitude, data.location.longitude).then( (address) => {
                        setCalendarConfig({
                            name: data.name,
                            startDate: formatDateForInput(data.starttime),
                            startTime: formatTimeForInput(data.starttime),
                            endDate: formatDateForInput(data.endtime),
                            endTime: formatTimeForInput(data.endtime),
                            options: ["Google", "iCal", "Apple", "MicrosoftTeams", "Outlook.com"],
                            organizer: `${data.supervisor.username}|${data.supervisor.email}`,
                            timezone: "Europe/Warsaw",
                            location: address
                        });
                    })

                    setSegmentsList(data.segments);
                    setIsDataLoaded(true);
                }
            });
    }

    const leaveEvent = () => {
        axios
            .post(`${window.location.protocol}//${window.location.host}/api/leaveEvent/`, {
                eventId: eventData.id
            }, {
                withCredentials: true
            })
            .then((response) => {
                if (response.status === 200) {
                    window.location.href = `${window.location.protocol}//${window.location.host}/`
                }
            });
    }

    return (
        <div>
            <Header />
            <main>
                {!isDataLoaded && <DataLoader />}
                {isDataLoaded && <div className={"event-page-wrapper"}>
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
                    <EventDescription desc={eventData.description} rules={eventData.rules}/>
                    <div className={"event-timers"}>
                        <Countdown id={"event-timer-start"} className={"event-timers-start"} title={"start countdown"} countDownTo={`${eventData.startDate}T${eventData.startTime}`}/>
                        <Countdown id={"event-timer-end"} className={"event-timers-end"} title={"end countdown"} countDownTo={`${eventData.endDate}T${eventData.endTime}`}/>
                    </div>
                    <p className={"event-calendar-container"}>
                        <Calendar className={"event-calendar"} segmentsList={segmentsList} />
                    </p>
                    <EventSchedule segments={segmentsList} />
                    { ((Cookies.get('username') != eventData.supervisor.username) && eventData.joinApproval) &&
                        <button className={"btn"} onClick={leaveEvent}>Leave event</button>}
                </div> }
            </main>
            <Footer />
        </div>
    );
};

export default Event;
