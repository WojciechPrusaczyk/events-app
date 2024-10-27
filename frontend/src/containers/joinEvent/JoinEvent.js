import React, { useEffect, useState } from 'react';
import Header from "../../components/structure/header";
import Footer from "../../components/structure/footer";
import "../../styles/containers/home.scss";
import axios from "axios";
import "../../styles/containers/joinEvent.scss";
import {useNavigate} from "react-router-dom";
import QRCode from "react-qr-code";

const JoinEvent = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        code: '',
    });

    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
  
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        axios
            .post(`${window.location.protocol}//${window.location.host}/api/get-event/`, {
                code: formData.code.toLowerCase()
            })
            .then(response => {
                if (response.status === 200) {
                    setSuccess("Event found!");
                    const url = "/join/"+response.data.detail.joinCode.toUpperCase();
                    navigate(url);
                }
            })
            .catch(() => {
                setError("Error occurred, try again later.");
            });
    };

    // Funkcja renderująca formularz dołączania
    const JoinEventForm = (
        <div className="join-event-form">
            <form onSubmit={handleSubmit}>
                <label htmlFor="code">Join with code</label>
                <input 
                    type="text" 
                    id="code" 
                    name="code"
                    value={formData.code} 
                    onChange={handleChange} 
                    placeholder="0000-0000"
                    required 
                />
                <button type="submit"> Join </button>
            </form>

            <p>Or</p>
            <a href={`${window.location.protocol}//${window.location.host}/app/`}>Download App and join <br />with QR code</a>
            <p>
                <div className="join-event-form-qr">
                    <QRCode value={`${window.location.protocol}//${window.location.host}/app/`} />
                </div>
            </p>
        </div>
    );

    return (
        <div>
            <Header />
            <main>
                {JoinEventForm}
                {error && <p className={"text-danger"}>{error}</p>}
                {success && <p className={"text-success"}>{success}</p>}
            </main>
            <Footer />
        </div>
    );
};

export default JoinEvent;
