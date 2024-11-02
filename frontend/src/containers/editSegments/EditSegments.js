import React, {useState, useEffect} from 'react';
import Header from "../../components/structure/header";
import Footer from "../../components/structure/footer";
import "../../styles/containers/home.scss";
import "../../styles/components/form.scss";
import "../../styles/containers/editSegment.scss";
import axios from "axios";
import {useNavigate, useParams} from 'react-router-dom';
import Loader from "../../components/loader";
import SegmentFormItem from "../../components/SegmentFormItem";
import {formatDateForInput, formatForBackend, formatTimeForInput, getAddressByLaLng} from "../../components/Helpers";
import LocationPin from "../../images/icons/locationPinIcon.svg";
import CrownIcon from "../../images/icons/crownIcon.svg";
import ClockIcon from "../../images/icons/clockIcon.svg";

const EditSegments = ({title = "Eventful"}) => {
    const {id: eventId} = useParams();
    const [segmentsList, setSegmentsList] = useState([]);
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const [activeSegmentId, setActiveSegmentId] = useState(1);
    const navigate = useNavigate();
    const [addresses, setAddresses] = useState({});

    const updateSegmentsList = (focusOnLastElement = false) => {
        axios
            .post(`${window.location.protocol}//${window.location.host}/api/get-segments/`, {
                id: eventId
            })
            .then((response) => {
                if (response.status === 200) {
                    const data = response.data;
                    let preparedData = [];
                    data.forEach((element) => {
                        preparedData.push({
                            id: element.id,
                            name: element.name,
                            description: (element.description != "") ? JSON.parse(element.description) : "",
                            startDate: formatDateForInput(element.starttime),
                            startTime: formatTimeForInput(element.starttime),
                            endDate: formatDateForInput(element.endtime),
                            endTime: formatTimeForInput(element.endtime),
                            speaker: element.speaker,
                            isActive: element.isactive,
                            location: element.location,
                        })
                    });

                    if (!focusOnLastElement && data.length > 0) setActiveSegmentId(data[0].id);
                    else if (focusOnLastElement && data.length > 0) setActiveSegmentId(data.pop().id);

                    setSegmentsList(preparedData);
                    setIsDataLoaded(true);


                    preparedData.forEach(async (segment) => {
                        console.log("test")
                        const address = await getAddressByLaLng(segment.location.latitude, segment.location.longitude);
                        setAddresses((prevAddresses) => ({
                            ...prevAddresses,
                            [segment.id]: address,
                        }));
                    });
                }
            });
    }

    const addSegmentHandler = (e) => {
        e.preventDefault();
        axios
            .post(`${window.location.protocol}//${window.location.host}/api/create-segment/`, {
                id: eventId
            })
            .then((response) => {
                if (response.status === 201) {
                    updateSegmentsList(true);
                }
            });
    }

    const updateSegment = (updatedSegment) => {
        setSegmentsList((prevState) => prevState.map(segment => segment.id === updatedSegment.id ? updatedSegment : segment));
    };

    useEffect(() => {

        document.title = title;

        if (eventId && segmentsList.length === 0) updateSegmentsList();
        updateSegmentsList();

    }, [eventId]);


    let segmentsForms, segmentsChooserList;
    if (Array.isArray(segmentsList) && segmentsList.length > 0) {
        segmentsForms = segmentsList.map((segment, index) => {
            return <SegmentFormItem key={segment.id} segmentObject={segment} updateSegment={updateSegment} active={segment.id === activeSegmentId} onDeleteAction={updateSegmentsList}/>
        });
        segmentsChooserList = segmentsList.map((segment, index) => {

            const startDate = new Date(formatForBackend(segment.startDate, segment.startTime));
            const endDate = new Date(formatForBackend(segment.endDate, segment.endTime));

            return <p
                key={segment.id}
                className={`segments-chooser-list-element${segment.id === activeSegmentId ? ' active' : ''}`}
                onClick={() => {
                    setActiveSegmentId(segment.id);
                }}
            >
                <p className={"segment-list-header"}>
                    <div className={"segment-list-header-dot"}></div>
                    {(segment.id !== activeSegmentId) && <span
                        className={"segment-list-header-text"}><b>
                    {new Intl.DateTimeFormat('en-GB', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                    }).format(startDate)}: </b>
                    {startDate.toLocaleTimeString('en-GB', {
                        hour: '2-digit', minute: '2-digit'
                    })} - {endDate.toLocaleTimeString('en-GB', {
                        hour: '2-digit', minute: '2-digit'
                    })}</span>}
                    {(segment.id === activeSegmentId) &&
                        <span className={"segment-list-header-text"}>{segment.name}</span>}
                </p>
                {(segment.id !== activeSegmentId) && <p className={"segment-list-content-name"}>
                    <span>{segment.name}</span>
                </p>}
                {(segment.id === activeSegmentId) && <p className={"segment-list-content-info"}>
                    <a className={"segment-list-content-info-location"} target="_blank"
                       href={`https://maps.google.com/?q=${segment.location.latitude},${segment.location.longitude}`}>
                        <img src={LocationPin} alt="location pin icon"/>
                        <span>
                            {addresses[segment.id] || 'Loading address...'}
                        </span>
                    </a>
                    <div className={"segment-list-content-info-speaker"}>
                        <img src={CrownIcon} alt="speaker icon"/>
                        <span>{segment.speaker.username}</span>
                    </div>
                    <div className={"segment-list-content-info-time"}>
                        <img src={ClockIcon} alt="clock icon"/>
                        <span>
                            {startDate.toLocaleTimeString('en-GB', {
                                hour: '2-digit', minute: '2-digit'
                            })} - {endDate.toLocaleTimeString('en-GB', {
                            hour: '2-digit', minute: '2-digit'
                        })}
                        </span>
                    </div>
                </p>}
            </p>
        });
        }

        return (<div>
                <Header/>
                <main>
                    <p className={"go-back-btn-container"}>
                        <button id={"go-back-btn"} className={"btn"} onClick={(e) => navigate(-1)}>
                        Go back to event
                    </button>
                    </p>
                    {!isDataLoaded && <Loader/>}
                    {isDataLoaded && <div id={"segments-container"}>
                        <div className={"segments-chooser-list"}>
                            {Array.isArray(segmentsList) && segmentsList.length > 0 && segmentsChooserList}
                        </div>
                        <div className={"segments-forms"}>
                            {Array.isArray(segmentsList) && segmentsList.length > 0 && segmentsForms}
                        </div>
                    </div>}
                    <p className={"add-segment-btn-container"}>
                        <button id={"add-segment-btn"} className={"btn"}
                                onClick={(e) => {
                                    document.getElementById("segments-container").scrollIntoView({behavior: "smooth"});
                                    addSegmentHandler(e);
                                }}>Add
                            segment
                        </button>
                    </p>
                </main>
                <Footer/>
            </div>);
    }
    ;

    export default EditSegments;
