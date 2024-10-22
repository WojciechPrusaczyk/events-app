import React, { useEffect, useState } from 'react';
import Header from "../../components/structure/header";
import Footer from "../../components/structure/footer";
import "../../styles/containers/home.scss";
import axios from "axios";
import "../../styles/containers/joinEvent.scss";

const JoinEvent = () => {
    const [formData, setFormData] = useState({
        code: '',
    });

    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const [eventData, setEventData] = useState({});
    const [isJoining, setIsJoining] = useState(false);  // Nowa flaga do śledzenia, czy trwa dołączanie
  
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setIsJoining(true);  // Ustaw flage na true podczas dołączania

        try {
            const response = axios.post(`${window.location.protocol}//${window.location.host}/api/send-event-request/`, {
                code: formData.code
            }, {
                withCredentials: true
            });

            if (response.status === 200) {
                setSuccess("Successfully joined the event!");
                setEventData(response.data.detail); // Zapisujemy szczegóły wydarzenia
                setIsDataLoaded(true);  // Ustaw flagę, że dane są załadowane
            }
        } catch (err) {
            if (err.response && err.response.status === 404) {
                setError("Event not found.");
            } else {
                setError("An error occurred while joining the event.");
            }
        } finally {
            setIsJoining(false);  // Resetuj flagę po zakończeniu
        }
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
                    placeholder="0000 0000" 
                    required 
                />
                <button type="submit" disabled={isJoining}>
                    {isJoining ? "Joining..." : "Join"}
                </button>
            </form>

            {error && <p style={{ color: 'red' }}>{error}</p>}
            {success && <p style={{ color: 'green' }}>{success}</p>}
            <p>Or</p>
            <a href="#">Download App and join <br />with QR code</a>
        </div>
    );

    return (
        <div>
            <Header />
            <main>
                {JoinEventForm}
                {/* Jeśli dane wydarzenia są załadowane, można je wyświetlić */}
                {isDataLoaded && (
                    <div className="event-details">
                        <h2>Event Details</h2>
                        <p><strong>Name:</strong> {eventData.name}</p>
                        <p><strong>Description:</strong> {eventData.description}</p>
                        {/* Można dodać więcej szczegółów według potrzeb */}
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
};

export default JoinEvent;
