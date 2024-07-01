import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Register from "./containers/register/Register";
import Home from "./containers/home/Home";
import Login from "./containers/login/Login";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" exact element={ <Home /> } />
        <Route path="/register" element={ <Register /> } />
        <Route path="/login" element={ <Login /> } />
      </Routes>
    </Router>
  );
}

export default App;
