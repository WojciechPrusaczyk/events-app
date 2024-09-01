import React, { useState, useEffect } from 'react';

const TimePicker = ({ handleChange, id, timeValue, className }) => {
  const actualId = id || "time-picker";
  const actualClassName = className || "time-picker";

  // Function to parse time from input format "HH:MM"
  const parseTime = (timeStr) => {
    if (timeStr) {
      const timeParts = timeStr.split(":");
      return {
        hour: timeParts[0] || "",
        minute: timeParts[1] || "",
      };
    }
    return { hour: "", minute: "" };
  };

  const [hour, setHour] = useState("");
  const [minute, setMinute] = useState("");

  useEffect(() => {
    const { hour, minute } = parseTime(timeValue);
    setHour(hour);
    setMinute(minute);
  }, [timeValue]);

  const synchronizeTime = (newHour, newMinute) => {
    let tempMinuteValue = newMinute !== undefined ? newMinute : minute;
    let tempHourValue = newHour !== undefined ? newHour : hour;

    // ensuring that value can loop
    tempHourValue = tempHourValue > 23 ? 0 : tempHourValue
    tempHourValue = tempHourValue < 0 ? 23 : tempHourValue
    let hourValue = "";
    if(tempHourValue.length === 3)
    {
        hourValue = tempHourValue.toString().substring(1);
    } else {
        hourValue = tempHourValue.toString().padStart(2, '0');
    }

    // ensuring that value can loop
    tempMinuteValue = tempMinuteValue > 59 ? 0 : tempMinuteValue
    tempMinuteValue = tempMinuteValue < 0 ? 29 : tempMinuteValue
    let minuteValue = "";
    if(tempMinuteValue.length === 3)
    {
        minuteValue = tempMinuteValue.toString().substring(1);
    } else {
        minuteValue = tempMinuteValue.toString().padStart(2, '0');
    }

    setHour(hourValue);
    setMinute(minuteValue);

    // Check if both hour and minute are valid to update parent
    if (hourValue && minuteValue) {
      const formattedTime = `${hourValue}:${minuteValue}`;
      handleChange({ target: { value: formattedTime } });
    }
  };

  return (
    <div className={actualClassName}>
      {/* Hour */}
      <input
        id={`${actualId}-hour`}
        type="number"
        aria-label="hour"
        min="-1"
        max="24"
        placeholder="hh"
        value={hour}
        onChange={(e) => {
          const newHour = e.target.value;
          synchronizeTime(newHour, minute);
        }}
      />

      <span>:</span>

      {/* Minute */}
      <input
        id={`${actualId}-minute`}
        type="number"
        aria-label="minute"
        placeholder="mm"
        min="-1"
        max="60"
        value={minute}
        onChange={(e) => {
          const newMinute = e.target.value;
          synchronizeTime(hour, newMinute);
        }}
      />
    </div>
  );
};

export default TimePicker;