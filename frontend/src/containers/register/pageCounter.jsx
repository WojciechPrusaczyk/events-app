import React from 'react';

const PageCounter = ({page, prevStep}) => {
    return(
        <div className="page-info">
            <p className="page-info-dots">
                <span className={`page-info-dots-dot ${(page >= 1) ? " active" : ""}`}></span>
                <span className={`page-info-dots-dot ${(page >= 2) ? " active" : ""}`}></span>
                <span className={`page-info-dots-dot ${(page >= 3) ? " active" : ""}`}></span>
            </p>
            {(page >= 1 && undefined !== prevStep) &&
                <p>
                    <button onClick={prevStep}>
                        go back
                    </button>
                </p>
            }
        </div>
    );
}

export default PageCounter;