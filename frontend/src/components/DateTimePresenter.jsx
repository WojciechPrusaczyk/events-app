import React from 'react';
import RightArrow from "../images/icons/rightArrowIcon.svg";
import ClockIcon from "../images/icons/clockIcon.svg";
import DateIcon from "../images/icons/dateIcon.svg";
const DateTimePresenter = ({startDate, startTime, endDate, endTime}) => {

  return (
    <div className="datetime-presenter">
        <div className={"datetime-presenter-legend"}>
            <img className="datetime-presenter-legend-icon" src={DateIcon}
                 alt="date icon"/>
            <img className="datetime-presenter-legend-icon" src={ClockIcon}
                 alt="clock icon"/>
        </div>
        <div className={"datetime-presenter-datetime"}>
            <span className={"datetime-presenter-datetime-date"}> {startDate} </span>
            <span className={"datetime-presenter-datetime-time"}> {startTime} </span>
        </div>
        <img className="datetime-presenter-icon" src={RightArrow}
             alt="right arrow icon"/>
        <div className={"datetime-presenter-datetime"}>
            <span className={"datetime-presenter-datetime-date"}> {endDate} </span>
            <span className={"datetime-presenter-datetime-time"}> {endTime} </span>
        </div>
    </div>
  );
};

export default DateTimePresenter;
