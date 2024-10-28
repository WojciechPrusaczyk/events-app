import React, { useEffect, useState } from 'react';
import "../../styles/containers/home.scss";
import "../../styles/containers/joinEvent.scss";
import DataLoader from "../../components/loader";
import DateTimePresenter from "../DateTimePresenter";
import CrownIcon from "../../images/icons/crownIcon.svg";
import EventImage from "../EventImage";
import LocationPin from "../../images/icons/locationPinIcon.svg";
import {formatForBackend, getAddressByLaLng} from "../Helpers";
import { atcb_action } from "add-to-calendar-button";

const EventHeader = ({id = "event-header", className = "event-header", calendarConfig, title, supervisor, iconFilename, location, startDate, startTime, endDate, endTime}) => {

    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const [address, setAddress] = useState("");
    const [startDateTime, setStartDateTime] = useState(new Date(formatForBackend(startDate, startTime)));
    const [endDateTime, setEndDateTime] = useState(new Date(formatForBackend(endDate, endTime)));

    const fetchAddress = async () => {
        const addr = await getAddressByLaLng(location.latitude, location.longitude);
        setAddress(addr);
        setIsDataLoaded(true);
    };
    if (address === "" ) fetchAddress();

    useEffect(() => {

    }, []);

    return (
        <div id={id}>
            {!isDataLoaded && <DataLoader />}
            {isDataLoaded && <div className={className}>
                <div className={className+"-image"}>
                    <EventImage className={className+"-image-element"} name={title} image={iconFilename} size={"medium"}/>
                </div>
                <div className={className+"-content"}>
                    <h1 className={className+"-content-title"}>{title}</h1>
                    <div className={className+"-content-data"}>
                        <DateTimePresenter
                            onClickFunction={ (element) => atcb_action(calendarConfig, element)}
                            className={className+"-content-data-datetime"}
                            startDate={startDateTime.toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                            startTime={startDateTime.toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: false
                            })}
                            endDate={endDateTime.toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                            endTime={endDateTime.toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: false
                            })}
                        />
                        <div className={className+"-content-data-info"}>
                            <div className={className+"-content-data-info-location"}>
                                {((location.placeId == null || location.placeId === "default") || location.formattedAddress == null || location.formattedAddress === "") &&
                                    <a className={className+"-content-data-info-location-container"} target="_blank"
                                       href={`https://maps.google.com/?q=${location.latitude},${location.longitude}`}>
                                        <img src={LocationPin} alt="location pin icon"/>
                                        {address ? address : "Loading address."}
                                    </a>
                                }
                                {(location.placeId !== null && location.placeId !== "default" && location.formattedAddress !== null) &&
                                    <a className={className+"-content-data-info-location-container"} target="_blank"
                                       href={`https://maps.google.com/?q=${location.latitude},${location.longitude}`}>
                                        <img src={LocationPin} alt="location pin icon"/>
                                        {location.formattedAddress}
                                    </a>
                                }
                            </div>
                            <div className={className+"-content-data-info-supervisor"}>
                                <h1 className={className+"-content-data-info-supervisor-container"}>
                                    <img src={CrownIcon} alt="crown icon" />
                                    {supervisor}
                                </h1>
                            </div>
                        </div>
                    </div>
                </div>
            </div>}
        </div>
    );
};

export default EventHeader;
