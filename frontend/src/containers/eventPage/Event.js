import React, { useEffect, useState } from 'react';
import Header from "../../components/structure/header";
import Footer from "../../components/structure/footer";
import "../../styles/containers/home.scss";
import axios from "axios";
import "../../styles/containers/joinEvent.scss";
import {useNavigate, useParams} from "react-router-dom";
import QRCode from "react-qr-code";
import {formatDateForInput, formatTimeForInput} from "../../components/Helpers";
import DataLoader from "../../components/loader";

const Event = ({title = "Eventful"}) => {
    const navigate = useNavigate();
    const { eventToken } = useParams();
    const [eventData, setEventData] = useState({});

    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [isDataLoaded, setIsDataLoaded] = useState(false);

    useEffect(() => {
        document.title = title;
        getEvent();
    }, []);

    const getEvent = () => {
        axios
            .post(`${window.location.protocol}//${window.location.host}/api/get-event/`, {
                token: eventToken
            }, {
                withCredentials: true
            })
            .then((response) => {
                if (response.status === 200) {
                    const data = response.data.detail;
                    setEventData({
                        name: data.name,
                        description: (data.description != "")?JSON.parse(data.description):"",
                        rules: (data.rules != "")?JSON.parse(data.rules):"",
                        startDate: formatDateForInput(data.starttime),
                        startTime: formatTimeForInput(data.starttime),
                        endDate: formatDateForInput(data.endtime),
                        endTime: formatTimeForInput(data.endtime),
                        supervisor: data.supervisor.uid,
                        isActive: data.isactive,
                        isPublic: data.ispublic,
                        joinApproval: data.joinapproval,
                        image: data.iconFilename,
                        joinCode: data.joinCode,
                    })

                    document.title = "Eventful: "+data.name;

                    // // ustawienie lokalizacji
                    // if ( null != data.location)
                    // {
                    //     const lat = parseFloat(data.location.latitude);
                    //     const lng = parseFloat(data.location.longitude);
                    //
                    //     setSelectedLocation({lat, lng});
                    //     setMarkerPosition({lat, lng});
                    //
                    //     if ( null != data.location.formattedAddress)
                    //         setFormattedAddress(data.location.formattedAddress);
                    //
                    //     if ( null != data.location.placeId)
                    //         setPlaceId(data.location.placeId);
                    // }
                    // changeSupervisor(data.supervisor.uid);
                    // setCopyButtonText(data.joinCode.toUpperCase());
                    setIsDataLoaded(true);
                }
            });
    }

    return (
        <div>
            <Header />
            <main>
                {!isDataLoaded && <DataLoader />}
                {isDataLoaded && <h1>{eventData.name}</h1>}

                {error && <p className={"text-danger"}>{error}</p>}
                {success && <p className={"text-success"}>{success}</p>}
            </main>
            <Footer />
        </div>
    );
};

export default Event;
