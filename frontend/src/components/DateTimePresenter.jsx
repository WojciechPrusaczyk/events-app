import React from 'react';
import RightArrow from "../images/icons/rightArrowIcon.svg";
import ClockIcon from "../images/icons/clockIcon.svg";
import DateIcon from "../images/icons/dateIcon.svg";
const DateTimePresenter = ({className = "datetime-presenter", startDate, startTime, endDate, endTime}) => {

  return (
    <div className={className}>
        <div className={className+"-legend"}>
            <img className={className+"-legend-icon"} src={DateIcon}
                 alt="date icon"/>
            <img className={className+"-legend-icon"} src={ClockIcon}
                 alt="clock icon"/>
        </div>
        <div className={className+"-datetime"}>
            <span className={className+"-datetime-date"}> {startDate} </span>
            <span className={className+"-datetime-time"}> {startTime} </span>
        </div>
        <img className={className+"-icon"} src={RightArrow}
             alt="right arrow icon"/>
        <div className={className+"-datetime"}>
            <span className={className+"-datetime-date"}> {endDate} </span>
            <span className={className+"-datetime-time"}> {endTime} </span>
        </div>
    </div>
  );
};

export default DateTimePresenter;
