import React, {useEffect, useState} from 'react';
import LocationPin from "../../images/icons/locationPinIcon.svg";
import CrownIcon from "../../images/icons/crownIcon.svg";
import ClockIcon from "../../images/icons/clockIcon.svg";
import {formatForBackend, getAddressByLaLng, quillToHtml} from "../Helpers";

const EventCalendar = ({ segments }) => {

    // Grupowanie i sortowanie segmentów według dni
    const groupedSegments = segments.reduce((acc, segment) => {
        const date = new Date(segment.starttime).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric'
        });

        if (!acc[date]) acc[date] = [];
        acc[date].push(segment);

        // Sortowanie segmentów w dniu według starttime
        acc[date].sort((a, b) => new Date(a.starttime) - new Date(b.starttime));

        return acc;
    }, {});

    const [activeSegments, setActiveSegments] = useState(
        Object.keys(groupedSegments).reduce((acc, day) => {
            acc[day] = groupedSegments[day][0];
            return acc;
        }, {})
    );

    const handleSegmentClick = (day, segment) => {
        setActiveSegments((prev) => ({ ...prev, [day]: segment }));
    };

    const [addresses, setAddresses] = useState({});

    useEffect(() => {
        // Pobierz adresy dla każdego segmentu na podstawie lokalizacji
        segments.forEach(async (segment) => {
            const address = await getAddressByLaLng(segment.location.latitude, segment.location.longitude);
            setAddresses((prevAddresses) => ({
                ...prevAddresses,
                [segment.id]: address,
            }));
        });
    }, [segments]);

    return (
        <div className="event-schedule">
            {Object.entries(groupedSegments).map(([day, daySegments]) => (
                <div className="event-schedule-day" key={day}
                     id={`day-${new Date(day).getDate()}-${new Date(day).toLocaleString('default', { month: 'short' })}-${new Date(day).toLocaleString('default', { year: 'numeric' })}`}>
                    <div className="event-schedule-day-header">
                        <div className="event-schedule-day-header-date">
                            <span className="event-schedule-day-header-date-day">{new Date(day).getDate()}</span>
                            <span className="event-schedule-day-header-date-month">
                                {new Date(day).toLocaleString('en-GB', { month: 'short' })}
                            </span>
                        </div>
                        <span className="event-schedule-day-header-weekday">
                            {new Date(day).toLocaleString('en-GB', { weekday: 'long' }).toUpperCase()}
                        </span>
                    </div>
                    <div className="event-schedule-day-container">
                        <div className="event-schedule-day-container-list">
                            {daySegments.map((segment) => (
                                <p
                                    key={segment.id}
                                    className={`event-schedule-day-container-list-element${segment === activeSegments[day] ? ' active' : ''}`}
                                    onClick={() => handleSegmentClick(day, segment)}
                                >
                                    <p className={"segment-list-header"}>
                                        <div className={"segment-list-header-dot"}></div>
                                        { (segment !== activeSegments[day]) && <span
                                            className={"segment-list-header-text"}>{new Date(segment.starttime).toLocaleTimeString('en-GB', {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })} - {new Date(segment.endtime).toLocaleTimeString('en-GB', {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}</span>}
                                        { (segment === activeSegments[day]) && <span className={"segment-list-header-text"}>{segment.name}</span>}
                                    </p>
                                    {(segment !== activeSegments[day]) && <p className={"segment-list-content-name"}>
                                        <span>{segment.name}</span>
                                    </p>}
                                    {(segment === activeSegments[day]) && <p className={"segment-list-content-info"}>
                                        <a className={"segment-list-content-info-location"} target="_blank"
                                           href={`https://maps.google.com/?q=${segment.location.latitude},${segment.location.longitude}`}>
                                            <img src={LocationPin} alt="location pin icon"/>
                                            <span>
                                                {addresses[segment.id] || 'Loading address...'}
                                            </span>
                                        </a>
                                        <div className={"segment-list-content-info-speaker"}>
                                            <img src={CrownIcon} alt="speaker icon"/>
                                            <span>{segment.speaker.username}</span>
                                        </div>
                                        <div className={"segment-list-content-info-time"}>
                                            <img src={ClockIcon} alt="clock icon"/>
                                            <span>
                                                {new Date(segment.starttime).toLocaleTimeString('en-GB', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })} - {new Date(segment.endtime).toLocaleTimeString('en-GB', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </span>
                                        </div>
                                    </p>}
                                </p>
                            ))}
                            <p className={"event-schedule-day-container-list-element"}>
                                <p className={"segment-list-header"}>
                                    <div className={"segment-list-header-dot"}></div>
                                </p>
                            </p>
                        </div>
                        <div className="event-schedule-day-description">
                            <h2 className="event-schedule-day-description-header">{activeSegments[day].name}</h2>
                            <p className="event-schedule-day-description-content" dangerouslySetInnerHTML={{ __html: quillToHtml(activeSegments[day].description) }}></p>
                            {/* Miejsce na zdjęcia */}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default EventCalendar;
