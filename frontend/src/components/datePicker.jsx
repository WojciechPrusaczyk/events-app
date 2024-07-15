import React, { useState, useEffect } from 'react';

const DatePicker = ({ handleChange, id, dateValue }) => {
  const actualId = id || "date-picker";

  const parseDate = (dateStr) => {
    if (dateStr) {
      const dateParts = dateStr.split("-");
      return {
        day: dateParts[2],
        month: dateParts[1] - 1, // Subtract 1 to convert to zero-indexed month
        year: dateParts[0],
      };
    }
    return { day: "", month: "", year: "" };
  };

  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");

  useEffect(() => {
    const { day, month, year } = parseDate(dateValue);
    setDay(day);
    setMonth(month);
    setYear(year);
  }, [dateValue]);

  const synchronizeTime = (newDay, newMonth, newYear) => {
    const dayValue = newDay !== undefined ? newDay : day;
    const monthValue = newMonth !== undefined ? newMonth : month;
    const yearValue = newYear !== undefined ? newYear : year;

    if (dayValue && monthValue !== undefined && yearValue) {
      const formattedMonth = (Number(monthValue) + 1).toString().padStart(2, '0'); // Convert to one-indexed month
      const formattedDay = dayValue.toString().padStart(2, '0');
      const formattedDate = `${yearValue}-${formattedMonth}-${formattedDay}`;
      handleChange({ target: { value: formattedDate } });
    }
  };

  return (
    <div className="date-wrapper">
      {/* Dzień */}
      <input
        id={`${actualId}-day`}
        type="number"
        aria-label="day of the month"
        min="1"
        max="31"
        placeholder="dd"
        value={day}
        onChange={(e) => {
          const newDay = e.target.value;
          setDay(newDay);
          synchronizeTime(newDay, month, year);
        }}
      />

      {/* Miesiąc */}
      <select
        id={`${actualId}-month`}
        aria-label="month"
        value={month}
        onChange={(e) => {
          const newMonth = e.target.value;
          setMonth(newMonth);
          synchronizeTime(day, newMonth, year);
        }}
      >
        <option value="" disabled>month</option>
        <option value="0">January</option>
        <option value="1">February</option>
        <option value="2">March</option>
        <option value="3">April</option>
        <option value="4">May</option>
        <option value="5">June</option>
        <option value="6">July</option>
        <option value="7">August</option>
        <option value="8">September</option>
        <option value="9">October</option>
        <option value="10">November</option>
        <option value="11">December</option>
      </select>

      {/* Rok */}
      <input
        id={`${actualId}-year`}
        type="number"
        aria-label="year"
        placeholder="yyyy"
        min="1900"
        max={Number(new Date().getFullYear() - 12)}
        value={year}
        onChange={(e) => {
          const newYear = e.target.value;
          setYear(newYear);
          synchronizeTime(day, month, newYear);
        }}
      />
    </div>
  );
};

export default DatePicker;