import React, { useEffect, useState } from 'react';
import "../../styles/containers/home.scss";
import "../../styles/containers/joinEvent.scss";
import UpArrow from "../../images/icons/upArrow.svg";

const Calendar = ({ id = "event-calendar", className = "event-calendar", segmentsList }) => {
    const [days, setDays] = useState([]);
    const currentDayIndex = 2;

    useEffect(() => {
        const today = new Date();

        const generateWeekDays = () => {
            const weekDays = [];

            for (let i = -2; i <= 4; i++) {
                const day = new Date(today);
                day.setDate(today.getDate() + i);
                const segmentsOnThisDay = segmentsList.some(segment => {
                    const segmentDate = new Date(segment.starttime).toDateString();
                    return segmentDate === day.toDateString();
                });
                weekDays.push({
                    date: day,
                    hasEvent: segmentsOnThisDay
                });
            }
            return weekDays;
        };

        setDays(generateWeekDays());
    }, [segmentsList]);

    return (
        <div id={id} className={className}>
            {days.map((day, index) => (
                <div
                    key={index}
                    className={`${className}-day${index === currentDayIndex ? ' current-day' : ''}${day.hasEvent ? ' event-day' : ''}`}
                    onClick={ () => {
                        if (day.hasEvent) {
                            const elem = document.getElementById(`day-${day.date.getDate()}-${day.date.toLocaleString('default', { month: 'short' })}-${day.date.toLocaleString('default', { year: 'numeric' })}`);
                            elem.scrollIntoView({behavior: "smooth"})
                        }
                    }}
                >
                    <span className={className+"-day-date"}>{day.date.getDate()}</span>
                    <span className={className+"-day-month"}>{day.date.toLocaleString('default', { month: 'short' })}</span>
                    <span className={className+"-day-weekday"}>{day.date.toLocaleString('default', { weekday: 'short' })}</span>
                    { (index === currentDayIndex ) && <img className={className+"-day-current"} src={UpArrow} alt="current day icon"/>}
                </div>
            ))}
        </div>
    );
};

export default Calendar;
