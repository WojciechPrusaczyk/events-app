import React, {useEffect, useState} from 'react';
import Header from "../../components/structure/header";
import Footer from "../../components/structure/footer";
import "../../styles/containers/home.scss";
import "../../styles/containers/showEvent.scss";
import axios from "axios";
import { useParams } from "react-router-dom";
import DataLoader from "../../components/loader";
import { getAddressByLaLng } from "../../components/Helpers";
import EventImage from "../../components/EventImage";
import TimeIcon from "../../images/icons/clockIcon.svg"
import DateIcon from "../../images/icons/dateIcon.svg"
import CrownIcon from "../../images/icons/crownIcon.svg"
import LocationPin from "../../images/icons/locationPinIcon.svg"

const ShowEvent = () => {
    const { code } = useParams();
    const [error, setError] = useState("");
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const [eventData, setEventData] = useState({});
    const [address, setAddress] = useState("");

    const getEvent = () => {
        axios
            .post(`${window.location.protocol}//${window.location.host}/api/get-event/`, {
                code: code.toLowerCase()
            }, { withCredentials: true})
            .then(response => {
                let data = response.data.detail;
                data.starttime = new Date(data.starttime);
                data.endtime = new Date(data.endtime);

                setEventData(data);
                setIsDataLoaded(true);
            })
            .catch(() => {
                setError("Error occurred, try again later.");
            });
    };

    const fetchAddress = async () => {
        const addr = await getAddressByLaLng(eventData.location.latitude, eventData.location.longitude);
        setAddress(addr);
    };

    useEffect(() => {
        getEvent();
    }, []);
    let event = null;

    if(isDataLoaded)
    {
        if (address === "" ) fetchAddress();

        event = <div className={"show-event"}>
            <p>
                <h1 className={"show-event-title"}>{eventData.name}</h1>
            </p>
            <p>
                <EventImage className={"show-event-image"} name={eventData.name} image={eventData.iconFilename}
                            size={"large"}/>
            </p>
            <p>
                {((eventData.location.placeId == null || eventData.location.placeId === "default") || eventData.location.formattedAddress == null || eventData.location.formattedAddress === "") &&
                    <a className={"show-event-address"} target="_blank"
                       href={`https://maps.google.com/?q=${eventData.location.latitude},${eventData.location.longitude}`}>
                        <img src={LocationPin} alt="location pin icon"/>
                        {address ? address : "Loading address."}
                    </a>
                }
                {(eventData.location.placeId !== null && eventData.location.placeId !== "default" && eventData.location.formattedAddress !== null) &&
                    <a className={"show-event-address"} target="_blank"
                       href={`https://maps.google.com/?q=${eventData.location.latitude},${eventData.location.longitude}`}>
                        <img src={LocationPin} alt="location pin icon"/>
                        {eventData.location.formattedAddress}
                    </a>
                }
            </p>
            <p>
                <div className={"show-event-date"}>
                    <span className={"show-event-date-title"}>Start:</span>
                    <span className={"show-event-date-time"}><img src={DateIcon} alt="calendar icon"/>
                        {eventData.starttime.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}</span>
                    <span className={"show-event-date-date"}><img src={TimeIcon} alt="time icon"/>
                        {eventData.starttime.toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                    })}</span>
                </div>
            </p>
            <p>
                <div className={"show-event-date"}>
                    <span className={"show-event-date-title"}>End:</span>
                    <span className={"show-event-date-time"}><img src={DateIcon} alt="calendar icon" />
                        {eventData.endtime.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}</span>
                    <span className={"show-event-date-date"}><img src={TimeIcon} alt="time icon"/>
                        {eventData.endtime.toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                    })}</span>
                </div>
            </p>
            <p>
                <h1 className={"show-event-supervisor"}>
                    <img src={CrownIcon} alt="crown icon" />
                    {eventData.supervisor.username}
                </h1>
            </p>
            <p>
                <button className={"show-event-join"}>{(eventData.joinapproval == false) ? "Join" : "Send join request"}</button>
            </p>
        </div>
    }

    return (
        <div>
            <Header/>
            <main>
                {!isDataLoaded && <DataLoader title={"Loading event, please wait."} />}
                {isDataLoaded && event}
            </main>
            <Footer />
        </div>
    );
};

export default ShowEvent;
