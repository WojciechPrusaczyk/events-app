import React, {useState, useEffect} from 'react';
import Header from "../../components/structure/header";
import Footer from "../../components/structure/footer";
import "../../styles/containers/home.scss";
import axios from "axios";
import Cookies from "js-cookie";
import {APIProvider, Map, Marker} from '@vis.gl/react-google-maps';
import {useParams} from 'react-router-dom';

const EditEvent = () => {
    const {id: eventId} = useParams();
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        rules: "",
        startDate: "",
        startTime: "",
        endDate: "",
        endTime: "",
        supervisor: "",
        isActive: false,
        isPublic: false,
        joinApproval: false,
    });

    const [selectedLocation, setSelectedLocation] = useState({
        lat: 53.1231938,
        lng: 18.0166862,
    });

    const [formattedAddress, setFormattedAddress] = useState("");
    const [placeId, setPlaceId] = useState("");
    const [markerPosition, setMarkerPosition] = useState(null);
    const [isDataLoaded, setIsDataLoaded] = useState(false);

    useEffect(() => {
        if (eventId) {
            axios
                .post(`${window.location.protocol}//${window.location.host}/api/get-event/`, {
                    id: eventId
                })
                .then((response) => {
                    if (response.status === 200) {
                        const data = response.data.detail;
                        setFormData({
                            title: data.name,
                            description: data.description,
                            rules: data.rules,
                            startDate: formatDateForInput(data.starttime),
                            startTime: formatTimeForInput(data.starttime),
                            endDate: formatDateForInput(data.endtime),
                            endTime: formatTimeForInput(data.endtime),
                            supervisor: data.supervisor,
                            isActive: data.isactive,
                            isPublic: data.ispublic,
                            joinApproval: data.joinapproval,
                        })

                        // ustawienie lokalizacji
                        if ( null != data.location)
                        {
                            const lat = parseFloat(data.location.latitude);
                            const lng = parseFloat(data.location.longitude);
                            console.log({lat, lng})
                            setSelectedLocation({lat, lng});
                            setMarkerPosition({lat, lng});

                            if ( null != data.location.formattedAddress)
                                setFormattedAddress(data.location.formattedAddress);

                            if ( null != data.location.placeId)
                                setPlaceId(data.location.placeId);
                        }
                        setIsDataLoaded(true);
                    }
                });
        }
    }, [eventId]);

    // Funkcja do konwersji daty z bazy danych na format dla <input type="date">
    const formatDateForInput = (dateString) => {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0'); // Dodaj 1, bo miesiące są 0-indeksowane
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    // Funkcja do konwersji godziny z bazy danych na format dla <input type="time">
    const formatTimeForInput = (dateString) => {
      const date = new Date(dateString);
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${hours}:${minutes}`;
    };

    function formatForBackend(dateInput, timeInput) {
        const combinedDateTime = `${dateInput}T${timeInput}`;
        const dateObject = new Date(combinedDateTime);
        return dateObject.toISOString();
    }

    const handleFormSubmit = (event) => {
        event.preventDefault();

        if (formData.title === "New Event" || formData.title === "")
        {
            const elem = document.getElementById("title");
            elem.classList += " error"
            window.location.href = "#title";
        } else {
            const preparedData = {
                id: eventId,
                name: formData.title,
                description: formData.description,
                rules: formData.rules,
                startTime: formatForBackend(formData.startDate, formData.startTime),
                endTime: formatForBackend(formData.endDate, formData.endTime),
                supervisor: formData.supervisor,
                isActive: formData.isActive,
                isPublic: formData.isPublic,
                joinApproval: formData.joinApproval,
                location: {
                    placeId: placeId,
                    formattedAddress: formattedAddress,
                    latitude: selectedLocation.lat,
                    longitude: selectedLocation.lng,
                }
            }
            axios
                .post(`${window.location.protocol}//${window.location.host}/api/edit-event/`, preparedData, {
                    withCredentials: true,
                })
                .then((response) => {
                    if (response.status === 200)
                    {
                        window.location.href = `${window.location.protocol}//${window.location.host}/`
                    }
                })
        }
    };

    const handleChange = (field) => (event) => {
        setFormData((prevState) => ({
            ...prevState,
            [field]: event.target.type !== "checkbox" ? event.target.value : event.target.checked,
        }));
    };

    const handleMapClick = (e) => {
        if (e.detail.latLng) {
            const lat = e.detail.latLng.lat;
            const lng = e.detail.latLng.lng;

            setSelectedLocation({lat, lng});
            setMarkerPosition({lat, lng});
            setFormattedAddress(null);
            setPlaceId(null);

            // pobieranie lokalizacji
            if (e.detail.placeId) {
                axios
                    .get(`https://maps.googleapis.com/maps/api/geocode/json?place_id=${e.detail.placeId}&key=AIzaSyDOYFpDSbiZEuqLgSWLkOYEhZnEPKa-g7g`)
                    .then((response) => {
                        if (response.status === 200 && response.data.results.length > 0) {
                            const result = response.data.results[0];
                            setFormattedAddress(result.formatted_address);
                            setPlaceId(result.place_id);
                        }
                    });
            }
        } else {
            console.error('e.latLng is undefined');
        }
    };

    return (
        <div>
            <Header/>
            <main>
                {!isDataLoaded && <div className="loader">
                    Loading, please wait
                </div>}
                {isDataLoaded &&
                    <form className="univForm-container">
                        <h1 className="univForm-container-title">Create event</h1>
                        <p>
                            <label className="univForm-container-label" htmlFor="title">
                                <span className="univForm-container-label-title">Title</span>
                                <span className="univForm-container-label-caption">Event’s name shown to users.</span>
                            </label>
                            <input id="title" type="text" className="univForm-container-textInput"
                                   onChange={handleChange('title')} defaultValue={formData.title}/>
                        </p>
                        <p>
                            <label className="univForm-container-label" htmlFor="description">
                                <span className="univForm-container-label-title">Description</span>
                                <span className="univForm-container-label-caption">Describe your event to users, encourage them to attend, include social media links.</span>
                            </label>
                            <textarea id="description" style={{resize: "none"}} className="univForm-container-textInput"
                                      onChange={handleChange('description')} defaultValue={formData.description}/>
                        </p>
                        <p>
                            <label className="univForm-container-label" htmlFor="rules">
                                <span className="univForm-container-label-title">Rules</span>
                                <span className="univForm-container-label-caption">Establish set of rules for attendants, to inform them what is inacceptable.</span>
                            </label>
                            <textarea id="rules" style={{resize: "none"}} className="univForm-container-textInput"
                                      onChange={handleChange('rules')} defaultValue={formData.rules}/>
                        </p>
                        <p>
                            <fieldset>
                                <legend>
                                    <span className="univForm-container-label-title">Start time</span>
                                    <span className="univForm-container-label-caption">Time when event is going to start. Attendants will be informed automatically before event starts.</span>
                                </legend>
                                <input id="startDate" type="date" className="univForm-container-date"
                                       aria-label="start date" onChange={handleChange('startDate')} defaultValue={formData.startDate}/>
                                <input id="startTime" type="time" className="univForm-container-time"
                                       aria-label="start time" onChange={handleChange('startTime')} defaultValue={formData.startTime}/>
                            </fieldset>
                        </p>
                        <p>
                            <fieldset>
                                <legend>
                                    <span className="univForm-container-label-title">End time</span>
                                    <span className="univForm-container-label-caption">Time when event is going to end. Attendants will be informed automatically before event ends.</span>
                                </legend>
                                <input id="endDate" type="date" className="univForm-container-date"
                                       aria-label="end date" onChange={handleChange('endDate')} defaultValue={formData.endDate}/>
                                <input id="endTime" type="time" className="univForm-container-time"
                                       aria-label="end time" onChange={handleChange('endTime')} defaultValue={formData.endTime}/>
                            </fieldset>
                        </p>
                        <p>
                            <label className="univForm-container-label" htmlFor="supervisor">
                                <span className="univForm-container-label-title">Supervisor</span>
                                <span className="univForm-container-label-caption">User who manages event. Changes after saving event.</span>
                            </label>
                            <input id="supervisor" type="text" className="univForm-container-textInput"
                                   onChange={handleChange('supervisor')} defaultValue={formData.supervisor}/>
                        </p>
                        <p>
                            <label className="univForm-container-label" htmlFor="isActive">
                                <span className="univForm-container-label-title">Is active</span>
                                <span className="univForm-container-label-caption">Determines if is event active and visible to all users.</span>
                            </label>
                            <input id="isActive" type="checkbox" className="univForm-container-checkboxInput"
                                   onChange={handleChange('isActive')} defaultChecked={formData.isActive}/>
                        </p>
                        <p>
                            <label className="univForm-container-label" htmlFor="isPublic">
                                <span className="univForm-container-label-title">Is public</span>
                                <span className="univForm-container-label-caption">Determines if is event publicly accessible.</span>
                            </label>
                            <input id="isPublic" type="checkbox" className="univForm-container-checkboxInput"
                                   onChange={handleChange('isPublic')} defaultChecked={formData.isPublic}/>
                        </p>
                        <p>
                            <label className="univForm-container-label" htmlFor="joinApproval">
                                <span className="univForm-container-label-title">Join through approval</span>
                                <span className="univForm-container-label-caption">Allows users to join only after your approval.</span>
                            </label>
                            <input id="joinApproval" type="checkbox" className="univForm-container-checkboxInput"
                                   onChange={handleChange('joinApproval')} defaultChecked={formData.joinApproval}/>
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
                        <p>
                            <input id="submit" type="submit" className="univForm-container-submitInput"
                                   onClick={handleFormSubmit}/>
                        </p>
                    </form>}
            </main>
            <Footer/>
        </div>
    );
};

export default EditEvent;
