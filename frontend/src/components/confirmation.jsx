import React from "react";
import "../styles/containers/confirmation.scss";

const Confirmation = ({ text = "Are you sure?", onConfirm, onClose }) => {

    return (
        <div className="confirmation-overlay">
            <div className="confirmation-box">
                <h2 className="confirmation-text">{text}</h2>
                <div className="confirmation-buttons">
                    <button className="confirmation-button btn btn-success" onClick={onClose}>No</button>
                    <button className="confirmation-button btn btn-danger" onClick={onConfirm}>Yes</button>
                </div>
            </div>
        </div>
    );
};

export default Confirmation;
