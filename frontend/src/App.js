import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Register from "./containers/register/Register";
import Home from "./containers/home/Home";
import Login from "./containers/login/Login";
import ForgotPassword from "./containers/forgotPassword/ForgotPassword";
import ResetPassword from "./containers/resetPassword/ResetPassword";
import AccountVerification from "./containers/accountVerification/AccountVerification";
import EditEvent from "./containers/editEvent/EditEvent";
import EventsList from "./containers/eventsList/EventsList";
import JoinEvent from "./containers/joinEvent/JoinEvent";
import ShowEvent from "./containers/showEvent/ShowEvent";
import EditSegments from "./containers/editSegments/EditSegments";
import NotFound from "./containers/errorPages/NotFound";
import ServerError from "./containers/errorPages/ServerError";
import { Helmet } from 'react-helmet';
import Event from "./containers/eventPage/Event";
import Forbidden from "./containers/errorPages/Forbidden";
import MobileApp from "./containers/articles/MobileApp";


const Title = 'Eventfull';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" exact element={<Home title={"Eventfull"} />} />
        <Route path="/app" element={<MobileApp title={"Eventfull: Mobile app"} />} />
        <Route path="/register" element={<Register title={"Eventfull: Sign up"} />} />
        <Route path="/login" element={<Login title={"Eventfull: Log in"} />} />
        <Route path="/forgot-password" element={<ForgotPassword title={"Eventfull: Password recovery"} />} />
        <Route path="/reset-password/:token" element={<ResetPassword title={"Eventfull: Password recovery"} />} />
        <Route path="/account-verification/:token" element={<AccountVerification title={"Eventfull: Account verification"} />} />
        <Route path="/edit-event/:id" element={<EditEvent title={"Eventfull: Edit event"} />} />
        <Route path="/edit-segments/:id" element={<EditSegments title={"Eventfull: Edit segments"} />} />
        <Route path="/events-list" element={<EventsList title={"Eventfull: Your events list"} />} />
        <Route path="/join" element={<JoinEvent title={"Eventfull: Join event"} />} />
        <Route path="/join/:code" element={<ShowEvent title={"Eventfull: Join event"} />} />
        <Route path="/event/:eventToken" element={<Event />} />

        <Route path="/404" element={<NotFound title={"Eventfull: Not found"} />} />
        <Route path="/500" element={<ServerError title={"Eventfull: Critical error"} />} />
        <Route path="/403" element={<Forbidden title={"Eventfull: Forbidden"} />} />
        <Route path="*" element={<NotFound title={"Eventfull: Not found"} />} />
      </Routes>
    </Router>
  );
}

export default App;
