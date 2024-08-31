import React, { useState } from 'react';
import Header from "../../components/structure/header";
import Footer from "../../components/structure/footer";
import "../../styles/containers/home.scss";
import axios from "axios";
import Cookies from "js-cookie";
import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';

const EditEvent = () => {
    const [selectedLocation, setSelectedLocation] = useState({ lat: 53.1231938, lng: 18.0166862 });
    const [formattedAddress, setFormattedAddress] = useState("");
    const [placeId, setPlaceId] = useState("");
    const [markerPosition, setMarkerPosition] = useState(null);

    const handleMapClick = (e) => {
        if (e.detail.latLng) {
            const lat = e.detail.latLng.lat;
            const lng = e.detail.latLng.lng;

            setSelectedLocation({ lat, lng });
            setMarkerPosition({ lat, lng });

            // pobieranie lokalizacji
            if (null != e.detail.placeId)
            {
                axios
                    .get(`https://maps.googleapis.com/maps/api/geocode/json?place_id=${e.detail.placeId}&key=AIzaSyDOYFpDSbiZEuqLgSWLkOYEhZnEPKa-g7g`)
                    .then( (response) => {
                        if (response.status === 200 && response.data.results.length > 0)
                        {
                            const result = response.data.results[0];
                            setFormattedAddress(result.formatted_address);
                            setPlaceId(result.place_id);
                            console.log(formattedAddress, placeId)
                        }
                    })
            }
        } else {
            console.error('e.latLng is undefined');
        }
    };

    return (
        <div>
            <Header />
            <main>
                <form className="univForm-container">
                    <h1 className="univForm-container-title">Create event</h1>
                    <p>
                        <label className="univForm-container-label" htmlFor="title">
                            <span className="univForm-container-label-title">Title</span>
                            <span className="univForm-container-label-caption">Event’s name shown to users.</span>
                        </label>
                        <input id="title" type="text" className="univForm-container-textInput"/>
                    </p>
                    <p>
                        <label className="univForm-container-label" htmlFor="description">
                            <span className="univForm-container-label-title">Description</span>
                            <span className="univForm-container-label-caption">Describe your event to users, encourage them to attend, include social media links.</span>
                        </label>
                        <textarea id="description" style={{resize: "none"}} className="univForm-container-textInput"/>
                    </p>
                    <p>
                        <label className="univForm-container-label" htmlFor="rules">
                            <span className="univForm-container-label-title">Rules</span>
                            <span className="univForm-container-label-caption">Establish set of rules for attendants, to inform them what is inacceptable.</span>
                        </label>
                        <textarea id="rules" style={{resize: "none"}} className="univForm-container-textInput"/>
                    </p>
                    <p>
                        <fieldset>
                            <legend>
                                <span className="univForm-container-label-title">Start time</span>
                                <span className="univForm-container-label-caption">Time when event is going to start. Attendants will be informed automatically before event starts.</span>
                            </legend>
                            <input id="startDate" type="date" className="univForm-container-date"
                                   aria-label="start date"/>
                            <input id="startTime" type="time" className="univForm-container-time"
                                   aria-label="start time"/>
                        </fieldset>
                    </p>
                    <p>
                        <fieldset>
                            <legend>
                                <span className="univForm-container-label-title">End time</span>
                                <span className="univForm-container-label-caption">Time when event is going to end. Attendants will be informed automatically before event ends.</span>
                            </legend>
                            <input id="endDate" type="date" className="univForm-container-date" aria-label="end date"/>
                            <input id="endTime" type="time" className="univForm-container-time" aria-label="end time"/>
                        </fieldset>
                    </p>
                    <p>
                        <label className="univForm-container-label" htmlFor="supervisor">
                            <span className="univForm-container-label-title">Supervisor</span>
                            <span className="univForm-container-label-caption">User who manages event. Changes after saving event.</span>
                        </label>
                        <input id="supervisor" type="text" className="univForm-container-textInput"/>
                    </p>
                    <p>
                        <label className="univForm-container-label" htmlFor="isActive">
                            <span className="univForm-container-label-title">Is active</span>
                            <span className="univForm-container-label-caption">Determines if is event active and visible to all users.</span>
                        </label>
                        <input id="isActive" type="checkbox" className="univForm-container-checkboxInput"/>
                    </p>
                    <p>
                        <label className="univForm-container-label" htmlFor="isPublic">
                            <span className="univForm-container-label-title">Is public</span>
                            <span className="univForm-container-label-caption">Determines if is event publicly accessible.</span>
                        </label>
                        <input id="isPublic" type="checkbox" className="univForm-container-checkboxInput"/>
                    </p>
                    <p>
                        <label className="univForm-container-label" htmlFor="joinApproval">
                            <span className="univForm-container-label-title">Join through approval</span>
                            <span className="univForm-container-label-caption">Allows users to join only after your approval.</span>
                        </label>
                        <input id="joinApproval" type="checkbox" className="univForm-container-checkboxInput"/>
                    </p>
                    <APIProvider apiKey={'AIzaSyDOYFpDSbiZEuqLgSWLkOYEhZnEPKa-g7g'}
                                 onLoad={() => console.log('Maps API has loaded.')}>
                        <Map
                            defaultZoom={13}
                            defaultCenter={selectedLocation}
                            onClick={handleMapClick} // Dodanie obsługi zdarzenia kliknięcia
                            style={{height: "400px"}}
                        >
                            {markerPosition && (
                                <Marker position={markerPosition}/>
                            )}
                        </Map>
                    </APIProvider>
                </form>
            </main>
            <Footer/>
        </div>
    );
};

export default EditEvent;
