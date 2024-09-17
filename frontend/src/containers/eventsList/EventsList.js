import React, {Component} from 'react';
import Header from "../../components/structure/header";
import Footer from "../../components/structure/footer";
import "../../styles/containers/eventsList.scss"
import axios from "axios";
import Loader from "../../components/loader";
import EventsListSegment from "../../components/EventsListSegment";
class EventsList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            eventsList: [],
        };
        this.getEvents = this.getEvents.bind(this);
    }

    componentDidMount() {
        this.getEvents();
    }

    getEvents() {
        axios
            .get(`${window.location.protocol}//${window.location.host}/api/get-events/`, {
                withCredentials: true,
            })
            .then((response) => {
                if(response.status === 200 )
                {
                    const prevState = this.state;
                    prevState.eventsList = response.data.events;
                    this.setState(prevState);
                }
                else if(response.status === 204 )
                {
                    const prevState = this.state;
                    prevState.eventsList = [];
                    this.setState(prevState);
                }
            })
    }

    render() {
        return (
            <div>
                <Header/>
                <main>
                    {this.state.eventsList === null && <Loader />}
                    {this.state.eventsList === [] && <div className="loader">
                        Found no events associated with you.
                    </div>}
                    { (this.state.eventsList !== null && this.state.eventsList.length > 0) &&
                        <EventsListSegment Id="events-list" ListTitle={"Events list"} EventsList={this.state.eventsList} IsEditList={true}/>
                    }
                </main>
                <Footer/>
            </div>
        );
    }
}

export default EventsList;