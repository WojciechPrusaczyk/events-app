import React, {useState, useEffect, useRef} from 'react';
import TextEditor from "./textEditor";
import TimePicker from "./timePicker";
import TimeIcon from "../images/icons/clockIcon.svg";
import DatePicker from "./datePicker";
import DateIcon from "../images/icons/dateIcon.svg";
import {APIProvider, Map, Marker} from "@vis.gl/react-google-maps";
import TrashIcon from "../images/icons/trashIcon.svg";
import RightArrow from "../images/icons/rightArrowIcon.svg";
import axios from "axios";
import {formatForBackend} from "./Helpers";
import DateTimePresenter from "./DateTimePresenter";

const SegmentFormItem = ({segmentObject, updateSegment}) => {

    const apiKey = process.env.REACT_APP_GOOGLE_API_KEY;
    const [selectedLocation, setSelectedLocation] = useState({
        lat: 53.1231938,
        lng: 18.0166862,
    });
    const [formattedAddress, setFormattedAddress] = useState("");
    const [placeId, setPlaceId] = useState("");
    const [markerPosition, setMarkerPosition] = useState(null);
    const titleRef = useRef(null);

    const [startDateTime, setStartDateTime] = useState(new Date(formatForBackend(segmentObject.startDate, segmentObject.startTime)));
    const [endDateTime, setEndDateTime] = useState(new Date(formatForBackend(segmentObject.endDate, segmentObject.endTime)));

    useEffect( () => {


        if ( null != segmentObject.location)
        {
            const lat = parseFloat(segmentObject.location.latitude);
            const lng = parseFloat(segmentObject.location.longitude);

            setSelectedLocation({lat, lng});
            setMarkerPosition({lat, lng});

            if ( null != segmentObject.location.formattedAddress)
                setFormattedAddress(segmentObject.location.formattedAddress);

            if ( null != segmentObject.location.placeId)
                setPlaceId(segmentObject.location.placeId);
        }

        if (titleRef.current) {
            titleRef.current.textContent = segmentObject.name;
        }

    }, [])

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
                    .get(`https://maps.googleapis.com/maps/api/geocode/json?place_id=${e.detail.placeId}&key=${apiKey}`)
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

    const handleInputChange = (field) => (event) => {
        let updatedSegment = {
            ...segmentObject,
            [field]: event.target.type !== "checkbox" ? event.target.value : event.target.checked
        };
        updateSegment(updatedSegment);
    };
    
    const handleDirectChange = (field) => (directData) => {
        let updatedSegment = {
            ...segmentObject,
            [field]: directData
        };
        updateSegment(updatedSegment);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const preparedObject = {
            id: segmentObject.id,
            name: segmentObject.name,
            description: JSON.stringify(segmentObject.description),
            starttime: formatForBackend(segmentObject.startDate, segmentObject.startTime),
            endtime: formatForBackend(segmentObject.endDate, segmentObject.endTime),
            speaker: segmentObject.speaker,
            isActive: segmentObject.isactive,
            location: {
                placeId: placeId,
                formattedAddress: formattedAddress,
                latitude: selectedLocation.lat,
                longitude: selectedLocation.lng,
            },
        }
        axios
            .post(
                `${window.location.protocol}//${window.location.host}/api/edit-segment/`, preparedObject,
                {
                    withCredentials: true
                }
             )
            .then((response) => {
                if (response.status === 200)
                {
                    window.location.hash = `segment-${segmentObject.id}`;
                    window.location.reload();
                }
                else {
                    console.error("Internal server error occurred.")
                }
            })
            .catch((error) => {
                console.error(error);
            });
    }

    const handleDelete = (e) => {
        e.preventDefault();
        axios
            .post(
                `${window.location.protocol}//${window.location.host}/api/delete-segment/`,
                 {id: segmentObject.id },
                {
                    withCredentials: true
                }
             )

            .then((response) => {
                if (response.status === 200)
                {
                    console.log("Segment deleted", response);
                    window.location.reload();
                }

            })
            .catch((error) => {
                console.error(error);
            });
    };

    const handleBlur = () => {
        const titleElement = titleRef.current;
        const fullText = segmentObject.name;
        if (titleElement && titleElement.textContent !== fullText) {

            let currentIndex = 1;

            const updateText = () => {
                if (currentIndex <= fullText.length) {
                    titleElement.textContent = fullText.slice(0, currentIndex);
                    currentIndex++;
                    setTimeout(updateText, 100);
                }
            };

            setTimeout(updateText, 800);
        }
    };

    return (
        <form id={"segment-" + segmentObject.id} className="univForm-container">
            <p className={"segment-header"}>
                <h1 id={"segment-name" + segmentObject.id} className="univForm-container-title" ref={titleRef}></h1>
                <DateTimePresenter
                    startDate={startDateTime.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}
                    startTime={startDateTime.toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                    })}
                    endDate={endDateTime.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}
                    endTime={endDateTime.toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                    })}
                />
            </p>
            <p>
                <label className="univForm-container-label" htmlFor={"title-" + segmentObject.id}>
                    <span className="univForm-container-label-title">Title</span>
                    <span className="univForm-container-label-caption">Segment’s name shown to users.</span>
                </label>
                <input id={"title-" + segmentObject.id} type="text" className="univForm-container-textInput"
                    onChange={handleInputChange('name')} defaultValue={segmentObject.name} onBlur={ handleBlur }/>
            </p>
            <p>
                <label className="univForm-container-label" htmlFor={"description-" + segmentObject.id}>
                    <span className="univForm-container-label-title">Description</span>
                    <span className="univForm-container-label-caption">Describe your segment to users, encourage them to attend.</span>
                </label>
                <TextEditor id={"description-" + segmentObject.id} className="univForm-container-bigTextInput"
                            handleChange={handleDirectChange('description')}
                            defaultValue={segmentObject.description}/>
            </p>
            <p>
                <fieldset>
                    <legend className="univForm-container-label">
                        <span className="univForm-container-label-title">Start time</span>
                        <span className="univForm-container-label-caption">Time when segment is going to start. Make sure it doesn't exceed event's time boundaries.</span>
                    </legend>
                    <TimePicker
                        id="startTime"
                        className="univForm-container-time"
                        handleChange={(e) => {
                            handleInputChange('startTime')(e);
                            setStartDateTime(new Date(formatForBackend(segmentObject.startDate, e.target.value)));
                        }}
                        timeValue={segmentObject.startTime}
                    />
                    <img className="univForm-container-dateTimeIcons" src={TimeIcon}
                         alt="choose time icon"/>
                    <DatePicker
                        id="startDate"
                        className="univForm-container-date"
                        handleChange={(e) => {
                            handleInputChange('startDate')(e);
                            setStartDateTime(new Date(formatForBackend(e.target.value, segmentObject.startTime)));
                        }}
                        dateValue={segmentObject.startDate}
                    />
                    <img className="univForm-container-dateTimeIcons" src={DateIcon}
                         alt="choose date icon"/>
                </fieldset>
            </p>
            <p>
                <fieldset>
                    <legend className="univForm-container-label">
                        <span className="univForm-container-label-title">End time</span>
                        <span className="univForm-container-label-caption">Time when segment is going to end. Make sure it doesn't exceed event's time boundaries.</span>
                    </legend>
                    <TimePicker
                        id={"endTime-" + segmentObject.id}
                        className="univForm-container-time"
                        handleChange={(e) => {
                            handleInputChange('endTime')(e);
                            setEndDateTime(new Date(formatForBackend(segmentObject.endDate, e.target.value)));
                        }}
                        timeValue={segmentObject.endTime}
                    />
                    <img className="univForm-container-dateTimeIcons" src={TimeIcon}
                         alt="choose time icon"/>
                    <DatePicker
                        id={"endDate-" + segmentObject.id}
                        className="univForm-container-date"
                        handleChange={(e) => {
                            handleInputChange('endDate')(e);
                            setEndDateTime(new Date(formatForBackend(e.target.value, segmentObject.endTime)));
                        }}
                        dateValue={segmentObject.endDate}
                    />
                    <img className="univForm-container-dateTimeIcons" src={DateIcon}
                         alt="choose date icon"/>
                </fieldset>
            </p>
            <p className="univForm-container-toggle">
                <p>
                    <span className="univForm-container-toggle-label-title">Is active</span>
                    <span className="univForm-container-toggle-label-caption">Determines if is segment active and visible to all users.</span>
                </p>
                <div className="univForm-container-toggle-wrapper">
                    <input className="univForm-container-toggle tgl tgl-light" id={"isActive-" + segmentObject.id}
                           type="checkbox"
                           aria-label="is active" onChange={handleInputChange('isActive')}
                           defaultChecked={segmentObject.isActive}/>
                    <label title="is active" aria-hidden="true" className="tgl-btn"
                           htmlFor={"isActive-" + segmentObject.id}/>
                </div>
            </p>
            <p>
                <label className="univForm-container-label" htmlFor={"map-" + segmentObject.id}>
                    <span className="univForm-container-label-title">Main location</span>
                    <span
                        className="univForm-container-label-caption">Choose main location where event will take place.</span>
                </label>
                <APIProvider apiKey={apiKey}
                             onLoad={() => console.log('Maps API has loaded.')}>
                    <Map
                        defaultZoom={13}
                        defaultCenter={selectedLocation}
                        onClick={handleMapClick}
                        className="univForm-container-mapInput"
                        id={"map-" + segmentObject.id}
                    >
                        {markerPosition && (
                            <Marker position={markerPosition}/>
                        )}
                    </Map>
                </APIProvider>
            </p>
            <p>
                <input id="submit" type="submit" className="univForm-container-submitInput"
                       value="Save" onClick={(e) => handleSubmit(e)}/>
            </p>
            <p>
                <label className="univForm-container-label" htmlFor="delete-segment">
                    <span className="univForm-container-label-caption">Permanently delete segment.</span>
                </label>
                <button id={"delete-segment"} className='btn btn-danger'
                        onClick={(e) => handleDelete(e)}>
                    <img src={TrashIcon}
                         alt="delete segment icon"
                    />
                </button>
            </p>
        </form>
    );
}

export default SegmentFormItem;