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
                {((eventData.location.placeId == null || eventData.location.placeId === "default") && eventData.location.formattedAddress == null) &&
                    <a className={"show-event-address"}
                       href={`https://maps.google.com/?q=${eventData.location.latitude},${eventData.location.longitude}`}>
                        {address ? address : "Loading address."}
                    </a>
                }
                {(eventData.location.placeId !== null && eventData.location.placeId !== "default" && eventData.location.formattedAddress !== null) &&
                    <a className={"show-event-address"}
                       href={`https://maps.google.com/?q=${eventData.location.latitude},${eventData.location.longitude}`}>
                        {eventData.location.formattedAddress}
                    </a>
                }
            </p>
            <p>
                <div className={"show-event-date"}>
                    <span>Start:</span>
                    <span>{eventData.starttime.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}</span>
                    <span>{eventData.starttime.toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                    })}</span>
                </div>
            </p>
            <p>
                <div className={"show-event-date"}>
                    <span>End:</span>
                    <span>{eventData.endtime.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}</span>
                    <span>{eventData.endtime.toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                    })}</span>
                </div>
            </p>
            <p>
                <h1 className={"show-event-supervisor"}>{eventData.supervisor.username}</h1>
            </p>
            <p>
                <button className={"show-event-join"}>{eventData.joinApproval ? "Join" : "Send join request"}</button>
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
