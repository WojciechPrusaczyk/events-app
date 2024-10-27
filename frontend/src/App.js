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

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" exact element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/account-verification/:token" element={<AccountVerification />} />
        <Route path="/edit-event/:id" element={<EditEvent />} />
        <Route path="/edit-segments/:id" element={<EditSegments />} />
        <Route path="/events-list" element={<EventsList />} />
        <Route path="/join" element={<JoinEvent />} />
        <Route path="/join/:code" element={<ShowEvent />} />
        <Route path="/404" element={<NotFound />} />
        <Route path="/500" element={<ServerError />} />
        {/* Catch-all route for 404 errors */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
