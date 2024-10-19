import React from 'react';

const DataLoader = ({title = "Loading data, please wait."}) => {

  return (
    <div className="loader">
        <h1 className="loader-title">{title}</h1>
        <div className={"loader-animation"}></div>
    </div>
  );
};

export default DataLoader;
