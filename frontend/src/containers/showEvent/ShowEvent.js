import React, {useEffect, useState} from 'react';
import Header from "../../components/structure/header";
import Footer from "../../components/structure/footer";
import "../../styles/containers/home.scss";
import "../../styles/containers/newPassword.scss";
import axios from "axios";
import { useParams } from "react-router-dom";
import DataLoader from "../../components/loader";
import {generateColorFromText, getAddressByLaLng, getShortName} from "../../components/Helpers";
import EventImage from "../../components/EventImage";



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

        event = <div>
            <p>
                <h1>{eventData.name}</h1>
            </p>
            <p>
                <EventImage name={eventData.name} image={eventData.iconFilename} size={"medium"}/>
            </p>
            <p>
                {((eventData.location.placeId == null || eventData.location.placeId === "default") && eventData.location.formattedAddress == null) &&
                    <a href={`https://maps.google.com/?q=${eventData.location.latitude},${eventData.location.longitude}`}>
                        {address ? address : "Loading address."}
                    </a>
                }
                {(eventData.location.placeId !== null && eventData.location.placeId !== "default" && eventData.location.formattedAddress !== null) &&
                    <a href={`https://maps.google.com/?q=${eventData.location.latitude},${eventData.location.longitude}`}>
                        {eventData.location.formattedAddress}
                    </a>
                }
            </p>
                <span>Start:</span>
                <span>{eventData.starttime.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                <span>{eventData.starttime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
            <p>
            </p>
                <span>End:</span>
                <span>{eventData.endtime.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                <span>{eventData.endtime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
            <p>
                <h1>{eventData.supervisor.username}</h1>
            </p>
            <p>
                <button>{eventData.joinApproval ? "Join" : "Send join request"}</button>
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
