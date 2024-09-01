import React, {useState, useEffect} from 'react';
import Header from "../../components/structure/header";
import Footer from "../../components/structure/footer";
import "../../styles/containers/home.scss";
import axios from "axios";
import {APIProvider, Map, Marker} from '@vis.gl/react-google-maps';
import {useParams} from 'react-router-dom';
import "../../styles/components/form.scss"
import DatePicker from "../../components/datePicker";
import TimePicker from "../../components/timePicker";
import TimeIcon from "../../images/icons/clockIcon.svg"
import DateIcon from "../../images/icons/dateIcon.svg"
import TextEditor from "../../components/textEditor";

const EditEvent = () => {
    const {id: eventId} = useParams();
    const [formData, setFormData] = useState({
        title: "",
        description: [],
        rules: [],
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

    const formatDateForInput = (dateString) => {
      const date = new Date(dateString); // Tworzy datę w lokalnej strefie czasowej
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0'); // Miesiące są 0-indeksowane
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const formatTimeForInput = (dateString) => {
      const date = new Date(dateString); // Tworzy datę w lokalnej strefie czasowej
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${hours}:${minutes}`;
    };

    function formatForBackend(dateInput, timeInput) {
        const combinedDateTime = `${dateInput}T${timeInput}`;
        const dateObject = new Date(combinedDateTime);

        // Obliczanie offsetu w minutach i przeliczanie na milisekundy
        const timezoneOffset = dateObject.getTimezoneOffset() * 60 * 1000;

        // Korygowanie daty przez odjęcie offsetu
        const localTime = new Date(dateObject.getTime() - timezoneOffset);

        // Zwraca w formacie ISO z zachowaniem lokalnej strefy czasowej
        return localTime.toISOString().slice(0, 19);  // usunięcie 'Z' na końcu, aby nie było błędnie interpretowane jako UTC
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
            console.log(preparedData);
            /*axios
                .post(`${window.location.protocol}//${window.location.host}/api/edit-event/`, preparedData, {
                    withCredentials: true,
                })
                .then((response) => {
                    if (response.status === 200)
                    {
                        window.location.href = `${window.location.protocol}//${window.location.host}/`
                    }
                })*/
        }
    };

    const handleChange = (field) => (event) => {
        setFormData((prevState) => ({
            ...prevState,
            [field]: event.target.type !== "checkbox" ? event.target.value : event.target.checked,
        }));
    };

    const handleArrayChange = (field) => (newDataArray) => {
    setFormData((prevState) => ({
        ...prevState,
        [field]: newDataArray,
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
                            <TextEditor id="description" className="univForm-container-bigTextInput" handleChange={handleArrayChange('description')} defaultValue={formData.description} />
                        </p>
                        <p>
                            <label className="univForm-container-label" htmlFor="rules">
                                <span className="univForm-container-label-title">Rules</span>
                                <span className="univForm-container-label-caption">Establish set of rules for attendants, to inform them what is inacceptable.</span>
                            </label>
                            <TextEditor id="rules" className="univForm-container-bigTextInput" handleChange={handleArrayChange('rules')} defaultValue={formData.rules} />
                        </p>
                        <p>
                            <fieldset>
                                <legend className="univForm-container-label">
                                    <span className="univForm-container-label-title">Start time</span>
                                    <span className="univForm-container-label-caption">Time when event is going to start. Attendants will be informed automatically before event starts.</span>
                                </legend>
                                <TimePicker
                                    id="startTime"
                                    className="univForm-container-time"
                                    handleChange={(e) => handleChange('startTime')(e)}
                                    timeValue={formData.startTime}
                                />
                                <img className="univForm-container-dateTimeIcons" src={TimeIcon}
                                     alt="choose time icon"/>
                                <DatePicker
                                    id="startDate"
                                    className="univForm-container-date"
                                    handleChange={(e) => handleChange('startDate')(e)}
                                    dateValue={formData.startDate}
                                />
                                <img className="univForm-container-dateTimeIcons" src={DateIcon}
                                     alt="choose date icon"/>
                            </fieldset>
                        </p>
                        <p>
                            <fieldset>
                                <legend className="univForm-container-label">
                                    <span className="univForm-container-label-title">End time</span>
                                    <span className="univForm-container-label-caption">Time when event is going to end. Attendants will be informed automatically before event ends.</span>
                                </legend>
                                <TimePicker
                                    id="endTime"
                                    className="univForm-container-time"
                                    handleChange={(e) => handleChange('endTime')(e)}
                                    timeValue={formData.endTime}
                                />
                                <img className="univForm-container-dateTimeIcons" src={TimeIcon}
                                     alt="choose time icon"/>
                                <DatePicker
                                    id="endDate"
                                    className="univForm-container-date"
                                    handleChange={(e) => handleChange('endDate')(e)}
                                    dateValue={formData.endDate}
                                />
                                <img className="univForm-container-dateTimeIcons" src={DateIcon}
                                     alt="choose date icon"/>
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
                        <p className="toggle-wrapper">
                            <p className="univForm-container-toggle">
                                <p>
                                    <span className="univForm-container-toggle-label-title">Is active</span>
                                    <span className="univForm-container-toggle-label-caption">Determines if is event active and visible to all users.</span>
                                </p>
                                <div className="univForm-container-toggle-wrapper">
                                    <input className="univForm-container-toggle tgl tgl-light" id="isActive" type="checkbox"
                                           aria-label="is active" onChange={handleChange('isActive')}
                                           defaultChecked={formData.isActive}/>
                                    <label title="is active" aria-hidden="true" className="tgl-btn" htmlFor="isActive"/>
                                </div>
                            </p>
                            <p className="univForm-container-toggle">
                                <p>
                                    <span className="univForm-container-toggle-label-title">Is public</span>
                                    <span className="univForm-container-toggle-label-caption">Determines if is event publicly accessible.</span>
                                </p>
                                <div className="univForm-container-toggle-wrapper">
                                    <input className="univForm-container-toggle tgl tgl-light" id="isPublic" type="checkbox"
                                           aria-label="is public" onChange={handleChange('isPublic')}
                                           defaultChecked={formData.isPublic}/>
                                    <label title="is public" aria-hidden="true" className="tgl-btn" htmlFor="isPublic"/>
                                </div>
                            </p>
                            <p className="univForm-container-toggle">
                                <p>
                                    <span className="univForm-container-toggle-label-title">Join through approval</span>
                                    <span className="univForm-container-toggle-label-caption">Allows users to join only after your approval.</span>
                                </p>
                                <div className="univForm-container-toggle-wrapper">
                                    <input className="univForm-container-toggle tgl tgl-light" id="joinApproval" type="checkbox"
                                           aria-label="Join approval" onChange={handleChange('joinApproval')}
                                           defaultChecked={formData.joinApproval}/>
                                    <label title="Join approval" aria-hidden="true" className="tgl-btn" htmlFor="joinApproval"/>
                                </div>
                            </p>
                        </p>
                        <p>
                            <label className="univForm-container-label" htmlFor="map">
                                <span className="univForm-container-label-title">Main location</span>
                                <span className="univForm-container-label-caption">Choose main location where event will take place.</span>
                            </label>
                            <APIProvider apiKey={'AIzaSyDOYFpDSbiZEuqLgSWLkOYEhZnEPKa-g7g'}
                                         onLoad={() => console.log('Maps API has loaded.')}>
                                <Map
                                    defaultZoom={13}
                                    defaultCenter={selectedLocation}
                                    onClick={handleMapClick}
                                    className="univForm-container-mapInput"
                                    id="map"
                                >
                                    {markerPosition && (
                                        <Marker position={markerPosition}/>
                                    )}
                                </Map>
                            </APIProvider>
                        </p>
                        <p>
                            <input id="submit" type="submit" className="univForm-container-submitInput"
                                   value="Save"
                                   onClick={handleFormSubmit}/>
                        </p>
                    </form>}
            </main>
            <Footer/>
        </div>
    );
};

export default EditEvent;
