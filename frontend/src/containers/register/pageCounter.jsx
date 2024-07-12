import React from 'react';
import leftArrow from "../../images/icons/left.svg"

const PageCounter = ({page, prevStep}) => {
    return(
        <div className="page-info">
            <p className="page-info-dots">
                <span className={`page-info-dots-dot ${(page >= 1) ? " active" : ""}`}></span>
                <span className={`page-info-dots-dot ${(page >= 2) ? " active" : ""}`}></span>
                <span className={`page-info-dots-dot ${(page >= 3) ? " active" : ""}`}></span>
            </p>
            {(page >= 1 && undefined !== prevStep) &&
            <p className="page-info-back">
                <button className="page-info-back-button" onClick={prevStep}>
                    <img src={leftArrow} alt="go back" aria-hidden="true" />
                    go back
                </button>
            </p>
            }
        </div>
    );
}

export default PageCounter;