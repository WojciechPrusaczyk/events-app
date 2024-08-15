import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Register from "./containers/register/Register";
import Home from "./containers/home/Home";
import Login from "./containers/login/Login";
import ForgotPassword from "./containers/forgot_password/ForgotPassword";
import ResetPassword from "./containers/reset_password/ResetPassword";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" exact element={ <Home /> } />
        <Route path="/register" element={ <Register /> } />
        <Route path="/login" element={ <Login /> } />
        <Route path="/forgot_password" element={ <ForgotPassword /> } />
        <Route path="/reset_password/:token" element={ <ResetPassword /> } />
      </Routes>
    </Router>
  );
}

export default App;
