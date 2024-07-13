import React, { useState } from 'react';
import eyeIconShow from '../images/icons/eye_icon.svg';
import eyeIconHide from '../images/icons/eye_icon_2.svg';

const DatePicker = ({ handleChange, id }) => {
  const actualId = `${(undefined !== id)?id:"date-picker"}`;
  let actualDate = new Date();

  const synchronizeTime = () => {
      let day = actualDate.getDate();
      let month = actualDate.getMonth();
      let year = actualDate.getFullYear();

      let element = <input type="date" value={`${year}-${month}-${day}`} />;
      handleChange(element);
  }

  return (
      <div className="date-wrapper">

          {/* Dzień */}
          <input id={`${actualId}-day`} type="number" aria-label="day of the month" min="0" max="31" placeholder="dd" onChange={ (elem) => {
              actualDate.setDate( Number(elem.target.value ) );
              synchronizeTime();
          }}/>

          {/* Miesiąc */}
          <select id={`${actualId}-month`} aria-label="month" name="" onChange={(elem) => {
              actualDate.setMonth(Number(elem.target.value));
              synchronizeTime();
          }}>
              <option value="" disabled selected>month</option>
              <option value="1">January</option>
              <option value="2">February</option>
              <option value="3">March</option>
              <option value="4">April</option>
              <option value="5">May</option>
              <option value="6">June</option>
              <option value="7">July</option>
              <option value="8">August</option>
              <option value="9">September</option>
              <option value="10">October</option>
              <option value="11">November</option>
              <option value="12">December</option>
          </select>

          {/* Rok */}
          <input id={`${actualId}-year`} aria-label="year" type="number" placeholder="yyyy" min="1900"
             max={ Number(new Date().getFullYear() - 12) }
             onChange={ (elem) => {
                actualDate.setFullYear( Number(elem.target.value ) );
                synchronizeTime();
             }}
          />
      </div>
  );
};

export default DatePicker;
