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
import {formatDateForInput, formatTimeForInput} from "../../components/Helpers";

const EditSegments = () => {
    const {id: eventId} = useParams();
    const [segmentsList, setSegmentsList] = useState([]);
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const navigate = useNavigate();

    const updateSegmentsList = () => {
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

                    setSegmentsList(preparedData);
                    setIsDataLoaded(true);
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
                    updateSegmentsList();
                }
            });
    }

    const updateSegment = (updatedSegment) => {
        setSegmentsList((prevState) =>
            prevState.map(segment =>
                segment.id === updatedSegment.id ? updatedSegment : segment
            )
        );
    };

    useEffect(() => {
        if (eventId && segmentsList.length === 0 ) updateSegmentsList();
        updateSegmentsList();
    }, [eventId]);


    let segmentsForms;
    if (Array.isArray(segmentsList) && segmentsList.length > 0) {
        segmentsForms = segmentsList.map((segment, index) => {
        return <SegmentFormItem key={segment.id} segmentObject={segment} updateSegment={updateSegment} />
    });
}

    return (
        <div>
            <Header/>
            <main>
                {!isDataLoaded && <Loader />}
                {isDataLoaded &&
                    <div id={"segments-container"}>
                        <button id={"go-back-btn"} className={"btn"} onClick={(e) => navigate(-1) }>
                            Go back to event
                        </button>
                        {Array.isArray(segmentsList) && segmentsList.length > 0 && segmentsForms}
                        <button id={"add-segment-btn"} className={"btn"} onClick={(e) => addSegmentHandler(e)}>Add
                            segment
                        </button>
                    </div>
                }
            </main>
            <Footer/>
        </div>
    );
};

export default EditSegments;
