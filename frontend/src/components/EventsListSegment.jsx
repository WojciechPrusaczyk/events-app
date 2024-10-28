import React, { useState, useEffect } from 'react';
import EventsList from "../containers/eventsList/EventsList";
import {generateColorFromText, getShortName} from "./Helpers";
import SettingsIcon from "../images/icons/settingsIcon.svg";
import Cookies from "js-cookie";

const EventsListSegment = ({Id = "events-list", ListTitle = "", ClassName, EventsList = [], HandleMoreButton, IsEditList = false}) => {
    let EventsListComponent = null;
    if (EventsList.length > 0)
    {
        EventsListComponent = EventsList.map((item, index) => {
            const shortName = getShortName(item.name);
            const {lightHex, darkHex} = generateColorFromText(shortName);
            let link = "";
            if(IsEditList && item.supervisor.username === Cookies.get('username'))
            {
                link = "edit-event/"+item.id;
            }
            else if(IsEditList)
            {
                link = "event/"+item.token;
            }
            else {
                link = "join/"+item.joinCode;
            }

            return <a key={item.id} className="events-list-events-item" href={`${window.location.protocol}//${window.location.host}/${link}`}>
                { ( null !== item.iconFilename) &&
                    <img className="events-list-events-item-image dp-large" src={`/media/images/${item.iconFilename}`} alt="" />}
                { ( null === item.iconFilename || undefined === item.iconFilename) &&
                    <span className="events-list-events-item-image dp-large" style={{
                        backgroundColor: lightHex,
                        color: darkHex
                    }}>{shortName}</span>}
                {(IsEditList && item.supervisor.username === Cookies.get('username')) && <img className="events-list-events-item-image-settings" src={SettingsIcon} alt="settings icon" aria-hidden={true}/>}
                <h2 className="events-list-events-item-title" title={item.name}>{item.name}</h2>
            </a>
        });
    }

    return (
        <p id={Id} className={`${ClassName ? ClassName + " " : ""}events-list`} style={{display: (EventsList.length > 0)?"":"none"}}>
            { "" !== ListTitle && <a aria-hidden={true} href={`${window.location.protocol}//${window.location.host}`} onClick={ () => {
                    if (undefined !== HandleMoreButton) {
                        HandleMoreButton();
                    }
                }} aria-label="show this category" className="events-list-title">{ListTitle}</a>}
            <div className="events-list-events">
                {( null !== EventsListComponent ) && EventsListComponent}
            </div>
        </p>
    );
}

export default EventsListSegment;