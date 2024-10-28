import React, {Component} from 'react';
import Header from "../../components/structure/header";
import Footer from "../../components/structure/footer";
import "../../styles/containers/eventsList.scss"
import axios from "axios";
import Loader from "../../components/loader";
import EventsListSegment from "../../components/EventsListSegment";
import Cookies from "js-cookie";
class EventsList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            eventsList: [],
        };
        this.getEvents = this.getEvents.bind(this);
    }

    componentDidMount() {
        document.title = this.props.title?this.props.title:"Eventful";

        this.getEvents();
    }

    getEvents() {
        axios
            .post(`${window.location.protocol}//${window.location.host}/api/get-events/`, {
                userAssociatedEvents: true
            }, {
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

        const now = new Date(); // aktualny czas

        // Filtracja list wydarzeń
        const supervisedEvents = this.state.eventsList?.filter(event => {
            return event.supervisor.username === Cookies.get('username')
        });

        const upcomingEvents = this.state.eventsList?.filter(event => {
            const startTime = new Date(event.starttime);
            return startTime > now; // Wydarzenia, które jeszcze się nie rozpoczęły
        });

        const ongoingEvents = this.state.eventsList?.filter(event => {
            const startTime = new Date(event.starttime);
            const endTime = new Date(event.endtime);
            return startTime <= now && endTime >= now; // Wydarzenia, które trwają w tej chwili
        });

        const recentEvents = this.state.eventsList?.filter(event => {
            const endTime = new Date(event.endtime);
            return endTime < now; // Wydarzenia, które już się zakończyły
        });

        return (
            <div>
                <Header/>
                <main>
                    {this.state.eventsList === null && <Loader />}
                    {this.state.eventsList === [] && <div className="loader">
                        Found no events associated with you.
                    </div>}

                    {/* Lista nadzorowanych wydarzeń */}
                    {supervisedEvents && supervisedEvents.length > 0 && (
                        <EventsListSegment
                            Id="upcoming-events-list"
                            ListTitle={"Supervised events"}
                            EventsList={supervisedEvents}
                            IsEditList={true}
                        />
                    )}

                    {/* Lista nadchodzących wydarzeń */}
                    {upcomingEvents && upcomingEvents.length > 0 && (
                        <EventsListSegment
                            Id="upcoming-events-list"
                            ListTitle={"Upcoming Events"}
                            EventsList={upcomingEvents}
                            IsEditList={true}
                        />
                    )}

                    {/* Lista trwających wydarzeń */}
                    {ongoingEvents && ongoingEvents.length > 0 && (
                        <EventsListSegment
                            Id="ongoing-events-list"
                            ListTitle={"Ongoing Events"}
                            EventsList={ongoingEvents}
                            IsEditList={true}
                        />
                    )}

                    {/* Lista zakończonych wydarzeń */}
                    {recentEvents && recentEvents.length > 0 && (
                        <EventsListSegment
                            Id="recent-events-list"
                            ListTitle={"Recent Events"}
                            EventsList={recentEvents}
                            IsEditList={true}
                        />
                    )}
                </main>
                <Footer/>
            </div>
        );
    }
}

export default EventsList;