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
import Loader from "../../components/loader";
import AddIcon from "../../images/icons/addIcon.svg";
import DownloadIcon from "../../images/icons/downloadIcon.svg";
import TrashIcon from "../../images/icons/trashIcon.svg";
import {generateColorFromText, getShortName} from "../../components/Helpers";
let fileHandle;
let dragoverTimeout;
const EditSegments = () => {
    const apiKey = process.env.REACT_APP_GOOGLE_API_KEY;
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
        image: null,
    });

    const [selectedLocation, setSelectedLocation] = useState({
        lat: 53.1231938,
        lng: 18.0166862,
    });

    const [formattedAddress, setFormattedAddress] = useState("");
    const [placeId, setPlaceId] = useState("");
    const [markerPosition, setMarkerPosition] = useState(null);
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const [usersList, setUsersList] = useState([]);
    const [supervisor, setSupervisor] = useState({});
    const [isDraggingItem, setDraggingItem] = useState(false);
    const [fileError, setFileError] = useState("");
    /* TODO: nie jest sprawdzane czy starttime < endtime */
    useEffect(() => {
        if (eventId) {
            axios
                .post(`${window.location.protocol}//${window.location.host}/api/get-event/`, {
                    id: eventId
                }, {
                    withCredentials: true
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
                            image: data.iconFilename,
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
                        changeSupervisor(data.supervisor);
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
        }
        else if (usersList.length > 0)
        {
            const elem = document.getElementById("list-root");
            elem.classList += " error"
            window.location.href = "#list-root";
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
                },
                image: formData.image,
            }
            axios
                .post(`${window.location.protocol}//${window.location.host}/api/edit-event/`, preparedData, {
                    withCredentials: true,
                    headers: {
                        "Content-Type": "multipart/form-data",  // Ensure the form is sent as multipart/form-data
                    }
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

    const handleArrayChange = (field) => (newDataArray) => {
        const textContent = newDataArray.map(op => op.insert).join('');
        console.log(`New data for ${field}:`, textContent);
        setFormData((prevState) => ({
            ...prevState,
            [field]: textContent,
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

    const handleSupervisorInputChange = (username) =>
    {
        axios
            .post(`${window.location.protocol}//${window.location.host}/api/search-users/`, {
                query: username,
                limit: 8,
            },{
                withCredentials: true
            }).then((response) => {
               if (response.status === 200) {
                    setUsersList(response.data.users);
               }
            })
    }
    const changeSupervisor = (id) => {

        axios
        .post(`${window.location.protocol}//${window.location.host}/api/user/`, {
            id: id
        },{
            withCredentials: true,
        }).then((response) => {
           if (response.status === 200) {
                setSupervisor(response.data.user);
                setUsersList([]);
                document.getElementById("supervisor").value = response.data.user.username;
           }
        })
    }

    let usersListView = <div id="users-list"><div id="list-root"> {usersList.map((user) => {
        return <p key={Object.values(user)[0]}>
            <button onClick={(e) => {
                e.preventDefault()
                changeSupervisor(Object.values(user)[0])
            }} aria-label="choose selected supervisor">
                <h1>{Object.values(user)[1]}</h1>
                <h2>{Object.values(user)[2]}</h2>
            </button>
        </p>
    })}
    </div></div>

    /*
    File upload section
     */


    const handleImageChange = (image) => {
        // dopuszczalne typy plików
		const validImageTypes = [
			"image/gif",
			"image/jpeg",
			"image/jpg",
			"image/png",
			"image/svg",
		];

        if ( null === image || undefined === image || image.kind === "file") {
            setFileError("Invalid file was uploaded.");
            return 0;
        }
        const file = image instanceof DataTransferItem ? image.getAsFile() : image;

        if (file.size > 2097152) {
            setFileError("File exceeds image size limit of 2MB.");
        } else if (!validImageTypes.includes(file.type)) {
            setFileError( 'Filetype is invalid. Make sure your image is in one of following formats: "gif", "jpg", "jpeg", "jpg", or "svg"' );
        } else {
            setFormData((prev) => ({
            ...prev,
            image: file
        }));
        }
    };

    // called with click
    const clickHandler = (event) => {
		const file = event.target.files[0];
        setDraggingItem(false);
        handleImageChange(file);
	};

    // called with drag and drop
    const dropHandler = (event) => {
		event.preventDefault();
        const file = event.dataTransfer.items[0];
        setDraggingItem(false);
        handleImageChange(file);
	};

    function applyStylesToElements(shortName) {
        const {lightHex, darkHex} = generateColorFromText(shortName);

        return {
            backgroundColor: lightHex,
            color: darkHex
        };
    }

    const DeleteButton = (e) => {

            e.preventDefault();  // Zatrzymuje domyślne zachowanie przycisku (przeładowanie strony)
            axios
                .post(
                    `${window.location.protocol}//${window.location.host}/api/delete-event/`, 
                     {id: eventId },  // Przekazanie id wydarzenia do API
                    {
                        withCredentials: true
                    }
                 ) // Upewnij się, że ciasteczka są uwzględniane
                    
                
                .then((response) => {

                    console.log("Wydarzenie usunięte", response);
                    window.location.href = `${window.location.protocol}//${window.location.host}/events-list/`;

                    // Możesz tutaj dodać przekierowanie lub inne działania po usunięciu
                })
                .catch((error) => {
                    console.error(eventId);
                });
        };

    

    return (
        <div>
            <Header/>
            <main>
                {!isDataLoaded && <Loader />}
                <div>
                    działa!
                </div>
            </main>
            <Footer/>
        </div>
    );
};

export default EditSegments;
