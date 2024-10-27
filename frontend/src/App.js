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


const Title = 'Eventful';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" exact element={<Home title={"Eventful"} />} />
        <Route path="/register" element={<Register title={"Eventful: Sign up"} />} />
        <Route path="/login" element={<Login title={"Eventful: Log in"} />} />
        <Route path="/forgot-password" element={<ForgotPassword title={"Eventful: Password recovery"} />} />
        <Route path="/reset-password/:token" element={<ResetPassword title={"Eventful: Password recovery"} />} />
        <Route path="/account-verification/:token" element={<AccountVerification title={"Eventful: Account verification"} />} />
        <Route path="/edit-event/:id" element={<EditEvent title={"Eventful: Edit event"} />} />
        <Route path="/edit-segments/:id" element={<EditSegments title={"Eventful: Edit segments"} />} />
        <Route path="/events-list" element={<EventsList title={"Eventful: Your events list"} />} />
        <Route path="/join" element={<JoinEvent title={"Eventful: Join event"} />} />
        <Route path="/join/:code" element={<ShowEvent title={"Eventful: Join event"} />} />
        <Route path="/404" element={<NotFound title={"Eventful: Not found"} />} />
        <Route path="/500" element={<ServerError title={"Eventful: Critical error"} />} />
        <Route path="*" element={<NotFound title={"Eventful: Not found"} />} />
      </Routes>
    </Router>
  );
}

export default App;
