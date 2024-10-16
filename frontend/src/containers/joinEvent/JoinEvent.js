import React, { useState } from 'react';
import Header from "../../components/structure/header";
import Footer from "../../components/structure/footer";
import "../../styles/containers/home.scss";
import axios from "axios";
import { useParams } from "react-router-dom";
import "../../styles/containers/joinEvent.scss";


const JoinEvent = () => {
    const [code, setCode] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
  
    const handleChange = (e) => {
      setCode(e.target.value);
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      setError(null);
      setSuccess(null);

      try {
        const response = await axios.post('/api/join-event/', { code });
        if (response.status === 200) {
          setSuccess("Successfully joined the event!");
        }
      } catch (err) {
        if (err.response && err.response.status === 404) {
          setError("Event not found.");
        } else {
          setError("An error occurred while joining the event.");
        }
      }
    };
  
    const JoinEventForm = (
      <div className="join-event-form">
        <form onSubmit={handleSubmit}>
          <label htmlFor="code">Join with code</label>
          <input 
            type="text" 
            id="code" 
            value={code} 
            onChange={handleChange} 
            placeholder="0000 0000" 
            required 
          />
          <button type="submit">Join</button>
        </form>
  
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {success && <p style={{ color: 'green' }}>{success}</p>}
  
        <p>Or</p>
  
        <a href="#">Download App and join <br/>with QR code</a>
      </div>
    );
  
    return (
      <div>
        <Header />
        <main>
          {JoinEventForm}
        </main>
        <Footer />
      </div>
    );
  };
  
  export default JoinEvent;
