import React, {useState, useEffect} from 'react';
import Header from "../../components/structure/header";
import Footer from "../../components/structure/footer";
import "../../styles/containers/home.scss";
import axios from "axios";
import {useParams} from 'react-router-dom';
import "../../styles/components/form.scss"
import Loader from "../../components/loader";
import SegmentFormItem from "../../components/SegmentFormItem";

const EditSegments = () => {
    const {id: eventId} = useParams();
    const [segmentsList, setSegmentsList] = useState([]);
    const [isDataLoaded, setIsDataLoaded] = useState(false)

    const updateSegmentsList = () => {
        axios
            .post(`${window.location.protocol}//${window.location.host}/api/get-segments/`, {
                id: eventId
            })
            .then((response) => {
                if (response.status === 200) {
                    const data = response.data;
                    setSegmentsList(data);
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

    useEffect(() => {
        if (eventId && segmentsList.length === 0 ) updateSegmentsList();
    }, [eventId]);


    let segmentsForms;
    if (Array.isArray(segmentsList) && segmentsList.length > 0) {
        console.log("DZIAŁA!");
        segmentsForms = segmentsList.map((segment, index) => {
        return <SegmentFormItem key={segment.id} segmentObject={segment} />
    });
}

    return (
        <div>
            <Header/>
            <main>
                {!isDataLoaded && <Loader />}
                {isDataLoaded &&
                <div>
                    {Array.isArray(segmentsList) && segmentsList.length > 0 && segmentsForms}
                    <button className={"btn"} onClick={ (e) => addSegmentHandler(e) }>Add segment</button>
                </div>
                }
            </main>
            <Footer/>
        </div>
    );
};

export default EditSegments;
